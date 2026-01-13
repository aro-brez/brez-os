import { NextResponse } from "next/server";

// Version is set at build time or from env
const APP_VERSION = process.env.npm_package_version || "1.0.0";

export async function GET() {
  const isSupabaseConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const isShopifyConfigured = !!(
    process.env.SHOPIFY_SHOP_DOMAIN &&
    process.env.SHOPIFY_ACCESS_TOKEN
  );

  const response = {
    ok: true,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    env: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "development",
    features: {
      supabase: isSupabaseConfigured,
      devMode: !isSupabaseConfigured,
      googleAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      anthropicAI: !!process.env.ANTHROPIC_API_KEY,
      shopify: isShopifyConfigured,
    },
    build: {
      // Vercel provides these automatically
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
      commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || "Local development",
      deployedAt: process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE || new Date().toISOString(),
    },
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
