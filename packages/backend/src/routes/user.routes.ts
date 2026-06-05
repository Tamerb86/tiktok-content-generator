import { Router, Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { usageService } from '../services/usage.service.js';
import { sendSuccess, sendNotFound, sendServerError } from '../utils/response.js';

const router = Router();

/**
 * GET /api/v1/me
 * Get current user profile with plan info
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendNotFound(res, 'User');
      return;
    }

    const user = await userService.getUserById(req.user.id);

    if (!user) {
      sendNotFound(res, 'User');
      return;
    }

    // Get usage statistics
    const usageStats = await usageService.getUsageStats(req.user.id);

    sendSuccess(res, {
      id: user.id,
      email: user.email,
      name: user.name,
      // Flat fields (web frontend)
      planCode: user.planCode,
      planName: user.planName,
      monthlyLimit: user.monthlyLimitRequests,
      // Nested plan (browser extension)
      plan: {
        code: user.planCode,
        name: user.planName,
        monthlyLimitRequests: user.monthlyLimitRequests,
      },
      usage: {
        currentMonthUsage: usageStats.currentMonthUsage,
        monthlyLimit: usageStats.monthlyLimit,
        remainingRequests: usageStats.remainingRequests,
        isWithinLimit: usageStats.isWithinLimit,
        periodStart: usageStats.periodStart.toISOString(),
        periodEnd: usageStats.periodEnd.toISOString(),
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    sendServerError(res);
  }
});

/**
 * PATCH /api/v1/me
 * Update current user profile
 */
router.patch('/me', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendNotFound(res, 'User');
      return;
    }

    const { name } = req.body;

    const updatedUser = await userService.updateUser(req.user.id, { name });

    if (!updatedUser) {
      sendNotFound(res, 'User');
      return;
    }

    sendSuccess(res, {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      planCode: updatedUser.planCode,
      planName: updatedUser.planName,
      monthlyLimit: updatedUser.monthlyLimitRequests,
      plan: {
        code: updatedUser.planCode,
        name: updatedUser.planName,
        monthlyLimitRequests: updatedUser.monthlyLimitRequests,
      },
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    sendServerError(res);
  }
});

export default router;
