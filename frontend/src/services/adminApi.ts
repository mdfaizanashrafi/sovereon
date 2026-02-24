/**
 * Admin API Client
 * Communicates with the admin backend API
 */

const API_URL = import.meta.env.VITE_API_URL;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

class AdminApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
      credentials: 'include', // Important for session cookies
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      
      // Try to parse JSON
      let data: ApiResponse<T>;
      try {
        data = await response.json();
      } catch (parseError) {
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: `Failed to parse response: HTTP ${response.status}`,
          },
        };
      }

      // Return error response instead of throwing
      if (!response.ok) {
        console.warn(`Admin API Warning: ${method} ${url} returned HTTP ${response.status}`, data);
        return {
          success: false,
          error: data.error || {
            code: 'HTTP_ERROR',
            message: `Request failed with status ${response.status}`,
          },
        };
      }

      return data;
    } catch (error) {
      console.error(`Admin API Error: ${method} ${url}`, error);
      
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  async login(username: string, password: string) {
    return this.request('/api/admin/auth/login', 'POST', { username, password });
  }

  async logout() {
    return this.request('/api/admin/auth/logout', 'POST');
  }

  async getCurrentAdmin() {
    return this.request('/api/admin/auth/me', 'GET');
  }

  // ============================================================================
  // TEAM MEMBERS
  // ============================================================================

  async getTeamMembers() {
    return this.request('/api/admin/team-members', 'GET');
  }

  async createTeamMember(data: Record<string, unknown>) {
    return this.request('/api/admin/team-members', 'POST', data);
  }

  async updateTeamMember(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/team-members/${id}`, 'PUT', data);
  }

  async deleteTeamMember(id: string) {
    return this.request(`/api/admin/team-members/${id}`, 'DELETE');
  }

  // ============================================================================
  // SERVICE CATEGORIES
  // ============================================================================

  async getServiceCategories() {
    return this.request('/api/admin/service-categories', 'GET');
  }

  async createServiceCategory(data: Record<string, unknown>) {
    return this.request('/api/admin/service-categories', 'POST', data);
  }

  async updateServiceCategory(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/service-categories/${id}`, 'PUT', data);
  }

  async deleteServiceCategory(id: string) {
    return this.request(`/api/admin/service-categories/${id}`, 'DELETE');
  }

  // ============================================================================
  // SERVICES
  // ============================================================================

  async getServices() {
    return this.request('/api/admin/services', 'GET');
  }

  async createService(data: Record<string, unknown>) {
    return this.request('/api/admin/services', 'POST', data);
  }

  async updateService(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/services/${id}`, 'PUT', data);
  }

  async deleteService(id: string) {
    return this.request(`/api/admin/services/${id}`, 'DELETE');
  }

  // ============================================================================
  // TESTIMONIALS
  // ============================================================================

  async getTestimonials() {
    return this.request('/api/admin/testimonials', 'GET');
  }

  async createTestimonial(data: Record<string, unknown>) {
    return this.request('/api/admin/testimonials', 'POST', data);
  }

  async updateTestimonial(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/testimonials/${id}`, 'PUT', data);
  }

  async deleteTestimonial(id: string) {
    return this.request(`/api/admin/testimonials/${id}`, 'DELETE');
  }

  // ============================================================================
  // FAQS
  // ============================================================================

  async getFAQs() {
    return this.request('/api/admin/faqs', 'GET');
  }

  async createFAQ(data: Record<string, unknown>) {
    return this.request('/api/admin/faqs', 'POST', data);
  }

  async updateFAQ(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/faqs/${id}`, 'PUT', data);
  }

  async deleteFAQ(id: string) {
    return this.request(`/api/admin/faqs/${id}`, 'DELETE');
  }

  // ============================================================================
  // PAGE CONTENT
  // ============================================================================

  async getPageContents() {
    return this.request('/api/admin/page-contents', 'GET');
  }

  async updatePageContent(page: string, section: string, content: string) {
    return this.request(`/api/admin/page-contents/${page}/${section}`, 'PUT', { content });
  }

  // ============================================================================
  // GLOBAL SETTINGS
  // ============================================================================

  async getSettings() {
    return this.request('/api/admin/settings', 'GET');
  }

  async updateSetting(key: string, value: string) {
    return this.request(`/api/admin/settings/${key}`, 'PUT', { value });
  }

  async updateSettingsBatch(settings: { key: string; value: string }[]) {
    return this.request('/api/admin/settings/batch', 'PUT', { settings });
  }

  // ============================================================================
  // CURRENT PROJECTS
  // ============================================================================

  async getCurrentProjects() {
    return this.request('/api/admin/current-projects', 'GET');
  }

  async createCurrentProject(data: Record<string, unknown>) {
    return this.request('/api/admin/current-projects', 'POST', data);
  }

  async updateCurrentProject(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/current-projects/${id}`, 'PUT', data);
  }

  async deleteCurrentProject(id: string) {
    return this.request(`/api/admin/current-projects/${id}`, 'DELETE');
  }

  // ============================================================================
  // FUTURE QUESTS
  // ============================================================================

  async getFutureQuests() {
    return this.request('/api/admin/future-quests', 'GET');
  }

  async createFutureQuest(data: Record<string, unknown>) {
    return this.request('/api/admin/future-quests', 'POST', data);
  }

  async updateFutureQuest(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/future-quests/${id}`, 'PUT', data);
  }

  async deleteFutureQuest(id: string) {
    return this.request(`/api/admin/future-quests/${id}`, 'DELETE');
  }

  // ============================================================================
  // CASE STUDIES
  // ============================================================================

  async getCaseStudies() {
    return this.request('/api/admin/case-studies', 'GET');
  }

  async createCaseStudy(data: Record<string, unknown>) {
    return this.request('/api/admin/case-studies', 'POST', data);
  }

  async updateCaseStudy(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/case-studies/${id}`, 'PUT', data);
  }

  async deleteCaseStudy(id: string) {
    return this.request(`/api/admin/case-studies/${id}`, 'DELETE');
  }

  // ============================================================================
  // BLOG POSTS
  // ============================================================================

  async getBlogPosts() {
    return this.request('/api/admin/blog-posts', 'GET');
  }

  async createBlogPost(data: Record<string, unknown>) {
    return this.request('/api/admin/blog-posts', 'POST', data);
  }

  async updateBlogPost(id: string, data: Record<string, unknown>) {
    return this.request(`/api/admin/blog-posts/${id}`, 'PUT', data);
  }

  async deleteBlogPost(id: string) {
    return this.request(`/api/admin/blog-posts/${id}`, 'DELETE');
  }
}

export const adminApi = new AdminApiClient();
export default AdminApiClient;
