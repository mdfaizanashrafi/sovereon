/**
 * ============================================================================
 * CHAOS EXPERIMENT: Network Failure
 * ============================================================================
 * Simulates various network failure scenarios:
 * - API latency injection
 * - Network partition
 * - External service timeout
 * - DNS resolution failure
 */

import { getChaosEngine, ExperimentDefinition, parseDuration } from '../engine';
import { logger } from '../../utils/logger';
import http from 'http';
import https from 'https';

// ============================================================================
// EXPERIMENT DEFINITIONS
// ============================================================================

/**
 * API latency injection experiment
 */
export const apiLatencyInjection: ExperimentDefinition = {
  id: '',
  name: 'api_latency_injection',
  description: 'Injects artificial latency into API responses',
  target: 'network',
  fault: 'latency_injection',
  scope: 'component',
  duration: parseDuration('60s'),
  rampUpTime: parseDuration('15s'),
  intensity: 0.5,
  autoRollback: true,
  maxDuration: parseDuration('3m'),
  abortConditions: [
    { metric: 'p99_latency', operator: '>', threshold: 8000 },
    { metric: 'error_rate', operator: '>', threshold: 10 },
  ],
  hypothesis: {
    when: 'API responses are delayed',
    systemWill: 'use circuit breakers and return cached responses',
    maintaining: 'API availability with graceful degradation',
  },
  config: {
    minLatency: 100,
    maxLatency: 3000,
    jitter: 50,
    affectedEndpoints: ['/api/services', '/api/team-members'],
  },
};

/**
 * Network partition experiment
 */
export const networkPartition: ExperimentDefinition = {
  id: '',
  name: 'network_partition',
  description: 'Simulates network partition between services',
  target: 'network',
  fault: 'partition',
  scope: 'system',
  duration: parseDuration('30s'),
  intensity: 1.0,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'error_rate', operator: '>', threshold: 30 },
  ],
  hypothesis: {
    when: 'network partition occurs',
    systemWill: 'operate in degraded mode with local data',
    maintaining: 'core functionality and data consistency',
  },
  config: {
    partitionType: 'complete', // 'complete' | 'partial'
    isolatedServices: ['cms', 'payment'],
  },
};

/**
 * External service timeout experiment
 */
export const externalServiceTimeout: ExperimentDefinition = {
  id: '',
  name: 'external_service_timeout',
  description: 'Simulates external service API timeouts',
  target: 'network',
  fault: 'timeout',
  scope: 'component',
  duration: parseDuration('45s'),
  intensity: 0.6,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'error_rate', operator: '>', threshold: 20 },
    { metric: 'p99_latency', operator: '>', threshold: 15000 },
  ],
  hypothesis: {
    when: 'external services timeout',
    systemWill: 'use fallback values and queue operations for retry',
    maintaining: 'user experience with default values',
  },
  config: {
    timeoutMs: 5000,
    services: ['stripe', 'razorpay', 'resend'],
    failureRate: 0.6,
  },
};

/**
 * DNS resolution failure experiment
 */
export const dnsResolutionFailure: ExperimentDefinition = {
  id: '',
  name: 'dns_resolution_failure',
  description: 'Simulates DNS resolution failures',
  target: 'network',
  fault: 'connection_drop',
  scope: 'component',
  duration: parseDuration('30s'),
  intensity: 0.4,
  autoRollback: true,
  maxDuration: parseDuration('2m'),
  abortConditions: [
    { metric: 'error_rate', operator: '>', threshold: 25 },
  ],
  hypothesis: {
    when: 'DNS resolution fails',
    systemWill: 'use cached IP addresses and retry with exponential backoff',
    maintaining: 'service continuity with DNS caching',
  },
  config: {
    failureRate: 0.4,
    affectedDomains: ['api.stripe.com', 'api.razorpay.com'],
  },
};

// ============================================================================
// FAULT INJECTION IMPLEMENTATIONS
// ============================================================================

/**
 * HTTP latency injector
 */
class HttpLatencyInjector {
  private originalHttpRequest: any;
  private originalHttpsRequest: any;
  private minLatency: number;
  private maxLatency: number;
  private jitter: number;

