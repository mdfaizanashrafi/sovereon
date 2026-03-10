/**
 * ============================================================================
 * SEARCH QUERIES TEST
 * ============================================================================
 * Tests for search and query functionality
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { CONFIG } from '../config.js';
import { checkStandard, checkArrayResponse, checkPaginatedResponse } from '../utils/checks.js';

export const options = {
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.001'],
  },
};

// Test search terms
const SEARCH_TERMS = [
  'AI', 'artificial intelligence', 'machine learning',
  'web', 'development', 'software',
  'cloud', 'aws', 'azure',
  'mobile', 'app', 'ios', 'android',
  'data', 'analytics', 'big data',
  'consulting', 'strategy',
];

export default function () {
  group('Search and Query Tests', () => {
    testPagination();
    testFiltering();
    testSorting();
    testSearch();
  });
}

function testPagination() {
  group('Pagination', () => {
    const endpoints = [
      CONFIG.endpoints.public.services,
      CONFIG.endpoints.public.teamMembers,
      CONFIG.endpoints.public.testimonials,
    ];
    
    for (const endpoint of endpoints) {
      const page = randomIntBetween(1, 5);
      const limit = randomIntBetween(10, 50);
      const url = `${CONFIG.baseUrl}${endpoint}?page=${page}&limit=${limit}`;
      
      const response = http.get(url);
      
      checkPaginatedResponse(response);
      check(response, {
        'pagination has correct limit': (r) => {
          try {
            const body = JSON.parse(r.body);
            if (body.data && Array.isArray(body.data)) {
              return body.data.length <= limit;
            }
            return true;
          } catch (e) {
            return false;
          }
        },
      });
    }
    
    sleep(0.5);
  });
}

function testFiltering() {
  group('Filtering', () => {
    // Test active/inactive filtering
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.public.services}?isActive=true`;
    const response = http.get(url);
    
    checkStandard(response, 200, 300);
    check(response, {
      'filter returns only active': (r) => {
        try {
          const body = JSON.parse(r.body);
          const data = body.data || body;
          if (Array.isArray(data)) {
            return data.every(item => item.isActive !== false);
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

function testSorting() {
  group('Sorting', () => {
    const sortFields = ['createdAt', 'name', 'order'];
    const sortOrders = ['asc', 'desc'];
    
    const field = sortFields[randomIntBetween(0, sortFields.length - 1)];
    const order = sortOrders[randomIntBetween(0, sortOrders.length - 1)];
    
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.public.services}?sort=${field}&order=${order}`;
    const response = http.get(url);
    
    checkStandard(response, 200, 300);
    checkArrayResponse(response, 0);
    
    sleep(0.5);
  });
}

function testSearch() {
  group('Search', () => {
    const searchTerm = SEARCH_TERMS[randomIntBetween(0, SEARCH_TERMS.length - 1)];
    
    // Search in services
    const servicesUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.public.services}?search=${encodeURIComponent(searchTerm)}`;
    const servicesResponse = http.get(servicesUrl);
    
    checkStandard(servicesResponse, 200, 400);
    checkArrayResponse(servicesResponse, 0);
    
    // Search in case studies
    const caseStudiesUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.public.caseStudies}?search=${encodeURIComponent(searchTerm)}`;
    const caseStudiesResponse = http.get(caseStudiesUrl);
    
    checkStandard(caseStudiesResponse, 200, 400);
    checkArrayResponse(caseStudiesResponse, 0);
    
    // Search in blog posts
    const blogUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.public.blogPosts}?search=${encodeURIComponent(searchTerm)}`;
    const blogResponse = http.get(blogUrl);
    
    checkStandard(blogResponse, 200, 400);
    checkArrayResponse(blogResponse, 0);
    
    sleep(0.5);
  });
}

function testComplexQueries() {
  group('Complex Queries', () => {
    // Test combined filters
    const params = new URLSearchParams({
      isActive: 'true',
      category: 'AI Solutions',
      sort: 'createdAt',
      order: 'desc',
      page: '1',
      limit: '20',
    });
    
    const url = `${CONFIG.baseUrl}${CONFIG.endpoints.public.services}?${params.toString()}`;
    const response = http.get(url);
    
    checkPaginatedResponse(response);
    checkStandard(response, 200, 400);
    
    sleep(0.5);
  });
}

export function setup() {
  console.log('Testing search and query functionality...');
  return { startTime: Date.now() };
}
