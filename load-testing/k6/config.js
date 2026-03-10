/**
 * ============================================================================
 * K6 LOAD TESTING CONFIGURATION
 * ============================================================================
 * Environment-based settings, thresholds, and stage configurations
 */

// Environment detection
const ENV = __ENV.ENV || 'staging';
const BASE_URL = __ENV.BASE_URL || getBaseUrl(ENV);

// Get base URL based on environment
function getBaseUrl(env) {
  const urls = {
    local: 'http://localhost:3000',
    development: 'http://localhost:3000',
    staging: 'https://api-staging.sovereon.online',
    production: 'https://api.sovereon.online',
  };
  return urls[env] || urls.staging;
}

// Threshold configurations
const THRESHOLDS = {
  // Standard thresholds for different test types
  smoke: {
    http_req_duration: ['p(95)<500'],      // 95% under 500ms
    http_req_failed: ['rate<0.01'],         // <1% errors
    http_reqs: ['count>10'],                // At least 10 requests
  },
  load: {
    http_req_duration: ['p(50)<100', 'p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.001'],        // <0.1% errors
    http_reqs: ['rate>50'],                 // >50 RPS
  },
  stress: {
    http_req_duration: ['p(95)<1000'],      // 95% under 1000ms under stress
    http_req_failed: ['rate<0.05'],         // <5% errors acceptable
  },
  spike: {
    http_req_duration: ['p(95)<2000'],      // 95% under 2000ms during spike
    http_req_failed: ['rate<0.10'],         // <10% errors acceptable
  },
  endurance: {
    http_req_duration: ['p(95)<200'],       // Consistent performance
    http_req_failed: ['rate<0.001'],        // Very low error rate
  },
};

// Stage configurations
const STAGES = {
  smoke: [
    { duration: '30s', target: 10 },       // 10 VUs for 30 seconds
  ],
  load: [
    { duration: '2m', target: 50 },        // Ramp up to 50 VUs
    { duration: '5m', target: 50 },        // Steady state
    { duration: '2m', target: 100 },       // Ramp up to 100 VUs
    { duration: '5m', target: 100 },       // Sustained at 100 VUs
    { duration: '2m', target: 0 },         // Ramp down
  ],
  stress: [
    { duration: '2m', target: 100 },       // Ramp to 100
    { duration: '2m', target: 200 },       // Ramp to 200
    { duration: '2m', target: 300 },       // Ramp to 300
    { duration: '2m', target: 400 },       // Ramp to 400
    { duration: '2m', target: 500 },       // Ramp to 500 (breaking point)
    { duration: '5m', target: 500 },       // Hold at 500
    { duration: '2m', target: 0 },         // Ramp down
  ],
  spike: [
    { duration: '10s', target: 1000 },     // Sudden spike to 1000 VUs
    { duration: '3m', target: 1000 },      // Hold spike
    { duration: '2m', target: 100 },       // Drop to normal
    { duration: '5m', target: 100 },       // Verify recovery
    { duration: '1m', target: 0 },         // Ramp down
  ],
  endurance: [
    { duration: '5m', target: 50 },        // Ramp up
    { duration: '55m', target: 50 },       // 1 hour sustained
    { duration: '5m', target: 0 },         // Ramp down
  ],
};

// Export configuration
export const CONFIG = {
  // Base configuration
  baseUrl: BASE_URL,
  environment: ENV,
  
  // API endpoints
  endpoints: {
    // Health endpoints
    health: {
      basic: '/api/health',
      live: '/api/health/live',
      ready: '/api/health/ready',
      detailed: '/api/health/detailed',
      db: '/api/health/db',
      cache: '/api/health/cache',
      memory: '/api/health/memory',
      system: '/api/health/system',
      performance: '/api/health/performance',
    },
    
    // Public CMS endpoints
    public: {
      teamMembers: '/api/v1/public/team-members',
      serviceCategories: '/api/v1/public/service-categories',
      services: '/api/v1/public/services',
      testimonials: '/api/v1/public/testimonials',
      faqs: '/api/v1/public/faqs',
      settings: '/api/v1/public/settings',
      currentProjects: '/api/v1/public/current-projects',
      futureQuests: '/api/v1/public/future-quests',
      caseStudies: '/api/v1/public/case-studies',
      blogPosts: '/api/v1/public/blog-posts',
    },
    
    // Admin endpoints
    admin: {
      login: '/api/v1/admin/auth/login',
      logout: '/api/v1/admin/auth/logout',
      me: '/api/v1/admin/auth/me',
      teamMembers: '/api/v1/admin/team-members',
      services: '/api/v1/admin/services',
      faqs: '/api/v1/admin/faqs',
      testimonials: '/api/v1/admin/testimonials',
      settings: '/api/v1/admin/settings',
    },
    
    // Contact endpoints
    contact: {
      submit: '/api/contact',
      consultation: '/api/consultation',
    },
    
    // Service endpoints
    services: {
      list: '/api/services',
      detail: (slug) => `/api/services/${slug}`,
    },
    
    // Metrics
    metrics: '/api/metrics',
  },
  
  // Thresholds
  thresholds: THRESHOLDS,
  
  // Stages
  stages: STAGES,
  
  // Request defaults
  requestDefaults: {
    timeout: '30s',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
  
  // Think time (sleep between requests)
  thinkTime: {
    min: 1,
    max: 5,
  },
};

// Helper to get options for a specific test type
export function getOptions(testType, customOptions = {}) {
  const baseOptions = {
    stages: STAGES[testType] || STAGES.load,
    thresholds: THRESHOLDS[testType] || THRESHOLDS.load,
  };
  
  return {
    ...baseOptions,
    ...customOptions,
  };
}

// Export individual configs for convenience
export { BASE_URL, ENV, THRESHOLDS, STAGES };

export default CONFIG;
