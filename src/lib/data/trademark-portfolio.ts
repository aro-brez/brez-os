// BREZ Trademark Portfolio - Source of Truth
// Synthesized from: Trademark Counsel Memo (January 5, 2026)
// Attorney: Nicholas D. Myers, The Myers Law Group
// General Counsel: Andrea Golan
// Last updated: January 16, 2026
// Outstanding Balance with Counsel: $13,000

// =============================================================================
// TRADEMARK PORTFOLIO STATUS
// =============================================================================

export type TrademarkStatus =
  | 'registered'
  | 'published_for_opposition'
  | 'pending'
  | 'suspended'
  | 'refused'
  | 'abandoned'
  | 'recommend_abandon';

export type RefusalReason =
  | 'likelihood_of_confusion'
  | 'fdca'
  | 'csa'
  | 'merely_descriptive'
  | 'third_party_dispute'
  | 'multiple_blocking_marks';

export type Jurisdiction = 'USPTO' | 'EU' | 'UK' | 'Canada' | 'State';

export interface TrademarkRecord {
  mark: string;
  jurisdiction: Jurisdiction;
  class: number[];
  status: TrademarkStatus;
  refusalReasons?: RefusalReason[];
  blockingMarks?: string[];
  deadline?: string;
  costToFight?: number;
  successProbability?: number;
  recommendedAction: string;
  notes?: string;
  currentUse?: 'W1' | 'P1' | 'V1' | 'N0'; // W1=Website, P1=Packaging, V1=Values content, N0=Not in use
}

// =============================================================================
// REGISTERED / LIVE TRADEMARKS (MUST MAINTAIN)
// =============================================================================

export const REGISTERED_TRADEMARKS: TrademarkRecord[] = [
  {
    mark: 'BREZ',
    jurisdiction: 'EU',
    class: [32],
    status: 'registered',
    recommendedAction: 'Maintain - Keep registration active',
    notes: 'Successfully registered in European Union',
  },
  {
    mark: 'FLOW',
    jurisdiction: 'EU',
    class: [32],
    status: 'registered',
    recommendedAction: 'Maintain - Settlement reached, goods description amended',
    notes: 'Successfully settled opposition by amending goods description',
  },
  {
    mark: 'BREZ',
    jurisdiction: 'UK',
    class: [32],
    status: 'pending',
    recommendedAction: 'Monitor - Application pending review',
    notes: 'United Kingdom application in queue',
  },
  {
    mark: 'FLOW',
    jurisdiction: 'EU',
    class: [32],
    status: 'published_for_opposition',
    recommendedAction: 'Monitor opposition period',
    notes: 'Published, watching for oppositions',
  },
];

// =============================================================================
// PENDING / BLOCKED TRADEMARKS (US)
// =============================================================================

