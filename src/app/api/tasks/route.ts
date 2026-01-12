import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// In-memory storage for demo (replace with Supabase in production)
const tasks: {
  id: string;
  content: string;
  status: string;
  priority: string;
  createdBy: { id: string; name: string; email: string };
  assignedTo?: { id: string; name: string; email: string };
  completedBy?: { id: string; name: string; email: string };
  completedAt?: string;
  createdAt: string;
  readBy: string[];
}[] = [];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In production, fetch from Supabase
    // const supabase = createClient();
    // const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
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

    const { content, priority = "medium", assignedToEmail } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const newTask = {
      id: `task-${Date.now()}`,
      content,
      status: "pending",
      priority,
      createdBy: {
        id: session.user.id,
        name: session.user.name || "Unknown",
        email: session.user.email || "",
      },
      assignedTo: assignedToEmail
        ? { id: "", name: assignedToEmail, email: assignedToEmail }
        : undefined,
      createdAt: new Date().toISOString(),
      readBy: [session.user.id],
    };

    // In production, insert into Supabase
    // const supabase = createClient();
    // const { data, error } = await supabase.from('tasks').insert(newTask).select().single();

    tasks.unshift(newTask);

    return NextResponse.json({ task: newTask });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
