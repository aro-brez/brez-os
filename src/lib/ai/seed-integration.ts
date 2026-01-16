/**
 * SEED Learning Engine Integration for BREZ OS
 * Connects algorithmic SEED to actual business decisions and outcomes
 */

import { SEEDLearningEngine } from '@/../.claude/algorithms/seed-learning-engine';

interface HistoricalData {
  lastUpdated?: string;
  sources?: Record<string, { connected: boolean; lastSync?: string }>;
}

interface DecisionOption {
  action: string;
  impact?: number;
  feasibility?: number;
  discoveryPotential?: number;
  expectedCAC?: number;
  expectedRevenue?: number;
  expectedLTV?: number;
  expectedCM?: number;
  amount?: string;
  channels?: string;
  theme?: string;
  percentage?: string;
  from?: string;
  to?: string;
}

interface DecisionRule {
  condition: string;
  action: string;
  successRate: number;
  usageCount: number;
}

interface PrioritizationWeights {
  impact: number;
  feasibility: number;
  discoveryPotential: number;
  riskTolerance: number;
}

interface BusinessDecision {
  id: string;
  timestamp: Date;
  type: 'cac_optimization' | 'spend_allocation' | 'product_launch' | 'retail_expansion' | 'pricing';
  context: {
    currentMetrics: {
      cac?: number;
      ltv?: number;
      conversionRate?: number;
      retentionRate?: number;
      contributionMargin?: number;
      cashPosition?: number;
    };
    constraints: {
      phase: 'STABILIZE' | 'THRIVE' | 'SCALE';
      bottleneck: string;
      budgetLimit?: number;
    };
    historicalData: HistoricalData;
  };
  options: DecisionOption[];
  chosenOption?: DecisionOption;
  prediction: {
    expectedOutcome: DecisionOption;
    confidence: number;
    metrics: Record<string, number>;
  };
}

interface BusinessOutcome {
  decisionId: string;
  timestamp: Date;
  actualMetrics: {
    cac?: number;
    ltv?: number;
    conversionRate?: number;
    retentionRate?: number;
    contributionMargin?: number;
    revenue?: number;
  };
  success: boolean;
  learnings: string[];
}

/**
 * Singleton service that manages SEED learning across BREZ OS
 */
class SEEDService {
  private static instance: SEEDService;
  private engine: SEEDLearningEngine;
  private pendingDecisions: Map<string, BusinessDecision> = new Map();

  private constructor() {
    this.engine = new SEEDLearningEngine();
  }

  static getInstance(): SEEDService {
    if (!SEEDService.instance) {
      SEEDService.instance = new SEEDService();
    }
    return SEEDService.instance;
  }

  /**
   * Make a business decision using learned weights and patterns
   */
  async makeDecision(
    type: BusinessDecision['type'],
    context: BusinessDecision['context'],
    options: DecisionOption[]
  ): Promise<{ decision: DecisionOption; confidence: number; reasoning: string }> {
    // Use SEED Learning Engine to score options
    const result = await this.engine.makeDecision(
      {
        type,
        ...context
      },
      options
    );

    // Create decision record
    const decision: BusinessDecision = {
      id: `decision_${Date.now()}`,
      timestamp: new Date(),
      type,
      context,
      options,
      chosenOption: result.decision,
      prediction: {
        expectedOutcome: result.decision,
        confidence: result.confidence,
        metrics: this.extractMetricsPrediction(result.decision)
      }
    };

    // Store for outcome tracking
    this.pendingDecisions.set(decision.id, decision);

    return {
      decision: result.decision,
      confidence: result.confidence,
      reasoning: result.source === 'learned_rule'
        ? 'Based on learned pattern from past success'
        : 'Based on weighted scoring with current learned priorities'
    };
  }

  /**
   * Record actual outcome of a decision to enable learning
   */
  async recordOutcome(
    decisionId: string,
    actualMetrics: BusinessOutcome['actualMetrics'],
    success: boolean,
    learnings?: string[]
  ): Promise<void> {
    const decision = this.pendingDecisions.get(decisionId);
    if (!decision) {
      console.warn(`Decision ${decisionId} not found for outcome recording`);
      return;
    }

    // Track outcome for reference (future: persist to database)
    const _outcome: BusinessOutcome = {
      decisionId,
      timestamp: new Date(),
      actualMetrics,
      success,
      learnings: learnings || []
    };

    // Feed to SEED Learning Engine - this is where learning happens
    await this.engine.perceive(
      {
        id: decisionId,
        prediction: decision.prediction.metrics,
        context: decision.context
      },
      {
        actual: actualMetrics,
        success
      }
    );

    // Clean up
    this.pendingDecisions.delete(decisionId);

    // Trigger improvement cycle
    await this.engine.improve();
  }

