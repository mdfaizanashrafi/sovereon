/**
 * ============================================================================
 * CRUD OPERATIONS TEST
 * ============================================================================
 * Tests for Create, Read, Update, Delete operations
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { CONFIG } from '../config.js';
import { checkStandard, checkCRUDResponse } from '../utils/checks.js';
import { loginAsAdmin, withAuth } from '../utils/auth.js';
import { generateTeamMember, generateFAQ, generateTestimonial } from '../utils/data.js';

export const options = {
  vus: 3,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
  console.log('Setting up CRUD test...');
  
  const session = loginAsAdmin();
  
  if (!session) {
    console.error('Failed to authenticate');
    return { skip: true };
  }
  
  return { session, startTime: Date.now() };
}

export default function (data) {
  if (data.skip) {
    return;
  }
  
  const session = data.session;
  
  group('CRUD Operations', () => {
    testTeamMembersCRUD(session);
    testFAQCRUD(session);
    testTestimonialCRUD(session);
  });
}

function testTeamMembersCRUD(session) {
  group('Team Members CRUD', () => {
    const baseUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.teamMembers}`;
    
    // CREATE
    const createData = generateTeamMember();
    const createResponse = http.post(
      baseUrl,
      JSON.stringify(createData),
      withAuth(session)
    );
    
    checkCRUDResponse(createResponse, 'create');
    
    let createdId = null;
    try {
      const body = JSON.parse(createResponse.body);
      createdId = body.data?.id || body.id;
    } catch (e) {
      // Continue
    }
    
    // READ (List)
    const listResponse = http.get(baseUrl, withAuth(session));
    checkCRUDResponse(listResponse, 'read');
    
    // READ (By ID) - if we have an ID
    if (createdId) {
      const getResponse = http.get(
        `${baseUrl}/${createdId}`,
        withAuth(session)
      );
      checkCRUDResponse(getResponse, 'read');
    }
    
    // UPDATE - if we have an ID
    if (createdId) {
      const updateData = { ...createData, name: `Updated ${createData.name}` };
      const updateResponse = http.put(
        `${baseUrl}/${createdId}`,
        JSON.stringify(updateData),
        withAuth(session)
      );
      checkCRUDResponse(updateResponse, 'update');
    }
    
    // DELETE - if we have an ID
    if (createdId) {
      const deleteResponse = http.del(
        `${baseUrl}/${createdId}`,
        null,
        withAuth(session)
      );
      checkCRUDResponse(deleteResponse, 'delete');
    }
    
    sleep(2);
  });
}

function testFAQCRUD(session) {
  group('FAQ CRUD', () => {
    const baseUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.faqs}`;
    
    // CREATE
    const createData = generateFAQ();
    const createResponse = http.post(
      baseUrl,
      JSON.stringify(createData),
      withAuth(session)
    );
    
    check(createResponse, {
      'faq create successful': (r) => r.status === 201 || r.status === 200,
    });
    
    let createdId = null;
    try {
      const body = JSON.parse(createResponse.body);
      createdId = body.data?.id || body.id;
    } catch (e) {
      // Continue
    }
    
    // READ
    const listResponse = http.get(baseUrl, withAuth(session));
    checkStandard(listResponse, 200, 300);
    
    // UPDATE - if we have an ID
    if (createdId) {
      const updateData = { ...createData, answer: 'Updated answer' };
      const updateResponse = http.put(
        `${baseUrl}/${createdId}`,
        JSON.stringify(updateData),
        withAuth(session)
      );
      checkStandard(updateResponse, 200, 300);
    }
    
    // DELETE - if we have an ID
    if (createdId) {
      const deleteResponse = http.del(
        `${baseUrl}/${createdId}`,
        null,
        withAuth(session)
      );
      checkStandard(deleteResponse, 200, 300);
    }
    
    sleep(2);
  });
}

function testTestimonialCRUD(session) {
  group('Testimonial CRUD', () => {
    const baseUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.testimonials}`;
    
    // CREATE
    const createData = generateTestimonial();
    const createResponse = http.post(
      baseUrl,
      JSON.stringify(createData),
      withAuth(session)
    );
    
    check(createResponse, {
      'testimonial create successful': (r) => r.status === 201 || r.status === 200,
    });
    
    // READ
    const listResponse = http.get(baseUrl, withAuth(session));
    checkStandard(listResponse, 200, 300);
    
    sleep(2);
  });
}

export function teardown(data) {
  console.log('CRUD operations test completed');
}