export const PENDING_TRADEMARKS: TrademarkRecord[] = [
  // TIER 1: Core Brand - Keep Active
  {
    mark: 'BREZ',
    jurisdiction: 'USPTO',
    class: [32, 35],
    status: 'suspended',
    refusalReasons: ['likelihood_of_confusion', 'fdca', 'third_party_dispute'],
    blockingMarks: ['Breeze Smoke', 'Breez (Promontory Holdings)'],
    successProbability: 70,
    recommendedAction: 'KEEP ACTIVE - Maintain priority date, monitor Breeze vs Breez dispute quarterly',
    notes: 'Suspended due to third-party dispute over bottled water marks. Request to Divide filed Jan 2025 to add Class 035. Strategy: Once Breeze/Breez resolves, argue BREZ beverages are distinct from smokable products and mints.',
  },
  {
    mark: 'FEEL GOOD TONICS',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'pending',
    refusalReasons: ['csa', 'fdca'],
    successProbability: 80,
    recommendedAction: 'Submit specimens showing use with non-THC products',
    currentUse: 'W1',
    notes: 'Can overcome CSA/FDCA refusal with evidence of use on non-THC products. This is our core descriptor.',
  },

  // TIER 2: Product Lines - Fight with Modifier Strategy
  {
    mark: 'FLOW',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'refused',
    refusalReasons: ['likelihood_of_confusion'],
    blockingMarks: ['Flow Water'],
    costToFight: 2500,
    successProbability: 65,
    recommendedAction: 'FIGHT - Use crowded field doctrine + narrow goods description OR file as "FLOW FEEL GOOD TONIC"',
    currentUse: 'P1',
    notes: 'Actual can reads: "[Flavor] Feel Good Tonic". Register as compound mark. Common law rights preserved for "FLOW" alone.',
  },
  {
    mark: 'MUSE',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'refused',
    refusalReasons: ['likelihood_of_confusion'],
    blockingMarks: ['Muse Wine', 'Muse Tea'],
    costToFight: 3000,
    successProbability: 55,
    recommendedAction: 'FIGHT - Crowded field argument (MUSE exists across many categories) OR file as "MUSE FEEL GOOD TONIC"',
    currentUse: 'N0',
    notes: 'If Muse tea and Muse wine coexist, Muse adaptogenic tonic can too. Argue narrow scope of protection.',
  },
  {
    mark: 'PASSION',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'refused',
    refusalReasons: ['likelihood_of_confusion'],
    blockingMarks: ['Passion fruit beverages'],
    costToFight: 2500,
    successProbability: 55,
    recommendedAction: 'FIGHT - File as "PASSION FEEL GOOD TONIC" to distinguish from fruit beverages',
    currentUse: 'N0',
    notes: 'Weak mark entitled to narrow protection. PASSION + descriptor creates distinct commercial impression.',
  },
  {
    mark: 'AMPLIFY',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'refused',
    refusalReasons: ['likelihood_of_confusion', 'fdca'],
    costToFight: 2500,
    successProbability: 50,
    recommendedAction: 'File as "AMPLIFY FEEL GOOD TONIC" + submit non-THC specimens',
    currentUse: 'P1',
    notes: 'Combine modifier strategy with non-THC evidence submission.',
  },
  {
    mark: 'ELEVATE',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'refused',
    refusalReasons: ['likelihood_of_confusion', 'fdca'],
    costToFight: 2500,
    successProbability: 50,
    recommendedAction: 'File as "ELEVATE FEEL GOOD TONIC" + submit non-THC specimens',
    currentUse: 'P1',
    notes: 'Same strategy as AMPLIFY.',
  },
  {
    mark: 'DREAM',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'refused',
    refusalReasons: ['likelihood_of_confusion', 'fdca'],
    costToFight: 2500,
    successProbability: 50,
    recommendedAction: 'File as "DREAM FEEL GOOD TONIC" + submit non-THC specimens',
    currentUse: 'P1',
    notes: 'Same strategy as AMPLIFY.',
  },
  {
    mark: 'DRIFT',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'refused',
    refusalReasons: ['likelihood_of_confusion', 'fdca'],
    costToFight: 2500,
    successProbability: 50,
    recommendedAction: 'File as "DRIFT FEEL GOOD TONIC" + submit non-THC specimens',
    currentUse: 'P1',
    notes: 'Same strategy as AMPLIFY.',
  },
];

// =============================================================================
// TRADEMARKS TO ABANDON (Cost-Saving Decisions)
// =============================================================================

export const ABANDONED_TRADEMARKS: TrademarkRecord[] = [
  {
    mark: 'BREZ Juice',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'recommend_abandon',
    refusalReasons: ['likelihood_of_confusion', 'multiple_blocking_marks'],
    blockingMarks: ['Juicy Breeze'],
    deadline: '2026-03-01',
    costToFight: 10000,
    successProbability: 20,
    recommendedAction: 'ABANDON by March 1, 2026 - Low success probability, multiple blocking marks',
    notes: 'Fighting would cost $8,500-$10k with only ~20% success chance. Not worth the investment.',
  },
  {
    mark: 'BREZ WATER',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'recommend_abandon',
    refusalReasons: ['likelihood_of_confusion', 'fdca', 'third_party_dispute'],
    blockingMarks: ['Breeze Smoke', 'Breez'],
    costToFight: 10000,
    successProbability: 15,
    recommendedAction: 'ABANDON - Same issues as BREZ plus water-specific conflicts',
    notes: 'Direct conflict with both Breeze and Breez water products.',
  },
  {
    mark: 'BREZ WTR',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'recommend_abandon',
    refusalReasons: ['likelihood_of_confusion', 'fdca'],
    costToFight: 8500,
    successProbability: 15,
    recommendedAction: 'ABANDON - Variant of BREZ WATER with same issues',
    notes: 'Abbreviation does not overcome confusion issues.',
  },
  {
    mark: 'MICRODOSED CANNABIS',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'recommend_abandon',
    refusalReasons: ['merely_descriptive', 'csa', 'fdca'],
    costToFight: 5000,
    successProbability: 5,
    recommendedAction: 'ABANDON - Merely descriptive, CSA/FDCA bars registration',
    notes: 'Trademark counsel recommendation: Low probability of successful registration.',
  },
  {
    mark: 'A BETTER BEVERAGE',
    jurisdiction: 'USPTO',
    class: [32],
    status: 'recommend_abandon',
    refusalReasons: ['merely_descriptive'],
    costToFight: 5000,
    successProbability: 25,
    recommendedAction: 'EXPLORE ALTERNATIVES - Could file on Supplemental Register for 5 years then claim acquired distinctiveness',
    notes: 'Merely descriptive but could acquire distinctiveness through use. Alternative: Register "BETTER BEVERAGE CO" or use as unregistered tagline.',
  },
];

