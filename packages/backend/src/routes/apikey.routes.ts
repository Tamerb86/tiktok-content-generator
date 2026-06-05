import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { apiKeyService } from '../services/apikey.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { z } from 'zod';
import { uuidSchema } from '../utils/validation.js';

const router = Router();

// Validation schemas
const createApiKeySchema = z.object({
  label: z.string().min(1).max(100).optional(),
});

const updateApiKeySchema = z.object({
  label: z.string().min(1).max(100),
});

/**
 * GET /api/v1/api-keys
 * Get all API keys for current user
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keys = await apiKeyService.getUserApiKeys(userId);

    return res.json(
      successResponse({
        keys,
        total: keys.length,
      })
    );
  } catch (error) {
    console.error('Get API keys error:', error);
    return res.status(500).json(errorResponse('Failed to get API keys'));
  }
});

/**
 * POST /api/v1/api-keys
 * Create a new API key
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Validate input
    const validation = createApiKeySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(errorResponse('Invalid input', validation.error.errors));
    }

    // Check limit (max 5 active keys per user)
    const activeCount = await apiKeyService.countActiveKeys(userId);
    if (activeCount >= 5) {
      return res.status(400).json(
        errorResponse('Maximum number of API keys reached (5). Please deactivate or delete an existing key.')
      );
    }

    // Create new key
    const result = await apiKeyService.createApiKey({
      userId,
      label: validation.data.label,
    });

    return res.status(201).json(
      successResponse(
        {
          ...result.data,
          key: result.key, // Plain key - shown only once!
        },
        'API key created successfully. Please save this key - it will not be shown again!'
      )
    );
  } catch (error) {
    console.error('Create API key error:', error);
    return res.status(500).json(errorResponse('Failed to create API key'));
  }
});

/**
 * PATCH /api/v1/api-keys/:id
 * Update API key label
 */
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keyId = req.params.id;

    if (!uuidSchema.safeParse(keyId).success) {
      return res.status(400).json(errorResponse('Invalid key ID'));
    }

    // Validate input
    const validation = updateApiKeySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(errorResponse('Invalid input', validation.error.errors));
    }

    const updated = await apiKeyService.updateApiKeyLabel(keyId, userId, validation.data.label);

    if (!updated) {
      return res.status(404).json(errorResponse('API key not found'));
    }

    return res.json(successResponse(null, 'API key updated successfully'));
  } catch (error) {
    console.error('Update API key error:', error);
    return res.status(500).json(errorResponse('Failed to update API key'));
  }
});

/**
 * POST /api/v1/api-keys/:id/deactivate
 * Deactivate an API key
 */
router.post('/:id/deactivate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keyId = req.params.id;

    if (!uuidSchema.safeParse(keyId).success) {
      return res.status(400).json(errorResponse('Invalid key ID'));
    }

    const deactivated = await apiKeyService.deactivateApiKey(keyId, userId);

    if (!deactivated) {
      return res.status(404).json(errorResponse('API key not found'));
    }

    return res.json(successResponse(null, 'API key deactivated successfully'));
  } catch (error) {
    console.error('Deactivate API key error:', error);
    return res.status(500).json(errorResponse('Failed to deactivate API key'));
  }
});

/**
 * POST /api/v1/api-keys/:id/reactivate
 * Reactivate an API key
 */
router.post('/:id/reactivate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keyId = req.params.id;

    if (!uuidSchema.safeParse(keyId).success) {
      return res.status(400).json(errorResponse('Invalid key ID'));
    }

    // Check limit
    const activeCount = await apiKeyService.countActiveKeys(userId);
    if (activeCount >= 5) {
      return res.status(400).json(
        errorResponse('Maximum number of active API keys reached (5)')
      );
    }

    const reactivated = await apiKeyService.reactivateApiKey(keyId, userId);

    if (!reactivated) {
      return res.status(404).json(errorResponse('API key not found'));
    }

    return res.json(successResponse(null, 'API key reactivated successfully'));
  } catch (error) {
    console.error('Reactivate API key error:', error);
    return res.status(500).json(errorResponse('Failed to reactivate API key'));
  }
});

/**
 * DELETE /api/v1/api-keys/:id
 * Delete an API key permanently
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keyId = req.params.id;

    if (!uuidSchema.safeParse(keyId).success) {
      return res.status(400).json(errorResponse('Invalid key ID'));
    }

    const deleted = await apiKeyService.deleteApiKey(keyId, userId);

    if (!deleted) {
      return res.status(404).json(errorResponse('API key not found'));
    }

    return res.json(successResponse(null, 'API key deleted successfully'));
  } catch (error) {
    console.error('Delete API key error:', error);
    return res.status(500).json(errorResponse('Failed to delete API key'));
  }
});

export default router;
