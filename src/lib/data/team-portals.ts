// =============================================================================
// BREZ TEAM PORTALS
// =============================================================================
// Personalized views for each team member when they log in.
// Shows:
// 1. Their specific data requests (what they need to provide)
// 2. How their data impacts the model
// 3. Current status of their contributions
// 4. Actionable insights relevant to their role
// =============================================================================

import {
  getAllRequestsForMember,
  getNextRequestForMember,
  type DataRequest,
} from './data-discovery';

import {
  getCurrentData,
  getLearnings,
  getUploadHistory,
  type TeamMember,
  type DataCategory,
} from './data-memory';

// =============================================================================
// TEAM MEMBER PROFILES
// =============================================================================

export interface TeamMemberProfile {
  id: TeamMember;
  name: string;
  title: string;
  department: string;
  primaryCategories: DataCategory[];
  emoji: string;
}

export const TEAM_PROFILES: Record<TeamMember, TeamMemberProfile> = {
  dan: {
    id: 'dan',
    name: 'Dan Gelshteyn',
    title: 'Chief Operations Officer',
    department: 'Operations',
    primaryCategories: ['cash_flow', 'inventory', 'production', 'ap_aging'],
    emoji: '⚙️',
  },
  cramer: {
    id: 'cramer',
    name: 'Brian Cramer',
    title: 'Finance Lead',
    department: 'Finance',
    primaryCategories: ['cm_dollars', 'cash_flow', 'ar_collections'],
    emoji: '💰',
  },
  brian: {
    id: 'brian',
    name: 'Brian Dewey',
    title: 'Chief Revenue Officer',
    department: 'Revenue',
    primaryCategories: ['retail_velocity'],
    emoji: '🏪',
  },
  david: {
    id: 'david',
    name: 'David Alvarado',
    title: 'Paid Advertising Lead',
    department: 'Growth',
    primaryCategories: ['dtc_ads'],
    emoji: '📱',
  },
  nick: {
    id: 'nick',
    name: 'Nick Shackleford',
    title: 'Head of Retention',
    department: 'Retention',
    primaryCategories: ['retention'],
    emoji: '🔄',
  },
  travis: {
    id: 'travis',
    name: 'Travis Duncan',
    title: 'Head of Product',
    department: 'Product',
    primaryCategories: ['cogs'],
    emoji: '🧪',
  },
  abla: {
    id: 'abla',
    name: 'Abla Jad',
    title: 'VP of Finance',
    department: 'Finance',
    primaryCategories: ['ap_aging', 'ar_collections', 'cash_flow'],
    emoji: '📊',
  },
  niall: {
    id: 'niall',
    name: 'Niall Little',
    title: 'VP of Sales',
    department: 'Sales',
    primaryCategories: ['retail_velocity'],
    emoji: '🤝',
  },
  alan: {
    id: 'alan',
    name: 'Alan Huynh',
    title: 'Head of Growth',
    department: 'Growth',
    primaryCategories: ['dtc_ads', 'retention'],
    emoji: '📈',
  },
};

// =============================================================================
// PORTAL DATA STRUCTURES
// =============================================================================

export interface PortalView {
  member: TeamMemberProfile;
  greeting: string;
  nextAction: DataRequest | null;
  allRequests: DataRequest[];
  recentContributions: {
    category: DataCategory;
    uploadedAt: string;
    version: number;
  }[];
  relevantLearnings: {
    insight: string;
    confidence: number;
  }[];
  modelImpact: {
    description: string;
    currentGap: string;
    potentialImprovement: string;
  };
}

// =============================================================================
// PORTAL GENERATOR
// =============================================================================

/**
 * Generate personalized portal view for a team member
 */
export function getPortalView(member: TeamMember): PortalView {
  const profile = TEAM_PROFILES[member];
  const nextAction = getNextRequestForMember(member);
  const allRequests = getAllRequestsForMember(member);

  // Get recent contributions
  const recentContributions: PortalView['recentContributions'] = [];
  for (const category of profile.primaryCategories) {
    const history = getUploadHistory(category);
    if (history.length > 0) {
      const latest = history[0];
      recentContributions.push({
        category,
        uploadedAt: latest.uploadedAt,
        version: latest.version,
      });
    }
  }

  // Get relevant learnings
  const allLearnings = profile.primaryCategories.flatMap(cat => getLearnings(cat));
  const relevantLearnings = allLearnings.slice(0, 3).map(l => ({
    insight: l.insight,
    confidence: l.confidence,
  }));

  // Calculate model impact
  const modelImpact = calculateModelImpact(member, allRequests);

  // Generate greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greeting = `${timeGreeting}, ${profile.name.split(' ')[0]}!`;

  return {
    member: profile,
    greeting,
    nextAction,
    allRequests,
    recentContributions,
    relevantLearnings,
    modelImpact,
  };
}

/**
 * Calculate how this member's data impacts the model
 */
