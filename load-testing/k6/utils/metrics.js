/**
 * ============================================================================
 * CUSTOM METRICS
 * ============================================================================
 * Custom metrics definitions for k6 load tests
 */

import { Counter, Gauge, Rate, Trend } from 'k6/metrics';

// ============================================================================
// RESPONSE TIME METRICS
// ============================================================================

// Trend metrics for different percentiles
export const responseTimeP50 = new Trend('custom_response_time_p50');
export const responseTimeP95 = new Trend('custom_response_time_p95');
export const responseTimeP99 = new Trend('custom_response_time_p99');

// Endpoint-specific response times
export const healthCheckTime = new Trend('health_check_response_time');
export const publicEndpointTime = new Trend('public_endpoint_response_time');
export const adminEndpointTime = new Trend('admin_endpoint_response_time');
export const crudOperationTime = new Trend('crud_operation_response_time');

// ============================================================================
// THROUGHPUT METRICS
// ============================================================================

// Request counters
export const requestCount = new Counter('total_requests');
export const successfulRequests = new Counter('successful_requests');
export const failedRequests = new Counter('failed_requests');

// Endpoint-specific counters
export const healthRequests = new Counter('health_requests');
export const publicRequests = new Counter('public_requests');
export const adminRequests = new Counter('admin_requests');
export const crudRequests = new Counter('crud_requests');

// ============================================================================
// ERROR METRICS
// ============================================================================

// Error rate tracking
export const errorRate = new Rate('error_rate');

// Specific error counters
export const http4xxErrors = new Counter('http_4xx_errors');
export const http5xxErrors = new Counter('http_5xx_errors');
export const timeoutErrors = new Counter('timeout_errors');
export const connectionErrors = new Counter('connection_errors');

// Error by endpoint
export const healthCheckErrors = new Counter('health_check_errors');
export const publicEndpointErrors = new Counter('public_endpoint_errors');
export const adminEndpointErrors = new Counter('admin_endpoint_errors');

// ============================================================================
// BUSINESS METRICS
// ============================================================================

// Form submission tracking
export const contactSubmissions = new Counter('contact_submissions');
export const consultationRequests = new Counter('consultation_requests');
export const formSubmissionErrors = new Counter('form_submission_errors');

// CRUD operation tracking
export const crudCreates = new Counter('crud_creates');
export const crudReads = new Counter('crud_reads');
export const crudUpdates = new Counter('crud_updates');
export const crudDeletes = new Counter('crud_deletes');

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

// Cache metrics
export const cacheHits = new Counter('cache_hits');
export const cacheMisses = new Counter('cache_misses');
export const cacheHitRate = new Rate('cache_hit_rate');

// Database metrics
export const dbQueryTime = new Trend('db_query_time');
export const dbConnectionErrors = new Counter('db_connection_errors');

// Memory and resource usage
export const memoryUsage = new Gauge('memory_usage_mb');
export const cpuUsage = new Gauge('cpu_usage_percent');

// ============================================================================
// AUTHENTICATION METRICS
// ============================================================================

export const loginAttempts = new Counter('login_attempts');
export const loginSuccess = new Counter('login_success');
export const loginFailures = new Counter('login_failures');
export const sessionRefreshes = new Counter('session_refreshes');

// ============================================================================
// ENDPOINT-SPECIFIC METRICS
// ============================================================================

// Health endpoints
export const healthBasicTime = new Trend('health_basic_time');
export const healthDetailedTime = new Trend('health_detailed_time');
export const healthDBTime = new Trend('health_db_time');
export const healthCacheTime = new Trend('health_cache_time');

// Public CMS endpoints
export const teamMembersTime = new Trend('team_members_time');
export const servicesTime = new Trend('services_time');
export const testimonialsTime = new Trend('testimonials_time');
export const faqsTime = new Trend('faqs_time');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Record response time metrics
 * @param {Object} response - HTTP response
 * @param {Trend} trendMetric - Trend metric to record
 */
export function recordResponseTime(response, trendMetric) {
  const duration = response.timings.duration;
  trendMetric.add(duration);
  
  // Also record to general metrics
  responseTimeP50.add(duration);
  responseTimeP95.add(duration);
  responseTimeP99.add(duration);
  
  return duration;
}

/**
 * Record request metrics
 * @param {Object} response - HTTP response
 * @param {string} endpoint - Endpoint name
 * @param {Counter} endpointCounter - Endpoint-specific counter
 */
export function recordRequest(response, endpoint, endpointCounter = null) {
  requestCount.add(1);
  
  if (endpointCounter) {
    endpointCounter.add(1);
  }
  
  if (response.status >= 200 && response.status < 300) {
    successfulRequests.add(1);
    errorRate.add(false);
  } else {
    failedRequests.add(1);
    errorRate.add(true);
    
    if (response.status >= 400 && response.status < 500) {
      http4xxErrors.add(1);
    } else if (response.status >= 500) {
      http5xxErrors.add(1);
    }
  }
}

/**
 * Record error metrics
 * @param {Error} error - Error object
 * @param {string} endpoint - Endpoint name
 */
export function recordError(error, endpoint) {
  failedRequests.add(1);
  errorRate.add(true);
  
  if (error.message && error.message.includes('timeout')) {
    timeoutErrors.add(1);
  } else if (error.message && error.message.includes('connection')) {
    connectionErrors.add(1);
  }
}

/**
 * Record CRUD metrics
 * @param {string} operation - CRUD operation (create, read, update, delete)
 * @param {boolean} success - Whether operation succeeded
 */
export function recordCRUD(operation, success) {
  const counterMap = {
    create: crudCreates,
    read: crudReads,
    update: crudUpdates,
    delete: crudDeletes,
  };
  
  const counter = counterMap[operation];
  if (counter) {
    counter.add(1);
  }
  
  if (!success) {
    // Track CRUD-specific errors
  }
}

/**
 * Update gauge metrics
 * @param {Gauge} gauge - Gauge metric
 * @param {number} value - Value to set
 */
export function updateGauge(gauge, value) {
  gauge.add(value);
}

export default {
  // Export all metrics
  responseTimeP50,
  responseTimeP95,
  responseTimeP99,
  healthCheckTime,
  publicEndpointTime,
  adminEndpointTime,
  crudOperationTime,
  requestCount,
  successfulRequests,
  failedRequests,
  healthRequests,
  publicRequests,
  adminRequests,
  crudRequests,
  errorRate,
  http4xxErrors,
  http5xxErrors,
  timeoutErrors,
  connectionErrors,
  healthCheckErrors,
  publicEndpointErrors,
  adminEndpointErrors,
  contactSubmissions,
  consultationRequests,
  formSubmissionErrors,
  crudCreates,
  crudReads,
  crudUpdates,
  crudDeletes,
  cacheHits,
  cacheMisses,
  cacheHitRate,
  dbQueryTime,
  dbConnectionErrors,
  memoryUsage,
  cpuUsage,
  loginAttempts,
  loginSuccess,
  loginFailures,
  sessionRefreshes,
  healthBasicTime,
  healthDetailedTime,
  healthDBTime,
  healthCacheTime,
  teamMembersTime,
  servicesTime,
  testimonialsTime,
  faqsTime,
  // Helper functions
  recordResponseTime,
  recordRequest,
  recordError,
  recordCRUD,
  updateGauge,
};
