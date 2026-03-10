/**
 * ============================================================================
 * PUBLIC ENDPOINTS TEST
 * ============================================================================
 * Tests for public CMS endpoints that don't require authentication
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { CONFIG } from '../config.js';
import { checkStandard, checkArrayResponse, checkAPISuccess } from '../utils/checks.js';
import { generatePaginationParams } from '../utils/data.js';

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.001'],
  },
};

export default function () {
  group('Public Endpoints', () => {
    testTeamMembers();
    testServiceCategories();
    testServices();
    testTestimonials();
    testFAQs();
    testSettings();
    testCaseStudies();
    testBlogPosts();
  });
}

function testTeamMembers() {
  group('Team Members', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.public.teamMembers}`;
    const response = http.get(url);
    
    checkArrayResponse(response, 0);
    check(response, {
      'team members has required fields': (r) => {
        try {
          const body = JSON.parse(r.body);
          const data = body.data || body;
          if (Array.isArray(data) && data.length > 0) {
            return data[0].hasOwnProperty('name') && 
                   data[0].hasOwnProperty('role');
          }
          return true;
        } catch (e) {
          return false;
        }
      },
    });
    
    sleep(0.5);
  });
}

function testServiceCategories() {
  group('Service Categories', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.public.serviceCategories}`;
    const response = http.get(url);
    
    checkArrayResponse(response, 0);
    checkAPISuccess(response);
    
    sleep(0.5);
  });
}

function testServices() {
  group('Services', () => {
    // List services
    const listUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.public.services}`;
    const listResponse = http.get(listUrl);
    
    checkArrayResponse(listResponse, 0);
    
    // Test detail endpoint if we have services
    try {
      const body = JSON.parse(listResponse.body);
      const data = body.data || body;
      if (Array.isArray(data) && data.length > 0 && data[0].slug) {
        const detailUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.public.services}/${data[0].slug}`;
        const detailResponse = http.get(detailUrl);
        
        checkStandard(detailResponse, 200, 300);
      }
    } catch (e) {
      // Continue if parsing fails
    }
    
    sleep(0.5);
  });
}

function testTestimonials() {
  group('Testimonials', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.public.testimonials}`;
    const response = http.get(url);
    
    checkArrayResponse(response, 0);
    check(response, {
      'testimonials has rating': (r) => {
        try {
          const body = JSON.parse(r.body);
          const data = body.data || body;
          if (Array.isArray(data) && data.length > 0) {
            return data[0].hasOwnProperty('rating') || 
                   data[0].hasOwnProperty('content');
          }
          return true;
        } catch (e) {
          return false;
        }
      },
    });
    
    sleep(0.5);
  });
}

function testFAQs() {
  group('FAQs', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.public.faqs}`;
    const response = http.get(url);
    
    checkArrayResponse(response, 0);
    check(response, {
      'faqs has Q&A format': (r) => {
        try {
          const body = JSON.parse(r.body);
          const data = body.data || body;
          if (Array.isArray(data) && data.length > 0) {
            return data[0].hasOwnProperty('question') && 
                   data[0].hasOwnProperty('answer');
          }
          return true;
        } catch (e) {
          return false;
        }
      },
    });
    
    sleep(0.5);
  });
}

function testSettings() {
  group('Settings', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.public.settings}`;
    const response = http.get(url);
    
    checkStandard(response, 200, 200);
    checkAPISuccess(response);
    
    sleep(0.5);
  });
}

function testCaseStudies() {
  group('Case Studies', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.public.caseStudies}`;
    const response = http.get(url);
    
    checkArrayResponse(response, 0);
    
    // Test detail endpoint
    try {
      const body = JSON.parse(response.body);
      const data = body.data || body;
      if (Array.isArray(data) && data.length > 0 && data[0].slug) {
        const detailUrl = `${url}/${data[0].slug}`;
        const detailResponse = http.get(detailUrl);
        
        checkStandard(detailResponse, 200, 300);
      }
    } catch (e) {
      // Continue if parsing fails
    }
    
    sleep(0.5);
  });
}

function testBlogPosts() {
  group('Blog Posts', () => {
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.public.blogPosts}`;
    const response = http.get(url);
    
    checkArrayResponse(response, 0);
    
    // Test detail endpoint
    try {
      const body = JSON.parse(response.body);
      const data = body.data || body;
      if (Array.isArray(data) && data.length > 0 && data[0].slug) {
        const detailUrl = `${url}/${data[0].slug}`;
        const detailResponse = http.get(detailUrl);
        
        checkStandard(detailResponse, 200, 300);
      }
    } catch (e) {
      // Continue if parsing fails
    }
    
    sleep(0.5);
  });
}

export function setup() {
  console.log('Testing public endpoints...');
  return { startTime: Date.now() };
}
