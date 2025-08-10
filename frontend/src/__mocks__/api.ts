const API_URL = 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

class Api {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    if (options.body && typeof options.body !== 'string') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data.data;
  }

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  put<T = any>(endpoint: string, data?: any) {
    return this.request<T>(endpoint, { method: 'PUT', body: data });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const api = new Api();
export default api;