/**
 * ============================================================================
 * API SMOKE TEST
 * ============================================================================
 * Quick health check to validate all endpoints respond correctly
 * - 10 virtual users
 * - 30 second duration
 * - Validates all endpoints respond
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { CONFIG } from '../config.js';
import { checkStandard, checkHealth, checkAPISuccess } from '../utils/checks.js';

// Smoke test options
export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% under 500ms
    http_req_failed: ['rate<0.01'],     // <1% errors
    checks: ['rate>0.95'],              // 95% of checks must pass
  },
};

// Test scenarios
const ENDPOINTS = {
  health: [
    CONFIG.endpoints.health.basic,
    CONFIG.endpoints.health.live,
    CONFIG.endpoints.health.ready,
    CONFIG.endpoints.health.detailed,
  ],
  public: [
    CONFIG.endpoints.public.teamMembers,
    CONFIG.endpoints.public.serviceCategories,
    CONFIG.endpoints.public.services,
    CONFIG.endpoints.public.testimonials,
    CONFIG.endpoints.public.faqs,
    CONFIG.endpoints.public.settings,
  ],
  services: [
    CONFIG.endpoints.services.list,
  ],
};

export default function () {
  // Test health endpoints
  group('Health Endpoints', () => {
    for (const endpoint of ENDPOINTS.health) {
      const url = `${CONFIG.baseUrl}${endpoint}`;
      const response = http.get(url);
      
      checkHealth(response);
      sleep(0.5);
    }
  });

  // Test public endpoints
  group('Public Endpoints', () => {
    for (const endpoint of ENDPOINTS.public) {
      const url = `${CONFIG.baseUrl}${endpoint}`;
      const response = http.get(url);
      
      checkStandard(response, 200, 500);
      sleep(0.5);
    }
  });

  // Test services endpoint
  group('Services Endpoint', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.services.list}`;
    const response = http.get(url);
    
    checkAPISuccess(response);
    sleep(0.5);
  });
}

// Setup function - runs once before tests
export function setup() {
  console.log(`Running smoke test against: ${CONFIG.baseUrl}`);
  console.log(`Environment: ${CONFIG.environment}`);
  
  // Verify base URL is accessible
  const healthCheck = http.get(`${CONFIG.baseUrl}${CONFIG.endpoints.health.basic}`);
  
  if (healthCheck.status !== 200) {
    console.error(`Health check failed: ${healthCheck.status}`);
    throw new Error('Service is not healthy. Aborting smoke test.');
  }
  
  console.log('Health check passed. Starting smoke test...');
  return { startTime: Date.now() };
}

// Teardown function - runs once after tests
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Smoke test completed in ${duration}s`);
}
