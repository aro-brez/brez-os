import { z } from "zod";

// ============ CORE ENTITIES ============

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  role: z.enum(["admin", "member", "viewer"]),
  department: z.string(),
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const DepartmentSchema = z.enum([
  "growth",
  "retail",
  "finance",
  "ops",
  "product",
  "cx",
  "creative",
  "exec",
]);
export type Department = z.infer<typeof DepartmentSchema>;

// ============ CHANNELS & MESSAGES ============

export const ChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  department: DepartmentSchema,
  description: z.string(),
  icon: z.string(),
  createdAt: z.string(),
});
export type Channel = z.infer<typeof ChannelSchema>;

export const ReactionSchema = z.object({
  emoji: z.string(),
  userId: z.string(),
});
export type Reaction = z.infer<typeof ReactionSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  channelId: z.string(),
  parentId: z.string().nullable(), // null = top-level, string = reply
  authorId: z.string(),
  content: z.string(),
  attachments: z.array(z.string()), // file IDs
  reactions: z.array(ReactionSchema),
  mentions: z.array(z.string()), // user IDs
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});
export type Message = z.infer<typeof MessageSchema>;

// ============ GOALS ============

export const GoalStatusSchema = z.enum(["on_track", "at_risk", "behind", "completed"]);
export type GoalStatus = z.infer<typeof GoalStatusSchema>;

export const GoalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  department: DepartmentSchema,
  ownerId: z.string(),
  dueDate: z.string(),
  impactScore: z.number().min(1).max(10),
  metricTarget: z.string(),
  metricCurrent: z.string().optional(),
  status: GoalStatusSchema,
  linkedTaskIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Goal = z.infer<typeof GoalSchema>;

// ============ TASKS ============

export const TaskStatusSchema = z.enum(["todo", "doing", "done"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskCommentSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.string(),
});
export type TaskComment = z.infer<typeof TaskCommentSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  ownerId: z.string().nullable(),
  dueDate: z.string().nullable(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  department: DepartmentSchema,
  goalId: z.string().nullable(),
  projectId: z.string().nullable(),
  comments: z.array(TaskCommentSchema),
  attachments: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Task = z.infer<typeof TaskSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  department: DepartmentSchema,
  ownerId: z.string(),
  status: z.enum(["active", "completed", "archived"]),
  taskIds: z.array(z.string()),
  createdAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

// ============ FILES ============

export const FileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string(), // local path or blob URL in dev mode
  tags: z.array(z.string()),
  notes: z.string().optional(),
  uploadedBy: z.string(),
  linkedChannelId: z.string().nullable(),
  linkedGoalId: z.string().nullable(),
  linkedTaskId: z.string().nullable(),
  source: z.enum(["upload", "google_drive", "dropbox"]),
  externalId: z.string().optional(), // for Google Drive, etc.
  createdAt: z.string(),
});
export type File = z.infer<typeof FileSchema>;

// ============ CUSTOMER FEEDBACK ============

export const CustomerMessageSchema = z.object({
  id: z.string(),
  source: z.enum(["review", "support", "survey", "social"]),
  platform: z.string().optional(), // Amazon, Shopify, Zendesk, etc.
  content: z.string(),
  rating: z.number().optional(),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  themes: z.array(z.string()),
  pricesMentioned: z.array(z.string()),
  customerName: z.string().optional(),
  date: z.string(),
  importedAt: z.string(),
});
export type CustomerMessage = z.infer<typeof CustomerMessageSchema>;

// ============ FINANCIALS ============

export const FinancialSnapshotSchema = z.object({
  id: z.string(),
  date: z.string(),
  cashOnHand: z.number(),
  apDueNext2Weeks: z.number(),
  arExpectedNext2Weeks: z.number(),
  fixedWeeklyStack: z.number(),
  notes: z.string().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
});
export type FinancialSnapshot = z.infer<typeof FinancialSnapshotSchema>;

// ============ GROWTH SNAPSHOTS ============

