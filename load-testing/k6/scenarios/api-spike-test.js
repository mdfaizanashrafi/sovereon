/**
 * ============================================================================
 * API SPIKE TEST
 * ============================================================================
 * Spike test to simulate sudden traffic surge
 * - 0 → 1000 users instantly
 * - Tests auto-scaling
 * - Recovery validation
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { CONFIG } from '../config.js';
import { checkStandard, checkHealth } from '../utils/checks.js';
import { recordResponseTime, recordRequest } from '../utils/metrics.js';

// Spike test options - sudden traffic surge
export const options = {
  stages: [
    { duration: '30s', target: 50 },     // Baseline normal traffic
    { duration: '10s', target: 1000 },   // SUDDEN SPIKE to 1000 VUs
    { duration: '3m', target: 1000 },    // Hold spike
    { duration: '2m', target: 100 },     // Drop to normal
    { duration: '5m', target: 100 },     // Verify recovery
    { duration: '1m', target: 0 },       // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],   // 95% under 2000ms during spike
    http_req_failed: ['rate<0.10'],       // <10% errors acceptable during spike
    http_reqs: ['count>1000'],            // At least 1000 requests
  },
};

export default function () {
  const phase = getCurrentPhase();
  
  group('Spike Test - Mixed Traffic', () => {
    // Core endpoints that must remain available
    const coreEndpoints = [
      CONFIG.endpoints.health.basic,
      CONFIG.endpoints.health.ready,
      CONFIG.endpoints.public.services,
    ];
    
    // Additional endpoints to test
    const secondaryEndpoints = [
      CONFIG.endpoints.public.teamMembers,
      CONFIG.endpoints.public.testimonials,
      CONFIG.endpoints.public.faqs,
    ];
    
    // Always hit core endpoints
    for (const endpoint of coreEndpoints) {
      const url = `${CONFIG.baseUrl}${endpoint}`;
      const response = http.get(url);
      
      recordResponseTime(response, null);
      recordRequest(response, 'spike_core');
      
      // Lenient checks during spike
      check(response, {
        'core endpoint responds': (r) => r.status !== 0,
        'core endpoint no server error': (r) => r.status < 500,
      });
    }
    
    // Randomly hit secondary endpoints
    if (randomIntBetween(1, 100) <= 50) {
      const endpoint = secondaryEndpoints[randomIntBetween(0, secondaryEndpoints.length - 1)];
      const url = `${CONFIG.baseUrl}${endpoint}`;
      const response = http.get(url);
      
      recordResponseTime(response, null);
      recordRequest(response, 'spike_secondary');
      
      check(response, {
        'secondary endpoint responds': (r) => r.status !== 0,
      });
    }
  });
  
  // Minimal sleep during spike
  if (phase === 'spike') {
    sleep(0.1);
  } else {
    sleep(randomIntBetween(0.5, 2));
  }
}

function getCurrentPhase() {
  // Simple phase detection based on elapsed time
  // This is approximate; actual phase depends on stage timing
  const elapsed = (__ITER || 0) * 2; // Rough estimate
  
  if (elapsed < 30) return 'baseline';
  if (elapsed < 40) return 'spike_ramp';
  if (elapsed < 220) return 'spike';
  if (elapsed < 340) return 'recovery';
  return 'cooldown';
}

export function setup() {
  console.log(`Starting spike test against: ${CONFIG.baseUrl}`);
  console.log('WARNING: This will generate a sudden spike of 1000 VUs');
  console.log('Ensure your infrastructure can handle this load');
  
  // Verify service is healthy
  const healthCheck = http.get(`${CONFIG.baseUrl}${CONFIG.endpoints.health.basic}`);
  if (healthCheck.status !== 200) {
    throw new Error('Service is not healthy. Aborting spike test.');
  }
  
  return { 
    startTime: Date.now(),
    expectedPhases: ['baseline', 'spike', 'recovery'],
  };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Spike test completed in ${duration}s`);
  console.log('Check results for:');
  console.log('  - Response times during spike');
  console.log('  - Error rates during spike');
  console.log('  - Recovery time after spike');
  console.log('  - Any cascading failures');
}
