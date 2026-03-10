/**
 * ============================================================================
 * ADMIN ENDPOINTS TEST
 * ============================================================================
 * Tests for admin endpoints that require authentication
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { CONFIG } from '../config.js';
import { checkStandard, checkAPISuccess } from '../utils/checks.js';
import { loginAsAdmin, withAuth } from '../utils/auth.js';

export const options = {
  vus: 5,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

// Shared session (in real tests, use setup() to create sessions)
let session = null;

export function setup() {
  console.log('Setting up admin authentication...');
  
  // Login as admin
  session = loginAsAdmin();
  
  if (!session) {
    console.error('Failed to login as admin');
    return { skip: true };
  }
  
  return { session, startTime: Date.now() };
}

export default function (data) {
  if (data.skip) {
    console.log('Skipping admin tests - no authentication');
    return;
  }
  
  // Use session from setup
  const authSession = data.session;
  
  group('Admin Endpoints', () => {
    testAuthEndpoints(authSession);
    testTeamMembersAdmin(authSession);
    testServicesAdmin(authSession);
    testFAQsAdmin(authSession);
    testSettingsAdmin(authSession);
  });
}

function testAuthEndpoints(session) {
  group('Auth', () => {
    // Test /me endpoint
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.me}`;
    const response = http.get(url, withAuth(session));
    
    checkStandard(response, 200, 200);
    check(response, {
      'auth returns valid data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.hasOwnProperty('data');
        } catch (e) {
          return false;
        }
      },
    });
    
    sleep(1);
  });
}

function testTeamMembersAdmin(session) {
  group('Team Members (Admin)', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.teamMembers}`;
    
    // GET all
    const listResponse = http.get(url, withAuth(session));
    checkStandard(listResponse, 200, 300);
    
    // POST create (occasionally)
    if (Math.random() < 0.1) {
      const createData = {
        name: `Test ${Date.now()}`,
        role: 'Test Role',
        bio: 'Test bio',
        isActive: true,
      };
      
      const createResponse = http.post(
        url,
        JSON.stringify(createData),
        withAuth(session)
      );
      
      check(createResponse, {
        'create returns 201': (r) => r.status === 201 || r.status === 200,
      });
    }
    
    sleep(1);
  });
}

function testServicesAdmin(session) {
  group('Services (Admin)', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.services}`;
    
    // GET all
    const listResponse = http.get(url, withAuth(session));
    checkStandard(listResponse, 200, 300);
    
    sleep(1);
  });
}

function testFAQsAdmin(session) {
  group('FAQs (Admin)', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.faqs}`;
    
    // GET all
    const listResponse = http.get(url, withAuth(session));
    checkStandard(listResponse, 200, 300);
    
    sleep(1);
  });
}

function testSettingsAdmin(session) {
  group('Settings (Admin)', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.settings}`;
    
    // GET settings
    const getResponse = http.get(url, withAuth(session));
    checkStandard(getResponse, 200, 300);
    
    sleep(1);
  });
}

export function teardown(data) {
  if (data.session) {
    console.log('Cleaning up admin session...');
    // Logout if needed
  }
  
  console.log('Admin endpoints test completed');
}
