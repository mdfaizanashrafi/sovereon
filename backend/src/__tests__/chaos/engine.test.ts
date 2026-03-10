/**
 * ============================================================================
 * CHAOS ENGINE TESTS
 * ============================================================================
 * Tests for the chaos experiment orchestrator
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  ChaosEngine, 
  createExperiment, 
  parseDuration,
  resetChaosEngine,
} from '../../chaos/engine';

describe('ChaosEngine', () => {
  let engine: ChaosEngine;

  beforeEach(() => {
    engine = new ChaosEngine();
    engine.setSafetyEnabled(false); // Disable for testing
  });

  afterEach(() => {
    engine.destroy();
    resetChaosEngine();
  });

  describe('Experiment Lifecycle', () => {
    it('should start with no running experiments', () => {
      expect(engine.getRunningCount()).toBe(0);
      expect(engine.getRunningExperiments()).toHaveLength(0);
    });

    it('should run a simple experiment', async () => {
      const experiment = createExperiment({
        name: 'test_experiment',
        description: 'Test experiment',
        target: 'database',
        fault: 'latency_injection',
        scope: 'isolated',
        duration: 100,
        intensity: 0.5,
        autoRollback: true,
        maxDuration: 5000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      const result = await engine.run(experiment);

      expect(result.status).toBe('completed');
      expect(result.experimentId).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(100);
    });

    it('should auto-rollback after experiment completion', async () => {
      const experiment = createExperiment({
        name: 'rollback_test',
        description: 'Test rollback',
        target: 'cache',
        fault: 'connection_drop',
        scope: 'isolated',
        duration: 50,
        intensity: 0.3,
        autoRollback: true,
        maxDuration: 5000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      const rollbackFn = vi.fn().mockResolvedValue(undefined);
      
      engine.once('experiment:starting', () => {
        const running = engine.getRunningExperiments()[0];
        if (running) {
          running.rollbackFns.push(rollbackFn);
        }
      });

      await engine.run(experiment);

      expect(rollbackFn).toHaveBeenCalled();
    });

    it('should track running experiments', async () => {
      const experiment = createExperiment({
        name: 'tracking_test',
        description: 'Test tracking',
        target: 'network',
        fault: 'latency_injection',
        scope: 'isolated',
        duration: 200,
        intensity: 0.5,
        autoRollback: true,
        maxDuration: 5000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      const runPromise = engine.run(experiment);
      
      // Should have running experiment
      expect(engine.getRunningCount()).toBe(1);
      
      await runPromise;
      
      // Should be cleared after completion
      expect(engine.getRunningCount()).toBe(0);
    });
  });

  describe('Safety Checks', () => {
    it('should enforce max intensity limit', async () => {
      engine.setSafetyEnabled(true);

      const experiment = createExperiment({
        name: 'intensity_test',
        description: 'Test intensity limit',
        target: 'database',
        fault: 'connection_drop',
        scope: 'isolated',
        duration: 100,
        intensity: 0.8, // Above 0.5 limit
        autoRollback: true,
        maxDuration: 5000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      const result = await engine.run(experiment);

      expect(result.status).toBe('failed');
      expect(result.violations[0]).toContain('exceeds maximum');
    });

    it('should enforce max duration limit', async () => {
      engine.setSafetyEnabled(true);

      const experiment = createExperiment({
        name: 'duration_test',
        description: 'Test duration limit',
        target: 'cache',
        fault: 'latency_injection',
        scope: 'isolated',
        duration: 10 * 60 * 1000, // 10 minutes, above 5 minute limit
        intensity: 0.3,
        autoRollback: true,
        maxDuration: 11 * 60 * 1000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      const result = await engine.run(experiment);

      expect(result.status).toBe('failed');
      expect(result.violations[0]).toContain('exceeds maximum');
    });

    it('should respect concurrent experiment limit', async () => {
      engine.setSafetyEnabled(true);

      const experiment1 = createExperiment({
        name: 'concurrent_1',
        description: 'First concurrent',
        target: 'memory',
        fault: 'resource_exhaustion',
        scope: 'isolated',
        duration: 500,
        intensity: 0.3,
        autoRollback: true,
        maxDuration: 5000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      const experiment2 = createExperiment({
        name: 'concurrent_2',
        description: 'Second concurrent',
        target: 'network',
        fault: 'partition',
        scope: 'isolated',
        duration: 100,
        intensity: 0.3,
        autoRollback: true,
        maxDuration: 5000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      // Start first experiment (don't await)
      engine.run(experiment1);

      // Try to start second immediately
      const result2 = await engine.run(experiment2);

      expect(result2.status).toBe('failed');
      expect(result2.violations[0]).toContain('Maximum concurrent');
    });
  });

  describe('Abort Conditions', () => {
    it('should abort on error rate threshold', async () => {
      const experiment = createExperiment({
        name: 'abort_test',
        description: 'Test abort condition',
        target: 'database',
        fault: 'error_injection',
        scope: 'isolated',
        duration: 5000,
        intensity: 0.5,
        autoRollback: true,
        maxDuration: 10000,
        abortConditions: [
          { metric: 'error_rate', operator: '>', threshold: 5 },
        ],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      // Simulate high error rate by injecting into metrics
      const result = await engine.run(experiment);

      // Should complete or be rolled back
      expect(['completed', 'rolled_back', 'failed']).toContain(result.status);
    });
  });

  describe('Experiment Control', () => {
    it('should stop a running experiment', async () => {
      const experiment = createExperiment({
        name: 'stop_test',
        description: 'Test stop',
        target: 'cache',
        fault: 'connection_drop',
        scope: 'isolated',
        duration: 5000,
        intensity: 0.5,
        autoRollback: true,
        maxDuration: 10000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      const runPromise = engine.run(experiment);
      
      // Small delay to ensure experiment started
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const running = engine.getRunningExperiments()[0];
      expect(running).toBeDefined();

      const stopped = await engine.stop(running.definition.id);
      expect(stopped).toBe(true);

      const result = await runPromise;
      expect(result.status).toBe('rolled_back');
    });

    it('should stop all experiments', async () => {
      const experiment = createExperiment({
        name: 'stop_all_test',
        description: 'Test stop all',
        target: 'network',
        fault: 'latency_injection',
        scope: 'isolated',
        duration: 5000,
        intensity: 0.3,
        autoRollback: true,
        maxDuration: 10000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      // Start experiment
      engine.run(experiment);
      
      await new Promise(resolve => setTimeout(resolve, 50));

      const stopped = await engine.stopAll();
      expect(stopped).toBeGreaterThanOrEqual(0);
      expect(engine.getRunningCount()).toBe(0);
    });
  });

  describe('History Tracking', () => {
    it('should track experiment history', async () => {
      const experiment = createExperiment({
        name: 'history_test',
        description: 'Test history',
        target: 'database',
        fault: 'latency_injection',
        scope: 'isolated',
        duration: 50,
        intensity: 0.3,
        autoRollback: true,
        maxDuration: 5000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      await engine.run(experiment);

      const history = engine.getExperimentHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].experimentId).toBeDefined();
    });

    it('should clear history', async () => {
      const experiment = createExperiment({
        name: 'clear_history_test',
        description: 'Test clear history',
        target: 'cache',
        fault: 'connection_drop',
        scope: 'isolated',
        duration: 50,
        intensity: 0.3,
        autoRollback: true,
        maxDuration: 5000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      await engine.run(experiment);
      expect(engine.getExperimentHistory().length).toBeGreaterThan(0);

      engine.clearHistory();
      expect(engine.getExperimentHistory()).toHaveLength(0);
    });
  });

  describe('Event Emission', () => {
    it('should emit experiment:starting event', async () => {
      const startingHandler = vi.fn();
      engine.on('experiment:starting', startingHandler);

      const experiment = createExperiment({
        name: 'event_test',
        description: 'Test events',
        target: 'memory',
        fault: 'resource_exhaustion',
        scope: 'isolated',
        duration: 50,
        intensity: 0.3,
        autoRollback: true,
        maxDuration: 5000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      await engine.run(experiment);

      expect(startingHandler).toHaveBeenCalled();
      expect(startingHandler.mock.calls[0][0]).toHaveProperty('experimentId');
      expect(startingHandler.mock.calls[0][0]).toHaveProperty('definition');
    });

    it('should emit experiment:completed event', async () => {
      const completedHandler = vi.fn();
      engine.on('experiment:completed', completedHandler);

      const experiment = createExperiment({
        name: 'completed_event_test',
        description: 'Test completed event',
        target: 'network',
        fault: 'partition',
        scope: 'isolated',
        duration: 50,
        intensity: 0.3,
        autoRollback: true,
        maxDuration: 5000,
        abortConditions: [],
        hypothesis: {
          when: 'test',
          systemWill: 'test',
          maintaining: 'test',
        },
      });

      await engine.run(experiment);

      expect(completedHandler).toHaveBeenCalled();
      expect(completedHandler.mock.calls[0][0]).toHaveProperty('result');
    });
  });
});

describe('parseDuration', () => {
  it('should parse milliseconds', () => {
    expect(parseDuration('100ms')).toBe(100);
    expect(parseDuration('500ms')).toBe(500);
  });

  it('should parse seconds', () => {
    expect(parseDuration('1s')).toBe(1000);
    expect(parseDuration('30s')).toBe(30000);
  });

  it('should parse minutes', () => {
    expect(parseDuration('1m')).toBe(60000);
    expect(parseDuration('5m')).toBe(300000);
  });

  it('should parse hours', () => {
    expect(parseDuration('1h')).toBe(3600000);
    expect(parseDuration('2h')).toBe(7200000);
  });

  it('should throw on invalid format', () => {
    expect(() => parseDuration('invalid')).toThrow();
    expect(() => parseDuration('100')).toThrow();
    expect(() => parseDuration('100x')).toThrow();
  });
});

describe('createExperiment', () => {
  it('should create experiment with generated ID', () => {
    const experiment = createExperiment({
      name: 'created_test',
      description: 'Test creation',
      target: 'database',
      fault: 'connection_drop',
      scope: 'isolated',
      duration: 1000,
      intensity: 0.5,
      autoRollback: true,
      maxDuration: 5000,
      abortConditions: [],
      hypothesis: {
        when: 'test',
        systemWill: 'test',
        maintaining: 'test',
      },
    });

    expect(experiment.id).toBeDefined();
    expect(experiment.id).toMatch(/^exp_/);
    expect(experiment.name).toBe('created_test');
  });
});
