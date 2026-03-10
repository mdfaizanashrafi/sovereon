/**
 * ============================================================================
 * AUTHENTICATION UTILITIES
 * ============================================================================
 * Helper functions for authentication in load tests
 */

import http from 'k6/http';
import { check } from 'k6';
import { CONFIG } from '../config.js';

/**
 * Login as admin user
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Object} - Session object with cookies
 */
export function loginAsAdmin(username, password) {
  const url = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.login}`;
  
  const payload = JSON.stringify({
    username: username || __ENV.ADMIN_USERNAME || 'admin',
    password: password || __ENV.ADMIN_PASSWORD || 'password',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(url, payload, params);
  
  const success = check(response, {
    'login successful': (r) => r.status === 200,
    'has session cookie': (r) => r.cookies && Object.keys(r.cookies).length > 0,
  });
  
  if (!success) {
    console.error(`Login failed: ${response.status} - ${response.body}`);
    return null;
  }
  
  return {
    cookies: response.cookies,
    headers: {
      'Cookie': Object.entries(response.cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; '),
    },
  };
}

/**
 * Get admin session info
 * @param {Object} session - Session object from login
 * @returns {Object} - Session info response
 */
export function getSessionInfo(session) {
  if (!session) return null;
  
  const url = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.me}`;
  
  const response = http.get(url, {
    headers: session.headers,
  });
  
  check(response, {
    'session info retrieved': (r) => r.status === 200,
  });
  
  return response;
}

/**
 * Logout admin user
 * @param {Object} session - Session object
 * @returns {Object} - Logout response
 */
export function logout(session) {
  if (!session) return null;
  
  const url = `${CONFIG.baseUrl}${CONFIG.endpoints.admin.logout}`;
  
  const response = http.post(url, null, {
    headers: session.headers,
  });
  
  check(response, {
    'logout successful': (r) => r.status === 200,
  });
  
  return response;
}

/**
 * Create authenticated request params
 * @param {Object} session - Session object
 * @param {Object} additionalHeaders - Additional headers
 * @returns {Object} - Request params with auth
 */
export function withAuth(session, additionalHeaders = {}) {
  if (!session) {
    return {
      headers: {
        'Content-Type': 'application/json',
        ...additionalHeaders,
      },
    };
  }
  
  return {
    headers: {
      'Content-Type': 'application/json',
      ...session.headers,
      ...additionalHeaders,
    },
    cookies: session.cookies,
  };
}

/**
 * Batch login for multiple virtual users
 * @param {number} count - Number of sessions to create
 * @returns {Array} - Array of session objects
 */
export function batchLogin(count = 5) {
  const sessions = [];
  
  for (let i = 0; i < count; i++) {
    const session = loginAsAdmin();
    if (session) {
      sessions.push(session);
    }
  }
  
  return sessions;
}

export default {
  loginAsAdmin,
  getSessionInfo,
  logout,
  withAuth,
  batchLogin,
};
