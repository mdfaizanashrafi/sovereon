/**
 * Contact API Client
 * Handles contact form and consultation submissions
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

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  message: string;
  company_website?: string; // Honeypot
}

interface ConsultationFormData {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  company_website?: string; // Honeypot
}

class ContactApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
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

  /**
   * Submit contact form
   */
  async submitContact(data: ContactFormData) {
    return this.request('/api/contact', 'POST', data as unknown as Record<string, unknown>);
  }

  /**
   * Submit AI consultation form
   */
  async submitConsultation(data: ConsultationFormData) {
    return this.request('/api/consultation', 'POST', data as unknown as Record<string, unknown>);
  }
}

export const contactApi = new ContactApiClient();
export default ContactApiClient;
