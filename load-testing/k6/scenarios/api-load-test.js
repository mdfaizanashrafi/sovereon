/**
 * ============================================================================
 * API LOAD TEST
 * ============================================================================
 * Sustained load test to measure performance under normal load
 * - 100 virtual users
 * - 5 minute steady state
 * - Tests all API endpoints
 * - Measures response times
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { CONFIG } from '../config.js';
import { checkStandard, checkAPISuccess, checkArrayResponse } from '../utils/checks.js';
import { recordResponseTime, recordRequest, publicEndpointTime } from '../utils/metrics.js';
import { generateContactForm } from '../utils/data.js';

// Load test options with stages
export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 VUs
    { duration: '5m', target: 100 },  // Ramp to 100 VUs (steady state)
    { duration: '5m', target: 100 },  // Stay at 100 VUs
    { duration: '2m', target: 50 },   // Ramp down to 50
    { duration: '1m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(50)<100', 'p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.001'],    // <0.1% errors
    http_reqs: ['rate>50'],              // >50 RPS
    checks: ['rate>0.99'],               // 99% of checks must pass
  },
};

// Test scenarios with weights
const SCENARIOS = [
  { name: 'health', weight: 10 },
  { name: 'public_cms', weight: 40 },
  { name: 'services', weight: 25 },
  { name: 'contact', weight: 15 },
  { name: 'mixed', weight: 10 },
];

export default function () {
  const scenario = selectScenario();
  
  switch (scenario) {
    case 'health':
      testHealthEndpoints();
      break;
    case 'public_cms':
      testPublicCMS();
      break;
    case 'services':
      testServices();
      break;
    case 'contact':
      testContactForm();
      break;
    case 'mixed':
      testMixedLoad();
      break;
  }
  
  sleep(randomIntBetween(1, 3));
}

function selectScenario() {
  const totalWeight = SCENARIOS.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const scenario of SCENARIOS) {
    random -= scenario.weight;
    if (random <= 0) {
      return scenario.name;
    }
  }
  
  return SCENARIOS[0].name;
}

function testHealthEndpoints() {
  group('Health Check', () => {
    const endpoints = [
      CONFIG.endpoints.health.basic,
      CONFIG.endpoints.health.ready,
    ];
    
    for (const endpoint of endpoints) {
      const url = `${CONFIG.baseUrl}${endpoint}`;
      const response = http.get(url);
      
      recordResponseTime(response, publicEndpointTime);
      recordRequest(response, 'health');
      checkStandard(response, 200, 100);
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
    
    // Pick 2-3 random endpoints
    const numCalls = randomIntBetween(2, 3);
    for (let i = 0; i < numCalls; i++) {
      const endpoint = endpoints[randomIntBetween(0, endpoints.length - 1)];
      const url = `${CONFIG.baseUrl}${endpoint}`;
      const response = http.get(url);
      
      recordResponseTime(response, publicEndpointTime);
      recordRequest(response, 'public_cms');
      checkArrayResponse(response, 0);
    }
  });
}

function testServices() {
  group('Services API', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.services.list}`;
    const response = http.get(url);
    
    recordResponseTime(response, publicEndpointTime);
    recordRequest(response, 'services');
    checkAPISuccess(response);
  });
}

function testContactForm() {
  group('Contact Form', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.contact.submit}`;
    const data = generateContactForm();
    
    const response = http.post(url, JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    recordResponseTime(response, publicEndpointTime);
    recordRequest(response, 'contact');
    checkStandard(response, 200, 500);
  });
}

function testMixedLoad() {
  group('Mixed Load', () => {
    // Make multiple requests in quick succession
    const requests = [
      { method: 'GET', url: `${CONFIG.baseUrl}${CONFIG.endpoints.public.teamMembers}` },
      { method: 'GET', url: `${CONFIG.baseUrl}${CONFIG.endpoints.public.services}` },
      { method: 'GET', url: `${CONFIG.baseUrl}${CONFIG.endpoints.health.basic}` },
    ];
    
    const responses = http.batch(requests);
    
    for (const response of responses) {
      recordResponseTime(response, publicEndpointTime);
      recordRequest(response, 'mixed');
      checkStandard(response, 200, 300);
    }
  });
}

export function setup() {
  console.log(`Starting load test against: ${CONFIG.baseUrl}`);
  console.log(`Target: 100 VUs sustained for 5 minutes`);
  
  // Verify service is healthy
  const healthCheck = http.get(`${CONFIG.baseUrl}${CONFIG.endpoints.health.basic}`);
  if (healthCheck.status !== 200) {
    throw new Error('Service is not healthy. Aborting load test.');
  }
  
  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration}s`);
}
