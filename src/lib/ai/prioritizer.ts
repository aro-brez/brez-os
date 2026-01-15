/**
 * Rules-based AI Prioritizer (V1)
 * V2 will integrate with Claude API for intelligent prioritization
 */

import { Task, Goal, Message, FinancialSnapshot, CustomerMessage, Department } from "../data/schemas";
import { devStore } from "../data/devStore";

export interface Priority {
  id: string;
  type: "task" | "goal" | "message" | "insight";
  title: string;
  description: string;
  urgency: "critical" | "high" | "medium" | "low";
  department?: Department;
  dueDate?: string;
  owner?: string;
  linkedId: string;
}

export interface NextBestAction {
  action: string;
  reason: string;
  type: "task" | "decision" | "question" | "alert";
  department?: Department;
  linkedTaskId?: string;
}

export interface QuestionToAnswer {
  question: string;
  context: string;
  department: Department;
  suggestedOwner?: string;
}

/**
 * Get top priorities for today across all departments
 */
export function getTopPriorities(limit = 5): Priority[] {
  const tasks = devStore.getTasks();
  const goals = devStore.getGoals();
  const users = devStore.getUsers();

  const priorities: Priority[] = [];

  // Score and rank tasks
  const scoredTasks = tasks
    .filter((t) => t.status !== "done")
    .map((task) => {
      let score = 0;

      // Priority weight
      if (task.priority === "urgent") score += 100;
      else if (task.priority === "high") score += 75;
      else if (task.priority === "medium") score += 50;
      else score += 25;

      // Due date urgency
      if (task.dueDate) {
        const daysUntilDue = Math.ceil(
          (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDue < 0) score += 200; // Overdue
        else if (daysUntilDue === 0) score += 150; // Due today
        else if (daysUntilDue <= 2) score += 100; // Due soon
        else if (daysUntilDue <= 7) score += 50;
      }

      // Linked to goal boosts priority
      if (task.goalId) {
        const goal = goals.find((g) => g.id === task.goalId);
        if (goal) score += goal.impactScore * 5;
      }

      // In-progress gets slight boost
      if (task.status === "doing") score += 20;

      return { task, score };
    })
    .sort((a, b) => b.score - a.score);

  // Convert top tasks to priorities
  scoredTasks.slice(0, limit).forEach(({ task, score }) => {
    const owner = task.ownerId ? users.find((u) => u.id === task.ownerId) : null;
    let urgency: Priority["urgency"] = "low";
    if (score >= 200) urgency = "critical";
    else if (score >= 100) urgency = "high";
    else if (score >= 50) urgency = "medium";

    priorities.push({
      id: `priority-${task.id}`,
      type: "task",
      title: task.title,
      description: task.description || "",
      urgency,
      department: task.department,
      dueDate: task.dueDate || undefined,
      owner: owner?.name,
      linkedId: task.id,
    });
  });

  return priorities;
}

/**
 * Get priorities for a specific department
 */
export function getDepartmentPriorities(department: Department, limit = 5): Priority[] {
  const allPriorities = getTopPriorities(20);
  return allPriorities.filter((p) => p.department === department).slice(0, limit);
}

/**
 * Get Next Best Action (global or per department)
 */
export function getNextBestAction(department?: Department): NextBestAction {
  const tasks = devStore.getTasks();
  const goals = devStore.getGoals();
  const snapshots = devStore.getFinancialSnapshots();

  // Check financial health first
  if (snapshots.length > 0) {
    const latest = snapshots[0];
    const netCashFlow = latest.arExpectedNext2Weeks - latest.apDueNext2Weeks;
    const weeksOfRunway = latest.cashOnHand / latest.fixedWeeklyStack;

    if (weeksOfRunway < 4) {
      return {
        action: "Review cash position immediately",
        reason: `Only ${weeksOfRunway.toFixed(1)} weeks of runway remaining`,
        type: "alert",
        department: "finance",
      };
    }

    if (netCashFlow < -50000) {
      return {
        action: "Address negative cash flow",
        reason: `Net cash flow is -$${Math.abs(netCashFlow / 1000).toFixed(0)}K over next 2 weeks`,
        type: "alert",
        department: "finance",
      };
    }
  }

  // Find most urgent task
  const urgentTasks = tasks
    .filter((t) => {
      if (t.status === "done") return false;
      if (department && t.department !== department) return false;
      return true;
    })
    .filter((t) => {
      if (!t.dueDate) return false;
      const daysUntilDue = Math.ceil(
        (new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilDue <= 2;
    })
    .sort((a, b) => {
      const aDays = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDays = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aDays - bDays;
    });

  if (urgentTasks.length > 0) {
    const task = urgentTasks[0];
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    return {
      action: isOverdue ? `Complete overdue: ${task.title}` : `Focus on: ${task.title}`,
      reason: isOverdue ? "This task is past its due date" : "Due within 48 hours",
      type: "task",
      department: task.department,
      linkedTaskId: task.id,
    };
  }

  // Check for at-risk goals
  const atRiskGoals = goals.filter((g) => {
    if (department && g.department !== department) return false;
    return g.status === "at_risk" || g.status === "behind";
  });

  if (atRiskGoals.length > 0) {
    const goal = atRiskGoals[0];
    return {
      action: `Review ${goal.status === "behind" ? "behind" : "at-risk"} goal: ${goal.title}`,
      reason: `Goal is ${goal.status.replace("_", " ")} - needs attention`,
      type: "decision",
      department: goal.department,
    };
  }

  // Default action
  return {
    action: "Review and prioritize upcoming work",
    reason: "No critical items - good time for strategic planning",
    type: "task",
    department,
  };
}

/**
 * Get questions that need answers
 */
export function getQuestionsToAnswer(department?: Department, limit = 3): QuestionToAnswer[] {
  const goals = devStore.getGoals();
  const tasks = devStore.getTasks();
  const customers = devStore.getCustomerMessages();
  const questions: QuestionToAnswer[] = [];

  // Generate questions from goals without clear metrics
  goals
    .filter((g) => !department || g.department === department)
    .filter((g) => !g.metricCurrent)
    .forEach((g) => {
      questions.push({
        question: `What's the current status on "${g.title}"?`,
        context: `Goal is due ${new Date(g.dueDate).toLocaleDateString()} with target: ${g.metricTarget}`,
        department: g.department,
      });
    });

  // Questions from negative customer feedback themes
  const negativeThemes = new Map<string, number>();
  customers
    .filter((c) => c.sentiment === "negative")
    .forEach((c) => {
      c.themes.forEach((theme) => {
        negativeThemes.set(theme, (negativeThemes.get(theme) || 0) + 1);
      });
    });

  Array.from(negativeThemes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .forEach(([theme, count]) => {
      questions.push({
        question: `How are we addressing "${theme}" issues?`,
        context: `${count} customers mentioned this in negative feedback`,
        department: "cx",
      });
    });

  // Questions from blocked/stale tasks
  tasks
    .filter((t) => t.status === "doing")
    .filter((t) => {
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(t.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceUpdate > 5;
    })
    .forEach((t) => {
      questions.push({
        question: `What's blocking "${t.title}"?`,
        context: "Task has been in-progress for over 5 days",
        department: t.department,
      });
    });

  return questions
    .filter((q) => !department || q.department === department)
    .slice(0, limit);
}

/**
 * V2 Interface - Will be replaced with Claude API integration
 */
export interface AIAnalysis {
  priorities: Priority[];
  nextBestAction: NextBestAction;
  questions: QuestionToAnswer[];
  summary: string;
}

export async function analyzeWithAI(
  _context: {
    tasks: Task[];
    goals: Goal[];
    messages: Message[];
    financials: FinancialSnapshot[];
    customers: CustomerMessage[];
  },
  _department?: Department
): Promise<AIAnalysis> {
  // V2: Will integrate with Claude API for intelligent analysis
  // Currently uses rules-based prioritization as fallback
  return {
    priorities: getTopPriorities(),
    nextBestAction: getNextBestAction(_department),
    questions: getQuestionsToAnswer(_department),
    summary: "Analysis complete using rules-based engine. V2 will provide AI-powered insights.",
  };
}