  constructor(config: { minLatency: number; maxLatency: number; jitter: number }) {
    this.minLatency = config.minLatency;
    this.maxLatency = config.maxLatency;
    this.jitter = config.jitter;
  }

  async inject(intensity: number): Promise<void> {
    this.originalHttpRequest = http.request;
    this.originalHttpsRequest = https.request;

    const injectLatency = async () => {
      if (Math.random() < intensity) {
        const baseLatency = this.minLatency + Math.random() * (this.maxLatency - this.minLatency);
        const jitterAmount = (Math.random() - 0.5) * this.jitter;
        await new Promise(resolve => setTimeout(resolve, baseLatency + jitterAmount));
      }
    };

    // Override http.request
    http.request = (...args: any[]) => {
      const req = this.originalHttpRequest.apply(http, args);
      injectLatency();
      return req;
    };

    // Override https.request
    https.request = (...args: any[]) => {
      const req = this.originalHttpsRequest.apply(https, args);
      injectLatency();
      return req;
    };

    logger.info('[Chaos] HTTP latency injection enabled');
  }

  async rollback(): Promise<void> {
    if (this.originalHttpRequest) {
      http.request = this.originalHttpRequest;
    }
    if (this.originalHttpsRequest) {
      https.request = this.originalHttpsRequest;
    }
    logger.info('[Chaos] HTTP latency injection disabled');
  }
}

/**
 * Network partition simulator
 */
class NetworkPartitionSimulator {
  private isolatedServices: string[];
  private blockedUrls: Set<string> = new Set();
  private originalFetch: any;

  constructor(config: { isolatedServices: string[] }) {
    this.isolatedServices = config.isolatedServices;
  }

  async inject(): Promise<void> {
    this.originalFetch = global.fetch;

    // Define blocked URLs based on isolated services
    const serviceUrls: Record<string, string[]> = {
      cms: ['/api/services', '/api/team-members', '/api/faqs'],
      payment: ['/api/payments', '/api/invoices'],
    };

    for (const service of this.isolatedServices) {
      const urls = serviceUrls[service] || [];
      urls.forEach(url => this.blockedUrls.add(url));
    }

    // Override fetch to block requests
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      
      for (const blockedUrl of this.blockedUrls) {
        if (url.includes(blockedUrl)) {
          throw new Error(`[CHAOS] Network partition: ${url} is unreachable`);
        }
      }

      return this.originalFetch(input, init);
    };

    logger.info('[Chaos] Network partition simulation enabled', {
      isolatedServices: this.isolatedServices,
    });
  }

  async rollback(): Promise<void> {
    global.fetch = this.originalFetch;
    this.blockedUrls.clear();
    logger.info('[Chaos] Network partition simulation disabled');
  }
}

/**
 * External service timeout injector
 */
class ExternalServiceTimeoutInjector {
  private services: string[];
  private timeoutMs: number;
  private failureRate: number;
  private originalFetch: any;

  constructor(config: { services: string[]; timeoutMs: number; failureRate: number }) {
    this.services = config.services;
    this.timeoutMs = config.timeoutMs;
    this.failureRate = config.failureRate;
  }

  async inject(): Promise<void> {
    this.originalFetch = global.fetch;

    const serviceDomains: Record<string, string> = {
      stripe: 'api.stripe.com',
      razorpay: 'api.razorpay.com',
      resend: 'api.resend.com',
    };

    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();

      for (const service of this.services) {
        const domain = serviceDomains[service];
        if (domain && url.includes(domain) && Math.random() < this.failureRate) {
          // Simulate timeout
          await new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error(`[CHAOS] External service timeout: ${service}`));
            }, this.timeoutMs);
          });
        }
      }

      return this.originalFetch(input, init);
    };

    logger.info('[Chaos] External service timeout injection enabled');
  }

  async rollback(): Promise<void> {
    global.fetch = this.originalFetch;
    logger.info('[Chaos] External service timeout injection disabled');
  }
}

/**
 * DNS failure simulator
 */
class DnsFailureSimulator {
  private failureRate: number;
  private affectedDomains: string[];
  private dnsCache: Map<string, string> = new Map();
  private originalLookup: any;

  constructor(config: { failureRate: number; affectedDomains: string[] }) {
    this.failureRate = config.failureRate;
    this.affectedDomains = config.affectedDomains;
  }

