/**
 * Public CMS API Client
 * Fetches public content for the website
 */

const API_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp?: string;
}

class CmsApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      // Try to parse JSON even if response is not ok (for error responses)
      let data: ApiResponse<T>;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create a generic error response
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: `Failed to parse response: HTTP ${response.status}`,
          },
          timestamp: new Date().toISOString(),
        };
      }
      
      // Return the response even if not ok (let caller handle errors)
      if (!response.ok) {
        console.warn(`API Warning: ${url} returned HTTP ${response.status}`, data);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error: GET ${url}`, error);
      
      // Return a structured error response instead of throwing
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ============================================================================
  // TEAM MEMBERS
  // ============================================================================

  async getTeamMembers(): Promise<ApiResponse<any[]>> {
    return this.request('/api/public/team-members');
  }

  // ============================================================================
  // SERVICE CATEGORIES
  // ============================================================================

  async getServiceCategories(): Promise<ApiResponse<any[]>> {
    return this.request('/api/public/service-categories');
  }

  // ============================================================================
  // TESTIMONIALS
  // ============================================================================

  async getTestimonials(): Promise<ApiResponse<any[]>> {
    return this.request('/api/public/testimonials');
  }

  // ============================================================================
  // FAQS
  // ============================================================================

  async getFAQs(): Promise<ApiResponse<any[]>> {
    return this.request('/api/public/faqs');
  }

  // ============================================================================
  // PAGE CONTENT
  // ============================================================================

  async getPageContent(page: string, section: string): Promise<ApiResponse<any>> {
    return this.request(`/api/public/page-content/${page}/${section}`);
  }

  // ============================================================================
  // GLOBAL SETTINGS
  // ============================================================================

  async getSettings(): Promise<ApiResponse<Record<string, string>>> {
    return this.request('/api/public/settings');
  }

  // ============================================================================
  // CURRENT PROJECTS
  // ============================================================================

  async getCurrentProjects(): Promise<ApiResponse<any[]>> {
    return this.request('/api/public/current-projects');
  }

  // ============================================================================
  // FUTURE QUESTS
  // ============================================================================

  async getFutureQuests(): Promise<ApiResponse<any[]>> {
    return this.request('/api/public/future-quests');
  }

  // ============================================================================
  // CASE STUDIES
  // ============================================================================

  async getCaseStudies(): Promise<ApiResponse<any[]>> {
    return this.request('/api/public/case-studies');
  }

  // ============================================================================
  // BLOG POSTS
  // ============================================================================

  async getBlogPosts(): Promise<ApiResponse<any[]>> {
    return this.request('/api/public/blog-posts');
  }
}

export const cmsApi = new CmsApiClient();
export default CmsApiClient;
