/**
 * ============================================================================
 * API STRESS TEST
 * ============================================================================
 * Stress test to find the breaking point of the system
 * - Ramp to 500+ users
 * - 10 minute duration
 * - Identifies bottlenecks
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { CONFIG } from '../config.js';
import { checkStandard, checkHealth } from '../utils/checks.js';
import { recordResponseTime, recordRequest, errorRate } from '../utils/metrics.js';

// Stress test options - gradual ramp to find breaking point
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Normal load
    { duration: '2m', target: 200 },   // 2x load
    { duration: '2m', target: 300 },   // 3x load
    { duration: '2m', target: 400 },   // 4x load
    { duration: '2m', target: 500 },   // 5x load - stress point
    { duration: '3m', target: 500 },   // Hold at stress point
    { duration: '2m', target: 200 },   // Ramp down
    { duration: '1m', target: 0 },     // Recovery
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% under 1000ms under stress
    http_req_failed: ['rate<0.05'],      // <5% errors acceptable
    checks: ['rate>0.90'],               // 90% of checks must pass
  },
};

export default function () {
  const target = __ENV.TARGET || 'mixed';
  
  switch (target) {
    case 'health':
      stressHealth();
      break;
    case 'public':
      stressPublic();
      break;
    case 'database':
      stressDatabase();
      break;
    case 'mixed':
    default:
      stressMixed();
      break;
  }
  
  // Shorter think time during stress test
  sleep(randomIntBetween(0.5, 2));
}

function stressHealth() {
  group('Stress - Health Endpoints', () => {
    const urls = [
      `${CONFIG.baseUrl}${CONFIG.endpoints.health.basic}`,
      `${CONFIG.baseUrl}${CONFIG.endpoints.health.ready}`,
      `${CONFIG.baseUrl}${CONFIG.endpoints.health.detailed}`,
    ];
    
    for (const url of urls) {
      const response = http.get(url);
      
      recordResponseTime(response, null);
      recordRequest(response, 'stress_health');
      
      // More lenient checks during stress
      check(response, {
        'response received': (r) => r.status !== 0,
        'status < 500': (r) => r.status < 500,
      });
    }
  });
}

function stressPublic() {
  group('Stress - Public Endpoints', () => {
    const endpoints = [
      CONFIG.endpoints.public.teamMembers,
      CONFIG.endpoints.public.services,
      CONFIG.endpoints.public.testimonials,
      CONFIG.endpoints.public.faqs,
      CONFIG.endpoints.public.caseStudies,
      CONFIG.endpoints.public.blogPosts,
    ];
    
    const requests = endpoints.map(endpoint => ({
      method: 'GET',
      url: `${CONFIG.baseUrl}${endpoint}`,
    }));
    
    const responses = http.batch(requests);
    
    for (const response of responses) {
      recordResponseTime(response, null);
      recordRequest(response, 'stress_public');
      
      check(response, {
        'response received': (r) => r.status !== 0,
        'status < 500': (r) => r.status < 500,
      });
    }
  });
}

function stressDatabase() {
  group('Stress - Database Operations', () => {
    // Hit endpoints that require database queries
    const urls = [
      `${CONFIG.baseUrl}${CONFIG.endpoints.health.db}`,
      `${CONFIG.baseUrl}${CONFIG.endpoints.public.services}`,
      `${CONFIG.baseUrl}${CONFIG.endpoints.services.list}`,
    ];
    
    for (const url of urls) {
      const response = http.get(url);
      
      recordResponseTime(response, null);
      recordRequest(response, 'stress_db');
      
      check(response, {
        'response received': (r) => r.status !== 0,
        'status < 500': (r) => r.status < 500,
      });
    }
  });
}

function stressMixed() {
  group('Stress - Mixed Workload', () => {
    // Simulate realistic mixed traffic under stress
    const scenarios = [
      { weight: 30, type: 'health' },
      { weight: 50, type: 'public' },
      { weight: 20, type: 'database' },
    ];
    
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const scenario of scenarios) {
      cumulative += scenario.weight;
      if (random <= cumulative) {
        switch (scenario.type) {
          case 'health':
            stressHealth();
            break;
          case 'public':
            stressPublic();
            break;
          case 'database':
            stressDatabase();
            break;
        }
        break;
      }
    }
  });
}

export function setup() {
  console.log(`Starting stress test against: ${CONFIG.baseUrl}`);
  console.log('This test will ramp up to 500 VUs to find the breaking point');
  console.log('Target:', __ENV.TARGET || 'mixed');
  
  // Verify service is healthy
  const healthCheck = http.get(`${CONFIG.baseUrl}${CONFIG.endpoints.health.basic}`);
  if (healthCheck.status !== 200) {
    throw new Error('Service is not healthy. Aborting stress test.');
  }
  
  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Stress test completed in ${duration}s`);
  console.log('Check results for performance degradation and error rates');
}
