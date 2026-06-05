import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { userService } from '../services/user.service.js';
import { apiKeyService } from '../services/apikey.service.js';
import type { PlanCode } from '../db/types.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        planCode: PlanCode;
      };
      apiKeyId?: string; // Set if authenticated via API key
    }
  }
}

/**
 * Request type for authenticated routes (req.user is populated by authMiddleware).
 */
export type AuthenticatedRequest = Request;

// Cache for JWKS
let jwksCache: jose.JWTVerifyGetKey | null = null;
let jwksCacheTime = 0;
const JWKS_CACHE_TTL = 3600000; // 1 hour

/**
 * Get JWKS from Supabase
 */
async function getJWKS(): Promise<jose.JWTVerifyGetKey> {
  const now = Date.now();
  
  if (jwksCache && (now - jwksCacheTime) < JWKS_CACHE_TTL) {
    return jwksCache;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not configured');
  }

  const jwksUrl = new URL('/.well-known/jwks.json', supabaseUrl);
  jwksCache = jose.createRemoteJWKSet(jwksUrl);
  jwksCacheTime = now;

  return jwksCache;
}

/**
 * Verify JWT token using Supabase JWKS
 */
async function verifyToken(token: string): Promise<jose.JWTPayload> {
  const jwks = await getJWKS();
  
  const { payload } = await jose.jwtVerify(token, jwks, {
    issuer: `${process.env.SUPABASE_URL}/auth/v1`,
    audience: 'authenticated',
  });

  return payload;
}

/**
 * Alternative: Verify JWT using SUPABASE_JWT_SECRET (HS256)
 * Use this if JWKS endpoint is not available
 */
async function verifyTokenWithSecret(token: string): Promise<jose.JWTPayload> {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error('SUPABASE_JWT_SECRET is not configured');
  }

  const secretKey = new TextEncoder().encode(secret);
  
  const { payload } = await jose.jwtVerify(token, secretKey, {
    algorithms: ['HS256'],
  });

  return payload;
}

/**
 * Auth Middleware
 * Supports two authentication methods:
 * 1. Bearer Token (JWT from Supabase)
 * 2. API Key (X-API-Key header)
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check for API Key first (X-API-Key header)
    const apiKey = req.headers['x-api-key'] as string | undefined;
    
    if (apiKey) {
      const result = await apiKeyService.validateApiKey(apiKey);
      
      if (result) {
        // Get user data
        const user = await userService.getUserById(result.userId);
        
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            planCode: user.planCode,
          };
          req.apiKeyId = result.keyId;
          next();
          return;
        }
      }
      
      // Invalid API key
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or inactive API key',
      });
      return;
    }

    // Check for Bearer Token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header. Use Bearer token or X-API-Key.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    let payload: jose.JWTPayload;
    
    try {
      // Try JWKS first
      payload = await verifyToken(token);
    } catch (jwksError) {
      // Fallback to JWT secret
      try {
        payload = await verifyTokenWithSecret(token);
      } catch (secretError) {
        console.error('Token verification failed:', jwksError, secretError);
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
        return;
      }
    }

    // Extract user info from token
    const supabaseUid = payload.sub;
    const email = payload.email as string | undefined;

    if (!supabaseUid || !email) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token payload',
      });
      return;
    }

    // Get or create user in our database
    const user = await userService.getOrCreateUser({
      supabaseUid,
      email,
      name: (payload.user_metadata as Record<string, unknown>)?.name as string | undefined,
    });

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      planCode: user.planCode,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Optional Auth Middleware
 * Same as authMiddleware but doesn't fail if no token is provided
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'] as string | undefined;
  
  if (!authHeader && !apiKey) {
    next();
    return;
  }

  // If token or API key is provided, verify it
  await authMiddleware(req, res, next);
}

/**
 * API Key Only Middleware
 * Only accepts API key authentication (no JWT)
 */
export async function apiKeyOnlyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKey = req.headers['x-api-key'] as string | undefined;
    
    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'API key required. Use X-API-Key header.',
      });
      return;
    }

    const result = await apiKeyService.validateApiKey(apiKey);
    
    if (!result) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or inactive API key',
      });
      return;
    }

    // Get user data
    const user = await userService.getUserById(result.userId);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not found',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      planCode: user.planCode,
    };
    req.apiKeyId = result.keyId;
    
    next();
  } catch (error) {
    console.error('API Key middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}
