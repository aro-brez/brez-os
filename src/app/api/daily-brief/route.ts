import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Types for the Daily Brief feature
interface DailyUpdate {
  id: string;
  content: string;
  type: "update" | "request" | "announcement";
  author: {
    id: string;
    name: string;
    email: string;
  };
  targetPerson?: string; // Who the request is for (e.g., "travis", "dan", "anyone")
  createdAt: string;
  resolved: boolean;
  resolvedBy?: {
    id: string;
    name: string;
  };
  resolvedAt?: string;
}

// In-memory storage for demo (replace with Supabase in production)
const dailyUpdates: DailyUpdate[] = [
  // Seed with some example data
  {
    id: "brief-1",
    content: "New packaging design mockups are ready for review",
    type: "update",
    author: { id: "1", name: "Travis Duncan", email: "travis@drinkbrez.com" },
    createdAt: new Date().toISOString(),
    resolved: false,
  },
  {
    id: "brief-2",
    content: "Need approval on the Q1 marketing budget allocation",
    type: "request",
    author: { id: "2", name: "David Alvarado", email: "david@drinkbrez.com" },
    targetPerson: "dan",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    resolved: false,
  },
  {
    id: "brief-3",
    content: "Retail velocity report shows 15% increase in West Coast",
    type: "announcement",
    author: { id: "3", name: "Brian Dewey", email: "brian@drinkbrez.com" },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    resolved: false,
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, requests, updates, mine

    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filteredUpdates = dailyUpdates.filter((update) => {
      const updateDate = new Date(update.createdAt);
      updateDate.setHours(0, 0, 0, 0);
      // Show updates from last 24 hours
      return updateDate.getTime() >= today.getTime() - 86400000;
    });

    // Apply additional filters
    if (filter === "requests") {
      filteredUpdates = filteredUpdates.filter((u) => u.type === "request" && !u.resolved);
    } else if (filter === "updates") {
      filteredUpdates = filteredUpdates.filter((u) => u.type === "update" || u.type === "announcement");
    } else if (filter === "mine") {
      const userEmail = session.user.email?.toLowerCase() || "";
      const userName = session.user.name?.toLowerCase() || "";
      filteredUpdates = filteredUpdates.filter(
        (u) =>
          u.targetPerson?.toLowerCase() === userName.split(" ")[0] ||
          u.author.email.toLowerCase() === userEmail
      );
    }

    // Sort by most recent first
    filteredUpdates.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      updates: filteredUpdates,
      summary: {
        totalUpdates: filteredUpdates.length,
        pendingRequests: filteredUpdates.filter((u) => u.type === "request" && !u.resolved).length,
        announcements: filteredUpdates.filter((u) => u.type === "announcement").length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch daily brief:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily brief" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, type = "update", targetPerson } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const newUpdate: DailyUpdate = {
      id: `brief-${Date.now()}`,
      content,
      type,
      author: {
        id: session.user.id || "unknown",
        name: session.user.name || "Unknown",
        email: session.user.email || "",
      },
      targetPerson: targetPerson || undefined,
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    dailyUpdates.unshift(newUpdate);

    return NextResponse.json({ success: true, update: newUpdate });
  } catch (error) {
    console.error("Failed to create daily brief update:", error);
    return NextResponse.json(
      { error: "Failed to create update" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, resolved } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Update ID is required" },
        { status: 400 }
      );
    }

    const updateIndex = dailyUpdates.findIndex((u) => u.id === id);
    if (updateIndex === -1) {
      return NextResponse.json(
        { error: "Update not found" },
        { status: 404 }
      );
    }

    dailyUpdates[updateIndex].resolved = resolved;
    if (resolved) {
      dailyUpdates[updateIndex].resolvedBy = {
        id: session.user.id || "unknown",
        name: session.user.name || "Unknown",
      };
      dailyUpdates[updateIndex].resolvedAt = new Date().toISOString();
    }

    return NextResponse.json({ success: true, update: dailyUpdates[updateIndex] });
  } catch (error) {
    console.error("Failed to update daily brief:", error);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}
