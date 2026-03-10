/**
 * ============================================================================
 * TEST DATA GENERATION UTILITIES
 * ============================================================================
 * Helper functions for generating test data
 */

import { randomIntBetween, randomString, uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

/**
 * Generate a random contact form submission
 * @returns {Object} - Contact form data
 */
export function generateContactForm() {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Wilson', 'Miller', 'Davis'];
  const services = ['AI Consulting', 'Web Development', 'Mobile App', 'Cloud Migration', 'Data Analytics'];
  
  const firstName = firstNames[randomIntBetween(0, firstNames.length - 1)];
  const lastName = lastNames[randomIntBetween(0, lastNames.length - 1)];
  
  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: `+1${randomIntBetween(2000000000, 9999999999)}`,
    company: `${lastName} Corp`,
    service: services[randomIntBetween(0, services.length - 1)],
    message: `This is a test message from ${firstName}. We are interested in learning more about your services.`,
    company_website: '', // Honeypot field - must be empty
  };
}

/**
 * Generate a consultation request
 * @returns {Object} - Consultation form data
 */
export function generateConsultationForm() {
  const data = generateContactForm();
  delete data.company; // Consultation form doesn't have company field
  return data;
}

/**
 * Generate a team member object
 * @returns {Object} - Team member data
 */
export function generateTeamMember() {
  const roles = ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist', 'DevOps Engineer'];
  
  return {
    name: `Test Member ${randomString(8)}`,
    role: roles[randomIntBetween(0, roles.length - 1)],
    bio: `This is a test bio for team member created during load testing.`,
    imageUrl: `https://example.com/images/${randomString(10)}.jpg`,
    linkedInUrl: 'https://linkedin.com/in/test',
    order: randomIntBetween(1, 100),
    isActive: true,
  };
}

/**
 * Generate a service object
 * @returns {Object} - Service data
 */
export function generateService() {
  const categories = ['AI Solutions', 'Web Development', 'Mobile Apps', 'Cloud Services', 'Consulting'];
  
  return {
    name: `Test Service ${randomString(8)}`,
    slug: `test-service-${randomString(8).toLowerCase()}`,
    description: `Test service description created during load testing.`,
    shortDescription: `Short description for test service.`,
    category: categories[randomIntBetween(0, categories.length - 1)],
    basePrice: randomIntBetween(1000, 50000),
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    isActive: true,
  };
}

/**
 * Generate a testimonial
 * @returns {Object} - Testimonial data
 */
export function generateTestimonial() {
  const companies = ['Tech Corp', 'Innovation Labs', 'Digital Solutions', 'Future Systems', 'Smart Tech'];
  
  return {
    clientName: `Test Client ${randomString(6)}`,
    company: companies[randomIntBetween(0, companies.length - 1)],
    content: `Excellent service! The team delivered beyond our expectations. Highly recommended!`,
    rating: randomIntBetween(4, 5),
    imageUrl: `https://example.com/testimonials/${randomString(10)}.jpg`,
    isActive: true,
  };
}

/**
 * Generate an FAQ
 * @returns {Object} - FAQ data
 */
export function generateFAQ() {
  const questions = [
    'What services do you offer?',
    'How long does a typical project take?',
    'What is your pricing model?',
    'Do you offer support after project completion?',
    'What technologies do you specialize in?',
  ];
  
  return {
    question: questions[randomIntBetween(0, questions.length - 1)],
    answer: `This is a test answer for the FAQ. It provides detailed information about the question.`,
    category: 'General',
    order: randomIntBetween(1, 100),
    isActive: true,
  };
}

/**
 * Generate a blog post
 * @returns {Object} - Blog post data
 */
export function generateBlogPost() {
  const titles = [
    'The Future of AI in Business',
    '10 Tips for Better Web Development',
    'Understanding Cloud Migration',
    'Best Practices for Mobile Apps',
    'Data Analytics Trends for 2024',
  ];
  
  return {
    title: titles[randomIntBetween(0, titles.length - 1)],
    slug: `blog-post-${randomString(8).toLowerCase()}`,
    content: `This is test content for a blog post. It contains information about various topics.`,
    excerpt: `Short excerpt for the blog post.`,
    author: `Test Author ${randomString(6)}`,
    published: true,
  };
}

/**
 * Get a random item from an array
 * @param {Array} array - Array to pick from
 * @returns {*} - Random item
 */
export function randomItem(array) {
  return array[randomIntBetween(0, array.length - 1)];
}

/**
 * Generate pagination parameters
 * @returns {Object} - Pagination params
 */
export function generatePaginationParams() {
  return {
    page: randomIntBetween(1, 10),
    limit: randomIntBetween(10, 50),
  };
}

/**
 * Generate search query parameters
 * @returns {Object} - Search params
 */
export function generateSearchParams() {
  const searchTerms = ['AI', 'cloud', 'mobile', 'web', 'consulting', 'development', 'analytics'];
  
  return {
    q: randomItem(searchTerms),
    page: randomIntBetween(1, 5),
    limit: 20,
  };
}

/**
 * Generate unique test data for concurrent tests
 * @param {number} vuId - Virtual user ID
 * @returns {Object} - Unique test data
 */
export function generateUniqueData(vuId) {
  const timestamp = Date.now();
  const uniqueId = `${vuId}-${timestamp}-${randomString(6)}`;
  
  return {
    uniqueId,
    timestamp,
    email: `test-${uniqueId}@example.com`,
    username: `user-${uniqueId}`,
  };
}

export default {
  generateContactForm,
  generateConsultationForm,
  generateTeamMember,
  generateService,
  generateTestimonial,
  generateFAQ,
  generateBlogPost,
  randomItem,
  generatePaginationParams,
  generateSearchParams,
  generateUniqueData,
};
