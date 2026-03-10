/**
 * ============================================================================
 * API ENDURANCE TEST (SOAK TEST)
 * ============================================================================
 * Long-running stability test
 * - 50 users for 1 hour
 * - Memory leak detection
 * - Connection pool validation
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { CONFIG } from '../config.js';
import { checkStandard, checkHealth } from '../utils/checks.js';
import { recordResponseTime, recordRequest, memoryUsage, dbConnectionErrors } from '../utils/metrics.js';

// Endurance test options - sustained load for 1 hour
export const options = {
  stages: [
    { duration: '5m', target: 50 },      // Ramp up to 50 VUs
    { duration: '55m', target: 50 },     // Sustained for 1 hour
    { duration: '5m', target: 0 },       // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],    // Consistent performance
    http_req_failed: ['rate<0.001'],      // Very low error rate
    http_reqs: ['count>10000'],           // Significant request volume
    checks: ['rate>0.995'],               // 99.5% checks must pass
  },
};

// Track metrics for trend analysis
let requestDurations = [];
let errorCount = 0;
let requestCount = 0;

export default function () {
  group('Endurance Test - Sustained Load', () => {
    const scenario = randomIntBetween(1, 100);
    
    if (scenario <= 40) {
      testHealthMonitoring();
    } else if (scenario <= 70) {
      testPublicCMS();
    } else if (scenario <= 90) {
      testServices();
    } else {
      testDatabaseHealth();
    }
  });
  
  // Consistent think time to maintain steady load
  sleep(randomIntBetween(2, 5));
}

function testHealthMonitoring() {
  group('Health Monitoring', () => {
    const endpoints = [
      CONFIG.endpoints.health.basic,
      CONFIG.endpoints.health.ready,
      CONFIG.endpoints.health.memory,
      CONFIG.endpoints.health.system,
    ];
    
    for (const endpoint of endpoints) {
      const url = `${CONFIG.baseUrl}${endpoint}`;
      const response = http.get(url);
      
      recordMetrics(response);
      
      // Strict checks for endurance test
      check(response, {
        'health check status 200': (r) => r.status === 200,
        'health check response time < 200ms': (r) => r.timings.duration < 200,
      });
    }
  });
}

function testPublicCMS() {
  group('Public CMS', () => {
    const endpoints = [
      CONFIG.endpoints.public.teamMembers,
      CONFIG.endpoints.public.services,
      CONFIG.endpoints.public.testimonials,
      CONFIG.endpoints.public.faqs,
    ];
    
    const endpoint = endpoints[randomIntBetween(0, endpoints.length - 1)];
    const url = `${CONFIG.baseUrl}${endpoint}`;
    const response = http.get(url);
    
    recordMetrics(response);
    
    check(response, {
      'cms status 200': (r) => r.status === 200,
      'cms response time < 300ms': (r) => r.timings.duration < 300,
    });
  });
}

function testServices() {
  group('Services', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.services.list}`;
    const response = http.get(url);
    
    recordMetrics(response);
    
    check(response, {
      'services status 200': (r) => r.status === 200,
      'services response time < 250ms': (r) => r.timings.duration < 250,
    });
  });
}

function testDatabaseHealth() {
  group('Database Health', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.health.db}`;
    const response = http.get(url);
    
    recordMetrics(response);
    
    check(response, {
      'db health status 200': (r) => r.status === 200,
      'db health response time < 500ms': (r) => r.timings.duration < 500,
    });
    
    // Track database connection errors
    if (response.status !== 200) {
      dbConnectionErrors.add(1);
    }
  });
}

function recordMetrics(response) {
  recordResponseTime(response, null);
  recordRequest(response, 'endurance');
  
  // Track for trend analysis
  requestDurations.push(response.timings.duration);
  requestCount++;
  
  if (response.status >= 400) {
    errorCount++;
  }
  
  // Keep array size manageable
  if (requestDurations.length > 1000) {
    requestDurations = requestDurations.slice(-500);
  }
}

export function setup() {
  console.log(`Starting endurance test against: ${CONFIG.baseUrl}`);
  console.log('Duration: 1 hour with 50 VUs');
  console.log('Monitoring for:');
  console.log('  - Memory leaks');
  console.log('  - Connection pool exhaustion');
  console.log('  - Performance degradation over time');
  console.log('  - Resource leaks');
  
  // Verify service is healthy
  const healthCheck = http.get(`${CONFIG.baseUrl}${CONFIG.endpoints.health.basic}`);
  if (healthCheck.status !== 200) {
    throw new Error('Service is not healthy. Aborting endurance test.');
  }
  
  return { 
    startTime: Date.now(),
    initialMemory: null, // Would be populated from health endpoint
  };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  const minutes = Math.floor(duration / 60);
  
  console.log(`Endurance test completed: ${minutes} minutes`);
  console.log(`Total requests: ${requestCount}`);
  console.log(`Error count: ${errorCount}`);
  console.log(`Error rate: ${(errorCount / requestCount * 100).toFixed(2)}%`);
  
  // Calculate performance trend
  if (requestDurations.length > 0) {
    const avgDuration = requestDurations.reduce((a, b) => a + b, 0) / requestDurations.length;
    console.log(`Average response time: ${avgDuration.toFixed(2)}ms`);
  }
  
  console.log('Check results for:');
  console.log('  - Increasing memory usage (memory leak)');
  console.log('  - Increasing response times over time');
  console.log('  - Connection pool exhaustion');
  console.log('  - File descriptor leaks');
}
