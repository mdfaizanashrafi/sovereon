/**
 * ============================================================================
 * CHAOS ENGINEERING FRAMEWORK - Core Engine
 * ============================================================================
 * Orchestrates chaos experiments with safety checks, circuit breakers,
 * automatic rollback, and gradual failure injection capabilities.
 */

import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ChaosFaultType = 
  | 'connection_drop'
  | 'latency_injection'
  | 'error_injection'
  | 'resource_exhaustion'
  | 'corruption'
  | 'timeout'
  | 'partition';

export type ChaosTarget = 
  | 'database'
  | 'cache'
  | 'network'
  | 'memory'
  | 'disk'
  | 'external_service';

export type ExperimentScope = 'isolated' | 'component' | 'system';
export type ExperimentStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'rolled_back';

export interface AbortCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==';
  threshold: number;
}

export interface ExperimentDefinition {
  id: string;
  name: string;
  description: string;
  target: ChaosTarget;
  fault: ChaosFaultType;
  scope: ExperimentScope;
  
  // Timing
  duration: number; // milliseconds
  rampUpTime?: number; // milliseconds for gradual injection
  cooldownTime?: number; // milliseconds after experiment
  
  // Intensity (0.0 to 1.0)
  intensity: number;
  
  // Safety
  autoRollback: boolean;
  maxDuration: number; // hard timeout in milliseconds
  abortConditions: AbortCondition[];
  
  // Configuration
  config?: Record<string, any>;
  
  // Hypothesis
  hypothesis: {
    when: string;
    systemWill: string;
    maintaining: string;
  };
}

export interface ExperimentResult {
  experimentId: string;
  status: ExperimentStatus;
  startTime: Date;
  endTime?: Date;
  duration: number;
  metrics: {
    errorsInjected: number;
    requestsAffected: number;
    abortTriggered?: boolean;
    abortReason?: string;
  };
  violations: string[];
  hypothesisValidated: boolean;
}

export interface RunningExperiment {
  definition: ExperimentDefinition;
  status: ExperimentStatus;
  startTime: Date;
  abortController: AbortController;
  metrics: {
    errorsInjected: number;
    requestsAffected: number;
  };
  timers: NodeJS.Timeout[];
  rollbackFns: (() => Promise<void>)[];
}

export interface SystemMetrics {
  errorRate: number;
  p99Latency: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  timestamp: Date;
}

// ============================================================================
// SAFETY CONFIGURATION
// ============================================================================

const SAFETY_DEFAULTS = {
  maxConcurrentExperiments: 2,
  maxExperimentDuration: 5 * 60 * 1000, // 5 minutes
  minExperimentInterval: 30 * 1000, // 30 seconds between experiments
  productionBlocklist: ['database', 'memory'], // Never target in production
  maxIntensity: 0.5, // Maximum 50% failure rate
};

// ============================================================================
// CHAOS ENGINE CLASS
// ============================================================================

