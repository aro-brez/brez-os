import { NextResponse } from "next/server";

/**
 * Test Shopify API connection
 * Returns connection status and sample data if connected
 */
export async function GET() {
  const shopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  // Check if env vars are configured
  if (!shopDomain || !accessToken) {
    return NextResponse.json({
      connected: false,
      configured: false,
      error: "Missing environment variables",
      required: {
        SHOPIFY_SHOP_DOMAIN: !!shopDomain,
        SHOPIFY_ACCESS_TOKEN: !!accessToken,
      },
    }, { status: 200 });
  }

  try {
    // Test connection by fetching shop info
    const url = `https://${shopDomain}/admin/api/2024-01/shop.json`;
    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        connected: false,
        configured: true,
        error: `API Error: ${response.status} - ${response.statusText}`,
        details: errorText.slice(0, 200),
      }, { status: 200 });
    }

    const data = await response.json();

    return NextResponse.json({
      connected: true,
      configured: true,
      shop: {
        name: data.shop?.name,
        domain: data.shop?.domain,
        email: data.shop?.email,
        currency: data.shop?.currency,
        timezone: data.shop?.timezone,
        planName: data.shop?.plan_name,
      },
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      configured: true,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 200 });
  }
}
