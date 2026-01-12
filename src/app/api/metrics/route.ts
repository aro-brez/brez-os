import { NextResponse } from "next/server";
import { getUnifiedMetrics, generateDynamicOneThing } from "@/lib/integrations/unified";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department") || "exec";

  try {
    const metrics = await getUnifiedMetrics();
    const oneThing = generateDynamicOneThing(metrics, department);

    return NextResponse.json({
      success: true,
      metrics,
      oneThing,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Metrics API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
