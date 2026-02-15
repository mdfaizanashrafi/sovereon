/**
 * Real Backend API Client
 * Communicates with the actual Sovereon backend API
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

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
        }
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error: ${method} ${url}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', 'POST', { email, password });
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    return this.request('/api/auth/register', 'POST', {
      email,
      password,
      firstName,
      lastName,
    });
  }

  async logout() {
    this.clearToken();
    return Promise.resolve();
  }

  async getCurrentUser() {
    return this.request('/api/users/me', 'GET');
  }

  async updateProfile(data: any) {
    return this.request('/api/users/profile', 'PUT', data);
  }

  // Orders endpoints
  async getOrders() {
    return this.request('/api/orders', 'GET');
  }

  async getOrder(id: string) {
    return this.request(`/api/orders/${id}`, 'GET');
  }

  async createOrder(data: any) {
    return this.request('/api/orders', 'POST', data);
  }

  // Services endpoints
  async getServices() {
    return this.request('/api/services', 'GET');
  }

  async getService(id: string) {
    return this.request(`/api/services/${id}`, 'GET');
  }

  // Subscriptions endpoints
  async getSubscriptions() {
    return this.request('/api/subscriptions', 'GET');
  }

  async createSubscription(data: any) {
    return this.request('/api/subscriptions', 'POST', data);
  }

  // Invoices endpoints
  async getInvoices() {
    return this.request('/api/invoices', 'GET');
  }

  async getInvoice(id: string) {
    return this.request(`/api/invoices/${id}`, 'GET');
  }

  // Payments endpoints
  async getPayments() {
    return this.request('/api/payments', 'GET');
  }

  async createPayment(data: any) {
    return this.request('/api/payments', 'POST', data);
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health', 'GET');
  }
}

export const apiClient = new ApiClient();
export default ApiClient;
