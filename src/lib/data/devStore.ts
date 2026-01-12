"use client";

import {
  Database,
  User,
  Channel,
  Message,
  Goal,
  Task,
  File,
  CustomerMessage,
  CustomerDemographicSnapshot,
  FinancialSnapshot,
  GrowthSnapshot,
  Huddle,
  Connector,
  AppSettings,
  Department,
} from "./schemas";

const STORAGE_KEY = "brez-ai-dev-db";

// ============ SEED DATA ============

const seedUsers: User[] = [
  {
    id: "user-1",
    name: "Aaron Nosbisch",
    email: "aaron@drinkbrez.com",
    avatar: "/avatars/aaron.png",
    role: "admin",
    department: "exec",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-2",
    name: "Sarah Chen",
    email: "sarah@drinkbrez.com",
    role: "member",
    department: "growth",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-3",
    name: "Mike Johnson",
    email: "mike@drinkbrez.com",
    role: "member",
    department: "retail",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-4",
    name: "Emily Davis",
    email: "emily@drinkbrez.com",
    role: "member",
    department: "finance",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-5",
    name: "James Wilson",
    email: "james@drinkbrez.com",
    role: "member",
    department: "ops",
    createdAt: new Date().toISOString(),
  },
];

const seedChannels: Channel[] = [
  { id: "ch-growth", name: "Growth", department: "growth", description: "DTC, marketing, and customer acquisition", icon: "TrendingUp", createdAt: new Date().toISOString() },
  { id: "ch-retail", name: "Retail", department: "retail", description: "Retail partnerships and distribution", icon: "Store", createdAt: new Date().toISOString() },
  { id: "ch-finance", name: "Finance", department: "finance", description: "Financial planning and analysis", icon: "DollarSign", createdAt: new Date().toISOString() },
  { id: "ch-ops", name: "Operations", department: "ops", description: "Supply chain, fulfillment, and logistics", icon: "Truck", createdAt: new Date().toISOString() },
  { id: "ch-product", name: "Product", department: "product", description: "Product development and innovation", icon: "Package", createdAt: new Date().toISOString() },
  { id: "ch-cx", name: "Customer Experience", department: "cx", description: "Support, feedback, and satisfaction", icon: "Heart", createdAt: new Date().toISOString() },
  { id: "ch-creative", name: "Creative", department: "creative", description: "Brand, design, and content", icon: "Palette", createdAt: new Date().toISOString() },
  { id: "ch-exec", name: "Executive", department: "exec", description: "Leadership and strategy", icon: "Crown", createdAt: new Date().toISOString() },
];

const seedMessages: Message[] = [
  {
    id: "msg-1",
    channelId: "ch-growth",
    parentId: null,
    authorId: "user-2",
    content: "CAC is down 15% this week! The new landing page is converting really well.",
    attachments: [],
    reactions: [{ emoji: "fire", userId: "user-1" }, { emoji: "tada", userId: "user-3" }],
    mentions: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: null,
  },
  {
    id: "msg-2",
    channelId: "ch-growth",
    parentId: "msg-1",
    authorId: "user-1",
    content: "Amazing work @sarah! Let's scale spend 20% next week if this holds.",
    attachments: [],
    reactions: [],
    mentions: ["user-2"],
    createdAt: new Date(Date.now() - 3000000).toISOString(),
    updatedAt: null,
  },
  {
    id: "msg-3",
    channelId: "ch-retail",
    parentId: null,
    authorId: "user-3",
    content: "Sprouts wants to expand from 50 to 150 doors. Meeting scheduled for Thursday.",
    attachments: [],
    reactions: [{ emoji: "rocket", userId: "user-1" }],
    mentions: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: null,
  },
  {
    id: "msg-4",
    channelId: "ch-finance",
    parentId: null,
    authorId: "user-4",
    content: "Cash runway looks good through Q2. We have $485K buffer above reserve floor.",
    attachments: [],
    reactions: [],
    mentions: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: null,
  },
];

