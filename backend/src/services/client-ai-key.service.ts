import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.AI_KEY_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export interface ClientAiKeyResult {
  id: string;
  clientId: string;
  providerName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ClientAiKeyService {
  async setKey(clientId: string, providerName: string, apiKey: string): Promise<ClientAiKeyResult> {
    const encrypted = encrypt(apiKey);

    const existing = await prisma.clientAiKey.findUnique({
      where: { client_id_provider_name: { client_id: clientId, provider_name: providerName } },
    });

    if (existing) {
      const updated = await prisma.clientAiKey.update({
        where: { id: existing.id },
        data: { api_key_encrypted: encrypted, is_active: true },
      });
      return {
        id: updated.id,
        clientId: updated.client_id,
        providerName: updated.provider_name,
        isActive: updated.is_active,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };
    }

    const created = await prisma.clientAiKey.create({
      data: {
        client_id: clientId,
        provider_name: providerName,
        api_key_encrypted: encrypted,
      },
    });

    return {
      id: created.id,
      clientId: created.client_id,
      providerName: created.provider_name,
      isActive: created.is_active,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    };
  }

  async getKey(clientId: string, providerName: string): Promise<string | null> {
    const record = await prisma.clientAiKey.findUnique({
      where: { client_id_provider_name: { client_id: clientId, provider_name: providerName } },
    });

    if (!record || !record.is_active) return null;

    try {
      return decrypt(record.api_key_encrypted);
    } catch {
      return null;
    }
  }

  async getKeys(clientId: string): Promise<ClientAiKeyResult[]> {
    const records = await prisma.clientAiKey.findMany({
      where: { client_id: clientId },
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      clientId: r.client_id,
      providerName: r.provider_name,
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async deleteKey(clientId: string, providerName: string): Promise<void> {
    await prisma.clientAiKey.deleteMany({
      where: { client_id: clientId, provider_name: providerName },
    });
  }

  async toggleKey(clientId: string, providerName: string, isActive: boolean): Promise<void> {
    await prisma.clientAiKey.updateMany({
      where: { client_id: clientId, provider_name: providerName },
      data: { is_active: isActive },
    });
  }

  async hasKey(clientId: string, providerName: string): Promise<boolean> {
    const count = await prisma.clientAiKey.count({
      where: { client_id: clientId, provider_name: providerName, is_active: true },
    });
    return count > 0;
  }

  async getFirstAvailableKey(clientId: string): Promise<{ provider: string; apiKey: string } | null> {
    const providers = ['groq', 'openai', 'anthropic', 'gemini'];

    for (const provider of providers) {
      const key = await this.getKey(clientId, provider);
      if (key) return { provider, apiKey: key };
    }

    return null;
  }

  maskKey(apiKey: string): string {
    if (apiKey.length <= 8) return '****';
    return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
  }
}

export const clientAiKeyService = new ClientAiKeyService();
