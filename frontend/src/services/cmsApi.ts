/**
 * Public CMS API Client
 * Fetches public content for the website
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class CmsApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Error: GET ${url}`, error);
      throw error;
    }
  }

  // ============================================================================
  // TEAM MEMBERS
  // ============================================================================

  async getTeamMembers() {
    return this.request('/api/public/team-members');
  }

  // ============================================================================
  // SERVICE CATEGORIES
  // ============================================================================

  async getServiceCategories() {
    return this.request('/api/public/service-categories');
  }

  // ============================================================================
  // TESTIMONIALS
  // ============================================================================

  async getTestimonials() {
    return this.request('/api/public/testimonials');
  }

  // ============================================================================
  // FAQS
  // ============================================================================

  async getFAQs() {
    return this.request('/api/public/faqs');
  }

  // ============================================================================
  // PAGE CONTENT
  // ============================================================================

  async getPageContent(page: string, section: string) {
    return this.request(`/api/public/page-content/${page}/${section}`);
  }

  // ============================================================================
  // GLOBAL SETTINGS
  // ============================================================================

  async getSettings() {
    return this.request('/api/public/settings');
  }

  // ============================================================================
  // CURRENT PROJECTS
  // ============================================================================

  async getCurrentProjects() {
    return this.request('/api/public/current-projects');
  }

  // ============================================================================
  // FUTURE QUESTS
  // ============================================================================

  async getFutureQuests() {
    return this.request('/api/public/future-quests');
  }
}

export const cmsApi = new CmsApiClient();
export default CmsApiClient;
// Last updated: Tue, Feb 24, 2026  3:19:15 PM
