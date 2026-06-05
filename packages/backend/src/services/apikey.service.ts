import { db } from '../db/index.js';
import { apiKeys } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface ApiKeyData {
  id: string;
  key: string;
  label: string | null;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
}

export interface CreateApiKeyInput {
  userId: string;
  label?: string;
}

// Generate a secure random API key (40 characters)
function generateApiKey(): string {
  // Format: tcg_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (40 chars total)
  const prefix = 'tcg_';
  const randomPart = crypto.randomBytes(27).toString('base64url').slice(0, 36);
  return prefix + randomPart;
}

// Hash API key for storage (we store hash, not plain key)
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

class ApiKeyService {
  /**
   * Create a new API key for user
   * Returns the plain key only once (not stored)
   */
  async createApiKey(input: CreateApiKeyInput): Promise<{ key: string; data: ApiKeyData }> {
    const plainKey = generateApiKey();
    const hashedKey = hashApiKey(plainKey);

    const newKeyId = uuidv4();
    await db
      .insert(apiKeys)
      .values({
        id: newKeyId,
        userId: input.userId,
        key: hashedKey,
        label: input.label || `API Key ${new Date().toLocaleDateString()}`,
        isActive: true,
      });

    const [created] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, newKeyId));

    return {
      key: plainKey, // Return plain key only once
      data: {
        id: created.id,
        key: `${plainKey.slice(0, 8)}...${plainKey.slice(-4)}`, // Masked for display
        label: created.label,
        isActive: created.isActive,
        createdAt: created.createdAt,
        lastUsedAt: created.lastUsedAt,
      },
    };
  }

  /**
   * Get all API keys for user (masked)
   */
  async getUserApiKeys(userId: string): Promise<ApiKeyData[]> {
    const keys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));

    return keys.map((k: typeof keys[number]) => ({
      id: k.id,
      key: `tcg_****...${k.key.slice(-4)}`, // Show only last 4 chars of hash
      label: k.label,
      isActive: k.isActive,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
    }));
  }

  /**
   * Validate API key and return user ID
   */
  async validateApiKey(plainKey: string): Promise<{ userId: string; keyId: string } | null> {
    if (!plainKey || !plainKey.startsWith('tcg_')) {
      return null;
    }

    const hashedKey = hashApiKey(plainKey);

    const [key] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.key, hashedKey), eq(apiKeys.isActive, true)));

    if (!key) {
      return null;
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, key.id));

    return { userId: key.userId, keyId: key.id };
  }

  /**
   * Deactivate an API key
   */
  async deactivateApiKey(keyId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(apiKeys)
      .set({ isActive: false })
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));

    return result[0].affectedRows > 0;
  }

  /**
   * Reactivate an API key
   */
  async reactivateApiKey(keyId: string, userId: string): Promise<boolean> {
    const result = await db
      .update(apiKeys)
      .set({ isActive: true })
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));

    return result[0].affectedRows > 0;
  }

  /**
   * Delete an API key permanently
   */
  async deleteApiKey(keyId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));

    return result[0].affectedRows > 0;
  }

  /**
   * Update API key label
   */
  async updateApiKeyLabel(keyId: string, userId: string, label: string): Promise<boolean> {
    const result = await db
      .update(apiKeys)
      .set({ label })
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId)));

    return result[0].affectedRows > 0;
  }

  /**
   * Count active API keys for user
   */
  async countActiveKeys(userId: string): Promise<number> {
    const keys = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.userId, userId), eq(apiKeys.isActive, true)));

    return keys.length;
  }
}

export const apiKeyService = new ApiKeyService();
