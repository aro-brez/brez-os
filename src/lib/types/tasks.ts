export interface Task {
  id: string;
  content: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  completedBy?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  completedAt?: string;
  createdAt: string;
  readBy: string[];
}

export interface TaskInput {
  content: string;
  priority?: "low" | "medium" | "high";
  assignedToEmail?: string;
}