function calculateModelImpact(
  member: TeamMember,
  requests: DataRequest[]
): PortalView['modelImpact'] {
  const pendingRequests = requests.filter(r => r.currentStatus !== 'current');
  const totalImpact = pendingRequests.reduce((sum, r) => sum + r.impactScore, 0);
  const criticalCount = pendingRequests.filter(r => r.priority === 'critical').length;

  let description = '';
  let currentGap = '';
  let potentialImprovement = '';

  switch (member) {
    case 'dan':
      description = 'Your data powers cash flow forecasting and inventory planning.';
      currentGap = criticalCount > 0
        ? `${criticalCount} critical data points missing - cash runway may be inaccurate`
        : 'Operations data is current';
      potentialImprovement = `Providing the 13-week cash flow forecast would improve model confidence by ~30%`;
      break;
    case 'cramer':
      description = 'Your data validates the CM$ strategy and grounds truth the model.';
      currentGap = criticalCount > 0
        ? `Weekly CM$ data needed to confirm if pressurizing CAC is working`
        : 'Finance data is current';
      potentialImprovement = `8 weeks of CM$ data would validate the entire optimization strategy`;
      break;
    case 'brian':
      description = 'Your data determines retail profit velocity projections.';
      currentGap = criticalCount > 0
        ? `Need LOW/HIGH alpha scenarios for accurate retail profit range`
        : 'Retail data is current';
      potentialImprovement = `Retailer-level trends would improve velocity forecasting by ~25%`;
      break;
    case 'david':
      description = 'Your data drives spend reallocation recommendations.';
      currentGap = criticalCount > 0
        ? `Platform-level CAC needed to optimize spend allocation`
        : 'Ads data is current';
      potentialImprovement = `8 weeks of platform CAC would identify $20K+ reallocation opportunity`;
      break;
    case 'nick':
      description = 'Your data validates LTV assumptions and subscription value.';
      currentGap = criticalCount > 0
        ? `Cohort retention curves needed - LTV may be over/understated`
        : 'Retention data is current';
      potentialImprovement = `Cohort data would validate or correct LTV projections`;
      break;
    case 'travis':
      description = 'Your data impacts margin calculations across all SKUs.';
      currentGap = criticalCount > 0
        ? `SKU-level COGS needed for accurate margin by product`
        : 'Product data is current';
      potentialImprovement = `COGS changes timeline would improve forward margin projections`;
      break;
    default:
      description = 'Your data contributes to overall model accuracy.';
      currentGap = pendingRequests.length > 0 ? `${pendingRequests.length} data points pending` : 'Data is current';
      potentialImprovement = `Total potential model improvement: ${totalImpact} points`;
  }

  return { description, currentGap, potentialImprovement };
}

// =============================================================================
// FORMATTED PORTAL OUTPUT
// =============================================================================

/**
 * Generate formatted portal view for display
 */
export function renderPortal(member: TeamMember): string {
  const view = getPortalView(member);
  const p = view.member;

  let output = `
╔══════════════════════════════════════════════════════════════╗
║  ${p.emoji} ${p.name.toUpperCase()} - ${p.title}
╚══════════════════════════════════════════════════════════════╝

${view.greeting}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR IMPACT ON THE MODEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${view.modelImpact.description}

Current Gap: ${view.modelImpact.currentGap}
Potential: ${view.modelImpact.potentialImprovement}

`;

  if (view.nextAction) {
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR NEXT ACTION (${view.nextAction.priority.toUpperCase()} PRIORITY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${view.nextAction.title}

${view.nextAction.description}

Format needed: ${view.nextAction.format}
${view.nextAction.example ? `Example: ${view.nextAction.example}` : ''}

`;
  } else {
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ALL DATA CURRENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All your data contributions are up to date!

`;
  }

  if (view.allRequests.length > 0) {
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALL YOUR DATA RESPONSIBILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    for (const req of view.allRequests) {
      const statusIcon = req.currentStatus === 'current' ? '✅' : req.currentStatus === 'stale' ? '⚠️' : '❌';
      output += `${statusIcon} ${req.title} [${req.priority}] - ${req.currentStatus}
`;
    }
  }

  if (view.relevantLearnings.length > 0) {
    output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 INSIGHTS FROM YOUR DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    for (const learning of view.relevantLearnings) {
      output += `• ${learning.insight} (${learning.confidence}% confident)
`;
    }
  }

  if (view.recentContributions.length > 0) {
    output += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 YOUR RECENT CONTRIBUTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    for (const contrib of view.recentContributions) {
      const date = new Date(contrib.uploadedAt).toLocaleDateString();
      output += `• ${contrib.category}: v${contrib.version} (${date})
`;
    }
  }

  return output;
}

// =============================================================================
// QUICK ACCESS FOR UI
// =============================================================================

/**
 * Get condensed action card for team member
 */
export function getActionCard(member: TeamMember): {
  name: string;
  title: string;
  nextAction: string | null;
  priority: string | null;
  status: 'needs_data' | 'all_current';
} {
  const profile = TEAM_PROFILES[member];
  const nextAction = getNextRequestForMember(member);

  return {
    name: profile.name,
    title: profile.title,
    nextAction: nextAction?.title ?? null,
    priority: nextAction?.priority ?? null,
    status: nextAction ? 'needs_data' : 'all_current',
  };
}

/**
 * Get all team action cards
 */
export function getAllActionCards(): ReturnType<typeof getActionCard>[] {
  const members: TeamMember[] = ['dan', 'cramer', 'brian', 'david', 'nick', 'travis'];
  return members.map(m => getActionCard(m));
}