  /**
   * Get autonomous recommendation for current situation
   */
  async getRecommendation(
    context: BusinessDecision['context']
  ): Promise<{ action: string; rationale: string; confidence: number }> {
    // Determine decision type from context
    const type = this.inferDecisionType(context);

    // Generate options based on type
    const options = this.generateOptions(type, context);

    // Get SEED decision
    const result = await this.makeDecision(type, context, options);

    return {
      action: this.formatAction(result.decision),
      rationale: result.reasoning,
      confidence: result.confidence
    };
  }

  /**
   * Get current learning state for transparency
   */
  async getLearningState(): Promise<{
    predictionAccuracy: number;
    decisionsTracked: number;
    topRules: DecisionRule[];
    currentWeights: PrioritizationWeights;
    improvementVelocity: number;
  }> {
    const metrics = await this.engine.getMetrics();
    const state = await this.engine.getState();

    return {
      predictionAccuracy: metrics.predictionAccuracy,
      decisionsTracked: state.outcomeHistory.length,
      topRules: state.policyWeights.decisionRules
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5),
      currentWeights: state.policyWeights.prioritizationWeights,
      improvementVelocity: metrics.improvementVelocity
    };
  }

  private extractMetricsPrediction(decision: DecisionOption): Record<string, number> {
    // Extract predicted metric values from decision
    return {
      expectedCAC: decision.expectedCAC || 0,
      expectedLTV: decision.expectedLTV || 0,
      expectedCM: decision.expectedCM || 0,
      expectedRevenue: decision.expectedRevenue || 0
    };
  }

  private inferDecisionType(context: BusinessDecision['context']): BusinessDecision['type'] {
    // Infer decision type from context and current metrics
    if (context.currentMetrics.cac && context.constraints.phase === 'STABILIZE') {
      return 'cac_optimization';
    }
    if (context.constraints.bottleneck === 'CASH') {
      return 'spend_allocation';
    }
    return 'cac_optimization'; // default
  }

  private generateOptions(
    type: BusinessDecision['type'],
    context: BusinessDecision['context']
  ): DecisionOption[] {
    // Generate realistic options based on decision type
    switch (type) {
      case 'cac_optimization':
        return [
          {
            action: 'increase_spend',
            impact: 0.8,
            feasibility: 0.7,
            discoveryPotential: 0.6,
            expectedCAC: (context.currentMetrics.cac || 55) * 1.1,
            expectedRevenue: 1.3
          },
          {
            action: 'optimize_creative',
            impact: 0.7,
            feasibility: 0.9,
            discoveryPotential: 0.8,
            expectedCAC: (context.currentMetrics.cac || 55) * 0.9,
            expectedRevenue: 1.1
          },
          {
            action: 'reallocate_channels',
            impact: 0.6,
            feasibility: 0.8,
            discoveryPotential: 0.7,
            expectedCAC: (context.currentMetrics.cac || 55) * 0.95,
            expectedRevenue: 1.15
          }
        ];
      default:
        return [];
    }
  }

  private formatAction(decision: DecisionOption): string {
    if (decision.action === 'increase_spend') {
      return `Increase ad spend by ${decision.amount || '20%'} focusing on ${decision.channels || 'top-performing channels'}`;
    }
    if (decision.action === 'optimize_creative') {
      return `Launch new creative variant focusing on ${decision.theme || 'benefit messaging'}`;
    }
    if (decision.action === 'reallocate_channels') {
      return `Shift ${decision.percentage || '15%'} of budget from ${decision.from || 'Meta'} to ${decision.to || 'TikTok'}`;
    }
    return JSON.stringify(decision);
  }
}

// Export singleton instance
export const seedService = SEEDService.getInstance();

/**
 * Example usage in BREZ OS components:
 *
 * // Get recommendation
 * const recommendation = await seedService.getRecommendation({
 *   currentMetrics: { cac: 65, ltv: 180, contributionMargin: 0.32 },
 *   constraints: { phase: 'STABILIZE', bottleneck: 'CASH' }
 * });
 *
 * // Record outcome after action taken
 * await seedService.recordOutcome(
 *   decisionId,
 *   { cac: 58, revenue: 125000 },
 *   true,
 *   ['Creative variant A outperformed by 23%']
 * );
 *
 * // Check learning state
 * const learningState = await seedService.getLearningState();
 * console.log('Prediction accuracy:', learningState.predictionAccuracy);
 */
