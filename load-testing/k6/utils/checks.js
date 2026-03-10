/**
 * ============================================================================
 * COMMON CHECK FUNCTIONS
 * ============================================================================
 * Reusable check functions for k6 tests
 */

import { check } from 'k6';

/**
 * Standard HTTP checks for any response
 * @param {Object} response - HTTP response object
 * @param {number} expectedStatus - Expected status code (default: 200)
 * @param {number} maxDuration - Maximum acceptable duration in ms (default: 200)
 * @returns {boolean} - Whether all checks passed
 */
export function checkStandard(response, expectedStatus = 200, maxDuration = 200) {
  return check(response, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'response time OK': (r) => r.timings.duration < maxDuration,
    'response is not empty': (r) => r.body && r.body.length > 0,
  });
}

/**
 * Check for JSON response
 * @param {Object} response - HTTP response object
 * @param {number} expectedStatus - Expected status code
 * @returns {boolean} - Whether all checks passed
 */
export function checkJSON(response, expectedStatus = 200) {
  return check(response, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'content type is JSON': (r) => r.headers['Content-Type'] && 
      r.headers['Content-Type'].includes('application/json'),
    'response is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });
}

/**
 * Check for successful API response
 * @param {Object} response - HTTP response object
 * @returns {boolean} - Whether all checks passed
 */
export function checkAPISuccess(response) {
  const checks = {
    'status is 200': (r) => r.status === 200,
    'response has success flag': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.success === true;
      } catch (e) {
        return false;
      }
    },
    'response has data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.data !== undefined;
      } catch (e) {
        return false;
      }
    },
  };
  
  return check(response, checks);
}

/**
 * Check for health endpoint response
 * @param {Object} response - HTTP response object
 * @param {string} expectedStatus - Expected health status
 * @returns {boolean} - Whether all checks passed
 */
export function checkHealth(response, expectedStatus = 'healthy') {
  return check(response, {
    'health check returns 200': (r) => r.status === 200,
    [`status is ${expectedStatus}`]: (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === expectedStatus || body.success === true;
      } catch (e) {
        return false;
      }
    },
    'has timestamp': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.timestamp !== undefined;
      } catch (e) {
        return false;
      }
    },
  });
}

/**
 * Check for array response
 * @param {Object} response - HTTP response object
 * @param {number} minLength - Minimum array length
 * @returns {boolean} - Whether all checks passed
 */
export function checkArrayResponse(response, minLength = 0) {
  return check(response, {
    'status is 200': (r) => r.status === 200,
    'response is array': (r) => {
      try {
        const body = JSON.parse(r.body);
        const data = body.data || body;
        return Array.isArray(data);
      } catch (e) {
        return false;
      }
    },
    [`array has at least ${minLength} items`]: (r) => {
      try {
        const body = JSON.parse(r.body);
        const data = body.data || body;
        return Array.isArray(data) && data.length >= minLength;
      } catch (e) {
        return false;
      }
    },
  });
}

/**
 * Check for paginated response
 * @param {Object} response - HTTP response object
 * @returns {boolean} - Whether all checks passed
 */
export function checkPaginatedResponse(response) {
  return check(response, {
    'status is 200': (r) => r.status === 200,
    'has pagination info': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.pagination !== undefined || 
               (body.page !== undefined && body.limit !== undefined);
      } catch (e) {
        return false;
      }
    },
    'has data array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data);
      } catch (e) {
        return false;
      }
    },
  });
}

/**
 * Check for error response
 * @param {Object} response - HTTP response object
 * @param {number} expectedStatus - Expected error status code
 * @returns {boolean} - Whether all checks passed
 */
export function checkErrorResponse(response, expectedStatus = 400) {
  return check(response, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'has error message': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.error !== undefined || body.message !== undefined;
      } catch (e) {
        return r.body && r.body.length > 0;
      }
    },
  });
}

/**
 * Check response time tiers
 * @param {Object} response - HTTP response object
 * @returns {Object} - Check results object
 */
export function checkResponseTimeTiers(response) {
  return check(response, {
    'response time < 100ms (excellent)': (r) => r.timings.duration < 100,
    'response time < 200ms (good)': (r) => r.timings.duration < 200,
    'response time < 500ms (acceptable)': (r) => r.timings.duration < 500,
    'response time < 1000ms (slow)': (r) => r.timings.duration < 1000,
  });
}

/**
 * Check for rate limiting response
 * @param {Object} response - HTTP response object
 * @returns {boolean} - Whether rate limit was hit
 */
export function checkRateLimit(response) {
  return check(response, {
    'rate limit headers present': (r) => {
      return r.headers['X-RateLimit-Limit'] !== undefined ||
             r.headers['RateLimit-Limit'] !== undefined ||
             r.headers['Retry-After'] !== undefined;
    },
    'rate limit status (429)': (r) => r.status === 429,
  });
}

/**
 * Check for caching headers
 * @param {Object} response - HTTP response object
 * @returns {boolean} - Whether caching headers are present
 */
export function checkCacheHeaders(response) {
  return check(response, {
    'has cache headers': (r) => {
      const headers = r.headers;
      return headers['Cache-Control'] !== undefined ||
             headers['ETag'] !== undefined ||
             headers['Last-Modified'] !== undefined ||
             headers['X-Cache'] !== undefined;
    },
  });
}

/**
 * Comprehensive check for CRUD operations
 * @param {Object} response - HTTP response object
 * @param {string} operation - CRUD operation name
 * @returns {boolean} - Whether all checks passed
 */
export function checkCRUDResponse(response, operation) {
  const statusMap = {
    create: 201,
    read: 200,
    update: 200,
    delete: 200,
  };
  
  const expectedStatus = statusMap[operation] || 200;
  
  return check(response, {
    [`${operation} status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${operation} response time OK`]: (r) => r.timings.duration < 300,
    [`${operation} has valid body`]: (r) => r.body && r.body.length > 0,
  });
}

export default {
  checkStandard,
  checkJSON,
  checkAPISuccess,
  checkHealth,
  checkArrayResponse,
  checkPaginatedResponse,
  checkErrorResponse,
  checkResponseTimeTiers,
  checkRateLimit,
  checkCacheHeaders,
  checkCRUDResponse,
};
