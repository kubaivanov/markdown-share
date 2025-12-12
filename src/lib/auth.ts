import { NextRequest } from 'next/server';

/**
 * Validate API key for upload/delete operations (script access)
 */
export function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  const apiKey = process.env.API_SECRET_KEY;

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
  const adminKey = process.env.ADMIN_KEY;
  
  if (!adminKey) {
    console.error('ADMIN_KEY is not set');
    return false;
  }

  return key === adminKey;
}
