import { Router, Request, Response } from 'express';
import { productService } from '../services/product.service.js';
import {
  sendSuccess,
  sendSuccessWithMessage,
  sendNotFound,
  sendServerError,
  sendValidationError,
} from '../utils/response.js';
import {
  createProductSchema,
  updateProductSchema,
  paginationSchema,
  uuidSchema,
} from '../utils/validation.js';

const router = Router();

/**
 * GET /api/v1/products
 * Get all products for the current user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendNotFound(res, 'User');
      return;
    }

    // Validate pagination params
    const paginationResult = paginationSchema.safeParse(req.query);
    
    if (!paginationResult.success) {
      sendValidationError(res, 'Invalid pagination parameters');
      return;
    }

    const { page, limit } = paginationResult.data;
    const offset = (page - 1) * limit;

    // Get products
    const products = await productService.getProductsByUserId(req.user.id, {
      limit,
      offset,
    });

    // Get total count
    const total = await productService.countProductsByUserId(req.user.id);

    sendSuccess(res, {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    sendServerError(res);
  }
});

/**
 * GET /api/v1/products/image-proxy?url=...
 * Fetch an external product image server-side so the browser canvas can use it.
 */
router.get('/image-proxy', async (req: Request, res: Response) => {
  try {
    const url = typeof req.query.url === 'string' ? req.query.url : '';
    if (!/^https?:\/\//i.test(url)) {
      sendValidationError(res, 'A valid image URL is required');
      return;
    }
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8',
      },
      redirect: 'follow',
    });
    if (!resp.ok) {
      res.status(502).json({ success: false, error: 'Failed to fetch image' });
      return;
    }
    const ct = resp.headers.get('content-type') || 'image/jpeg';
    const buf = Buffer.from(await resp.arrayBuffer());
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch (error) {
    console.error('Image proxy error:', error);
    sendServerError(res);
  }
});

/**
 * GET /api/v1/products/:id
 * Get a single product with latest generated content
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendNotFound(res, 'User');
      return;
    }

    // Validate ID
    const idResult = uuidSchema.safeParse(req.params.id);
    
    if (!idResult.success) {
      sendValidationError(res, 'Invalid product ID');
      return;
    }

    // Get product with latest content
    const product = await productService.getProductWithLatestContent(
      idResult.data,
      req.user.id
    );

    if (!product) {
      sendNotFound(res, 'Product');
      return;
    }

    sendSuccess(res, product);
  } catch (error) {
    console.error('Error fetching product:', error);
    sendServerError(res);
  }
});

/**
 * POST /api/v1/products
 * Create a new product
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendNotFound(res, 'User');
      return;
    }

    // Validate input
    const validationResult = createProductSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      sendValidationError(res, errors);
      return;
    }

    // Create product
    const product = await productService.createProduct({
      userId: req.user.id,
      ...validationResult.data,
    });

    sendSuccessWithMessage(res, product, 'Product created successfully', 201);
  } catch (error) {
    console.error('Error creating product:', error);
    sendServerError(res);
  }
});

/**
 * PATCH /api/v1/products/:id
 * Update a product
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendNotFound(res, 'User');
      return;
    }

    // Validate ID
    const idResult = uuidSchema.safeParse(req.params.id);
    
    if (!idResult.success) {
      sendValidationError(res, 'Invalid product ID');
      return;
    }

    // Validate input
    const validationResult = updateProductSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      sendValidationError(res, errors);
      return;
    }

    // Update product
    const product = await productService.updateProduct(
      idResult.data,
      req.user.id,
      validationResult.data
    );

    if (!product) {
      sendNotFound(res, 'Product');
      return;
    }

    sendSuccessWithMessage(res, product, 'Product updated successfully');
  } catch (error) {
    console.error('Error updating product:', error);
    sendServerError(res);
  }
});

/**
 * DELETE /api/v1/products/:id
 * Delete a product
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendNotFound(res, 'User');
      return;
    }

    // Validate ID
    const idResult = uuidSchema.safeParse(req.params.id);
    
    if (!idResult.success) {
      sendValidationError(res, 'Invalid product ID');
      return;
    }

    // Delete product
    const deleted = await productService.deleteProduct(idResult.data, req.user.id);

    if (!deleted) {
      sendNotFound(res, 'Product');
      return;
    }

    sendSuccessWithMessage(res, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Error deleting product:', error);
    sendServerError(res);
  }
});

/**
 * POST /api/v1/products/import-url
 * Fetch a product page and extract title/image/price via Open Graph meta tags.
 */
router.post('/import-url', async (req: Request, res: Response) => {
  try {
    const url = (req.body && typeof req.body.url === 'string') ? req.body.url.trim() : '';
    if (!/^https?:\/\//i.test(url)) {
      sendValidationError(res, 'A valid product URL is required');
      return;
    }
    let html = '';
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });
      html = await resp.text();
    } catch (e) {
      sendSuccess(res, { sourceUrl: url, title: null, images: [], priceRaw: null, currency: null, scraped: false });
      return;
    }

    const meta = (prop: string): string | null => {
      const a = html.match(new RegExp('<meta[^>]+(?:property|name)=["\']' + prop + '["\'][^>]*content=["\']([^"\']+)["\']', 'i'));
      if (a) return a[1];
      const b = html.match(new RegExp('<meta[^>]+content=["\']([^"\']+)["\'][^>]*(?:property|name)=["\']' + prop + '["\']', 'i'));
      return b ? b[1] : null;
    };
    const decode = (t: string | null): string | null =>
      t ? t.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : t;

    let title = decode(meta('og:title') || meta('twitter:title'));
    if (!title) {
      const tm = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      title = tm ? decode(tm[1]) : null;
    }
    let image = decode(meta('og:image:secure_url') || meta('og:image') || meta('twitter:image'));
    if (image && !/^https?:\/\//i.test(image)) {
      try { image = new URL(image, url).href; } catch { /* ignore */ }
    }
    const priceRaw = decode(meta('product:price:amount') || meta('og:price:amount'));
    const currency = decode(meta('product:price:currency') || meta('og:price:currency'));

    sendSuccess(res, {
      sourceUrl: url,
      title,
      images: image ? [image] : [],
      priceRaw,
      currency,
      scraped: !!(title || image),
    });
  } catch (error) {
    console.error('Import URL error:', error);
    sendServerError(res);
  }
});

export default router;