export const GrowthSnapshotSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["actual", "scenario"]),
  inputs: z.record(z.unknown()),
  outputs: z.record(z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type GrowthSnapshot = z.infer<typeof GrowthSnapshotSchema>;

// ============ HUDDLES / MEETING SUMMARIES ============

export const MeetingActionItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  assigneeId: z.string().nullable(),
  taskId: z.string().nullable(), // created task
  approved: z.boolean().default(false),
});
export type MeetingActionItem = z.infer<typeof MeetingActionItemSchema>;

export const MeetingDecisionSchema = z.object({
  id: z.string(),
  text: z.string(),
  approved: z.boolean().default(false),
});
export type MeetingDecision = z.infer<typeof MeetingDecisionSchema>;

export const HuddleSchema = z.object({
  id: z.string(),
  channelId: z.string(),
  title: z.string(),
  participants: z.array(z.string()),
  notes: z.string(),
  transcript: z.string().optional(),
  summary: z.string().optional(),
  decisions: z.array(MeetingDecisionSchema),
  actionItems: z.array(MeetingActionItemSchema),
  status: z.enum(["active", "ended", "finalized"]),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
});
export type Huddle = z.infer<typeof HuddleSchema>;

// ============ CUSTOMER DEMOGRAPHICS ============

export const CustomerDemographicSnapshotSchema = z.object({
  id: z.string(),
  date: z.string(), // YYYY-MM-DD
  totalCustomers: z.number(),
  newCustomers: z.number(),
  returningCustomers: z.number(),
  averageOrderValue: z.number(),
  totalRevenue: z.number(),
  ageGroups: z.object({
    "18-24": z.number(),
    "25-34": z.number(),
    "35-44": z.number(),
    "45-54": z.number(),
    "55-64": z.number(),
    "65+": z.number(),
  }),
  gender: z.object({
    male: z.number(),
    female: z.number(),
    other: z.number(),
  }),
  topStates: z.array(z.object({
    state: z.string(),
    count: z.number(),
    revenue: z.number(),
  })),
  acquisitionChannels: z.object({
    organic: z.number(),
    paid: z.number(),
    referral: z.number(),
    social: z.number(),
    email: z.number(),
  }),
  subscriptionRate: z.number(), // percentage
  repeatPurchaseRate: z.number(), // percentage
});
export type CustomerDemographicSnapshot = z.infer<typeof CustomerDemographicSnapshotSchema>;

// ============ CONNECTORS ============

export const ConnectorStatusSchema = z.enum(["not_connected", "connected", "error"]);

export const ConnectorSchema = z.object({
  id: z.string(),
  type: z.enum(["shopify", "quickbooks", "meta_ads", "google_ads", "google_drive"]),
  status: ConnectorStatusSchema,
  lastSync: z.string().nullable(),
  config: z.record(z.string()).optional(),
  error: z.string().optional(),
});
export type Connector = z.infer<typeof ConnectorSchema>;

// ============ APP SETTINGS ============

export const AppSettingsSchema = z.object({
  devMode: z.boolean(),
  supabaseEnabled: z.boolean(),
  currentUserId: z.string(),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

// ============ FULL DATABASE SCHEMA ============

export const DatabaseSchema = z.object({
  users: z.array(UserSchema),
  channels: z.array(ChannelSchema),
  messages: z.array(MessageSchema),
  goals: z.array(GoalSchema),
  tasks: z.array(TaskSchema),
  projects: z.array(ProjectSchema),
  files: z.array(FileSchema),
  customerMessages: z.array(CustomerMessageSchema),
  customerDemographics: z.array(CustomerDemographicSnapshotSchema),
  financialSnapshots: z.array(FinancialSnapshotSchema),
  growthSnapshots: z.array(GrowthSnapshotSchema),
  huddles: z.array(HuddleSchema),
  connectors: z.array(ConnectorSchema),
  settings: AppSettingsSchema,
});
export type Database = z.infer<typeof DatabaseSchema>;