export class ChaosEngine extends EventEmitter {
  private runningExperiments = new Map<string, RunningExperiment>();
  private experimentHistory: ExperimentResult[] = [];
  private safetyEnabled: boolean = true;
  private isProduction: boolean;
  private lastExperimentEnd: Date | null = null;
  private metricsHistory: SystemMetrics[] = [];
  private metricsInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.isProduction = process.env.NODE_ENV === 'production';
    this.startMetricsCollection();
  }

  // ============================================================================
  // EXPERIMENT LIFECYCLE
  // ============================================================================

  /**
   * Run a chaos experiment with full safety checks
   */
  async run(definition: ExperimentDefinition): Promise<ExperimentResult> {
    const experimentId = definition.id || this.generateId();
    const fullDefinition: ExperimentDefinition = {
      ...definition,
      id: experimentId,
    };

    try {
      // Pre-flight safety checks
      await this.runSafetyChecks(fullDefinition);

      // Create running experiment context
      const abortController = new AbortController();
      const runningExperiment: RunningExperiment = {
        definition: fullDefinition,
        status: 'pending',
        startTime: new Date(),
        abortController,
        metrics: {
          errorsInjected: 0,
          requestsAffected: 0,
        },
        timers: [],
        rollbackFns: [],
      };

      this.runningExperiments.set(experimentId, runningExperiment);

      // Execute experiment
      this.emit('experiment:starting', { experimentId, definition: fullDefinition });
      logger.info(`[Chaos] Starting experiment: ${fullDefinition.name}`, {
        experimentId,
        target: fullDefinition.target,
        fault: fullDefinition.fault,
        intensity: fullDefinition.intensity,
      });

      const result = await this.executeExperiment(runningExperiment);
      
      // Store history
      this.experimentHistory.push(result);
      this.lastExperimentEnd = new Date();

      this.emit('experiment:completed', { experimentId, result });
      
      return result;

    } catch (error) {
      const failedResult: ExperimentResult = {
        experimentId,
        status: 'failed',
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        metrics: { errorsInjected: 0, requestsAffected: 0 },
        violations: [(error as Error).message],
        hypothesisValidated: false,
      };

      this.experimentHistory.push(failedResult);
      this.emit('experiment:failed', { experimentId, error });
      
      logger.error(`[Chaos] Experiment failed: ${fullDefinition.name}`, error);
      
      return failedResult;
    }
  }

  /**
   * Stop a running experiment
   */
  async stop(experimentId: string): Promise<boolean> {
    const experiment = this.runningExperiments.get(experimentId);
    if (!experiment) {
      return false;
    }

    logger.info(`[Chaos] Stopping experiment: ${experiment.definition.name}`);
    
    await this.rollbackExperiment(experiment, 'manual_stop');
    return true;
  }

  /**
   * Stop all running experiments
   */
  async stopAll(): Promise<number> {
    const count = this.runningExperiments.size;
    const promises = Array.from(this.runningExperiments.keys()).map(id => this.stop(id));
    await Promise.all(promises);
    return count;
  }

  /**
   * Pause a running experiment (temporarily stop without rollback)
   */
  pause(experimentId: string): boolean {
    const experiment = this.runningExperiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return false;
    }

    experiment.status = 'paused';
    experiment.abortController.abort();
    
    // Clear timers but keep rollback functions
    experiment.timers.forEach(timer => clearTimeout(timer));
    experiment.timers = [];

    this.emit('experiment:paused', { experimentId });
    logger.info(`[Chaos] Paused experiment: ${experiment.definition.name}`);
    
    return true;
  }

  /**
   * Resume a paused experiment
   */
  async resume(experimentId: string): Promise<boolean> {
    const experiment = this.runningExperiments.get(experimentId);
    if (!experiment || experiment.status !== 'paused') {
      return false;
    }

    experiment.status = 'running';
    experiment.abortController = new AbortController();
    
    this.emit('experiment:resumed', { experimentId });
    logger.info(`[Chaos] Resumed experiment: ${experiment.definition.name}`);
    
    return true;
  }

  // ============================================================================
  // PRIVATE EXECUTION METHODS
  // ============================================================================

  private async executeExperiment(experiment: RunningExperiment): Promise<ExperimentResult> {
    const { definition } = experiment;
    const violations: string[] = [];
    let abortTriggered = false;
    let abortReason = '';

    // Set up hard timeout
    const hardTimeoutTimer = setTimeout(() => {
      this.abortExperiment(experiment, 'hard_timeout');
    }, definition.maxDuration);
    experiment.timers.push(hardTimeoutTimer);

    // Set up abort condition monitoring
    const abortMonitorTimer = setInterval(() => {
      if (this.checkAbortConditions(experiment)) {
        abortTriggered = true;
        abortReason = 'abort_condition_met';
        this.abortExperiment(experiment, abortReason);
      }
    }, 1000);
    experiment.timers.push(abortMonitorTimer as unknown as NodeJS.Timeout);

    try {
      experiment.status = 'running';
      
      // Ramp up phase (gradual failure injection)
      if (definition.rampUpTime && definition.rampUpTime > 0) {
        await this.rampUp(experiment);
      }

      // Main experiment phase
      await this.waitForDuration(
        definition.duration - (definition.rampUpTime || 0),
        experiment.abortController.signal
      );

      // Cooldown phase
      if (definition.cooldownTime && definition.cooldownTime > 0) {
        await this.cooldown(experiment);
      }

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        logger.info(`[Chaos] Experiment aborted: ${definition.name}`);
      } else {
        throw error;
      }
    } finally {
      // Always rollback
      await this.rollbackExperiment(experiment, abortTriggered ? abortReason : 'completed');
      clearInterval(abortMonitorTimer);
    }

    // Validate hypothesis
    const hypothesisValidated = this.validateHypothesis(definition, violations);

    return {
      experimentId: definition.id,
      status: abortTriggered ? 'rolled_back' : 'completed',
      startTime: experiment.startTime,
      endTime: new Date(),
      duration: Date.now() - experiment.startTime.getTime(),
      metrics: {
        errorsInjected: experiment.metrics.errorsInjected,
        requestsAffected: experiment.metrics.requestsAffected,
        abortTriggered,
        abortReason: abortTriggered ? abortReason : undefined,
      },
      violations,
      hypothesisValidated,
    };
  }

  private async rampUp(experiment: RunningExperiment): Promise<void> {
    const { definition } = experiment;
    const steps = 10;
    const stepDuration = (definition.rampUpTime || 0) / steps;

    for (let i = 1; i <= steps; i++) {
      if (experiment.abortController.signal.aborted) break;
      
      const currentIntensity = (definition.intensity / steps) * i;
      this.emit('experiment:ramp_up', {
        experimentId: definition.id,
        step: i,
        intensity: currentIntensity,
      });
      
      await this.waitForDuration(stepDuration, experiment.abortController.signal);
    }
  }

  private async cooldown(experiment: RunningExperiment): Promise<void> {
    const { definition } = experiment;
    
    this.emit('experiment:cooldown', {
      experimentId: definition.id,
      duration: definition.cooldownTime,
    });

    await this.waitForDuration(definition.cooldownTime || 0, experiment.abortController.signal);
  }

  private async rollbackExperiment(experiment: RunningExperiment, reason: string): Promise<void> {
    if (experiment.status === 'rolled_back' || experiment.status === 'completed') {
      return;
    }

    logger.info(`[Chaos] Rolling back experiment: ${experiment.definition.name}`, { reason });
    
    experiment.status = 'rolled_back';

    // Clear all timers
    experiment.timers.forEach(timer => clearTimeout(timer));
    experiment.timers = [];

    // Execute rollback functions in reverse order
    for (const rollbackFn of experiment.rollbackFns.reverse()) {
      try {
        await rollbackFn();
      } catch (error) {
        logger.error('[Chaos] Rollback function failed', error);
      }
    }

    this.runningExperiments.delete(experiment.definition.id);
    
    this.emit('experiment:rolled_back', {
      experimentId: experiment.definition.id,
      reason,
    });
  }

  private abortExperiment(experiment: RunningExperiment, reason: string): void {
    experiment.abortController.abort();
    logger.warn(`[Chaos] Aborting experiment: ${experiment.definition.name}`, { reason });
  }

  // ============================================================================
  // SAFETY CHECKS
  // ============================================================================

  private async runSafetyChecks(definition: ExperimentDefinition): Promise<void> {
    if (!this.safetyEnabled) return;

    // Production safety check
    if (this.isProduction) {
      if (SAFETY_DEFAULTS.productionBlocklist.includes(definition.target)) {
        throw new Error(
          `Experiment target '${definition.target}' is blocked in production environment`
        );
      }

      if (definition.scope === 'system') {
        throw new Error('System-scoped experiments are not allowed in production');
      }
    }

    // Maximum intensity check
    if (definition.intensity > SAFETY_DEFAULTS.maxIntensity) {
      throw new Error(
        `Intensity ${definition.intensity} exceeds maximum allowed ${SAFETY_DEFAULTS.maxIntensity}`
      );
    }

    // Maximum duration check
    if (definition.duration > SAFETY_DEFAULTS.maxExperimentDuration) {
      throw new Error(
        `Duration ${definition.duration}ms exceeds maximum allowed ${SAFETY_DEFAULTS.maxExperimentDuration}ms`
      );
    }

    // Concurrent experiment limit
    if (this.runningExperiments.size >= SAFETY_DEFAULTS.maxConcurrentExperiments) {
      throw new Error(
        `Maximum concurrent experiments (${SAFETY_DEFAULTS.maxConcurrentExperiments}) reached`
      );
    }

    // Minimum interval between experiments
    if (this.lastExperimentEnd) {
      const timeSinceLast = Date.now() - this.lastExperimentEnd.getTime();
      if (timeSinceLast < SAFETY_DEFAULTS.minExperimentInterval) {
        throw new Error(
          `Must wait ${SAFETY_DEFAULTS.minExperimentInterval}ms between experiments`
        );
      }
    }

    // Scope restrictions
    if (definition.scope === 'system' && this.runningExperiments.size > 0) {
      throw new Error('Cannot run system-scoped experiment while other experiments are running');
    }
  }

  private checkAbortConditions(experiment: RunningExperiment): boolean {
    const currentMetrics = this.getCurrentMetrics();
    
    for (const condition of experiment.definition.abortConditions) {
      const value = this.getMetricValue(currentMetrics, condition.metric);
      
      if (value !== undefined && this.evaluateCondition(value, condition)) {
        logger.warn(`[Chaos] Abort condition met: ${condition.metric} ${condition.operator} ${condition.threshold}`, {
          currentValue: value,
          experimentId: experiment.definition.id,
        });
        return true;
      }
    }
    
    return false;
  }

  private getMetricValue(metrics: SystemMetrics, metric: string): number | undefined {
    switch (metric) {
      case 'error_rate': return metrics.errorRate;
      case 'p99_latency': return metrics.p99Latency;
      case 'memory_usage': return metrics.memoryUsage;
      case 'cpu_usage': return metrics.cpuUsage;
      case 'active_connections': return metrics.activeConnections;
      default: return undefined;
    }
  }

  private evaluateCondition(value: number, condition: AbortCondition): boolean {
    switch (condition.operator) {
      case '>': return value > condition.threshold;
      case '<': return value < condition.threshold;
      case '>=': return value >= condition.threshold;
      case '<=': return value <= condition.threshold;
      case '==': return value === condition.threshold;
      default: return false;
    }
  }

  // ============================================================================
  // METRICS COLLECTION
  // ============================================================================

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      const metrics = this.collectSystemMetrics();
      this.metricsHistory.push(metrics);
      
      // Keep only last 1000 metrics
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory.shift();
      }
    }, 5000); // Every 5 seconds
  }

  private collectSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    
    return {
      errorRate: this.calculateErrorRate(),
      p99Latency: this.calculateP99Latency(),
      memoryUsage: memUsage.heapUsed / 1024 / 1024, // MB
      cpuUsage: process.cpuUsage().user / 1000000, // seconds
      activeConnections: this.runningExperiments.size,
      timestamp: new Date(),
    };
  }

  private calculateErrorRate(): number {
    // Simplified - in real implementation would track actual request errors
    return 0;
  }

  private calculateP99Latency(): number {
    // Simplified - in real implementation would track actual request latencies
    return 0;
  }

  private getCurrentMetrics(): SystemMetrics {
    return this.metricsHistory[this.metricsHistory.length - 1] || this.collectSystemMetrics();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private waitForDuration(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(), ms);
      
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('AbortError'));
        });
      }
    });
  }

  private validateHypothesis(definition: ExperimentDefinition, violations: string[]): boolean {
    // Simplified hypothesis validation
    // In real implementation, would check if system behaved as expected
    return violations.length === 0;
  }

  // ============================================================================
  // PUBLIC GETTERS
  // ============================================================================

  getRunningExperiments(): RunningExperiment[] {
    return Array.from(this.runningExperiments.values());
  }

  getExperimentHistory(): ExperimentResult[] {
    return [...this.experimentHistory];
  }

  getRunningCount(): number {
    return this.runningExperiments.size;
  }

  getMetricsHistory(): SystemMetrics[] {
    return [...this.metricsHistory];
  }

  isSafetyEnabled(): boolean {
    return this.safetyEnabled;
  }

  setSafetyEnabled(enabled: boolean): void {
    this.safetyEnabled = enabled;
    logger.info(`[Chaos] Safety checks ${enabled ? 'enabled' : 'disabled'}`);
  }

  clearHistory(): void {
    this.experimentHistory = [];
  }

  destroy(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    this.stopAll();
    this.removeAllListeners();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let chaosEngineInstance: ChaosEngine | null = null;

export function getChaosEngine(): ChaosEngine {
  if (!chaosEngineInstance) {
    chaosEngineInstance = new ChaosEngine();
  }
  return chaosEngineInstance;
}

export function resetChaosEngine(): void {
  if (chaosEngineInstance) {
    chaosEngineInstance.destroy();
    chaosEngineInstance = null;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function parseDuration(duration: string): number {
  const units: Record<string, number> = {
    'ms': 1,
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
  };

  const match = duration.match(/^(\d+)(ms|s|m|h)$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}. Use format like '30s', '5m', '1h'`);
  }

  return parseInt(match[1], 10) * units[match[2]];
}

export function createExperiment(definition: Omit<ExperimentDefinition, 'id'>): ExperimentDefinition {
  return {
    ...definition,
    id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
}

export default ChaosEngine;
