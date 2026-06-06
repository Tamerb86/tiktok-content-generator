import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { supabase } from './supabase';
import type {
  ApiResponse,
  UserWithPlan,
  Product,
  ProductWithContent,
  Plan,
  SubscriptionInfo,
  FullPackageResult,
  GenerateFormData,
  CreateProductFormData,
  GeneratedContent,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private tokenRefreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 second timeout for generation
    });

    // Add auth token to requests
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          // Get current access token
          const token = await this.getValidToken();
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Refresh the session
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !session) {
              // Refresh failed, user needs to re-login
              throw new Error('Session expired. Please log in again.');
            }

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed
            return Promise.reject(new Error('Session expired. Please log in again.'));
          }
        }

        // Extract error message
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  // Get valid token, refreshing if necessary
  private async getValidToken(): Promise<string | null> {
    // If there's already a refresh in progress, wait for it
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }

      // Check if token is about to expire (within 60 seconds)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      
      if (expiresAt && expiresAt - now < 60) {
        // Token is about to expire, refresh it
        this.tokenRefreshPromise = this.refreshToken();
        const newToken = await this.tokenRefreshPromise;
        this.tokenRefreshPromise = null;
        return newToken;
      }

      return session.access_token;
    } catch (error) {
      console.error('Error getting valid token:', error);
      return null;
    }
  }

  // Refresh the token
  private async refreshToken(): Promise<string | null> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session) {
        return null;
      }

      return session.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  // Health check
  async health(): Promise<ApiResponse<{ status: string }>> {
    const { data } = await this.client.get('/health');
    return data;
  }

  // User endpoints
  async getMe(): Promise<ApiResponse<UserWithPlan>> {
    const { data } = await this.client.get('/me');
    return data;
  }

  async updateProfile(updates: { name?: string }): Promise<ApiResponse<UserWithPlan>> {
    const { data } = await this.client.patch('/me', updates);
    return data;
  }

  // Product endpoints
  async getProducts(page = 1, limit = 20): Promise<ApiResponse<{ products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>> {
    const { data } = await this.client.get('/products', { params: { page, limit } });
    return data;
  }

  async getProduct(id: string): Promise<ApiResponse<ProductWithContent>> {
    const { data } = await this.client.get(`/products/${id}`);
    return data;
  }

  async createProduct(product: CreateProductFormData): Promise<ApiResponse<Product>> {
    const { data } = await this.client.post('/products', {
      source: product.source,
      sourceUrl: product.sourceUrl,
      title: product.title,
      rawDescription: product.rawDescription,
      images: product.images,
      priceRaw: product.priceRaw,
      currency: product.currency,
    });
    return data;
  }

  async updateProduct(id: string, updates: Partial<CreateProductFormData>): Promise<ApiResponse<Product>> {
    const { data } = await this.client.patch(`/products/${id}`, {
      title: updates.title,
      rawDescription: updates.rawDescription,
      images: updates.images,
      priceRaw: updates.priceRaw,
      currency: updates.currency,
    });
    return data;
  }

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const { data } = await this.client.delete(`/products/${id}`);
    return data;
  }

  // Generation endpoints
  async generateFullPackage(input: GenerateFormData): Promise<ApiResponse<FullPackageResult>> {
    const { data } = await this.client.post('/generate/full-package', {
      product_id: input.productId,
      language: input.language,
      platform: input.platform,
      tone: input.tone,
      niche: input.niche,
      target_audience: input.targetAudience,
    });
    return data;
  }

  // Simplified generate content method
  async generateContent(input: {
    product_id: string;
    language: string;
    platform: string;
    tone: string;
    niche?: string;
  }): Promise<ApiResponse<FullPackageResult>> {
    const { data } = await this.client.post('/generate/full-package', input);
    return data;
  }

  // Start a real AI image-to-video generation (Replicate/Hailuo).
  async createAiVideo(input: { image_url: string; prompt?: string }): Promise<ApiResponse<{ id: string; status: string }>> {
    const { data } = await this.client.post('/generate/video', input);
    return data;
  }

  // Poll AI video generation status.
  async getAiVideo(id: string): Promise<ApiResponse<{ id: string; status: string; output: string | null; error: string | null }>> {
    const { data } = await this.client.get(`/generate/video/${id}`);
    return data;
  }

  // Fetch an external image through the backend proxy (canvas-safe). Returns a Blob.
  async fetchImageBlob(url: string): Promise<Blob> {
    const res = await this.client.get('/products/image-proxy', {
      params: { url },
      responseType: 'blob',
    });
    return res.data as Blob;
  }

  // Import product metadata (title/image/price) from a product URL.
  async importFromUrl(url: string): Promise<ApiResponse<{ sourceUrl: string; title: string | null; images: string[]; priceRaw: string | null; currency: string | null; scraped: boolean }>> {
    const { data } = await this.client.post('/products/import-url', { url });
    return data;
  }

  // Generate high-quality speech (OpenAI TTS). Returns an audio Blob.
  async generateAudio(text: string, voice?: string): Promise<Blob> {
    const res = await this.client.post(
      '/generate/audio',
      { text, voice },
      { responseType: 'blob' }
    );
    return res.data as Blob;
  }

  // Get contents for a specific product
  async getProductContents(productId: string): Promise<ApiResponse<GeneratedContent[]>> {
    const { data } = await this.client.get(`/generate/product/${productId}`);
    return { ...data, data: data?.data?.items ?? [] };
  }

  // Get single content by ID
  async getContent(contentId: string): Promise<ApiResponse<GeneratedContent>> {
    const { data } = await this.client.get(`/generate/content/${contentId}`);
    return data;
  }

  // Get generation history
  async getGenerationHistory(page = 1, limit = 20): Promise<ApiResponse<{ contents: GeneratedContent[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>> {
    const { data } = await this.client.get('/generate/history', { params: { page, limit } });
    return data;
  }

  async getUsage(): Promise<ApiResponse<{
    currentMonthUsage: number;
    monthlyLimit: number | null;
    remainingRequests: number | null;
    isWithinLimit: boolean;
    planCode: string;
  }>> {
    const { data } = await this.client.get('/generate/usage');
    return data;
  }

  async getGenerationOptions(): Promise<ApiResponse<{
    languages: { code: string; name: string }[];
    platforms: { code: string; name: string }[];
    tones: { code: string; name: string; category: string }[];
    niches: { code: string; name: string }[];
  }>> {
    const { data } = await this.client.get('/generate/options');
    return data;
  }

  // Plans endpoints
  async getPlans(): Promise<ApiResponse<{ plans: Plan[] }>> {
    const { data } = await this.client.get('/plans');
    return data;
  }

  // Billing endpoints
  async getSubscription(): Promise<ApiResponse<SubscriptionInfo>> {
    const { data } = await this.client.get('/billing/subscription');
    return data;
  }

  async createCheckoutSession(planCode: 'pro' | 'business'): Promise<ApiResponse<{ checkout_url: string }>> {
    const { data } = await this.client.post('/billing/create-checkout-session', {
      plan_code: planCode,
    });
    return data;
  }

  async createPortalSession(): Promise<ApiResponse<{ portal_url: string }>> {
    const { data } = await this.client.post('/billing/create-portal-session');
    return data;
  }

  async cancelSubscription(): Promise<ApiResponse<null>> {
    const { data } = await this.client.post('/billing/cancel');
    return data;
  }

  async resumeSubscription(): Promise<ApiResponse<null>> {
    const { data } = await this.client.post('/billing/resume');
    return data;
  }

  // API Keys endpoints
  async getApiKeys(): Promise<Array<{
    id: string;
    key: string;
    label: string;
    isActive: boolean;
    createdAt: string;
    lastUsedAt: string | null;
  }>> {
    const { data } = await this.client.get('/api-keys');
    return data.data.keys;
  }

  async createApiKey(input: { label: string }): Promise<{
    key: string;
    id: number;
    label: string;
    isActive: boolean;
    createdAt: string;
  }> {
    const { data } = await this.client.post('/api-keys', input);
    return data.data;
  }

  async updateApiKeyLabel(id: string, label: string): Promise<ApiResponse<null>> {
    const { data } = await this.client.patch(`/api-keys/${id}`, { label });
    return data;
  }

  async deactivateApiKey(id: string): Promise<ApiResponse<null>> {
    const { data } = await this.client.post(`/api-keys/${id}/deactivate`);
    return data;
  }

  async reactivateApiKey(id: string): Promise<ApiResponse<null>> {
    const { data } = await this.client.post(`/api-keys/${id}/reactivate`);
    return data;
  }

  async deleteApiKey(id: string): Promise<ApiResponse<null>> {
    const { data } = await this.client.delete(`/api-keys/${id}`);
    return data;
  }
}

export const api = new ApiClient();
