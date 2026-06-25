import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

function getSecret(name: 'API_SECRET_KEY' | 'ADMIN_KEY'): string | undefined {
  try {
    const value = getCloudflareContext().env[name];
    if (typeof value === 'string') return value;
  } catch {
    // next dev without the OpenNext dev proxy still uses process.env.
  }

  return process.env[name];
}

/**
 * Validate API key for upload/delete operations (script access)
 */
export function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  const apiKey = getSecret('API_SECRET_KEY');

  if (!apiKey) {
    console.error('API_SECRET_KEY is not set');
    return false;
  }

  return token === apiKey;
}

/**
 * Validate admin key for dashboard access (UI login)
 */
export function validateAdminKey(key: string): boolean {
  const adminKey = getSecret('ADMIN_KEY');
  
  if (!adminKey) {
    console.error('ADMIN_KEY is not set');
    return false;
  }

  return key === adminKey;
}
