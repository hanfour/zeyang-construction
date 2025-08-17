// Mock fetch globally
global.fetch = jest.fn();

// Mock the API URL
const API_URL = 'http://localhost:5001/api';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('request method', () => {
    it('makes GET request with correct headers', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResponse })
      });

      const result = await api.request('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('includes auth token when available', async () => {
      localStorage.setItem('accessToken', 'test-token');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} })
      });

      await api.request('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('makes POST request with body', async () => {
      const mockData = { name: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData })
      });

      await api.request('/test', {
        method: 'POST',
        body: mockData
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockData)
        })
      );
    });

    it('handles API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ success: false, message: 'Bad Request' })
      });

      await expect(api.request('/test')).rejects.toThrow('Bad Request');
    });

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(api.request('/test')).rejects.toThrow('Network error');
    });

    it('handles non-JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON'); },
        text: async () => 'Server Error'
      });

      await expect(api.request('/test')).rejects.toThrow('Server Error');
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} })
      });
    });

    it('get method calls request with GET', async () => {
      await api.get('/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('post method calls request with POST', async () => {
      const data = { test: 'data' };
      await api.post('/test', data);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ 
          method: 'POST',
          body: JSON.stringify(data)
        })
      );
    });

    it('put method calls request with PUT', async () => {
      const data = { test: 'data' };
      await api.put('/test', data);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ 
          method: 'PUT',
          body: JSON.stringify(data)
        })
      );
    });

    it('delete method calls request with DELETE', async () => {
      await api.delete('/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});