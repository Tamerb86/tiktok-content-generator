import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';
import { contentService, ContentServiceError } from '../services/content.service.js';
import { usageService } from '../services/usage.service.js';
import { success, error, validationError } from '../utils/response.js';
import { uuidSchema } from '../utils/validation.js';
import {
  LANGUAGES,
  PLATFORMS,
  TONES,
  NICHES,
  LLM_MODELS,
  type Language,
  type Platform,
  type Tone,
  type Niche,
  type LLMModel,
} from '../services/openai.types.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Validation schemas
const generateFullPackageSchema = z.object({
  product_id: z.string().uuid('Product ID must be a valid UUID'),
  language: z.enum(Object.keys(LANGUAGES) as [Language, ...Language[]]),
  platform: z.enum(Object.keys(PLATFORMS) as [Platform, ...Platform[]]),
  tone: z.enum(Object.keys(TONES) as [Tone, ...Tone[]]),
  niche: z.enum(Object.keys(NICHES) as [Niche, ...Niche[]]).optional(),
  target_audience: z.string().max(200).optional(),
  model: z.enum(Object.keys(LLM_MODELS) as [LLMModel, ...LLMModel[]]).optional(),
});

/**
 * POST /api/v1/generate/full-package
 * Generate full content package for a product
 */
router.post('/full-package', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validate request body
    const validation = generateFullPackageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(
        validationError(validation.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })))
      );
    }

    const { product_id, language, platform, tone, niche, target_audience, model } = validation.data;

    // Generate content
    const result = await contentService.generateFullPackage(req.user!.id, {
      productId: product_id,
      language,
      platform,
      tone,
      niche,
      targetAudience: target_audience,
      model,
    });

    return res.status(200).json(success(result.data, 'Content generated successfully'));

  } catch (err) {
    console.error('Generate full-package error:', err);

    if (err instanceof ContentServiceError) {
      return res.status(err.statusCode).json(error(err.message, err.code));
    }

    return res.status(500).json(error('Failed to generate content', 'GENERATION_ERROR'));
  }
});

/**
 * GET /api/v1/generate/usage
 * Get current usage statistics
 */
router.get('/usage', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await usageService.getUsageStats(req.user!.id);

    return res.status(200).json(success({
      currentMonthUsage: stats.currentMonthUsage,
      monthlyLimit: stats.monthlyLimit,
      remainingRequests: stats.remainingRequests,
      isWithinLimit: stats.isWithinLimit,
      isUnlimited: stats.monthlyLimit === null,
      planCode: stats.planCode,
      periodStart: stats.periodStart.toISOString(),
      periodEnd: stats.periodEnd.toISOString(),
    }));

  } catch (err) {
    console.error('Get usage error:', err);
    return res.status(500).json(error('Failed to get usage statistics', 'USAGE_ERROR'));
  }
});

/**
 * GET /api/v1/generate/history
 * Get content generation history
 */
router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const history = await contentService.getContentHistory(req.user!.id, limit, offset);

    return res.status(200).json(success({
      items: history.map(item => ({
        id: item.id,
        product_id: item.productId,
        product_title: item.productTitle,
        type: item.type,
        language: item.language,
        created_at: item.createdAt,
      })),
      pagination: {
        limit,
        offset,
        has_more: history.length === limit,
      },
    }));

  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json(error('Failed to get generation history', 'HISTORY_ERROR'));
  }
});

/**
 * GET /api/v1/generate/content/:id
 * Get specific generated content by ID
 */
router.get('/content/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contentId = req.params.id;
    if (!uuidSchema.safeParse(contentId).success) {
      return res.status(400).json(error('Invalid content ID', 'INVALID_ID'));
    }

    const content = await contentService.getContentById(contentId, req.user!.id);
    if (!content) {
      return res.status(404).json(error('Content not found', 'NOT_FOUND'));
    }

    return res.status(200).json(success({
      id: content.id,
      product_id: content.productId,
      type: content.type,
      language: content.language,
      input_params: content.inputParams,
      output: content.output,
      created_at: content.createdAt,
    }));

  } catch (err) {
    console.error('Get content error:', err);
    return res.status(500).json(error('Failed to get content', 'CONTENT_ERROR'));
  }
});

/**
 * GET /api/v1/generate/product/:productId
 * Get all generated contents for a product
 */
router.get('/product/:productId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const productId = req.params.productId;
    if (!uuidSchema.safeParse(productId).success) {
      return res.status(400).json(error('Invalid product ID', 'INVALID_ID'));
    }

    const contents = await contentService.getContentsByProduct(productId, req.user!.id);

    return res.status(200).json(success({
      items: contents.map(content => ({
        id: content.id,
        type: content.type,
        language: content.language,
        input_params: content.inputParams,
        output: content.output,
        created_at: content.createdAt,
      })),
      total: contents.length,
    }));

  } catch (err) {
    console.error('Get product contents error:', err);
    return res.status(500).json(error('Failed to get product contents', 'CONTENT_ERROR'));
  }
});

/**
 * DELETE /api/v1/generate/content/:id
 * Delete generated content
 */
router.delete('/content/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contentId = req.params.id;
    if (!uuidSchema.safeParse(contentId).success) {
      return res.status(400).json(error('Invalid content ID', 'INVALID_ID'));
    }

    const deleted = await contentService.deleteContent(contentId, req.user!.id);
    if (!deleted) {
      return res.status(404).json(error('Content not found', 'NOT_FOUND'));
    }

    return res.status(200).json(success(null, 'Content deleted successfully'));

  } catch (err) {
    console.error('Delete content error:', err);
    return res.status(500).json(error('Failed to delete content', 'DELETE_ERROR'));
  }
});

/**
 * GET /api/v1/generate/options
 * Get all available generation options (languages, platforms, tones, etc.)
 */