// =============================================================================
// ACQUISITION TARGETS
// =============================================================================

export interface AcquisitionTarget {
  mark: string;
  currentOwner?: string;
  estimatedValue: { low: number; high: number };
  offerStrategy: string;
  negotiationNotes: string;
  status: 'researching' | 'outreach' | 'negotiating' | 'acquired' | 'abandoned';
}

export const ACQUISITION_TARGETS: AcquisitionTarget[] = [
  {
    mark: 'DRINKING REIMAGINED',
    currentOwner: 'Unknown - Research needed',
    estimatedValue: { low: 2500, high: 15000 },
    offerStrategy: 'Start at $2,500-$5,000. Small brand likely not actively using. Include goodwill transfer.',
    negotiationNotes: 'Research current owner via USPTO TESS. Check if mark is in active use. Dead/abandoned marks can be filed fresh.',
    status: 'researching',
  },
];

// =============================================================================
// RECOMMENDED STRATEGIES
// =============================================================================

export interface TrademarkStrategy {
  name: string;
  description: string;
  applicableMarks: string[];
  estimatedCost: { low: number; high: number };
  successProbability: number;
  legalBasis: string;
  keyArguments: string[];
}

export const RECOMMENDED_STRATEGIES: TrademarkStrategy[] = [
  {
    name: 'Modifier Strategy (Primary Recommendation)',
    description: 'File marks as compound marks with "FEEL GOOD TONIC" suffix, matching actual can labeling',
    applicableMarks: ['FLOW', 'MUSE', 'PASSION', 'AMPLIFY', 'ELEVATE', 'DREAM', 'DRIFT'],
    estimatedCost: { low: 300, high: 500 },
    successProbability: 75,
    legalBasis: 'Compound marks create distinct commercial impression. Adding descriptive term to weak mark creates registrable composite.',
    keyArguments: [
      'Actual product labeling already uses "[Flavor] Feel Good Tonic" format',
      'Compound mark creates different commercial impression than standalone word',
      'Common law rights to standalone mark preserved through use in commerce',
      'USPTO more likely to approve distinctive compound mark vs. single generic word',
    ],
  },
  {
    name: 'Crowded Field Doctrine',
    description: 'Demonstrate that common terms (FLOW, MUSE, etc.) are weak marks entitled to narrow protection',
    applicableMarks: ['FLOW', 'MUSE', 'PASSION'],
    estimatedCost: { low: 1500, high: 3000 },
    successProbability: 65,
    legalBasis: 'DuPont Factor 6: Number and nature of similar marks in use. Per Juice Generation v. GS Enterprises (Fed. Cir. 2015).',
    keyArguments: [
      'Multiple third-party registrations exist for FLOW, MUSE across beverage categories',
      'Consumers are conditioned to distinguish between similar marks in crowded field',
      'Cited marks are commercially weak, entitled only to narrow protection',
      'Specific goods description (adaptogenic tonics) does not overlap with cited marks',
    ],
  },
  {
    name: 'Narrow Goods Description',
    description: 'Amend goods description to highly specific language that avoids overlap',
    applicableMarks: ['All pending marks'],
    estimatedCost: { low: 300, high: 500 },
    successProbability: 60,
    legalBasis: 'USPTO allows narrowing of goods description to avoid likelihood of confusion.',
    keyArguments: [
      'Amend from "non-alcoholic beverages" to "non-alcoholic adaptogenic functional tonics containing plant extracts"',
      'Specific description creates clear distinction from cited marks (water, wine, tea, soft drinks)',
      'Different trade channels: wellness retail vs. grocery beverage aisle',
      'Different consumer demographics: functional benefit seekers vs. general refreshment',
    ],
  },
  {
    name: 'Non-THC Evidence Submission',
    description: 'Submit specimens showing marks used with non-THC/non-infused products to overcome CSA/FDCA refusals',
    applicableMarks: ['FEEL GOOD TONICS', 'AMPLIFY', 'ELEVATE', 'DREAM', 'DRIFT', 'BREZ'],
    estimatedCost: { low: 200, high: 500 },
    successProbability: 85,
    legalBasis: 'CSA/FDCA refusals can be overcome with evidence of use on lawful products.',
    keyArguments: [
      'Website shows marks used for both THC and non-THC products',
      'Packaging, POS materials, or intent-to-use declaration for non-THC line',
      'Company sells functional beverages with adaptogens (legal) in addition to THC products',
    ],
  },
  {
    name: 'Consent/Coexistence Agreement',
    description: 'Negotiate agreements with blocking mark owners for peaceful coexistence',
    applicableMarks: ['FLOW', 'MUSE'],
    estimatedCost: { low: 1500, high: 4000 },
    successProbability: 55,
    legalBasis: 'USPTO gives substantial weight to detailed consent agreements explaining why confusion is unlikely.',
    keyArguments: [
      'Different product categories: adaptogenic tonics vs. water/wine/tea',
      'Different trade channels and consumer demographics',
      'Geographic or product category limitations acceptable',
      'Both parties have vested interest in avoiding confusion',
    ],
  },
];