const seedGoals: Goal[] = [
  {
    id: "goal-1",
    title: "Reduce CAC to $35",
    description: "Optimize ad spend and landing pages to hit $35 CAC target",
    department: "growth",
    ownerId: "user-2",
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    impactScore: 9,
    metricTarget: "$35 CAC",
    metricCurrent: "$42 CAC",
    status: "on_track",
    linkedTaskIds: ["task-1", "task-2"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-2",
    title: "Expand to 500 retail doors",
    description: "Grow retail distribution to 500 doors by end of quarter",
    department: "retail",
    ownerId: "user-3",
    dueDate: new Date(Date.now() + 60 * 86400000).toISOString(),
    impactScore: 8,
    metricTarget: "500 doors",
    metricCurrent: "320 doors",
    status: "on_track",
    linkedTaskIds: ["task-3"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "goal-3",
    title: "Maintain $200K cash reserve",
    description: "Keep cash above reserve floor at all times",
    department: "finance",
    ownerId: "user-4",
    dueDate: new Date(Date.now() + 90 * 86400000).toISOString(),
    impactScore: 10,
    metricTarget: "$200K minimum",
    metricCurrent: "$485K",
    status: "on_track",
    linkedTaskIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedTasks: Task[] = [
  {
    id: "task-1",
    title: "A/B test new hero section copy",
    description: "Test 3 variations of hero copy focused on functional benefits",
    ownerId: "user-2",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    status: "doing",
    priority: "high",
    department: "growth",
    goalId: "goal-1",
    projectId: null,
    comments: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Optimize Meta ad creative",
    description: "Create new UGC-style ads for Meta",
    ownerId: "user-2",
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    status: "todo",
    priority: "high",
    department: "growth",
    goalId: "goal-1",
    projectId: null,
    comments: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Prepare Sprouts expansion proposal",
    description: "Put together expansion proposal for 100 additional Sprouts doors",
    ownerId: "user-3",
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: "doing",
    priority: "urgent",
    department: "retail",
    goalId: "goal-2",
    projectId: null,
    comments: [
      {
        id: "comment-1",
        authorId: "user-1",
        content: "Make sure to include the velocity data from existing doors",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Review Q1 P&L",
    description: "Analyze Q1 financial performance and prepare summary for exec team",
    ownerId: "user-4",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    status: "todo",
    priority: "medium",
    department: "finance",
    goalId: null,
    projectId: null,
    comments: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-5",
    title: "Update inventory forecast",
    description: "Refresh 12-week inventory forecast based on new retail expansion",
    ownerId: "user-5",
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
    status: "todo",
    priority: "high",
    department: "ops",
    goalId: null,
    projectId: null,
    comments: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedCustomerMessages: CustomerMessage[] = [
  {
    id: "cm-1",
    source: "review",
    platform: "Amazon",
    content: "Love this drink! The relaxation effect is perfect after work. Only wish it was a bit cheaper - $4.99 per can adds up.",
    rating: 5,
    sentiment: "positive",
    themes: ["relaxation", "taste", "price"],
    pricesMentioned: ["$4.99"],
    customerName: "Jennifer M.",
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-2",
    source: "review",
    platform: "Amazon",
    content: "Tastes great but I expected more of a calming effect. Maybe I need to try the higher dose version?",
    rating: 4,
    sentiment: "neutral",
    themes: ["taste", "efficacy"],
    pricesMentioned: [],
    customerName: "David R.",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-3",
    source: "support",
    platform: "Zendesk",
    content: "My subscription arrived damaged. Two cans were dented and leaking. Need a replacement ASAP.",
    rating: undefined,
    sentiment: "negative",
    themes: ["shipping", "damaged"],
    pricesMentioned: [],
    customerName: "Alex T.",
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-4",
    source: "review",
    platform: "Shopify",
    content: "Best functional beverage I've tried! Subscription is worth it at $3.99/can. Helps me wind down without feeling groggy.",
    rating: 5,
    sentiment: "positive",
    themes: ["relaxation", "subscription", "value"],
    pricesMentioned: ["$3.99"],
    customerName: "Maria S.",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-5",
    source: "review",
    platform: "Amazon",
    content: "Finally a drink that actually helps me sleep without melatonin. Game changer! Elderflower is my favorite flavor.",
    rating: 5,
    sentiment: "positive",
    themes: ["sleep", "taste", "efficacy"],
    pricesMentioned: [],
    customerName: "Rachel K.",
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-6",
    source: "survey",
    platform: "Typeform",
    content: "I love BREZ but shipping to Hawaii is too expensive ($15!). Would subscribe if shipping was cheaper.",
    rating: 4,
    sentiment: "neutral",
    themes: ["shipping", "price", "subscription"],
    pricesMentioned: ["$15"],
    customerName: "Kai L.",
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-7",
    source: "social",
    platform: "Instagram",
    content: "Just tried @drinkbrez for the first time. The packaging is SO pretty but more importantly it actually works! Going to tell all my anxious friends about this.",
    rating: undefined,
    sentiment: "positive",
    themes: ["efficacy", "packaging", "recommendation"],
    pricesMentioned: [],
    customerName: "@wellness_vibes",
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-8",
    source: "review",
    platform: "Amazon",
    content: "Disappointed. Doesn't taste as good as other CBD drinks I've tried. Too sweet and artificial flavor.",
    rating: 2,
    sentiment: "negative",
    themes: ["taste"],
    pricesMentioned: [],
    customerName: "Marcus J.",
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-9",
    source: "review",
    platform: "Shopify",
    content: "My whole office is addicted now! We order a case every week. The afternoon slump is gone. Worth every penny.",
    rating: 5,
    sentiment: "positive",
    themes: ["efficacy", "value", "workplace"],
    pricesMentioned: [],
    customerName: "Tom B.",
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-10",
    source: "support",
    platform: "Zendesk",
    content: "Can you make a zero-sugar version? I'm diabetic but really want to try this product.",
    rating: undefined,
    sentiment: "neutral",
    themes: ["product request", "sugar"],
    pricesMentioned: [],
    customerName: "Sandra W.",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-11",
    source: "review",
    platform: "Amazon",
    content: "Perfect for my evening yoga routine. I've tried all the flavors and Hibiscus is by far the best. Subscription price makes it affordable.",
    rating: 5,
    sentiment: "positive",
    themes: ["relaxation", "taste", "subscription"],
    pricesMentioned: [],
    customerName: "Priya N.",
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    importedAt: new Date().toISOString(),
  },
  {
    id: "cm-12",
    source: "review",
    platform: "Shopify",
    content: "Ordered for my mom who has trouble sleeping. She says it's the first thing that works without making her feel drugged the next day!",
    rating: 5,
    sentiment: "positive",
    themes: ["sleep", "efficacy", "gift"],
    pricesMentioned: [],
    customerName: "Ashley C.",
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    importedAt: new Date().toISOString(),
  },
];

// Generate customer demographics for the past 12 months
const generateDemographics = (): CustomerDemographicSnapshot[] => {
  const snapshots: CustomerDemographicSnapshot[] = [];
  const baseDate = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setMonth(date.getMonth() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Simulate growth trends
    const growthFactor = 1 + (11 - i) * 0.08; // 8% growth per month
    const baseCustomers = 2500;
    const totalCustomers = Math.floor(baseCustomers * growthFactor);

    snapshots.push({
      id: `demo-${i}`,
      date: dateStr,
      totalCustomers,
      newCustomers: Math.floor(totalCustomers * 0.25 * (1 + Math.random() * 0.2)),
      returningCustomers: Math.floor(totalCustomers * 0.35 * (1 + Math.random() * 0.15)),
      averageOrderValue: 45 + Math.random() * 15 + (11 - i) * 0.5, // AOV growing
      totalRevenue: totalCustomers * (45 + Math.random() * 15),
      ageGroups: {
        "18-24": Math.floor(totalCustomers * (0.15 + Math.random() * 0.05)),
        "25-34": Math.floor(totalCustomers * (0.35 + Math.random() * 0.05)),
        "35-44": Math.floor(totalCustomers * (0.25 + Math.random() * 0.05)),
        "45-54": Math.floor(totalCustomers * (0.12 + Math.random() * 0.03)),
        "55-64": Math.floor(totalCustomers * (0.08 + Math.random() * 0.02)),
        "65+": Math.floor(totalCustomers * (0.05 + Math.random() * 0.02)),
      },
      gender: {
        male: Math.floor(totalCustomers * (0.35 + Math.random() * 0.05)),
        female: Math.floor(totalCustomers * (0.58 + Math.random() * 0.05)),
        other: Math.floor(totalCustomers * 0.05),
      },
      topStates: [
        { state: "California", count: Math.floor(totalCustomers * 0.22), revenue: Math.floor(totalCustomers * 0.22 * 52) },
        { state: "New York", count: Math.floor(totalCustomers * 0.12), revenue: Math.floor(totalCustomers * 0.12 * 48) },
        { state: "Texas", count: Math.floor(totalCustomers * 0.10), revenue: Math.floor(totalCustomers * 0.10 * 45) },
        { state: "Florida", count: Math.floor(totalCustomers * 0.08), revenue: Math.floor(totalCustomers * 0.08 * 44) },
        { state: "Colorado", count: Math.floor(totalCustomers * 0.06), revenue: Math.floor(totalCustomers * 0.06 * 55) },
      ],
      acquisitionChannels: {
        organic: Math.floor(totalCustomers * (0.25 + (11 - i) * 0.01)),
        paid: Math.floor(totalCustomers * 0.35),
        referral: Math.floor(totalCustomers * (0.15 + (11 - i) * 0.005)),
        social: Math.floor(totalCustomers * 0.15),
        email: Math.floor(totalCustomers * 0.10),
      },
      subscriptionRate: 28 + (11 - i) * 0.8 + Math.random() * 3,
      repeatPurchaseRate: 32 + (11 - i) * 0.5 + Math.random() * 5,
    });
  }

  return snapshots;
};

const seedCustomerDemographics = generateDemographics();

const seedHuddles: Huddle[] = [
  {
    id: "huddle-1",
    channelId: "ch-growth",
    title: "Weekly Growth Sync",
    participants: ["user-1", "user-2"],
    notes: "Discussed CAC trends, new landing page performance, and Q2 paid media strategy.",
    transcript: undefined,
    summary: "CAC decreased 15% with new landing page. Team agreed to increase Meta spend by 20% next week. Need to test TikTok creative before scaling. Sarah to present influencer partnership proposal by Friday.",
    decisions: [
      { id: "dec-1", text: "Increase Meta ad spend by 20% starting next Monday", approved: false },
      { id: "dec-2", text: "Pause Google Search campaigns with CAC > $50", approved: true },
      { id: "dec-3", text: "Launch TikTok test campaign with $5K budget", approved: false },
    ],
    actionItems: [
      { id: "ai-1", text: "Create 3 new UGC-style video ads for Meta", assigneeId: "user-2", taskId: null, approved: false },
      { id: "ai-2", text: "Set up TikTok Business account and pixel", assigneeId: "user-2", taskId: null, approved: false },
      { id: "ai-3", text: "Prepare influencer partnership proposal with ROI projections", assigneeId: "user-2", taskId: null, approved: false },
    ],
    status: "finalized",
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    endedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
  },
  {
    id: "huddle-2",
    channelId: "ch-retail",
    title: "Sprouts Expansion Planning",
    participants: ["user-1", "user-3"],
    notes: "Reviewed Sprouts velocity data and expansion timeline. Discussed inventory implications.",
    transcript: undefined,
    summary: "Sprouts wants to expand from 50 to 150 doors. Current velocity is 2.3 units/store/week. Need to coordinate with ops on inventory. Target launch date is 6 weeks out. Mike to prepare proposal by Thursday.",
    decisions: [
      { id: "dec-4", text: "Target 150 doors for Sprouts expansion (100 new)", approved: true },
      { id: "dec-5", text: "Request 60-day payment terms for new doors", approved: false },
      { id: "dec-6", text: "Offer 15% intro discount for first 90 days", approved: false },
    ],
    actionItems: [
      { id: "ai-4", text: "Pull velocity report for top 20 performing Sprouts locations", assigneeId: "user-3", taskId: null, approved: false },
      { id: "ai-5", text: "Coordinate with ops on inventory forecast for 100 new doors", assigneeId: "user-3", taskId: null, approved: false },
      { id: "ai-6", text: "Draft expansion proposal with P&L projections", assigneeId: "user-3", taskId: "task-3", approved: true },
    ],
    status: "finalized",
    startedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    endedAt: new Date(Date.now() - 86400000 * 1 + 2700000).toISOString(),
  },
  {
    id: "huddle-3",
    channelId: "ch-exec",
    title: "Exec Weekly: Q2 Planning",
    participants: ["user-1", "user-2", "user-3", "user-4", "user-5"],
    notes: "All-hands sync on Q2 priorities. Reviewed cash position and major initiatives.",
    transcript: undefined,
    summary: "Cash position strong at $685K with 15 weeks runway. Growth and Retail both showing positive momentum. Key Q2 priorities: hit $35 CAC, expand to 500 retail doors, launch subscription 2.0. Emily flagged need for AP review - some invoices past due.",
    decisions: [
      { id: "dec-7", text: "Set Q2 CAC target at $35 (down from $42 current)", approved: true },
      { id: "dec-8", text: "Approve $50K budget for subscription platform upgrade", approved: false },
      { id: "dec-9", text: "Hire contractor for creative team support", approved: false },
    ],
    actionItems: [
      { id: "ai-7", text: "Review and prioritize overdue AP invoices", assigneeId: "user-4", taskId: null, approved: false },
      { id: "ai-8", text: "Prepare subscription 2.0 requirements doc", assigneeId: "user-1", taskId: null, approved: false },
      { id: "ai-9", text: "Source 3 creative contractor candidates", assigneeId: "user-2", taskId: null, approved: false },
      { id: "ai-10", text: "Update 12-week cash forecast with retail expansion", assigneeId: "user-4", taskId: null, approved: false },
    ],
    status: "finalized",
    startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    endedAt: new Date(Date.now() - 86400000 * 3 + 5400000).toISOString(),
  },
];

const seedFinancialSnapshots: FinancialSnapshot[] = [
  {
    id: "fin-1",
    date: new Date().toISOString().split("T")[0],
    cashOnHand: 685000,
    apDueNext2Weeks: 125000,
    arExpectedNext2Weeks: 95000,
    fixedWeeklyStack: 45000,
    notes: "Strong position heading into Q2",
    createdBy: "user-4",
    createdAt: new Date().toISOString(),
  },
];

const seedConnectors: Connector[] = [
  { id: "conn-shopify", type: "shopify", status: "not_connected", lastSync: null },
  { id: "conn-qb", type: "quickbooks", status: "not_connected", lastSync: null },
  { id: "conn-meta", type: "meta_ads", status: "not_connected", lastSync: null },
  { id: "conn-google-ads", type: "google_ads", status: "not_connected", lastSync: null },
  { id: "conn-drive", type: "google_drive", status: "not_connected", lastSync: null },
];

const seedSettings: AppSettings = {
  devMode: true,
  supabaseEnabled: false,
  currentUserId: "user-1",
};

function createSeedDatabase(): Database {
  return {
    users: seedUsers,
    channels: seedChannels,
    messages: seedMessages,
    goals: seedGoals,
    tasks: seedTasks,
    projects: [],
    files: [],
    customerMessages: seedCustomerMessages,
    customerDemographics: seedCustomerDemographics,
    financialSnapshots: seedFinancialSnapshots,
    growthSnapshots: [],
    huddles: seedHuddles,
    connectors: seedConnectors,
    settings: seedSettings,
  };
}

// ============ STORE IMPLEMENTATION ============

class DevStore {
  private db: Database | null = null;
  private listeners: Set<() => void> = new Set();

  private load(): Database {
    if (this.db) return this.db;

    if (typeof window === "undefined") {
      this.db = createSeedDatabase();
      return this.db;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.db = JSON.parse(stored);
        return this.db!;
      } catch {
        console.warn("Failed to parse stored data, using seed data");
      }
    }

    this.db = createSeedDatabase();
    this.save();
    return this.db;
  }

  private save(): void {
    if (typeof window === "undefined" || !this.db) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(): void {
    this.db = createSeedDatabase();
    this.save();
  }

  // ============ USERS ============
  getUsers(): User[] {
    return this.load().users;
  }

  getUser(id: string): User | undefined {
    return this.load().users.find((u) => u.id === id);
  }

  getCurrentUser(): User {
    const db = this.load();
    return db.users.find((u) => u.id === db.settings.currentUserId) || db.users[0];
  }

  // ============ CHANNELS ============
  getChannels(): Channel[] {
    return this.load().channels;
  }

  getChannel(id: string): Channel | undefined {
    return this.load().channels.find((c) => c.id === id);
  }

  getChannelByDepartment(dept: Department): Channel | undefined {
    return this.load().channels.find((c) => c.department === dept);
  }

  // ============ MESSAGES ============
  getMessages(channelId: string): Message[] {
    return this.load().messages.filter((m) => m.channelId === channelId);
  }

  getThreadReplies(parentId: string): Message[] {
    return this.load().messages.filter((m) => m.parentId === parentId);
  }

  addMessage(message: Omit<Message, "id" | "createdAt" | "updatedAt">): Message {
    const db = this.load();
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    db.messages.push(newMessage);
    this.save();
    return newMessage;
  }

  addReaction(messageId: string, emoji: string, userId: string): void {
    const db = this.load();
    const message = db.messages.find((m) => m.id === messageId);
    if (message) {
      const existing = message.reactions.find((r) => r.emoji === emoji && r.userId === userId);
      if (existing) {
        message.reactions = message.reactions.filter((r) => !(r.emoji === emoji && r.userId === userId));
      } else {
        message.reactions.push({ emoji, userId });
      }
      this.save();
    }
  }

  // ============ GOALS ============
  getGoals(): Goal[] {
    return this.load().goals;
  }

  getGoalsByDepartment(dept: Department): Goal[] {
    return this.load().goals.filter((g) => g.department === dept);
  }

  getGoal(id: string): Goal | undefined {
    return this.load().goals.find((g) => g.id === id);
  }

  addGoal(goal: Omit<Goal, "id" | "createdAt" | "updatedAt">): Goal {
    const db = this.load();
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.goals.push(newGoal);
    this.save();
    return newGoal;
  }

  updateGoal(id: string, updates: Partial<Goal>): void {
    const db = this.load();
    const index = db.goals.findIndex((g) => g.id === id);
    if (index !== -1) {
      db.goals[index] = { ...db.goals[index], ...updates, updatedAt: new Date().toISOString() };
      this.save();
    }
  }

  // ============ TASKS ============
  getTasks(): Task[] {
    return this.load().tasks;
  }

  getTasksByDepartment(dept: Department): Task[] {
    return this.load().tasks.filter((t) => t.department === dept);
  }

  getTasksByOwner(ownerId: string): Task[] {
    return this.load().tasks.filter((t) => t.ownerId === ownerId);
  }

  getTasksByGoal(goalId: string): Task[] {
    return this.load().tasks.filter((t) => t.goalId === goalId);
  }

  getTask(id: string): Task | undefined {
    return this.load().tasks.find((t) => t.id === id);
  }

  addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments">): Task {
    const db = this.load();
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.tasks.push(newTask);
    this.save();
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const db = this.load();
    const index = db.tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      db.tasks[index] = { ...db.tasks[index], ...updates, updatedAt: new Date().toISOString() };
      this.save();
    }
  }

  deleteTask(id: string): void {
    const db = this.load();
    db.tasks = db.tasks.filter((t) => t.id !== id);
    this.save();
  }

  addTaskComment(taskId: string, authorId: string, content: string): void {
    const db = this.load();
    const task = db.tasks.find((t) => t.id === taskId);
    if (task) {
      task.comments.push({
        id: `comment-${Date.now()}`,
        authorId,
        content,
        createdAt: new Date().toISOString(),
      });
      task.updatedAt = new Date().toISOString();
      this.save();
    }
  }

  // ============ FILES ============
  getFiles(): File[] {
    return this.load().files;
  }

  addFile(file: Omit<File, "id" | "createdAt">): File {
    const db = this.load();
    const newFile: File = {
      ...file,
      id: `file-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.files.push(newFile);
    this.save();
    return newFile;
  }

  deleteFile(id: string): void {
    const db = this.load();
    db.files = db.files.filter((f) => f.id !== id);
    this.save();
  }

  searchFiles(query: string): File[] {
    const q = query.toLowerCase();
    return this.load().files.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q)) ||
        f.notes?.toLowerCase().includes(q)
    );
  }

  // ============ CUSTOMER MESSAGES ============
  getCustomerMessages(): CustomerMessage[] {
    return this.load().customerMessages;
  }

  addCustomerMessages(messages: Omit<CustomerMessage, "id" | "importedAt">[]): void {
    const db = this.load();
    const now = new Date().toISOString();
    const newMessages = messages.map((m, i) => ({
      ...m,
      id: `cm-${Date.now()}-${i}`,
      importedAt: now,
    }));
    db.customerMessages.push(...newMessages);
    this.save();
  }

  searchCustomerMessages(query: string): CustomerMessage[] {
    const q = query.toLowerCase();
    return this.load().customerMessages.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        m.themes.some((t) => t.toLowerCase().includes(q))
    );
  }

  // ============ CUSTOMER DEMOGRAPHICS ============
  getCustomerDemographics(): CustomerDemographicSnapshot[] {
    return this.load().customerDemographics.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  getDemographicByDate(date: string): CustomerDemographicSnapshot | undefined {
    return this.load().customerDemographics.find(
      (d) => d.date.startsWith(date.substring(0, 7)) // Match by month
    );
  }

  getLatestDemographic(): CustomerDemographicSnapshot | undefined {
    const demos = this.getCustomerDemographics();
    return demos[demos.length - 1];
  }

  compareDemographics(date1: string, date2: string): {
    snapshot1: CustomerDemographicSnapshot | undefined;
    snapshot2: CustomerDemographicSnapshot | undefined;
    changes: Record<string, { value1: number; value2: number; change: number; percentChange: number }>;
  } {
    const snapshot1 = this.getDemographicByDate(date1);
    const snapshot2 = this.getDemographicByDate(date2);

    const changes: Record<string, { value1: number; value2: number; change: number; percentChange: number }> = {};

    if (snapshot1 && snapshot2) {
      const metrics = [
        "totalCustomers",
        "newCustomers",
        "returningCustomers",
        "averageOrderValue",
        "totalRevenue",
        "subscriptionRate",
        "repeatPurchaseRate",
      ];

      metrics.forEach((metric) => {
        const v1 = (snapshot1 as Record<string, unknown>)[metric] as number;
        const v2 = (snapshot2 as Record<string, unknown>)[metric] as number;
        changes[metric] = {
          value1: v1,
          value2: v2,
          change: v2 - v1,
          percentChange: v1 ? ((v2 - v1) / v1) * 100 : 0,
        };
      });
    }

    return { snapshot1, snapshot2, changes };
  }

  // ============ FINANCIAL SNAPSHOTS ============
  getFinancialSnapshots(): FinancialSnapshot[] {
    return this.load().financialSnapshots.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  addFinancialSnapshot(snapshot: Omit<FinancialSnapshot, "id" | "createdAt">): FinancialSnapshot {
    const db = this.load();
    const newSnapshot: FinancialSnapshot = {
      ...snapshot,
      id: `fin-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    db.financialSnapshots.push(newSnapshot);
    this.save();
    return newSnapshot;
  }

  // ============ GROWTH SNAPSHOTS ============
  getGrowthSnapshots(): GrowthSnapshot[] {
    return this.load().growthSnapshots;
  }

  addGrowthSnapshot(snapshot: Omit<GrowthSnapshot, "id" | "createdAt" | "updatedAt">): GrowthSnapshot {
    const db = this.load();
    const newSnapshot: GrowthSnapshot = {
      ...snapshot,
      id: `growth-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.growthSnapshots.push(newSnapshot);
    this.save();
    return newSnapshot;
  }

  // ============ HUDDLES ============
  getHuddles(channelId?: string): Huddle[] {
    const huddles = this.load().huddles;
    return channelId ? huddles.filter((h) => h.channelId === channelId) : huddles;
  }

  getHuddle(id: string): Huddle | undefined {
    return this.load().huddles.find((h) => h.id === id);
  }

  addHuddle(huddle: Omit<Huddle, "id" | "startedAt">): Huddle {
    const db = this.load();
    const newHuddle: Huddle = {
      ...huddle,
      id: `huddle-${Date.now()}`,
      startedAt: new Date().toISOString(),
    };
    db.huddles.push(newHuddle);
    this.save();
    return newHuddle;
  }

  updateHuddle(id: string, updates: Partial<Huddle>): void {
    const db = this.load();
    const index = db.huddles.findIndex((h) => h.id === id);
    if (index !== -1) {
      db.huddles[index] = { ...db.huddles[index], ...updates };
      this.save();
    }
  }

  approveHuddleDecision(huddleId: string, decisionId: string): void {
    const db = this.load();
    const huddle = db.huddles.find((h) => h.id === huddleId);
    if (huddle) {
      const decision = huddle.decisions.find((d) => d.id === decisionId);
      if (decision) {
        decision.approved = true;
        this.save();
      }
    }
  }

  approveHuddleActionItem(huddleId: string, actionItemId: string, createTask = false): Task | null {
    const db = this.load();
    const huddle = db.huddles.find((h) => h.id === huddleId);
    if (huddle) {
      const actionItem = huddle.actionItems.find((ai) => ai.id === actionItemId);
      if (actionItem) {
        actionItem.approved = true;

        if (createTask && !actionItem.taskId) {
          // Create a task from this action item
          const channel = this.getChannel(huddle.channelId);
          const newTask = this.addTask({
            title: actionItem.text,
            description: `Created from huddle: ${huddle.title}`,
            ownerId: actionItem.assigneeId,
            dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), // Due in 1 week
            status: "todo",
            priority: "high",
            department: channel?.department || "exec",
            goalId: null,
            projectId: null,
            attachments: [],
          });
          actionItem.taskId = newTask.id;
          this.save();
          return newTask;
        }

        this.save();
      }
    }
    return null;
  }

  getFinalizedHuddles(): Huddle[] {
    return this.load().huddles
      .filter((h) => h.status === "finalized")
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  // ============ CONNECTORS ============
  getConnectors(): Connector[] {
    return this.load().connectors;
  }

  updateConnector(id: string, updates: Partial<Connector>): void {
    const db = this.load();
    const index = db.connectors.findIndex((c) => c.id === id);
    if (index !== -1) {
      db.connectors[index] = { ...db.connectors[index], ...updates };
      this.save();
    }
  }

  // ============ SETTINGS ============
  getSettings(): AppSettings {
    return this.load().settings;
  }

  updateSettings(updates: Partial<AppSettings>): void {
    const db = this.load();
    db.settings = { ...db.settings, ...updates };
    this.save();
  }
}

export const devStore = new DevStore();
