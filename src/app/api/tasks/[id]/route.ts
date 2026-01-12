import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Note: In production, this should use Supabase
// This is a placeholder that shows the API structure

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();

    // In production, update in Supabase
    // const supabase = createClient();
    // const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();

    const updatedTask = {
      id,
      ...updates,
      completedAt: updates.status === "completed" ? new Date().toISOString() : undefined,
      completedBy:
        updates.status === "completed"
          ? {
              id: session.user.id,
              name: session.user.name || "Unknown",
              email: session.user.email || "",
            }
          : undefined,
    };

    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // In production, delete from Supabase
    // const supabase = createClient();
    // const { error } = await supabase.from('tasks').delete().eq('id', id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
