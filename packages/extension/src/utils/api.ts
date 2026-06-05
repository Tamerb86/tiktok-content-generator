import { storage } from './storage';
import type { ExtractedProduct } from './extractors';

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  plan: {
    code: string;
    name: string;
    monthlyLimitRequests: number;
  };
  subscription?: {
    status: string;
    currentPeriodEnd?: string;
  };
  usage: {
    currentMonthUsage: number;
    remainingRequests: number;
    monthlyLimit: number;
    isUnlimited: boolean;
  };
}

interface Product {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  rawDescription?: string;
  images?: string[];
  priceRaw?: string;
  currency?: string;
  createdAt: string;
}

interface GenerationResult {
  content: {
    script: string;
    angles: string[];
    hooks: string[];
    captions: string[];
    hashtags: string[];
    thumbnailText: string[];
  };
  metadata: {
    model: string;
    tokensUsed: number;
    language: string;
    platform: string;
    tone: string;
    generatedAt: string;
    processingTimeMs: number;
  };
  savedContentId: string;
  usage: {
    currentMonthUsage: number;
    remainingRequests: number;
    monthlyLimit: number;
  };
}

// API Client class
class ApiClient {
  private async getBaseUrl(): Promise<string> {
    return await storage.getApiUrl();
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await storage.getAuthToken();
    const apiKey = await storage.getApiKey();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Prefer API Key over Bearer token
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const baseUrl = await this.getBaseUrl();
    const headers = await this.getHeaders();

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth
  async verifyToken(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/me');
  }

  async verifyApiKey(apiKey: string): Promise<ApiResponse<UserProfile>> {
    const baseUrl = await this.getBaseUrl();
    
    try {
      const response = await fetch(`${baseUrl}/me`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Invalid API Key',
        };
      }

      return data;
    } catch (error) {
      console.error('API Key verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // User
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>('/me');
  }

  // Products
  async createProduct(product: ExtractedProduct): Promise<ApiResponse<Product>> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify({
        source: product.source,
        sourceUrl: product.sourceUrl,
        title: product.title,
        rawDescription: product.description,
        images: product.images,
        priceRaw: product.price,
        currency: product.currency,
      }),
    });
  }

  // Save product only (without generating content)
  async saveProduct(product: ExtractedProduct): Promise<ApiResponse<Product>> {
    return this.createProduct(product);
  }

  async getProducts(): Promise<ApiResponse<{ products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>> {
    return this.request('/products');
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`);
  }

  // Generation
  async generateContent(params: {
    productId: string;
    language: string;
    platform: string;
    tone: string;
    niche?: string;
    targetAudience?: string;
  }): Promise<ApiResponse<GenerationResult>> {
    return this.request<GenerationResult>('/generate/full-package', {
      method: 'POST',
      body: JSON.stringify({
        product_id: params.productId,
        language: params.language,
        platform: params.platform,
        tone: params.tone,
        niche: params.niche,
        target_audience: params.targetAudience,
      }),
    });
  }

  async getUsage(): Promise<ApiResponse<{
    currentMonthUsage: number;
    remainingRequests: number;
    monthlyLimit: number;
    isUnlimited: boolean;
  }>> {
    return this.request('/generate/usage');
  }

  // Quick generate (extract + create + generate in one call)
  async quickGenerate(
    product: ExtractedProduct,
    options: {
      language: string;
      platform: string;
      tone: string;
      niche?: string;
    }
  ): Promise<ApiResponse<GenerationResult & { product: Product }>> {
    // First create the product
    const productResult = await this.createProduct(product);
    if (!productResult.success || !productResult.data) {
      return {
        success: false,
        error: productResult.error || 'Failed to create product',
      };
    }

    // Then generate content
    const generationResult = await this.generateContent({
      productId: productResult.data.id,
      ...options,
    });

    if (!generationResult.success || !generationResult.data) {
      return {
        success: false,
        error: generationResult.error || 'Failed to generate content',
      };
    }

    return {
      success: true,
      data: {
        ...generationResult.data,
        product: productResult.data,
      },
    };
  }
}

export const api = new ApiClient();