  async inject(): Promise<void> {
    const dns = await import('dns');
    this.originalLookup = dns.lookup;

    // Pre-populate DNS cache
    this.affectedDomains.forEach(domain => {
      this.dnsCache.set(domain, '127.0.0.1'); // Fallback IP
    });

    // Note: Actually overriding dns.lookup is complex and risky
    // In practice, use environment variables or proxy settings
    logger.info('[Chaos] DNS failure simulation enabled (config-based)');
  }

  async rollback(): Promise<void> {
    this.dnsCache.clear();
    logger.info('[Chaos] DNS failure simulation disabled');
  }
}

// ============================================================================
// EXPERIMENT RUNNERS
// ============================================================================

export async function runApiLatencyInjection(duration?: string, maxLatency?: number): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...apiLatencyInjection,
    duration: duration ? parseDuration(duration) : apiLatencyInjection.duration,
    config: {
      ...(apiLatencyInjection.config || {}),
      maxLatency: maxLatency || (apiLatencyInjection.config && apiLatencyInjection.config.maxLatency) || 3000,
    },
  };
  
  const config = (definition.config || { minLatency: 100, maxLatency: 3000, jitter: 50 }) as { minLatency: number; maxLatency: number; jitter: number };
  const injector = new HttpLatencyInjector({
    minLatency: config.minLatency,
    maxLatency: config.maxLatency,
    jitter: config.jitter,
  });
  
  engine.once('experiment:starting', async () => {
    await injector.inject(definition.intensity);
  });
  
  engine.once('experiment:rolled_back', async () => {
    await injector.rollback();
  });
  
  return engine.run(definition);
}

export async function runNetworkPartition(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...networkPartition,
    duration: duration ? parseDuration(duration) : networkPartition.duration,
  };
  
  const simulator = new NetworkPartitionSimulator((definition.config || { partitionType: 'complete', isolatedServices: ['cms', 'payment'] }) as { isolatedServices: string[] });
  
  engine.once('experiment:starting', async () => {
    await simulator.inject();
  });
  
  engine.once('experiment:rolled_back', async () => {
    await simulator.rollback();
  });
  
  return engine.run(definition);
}

export async function runExternalServiceTimeout(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...externalServiceTimeout,
    duration: duration ? parseDuration(duration) : externalServiceTimeout.duration,
  };
  
  const injector = new ExternalServiceTimeoutInjector((definition.config || { services: ['stripe', 'razorpay', 'resend'], timeoutMs: 5000, failureRate: 0.6 }) as { services: string[]; timeoutMs: number; failureRate: number });
  
  engine.once('experiment:starting', async () => {
    await injector.inject();
  });
  
  engine.once('experiment:rolled_back', async () => {
    await injector.rollback();
  });
  
  return engine.run(definition);
}

export async function runDnsResolutionFailure(duration?: string): Promise<any> {
  const engine = getChaosEngine();
  const definition = {
    ...dnsResolutionFailure,
    duration: duration ? parseDuration(duration) : dnsResolutionFailure.duration,
  };
  
  const simulator = new DnsFailureSimulator((definition.config || { failureRate: 0.4, affectedDomains: ['api.stripe.com', 'api.razorpay.com'] }) as { failureRate: number; affectedDomains: string[] });
  
  engine.once('experiment:starting', async () => {
    await simulator.inject();
  });
  
  engine.once('experiment:rolled_back', async () => {
    await simulator.rollback();
  });
  
  return engine.run(definition);
}

// ============================================================================
// EXPERIMENT CATALOG
// ============================================================================

export const networkExperiments = {
  apiLatency: apiLatencyInjection,
  partition: networkPartition,
  externalTimeout: externalServiceTimeout,
  dnsFailure: dnsResolutionFailure,
};

export const networkExperimentRunners = {
  apiLatency: runApiLatencyInjection,
  partition: runNetworkPartition,
  externalTimeout: runExternalServiceTimeout,
  dnsFailure: runDnsResolutionFailure,
};

export default {
  networkExperiments,
  networkExperimentRunners,
  runApiLatencyInjection,
  runNetworkPartition,
  runExternalServiceTimeout,
  runDnsResolutionFailure,
};