// =============================================================================
// COST SUMMARY
// =============================================================================

export const COST_SUMMARY = {
  outstandingBalance: 13_000, // Owed to Myers Law Group

  // Recommended path costs
  recommendedPath: {
    modifierStrategy: {
      perMark: 400,
      marks: 7,
      total: 2_800,
    },
    nonThcEvidence: {
      perMark: 350,
      marks: 6,
      total: 2_100,
    },
    crowdedFieldArgument: {
      perMark: 2_000,
      marks: 3,
      total: 6_000,
    },
    narrowGoodsAmendment: {
      perMark: 400,
      marks: 10,
      total: 4_000,
    },
    totalRecommended: 14_900,
  },

  // Alternative: Fight everything individually
  fightEverything: {
    costPerMark: 8_500,
    marks: 12,
    total: 102_000,
    successRate: 0.35, // Average 35% success
  },

  // Savings from recommended path
  savings: 102_000 - 14_900, // $87,100 saved

  // Decision point
  nextPayment: {
    amount: 13_000,
    for: 'Clear outstanding balance before new work',
    recommendBefore: '2026-02-01',
  },
};

// =============================================================================
// TIMELINE & DEADLINES
// =============================================================================

export const DEADLINES = [
  {
    date: '2026-03-01',
    mark: 'BREZ Juice',
    action: 'Decide: Respond to refusal ($8,500-$10k) or abandon',
    recommendation: 'ABANDON',
  },
  {
    date: '2026-03-01',
    mark: 'BREZ WATER',
    action: 'Decide: Respond to refusal or abandon',
    recommendation: 'ABANDON',
  },
  {
    date: 'Quarterly',
    mark: 'BREZ',
    action: 'Monitor Breeze vs Breez dispute status',
    recommendation: 'MAINTAIN',
  },
  {
    date: 'ASAP',
    mark: 'All CSA/FDCA refused marks',
    action: 'Submit non-THC product specimens',
    recommendation: 'PRIORITIZE',
  },
];

// =============================================================================
// CURRENT USE LEGEND
// =============================================================================

export const USE_LEGEND = {
  W1: 'Website - Used on website for both THC and non-THC products',
  P1: 'Packaging - Used on top of 4-packs for OG SKUs',
  V1: 'Values - Used on website "core values" / mission-style content',
  N0: 'Not in use - Mark not currently in commerce',
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getTrademarksByStatus(status: TrademarkStatus): TrademarkRecord[] {
  return [
    ...REGISTERED_TRADEMARKS.filter(t => t.status === status),
    ...PENDING_TRADEMARKS.filter(t => t.status === status),
    ...ABANDONED_TRADEMARKS.filter(t => t.status === status),
  ];
}

export function getTrademarksByJurisdiction(jurisdiction: Jurisdiction): TrademarkRecord[] {
  return [
    ...REGISTERED_TRADEMARKS.filter(t => t.jurisdiction === jurisdiction),
    ...PENDING_TRADEMARKS.filter(t => t.jurisdiction === jurisdiction),
    ...ABANDONED_TRADEMARKS.filter(t => t.jurisdiction === jurisdiction),
  ];
}

export function getTotalCostToFight(): number {
  return [...PENDING_TRADEMARKS, ...ABANDONED_TRADEMARKS]
    .filter(t => t.costToFight)
    .reduce((sum, t) => sum + (t.costToFight || 0), 0);
}

export function getHighPriorityMarks(): TrademarkRecord[] {
  return PENDING_TRADEMARKS.filter(t =>
    (t.successProbability || 0) >= 50 &&
    t.status !== 'recommend_abandon'
  );
}

// =============================================================================
// CONTACT INFORMATION
// =============================================================================

export const CONTACTS = {
  trademarkCounsel: {
    name: 'Nicholas D. Myers',
    firm: 'The Myers Law Group',
    role: 'Trademark Attorney',
  },
  generalCounsel: {
    name: 'Andrea Golan',
    role: 'General Counsel',
    company: 'BREZ',
  },
  singleWriter: {
    department: 'Legal/Compliance',
    owner: 'Andrea Golan',
    backup: 'Amber Huelle',
  },
};
