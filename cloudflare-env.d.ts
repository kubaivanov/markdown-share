/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  DB: D1Database;
  FILES: R2Bucket;
  API_SECRET_KEY?: string;
  ADMIN_KEY?: string;
  NEXT_PUBLIC_BASE_URL?: string;
}