router.get('/options', async (_req: Request, res: Response) => {
  try {
    return res.status(200).json(success({
      languages: Object.entries(LANGUAGES).map(([code, info]) => ({
        code,
        name: info.name,
        native_name: info.nativeName,
        rtl: info.rtl,
      })),
      platforms: Object.entries(PLATFORMS).map(([code, info]) => ({
        code,
        name: info.name,
        max_duration: info.maxDuration,
        aspect_ratio: info.aspectRatio,
      })),
      tones: Object.entries(TONES).map(([code, info]) => ({
        code,
        name: info.name,
        name_ar: info.nameAr,
        description: info.description,
      })),
      niches: Object.entries(NICHES).map(([code, info]) => ({
        code,
        name: info.name,
        name_ar: info.nameAr,
        emoji: info.emoji,
      })),
      models: Object.entries(LLM_MODELS).map(([code, info]) => ({
        code,
        name: info.name,
        provider: info.provider,
      })),
    }));

  } catch (err) {
    console.error('Get options error:', err);
    return res.status(500).json(error('Failed to get options', 'OPTIONS_ERROR'));
  }
});

// Validation for TTS
const ttsSchema = z.object({
  text: z.string().min(1, 'Text is required').max(3500),
  voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
});

/**
 * POST /api/v1/generate/audio
 * Generate high-quality speech (OpenAI TTS) from text. Returns audio/mpeg.
 */
router.post('/audio', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = ttsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(
      validationError(parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })))
    );
  }
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json(error('Audio service is not configured', 'TTS_NOT_CONFIGURED'));
    }
    // Use real OpenAI for TTS (audio/speech is not available on OpenRouter)
    const client = new OpenAI({ apiKey });
    const voice = parsed.data.voice ?? 'shimmer';
    const speech = await client.audio.speech.create({
      model: 'tts-1',
      voice,
      input: parsed.data.text,
    });
    const buffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(buffer);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('TTS error:', msg);
    return res.status(502).json(error('Failed to generate audio', 'TTS_FAILED'));
  }
});


// Validation for AI video generation
const aiVideoSchema = z.object({
  image_url: z.string().url('A valid image URL is required'),
  prompt: z.string().max(1000).optional(),
  model: z.string().max(100).optional(),
});

const ALLOWED_VIDEO_MODEL_PREFIXES = ['minimax/', 'wan-video/', 'google/veo', 'bytedance/', 'kwaivgi/'];

/**
 * POST /api/v1/generate/video
 * Start a real AI image-to-video generation via Replicate (Hailuo/MiniMax by default).
 */
router.post('/video', async (req: AuthenticatedRequest, res: Response) => {
  const parsed = aiVideoSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(
      validationError(parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })))
    );
  }
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return res.status(500).json(error('AI video is not configured yet (add REPLICATE_API_TOKEN)', 'VIDEO_NOT_CONFIGURED'));
  }
  try {
    const requested = parsed.data.model;
    const model =
      requested && ALLOWED_VIDEO_MODEL_PREFIXES.some((p) => requested.startsWith(p))
        ? requested
        : process.env.REPLICATE_VIDEO_MODEL || 'google/veo-3.1-fast';
    const prompt =
      parsed.data.prompt ||
      'Dynamic product showcase: the camera orbits around the product while it slowly rotates, light sweeps across the surface, energetic cinematic motion, vivid colors, high detail commercial video';
    // Each model family expects a different image input field
    const input: Record<string, unknown> = { prompt };
    if (model.startsWith('minimax/')) input.first_frame_image = parsed.data.image_url;
    else if (model.startsWith('kwaivgi/')) input.start_image = parsed.data.image_url;
    else input.image = parsed.data.image_url;
    if (model.startsWith('google/veo')) {
      input.aspect_ratio = '9:16';
      input.resolution = '720p';
      input.duration = 6;
    }
    const resp = await fetch('https://api.replicate.com/v1/models/' + model + '/predictions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });
    const j = (await resp.json()) as { id?: string; status?: string; detail?: string };
    if (!resp.ok || !j.id) {
      console.error('Replicate start error:', j);
      return res.status(502).json(error(j.detail || 'Failed to start AI video generation', 'VIDEO_START_FAILED'));
    }
    return res.status(200).json(success({ id: j.id, status: j.status || 'starting' }));
  } catch (err) {
    console.error('AI video start error:', err);
    return res.status(502).json(error('Failed to start AI video generation', 'VIDEO_START_FAILED'));
  }
});

/**
 * GET /api/v1/generate/video/:id
 * Poll the status of an AI video generation.
 */
router.get('/video/:id', async (req: AuthenticatedRequest, res: Response) => {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return res.status(500).json(error('AI video is not configured yet (add REPLICATE_API_TOKEN)', 'VIDEO_NOT_CONFIGURED'));
  }
  try {
    const resp = await fetch('https://api.replicate.com/v1/predictions/' + encodeURIComponent(req.params.id), {
      headers: { Authorization: 'Bearer ' + token },
    });
    const j = (await resp.json()) as { id?: string; status?: string; output?: unknown; error?: unknown };
    if (!resp.ok) {
      return res.status(502).json(error('Failed to get AI video status', 'VIDEO_STATUS_FAILED'));
    }
    let output: string | null = null;
    if (typeof j.output === 'string') output = j.output;
    else if (Array.isArray(j.output) && typeof j.output[0] === 'string') output = j.output[0];
    return res.status(200).json(success({
      id: j.id,
      status: j.status || 'unknown',
      output,
      error: j.error ? String(j.error) : null,
    }));
  } catch (err) {
    console.error('AI video status error:', err);
    return res.status(502).json(error('Failed to get AI video status', 'VIDEO_STATUS_FAILED'));
  }
});


export default router;
