/**
 * Admin API Client
 * Communicates with the admin backend API
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

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP ${response.status}`);
    }

    return data;
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
}

export const adminApi = new AdminApiClient();
export default AdminApiClient;
