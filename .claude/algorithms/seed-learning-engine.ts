/**
 * SEED Learning Engine
 * Simple Evolving Executive Decision-making system
 *
 * This is a lightweight learning engine that improves decision-making
 * through feedback loops: Sense → Execute → Evaluate → Develop
 */

interface DecisionContext {
  type: string;
  currentMetrics?: {
    cac?: number;
    ltv?: number;
    conversionRate?: number;
    retentionRate?: number;
    contributionMargin?: number;
    cashPosition?: number;
  };
  constraints?: {
    phase: string;
    bottleneck: string;
    budgetLimit?: number;
  };
  historicalData?: any;
}

interface DecisionOption {
  action: string;
  impact?: number;
  feasibility?: number;
  discoveryPotential?: number;
  [key: string]: any;
}

interface DecisionRule {
  condition: string;
  action: string;
  successRate: number;
  usageCount: number;
}

interface OutcomeRecord {
  actionId: string;
  prediction: Record<string, number>;
  actual: Record<string, number>;
  success: boolean;
  timestamp: Date;
}

interface SEEDState {
  outcomeHistory: OutcomeRecord[];
  policyWeights: {
    decisionRules: DecisionRule[];
    prioritizationWeights: {
      impact: number;
      feasibility: number;
      discoveryPotential: number;
      riskTolerance: number;
    };
  };
}

export class SEEDLearningEngine {
  private state: SEEDState;
  private predictionAccuracy: number = 0.5; // Start at 50%
  private improvementVelocity: number = 0;

  constructor() {
    this.state = {
      outcomeHistory: [],
      policyWeights: {
        decisionRules: [
          {
            condition: 'phase === STABILIZE && cac > 60',
            action: 'optimize_creative',
            successRate: 0.72,
            usageCount: 15,
          },
          {
            condition: 'phase === STABILIZE && cashPosition < 500000',
            action: 'reallocate_channels',
            successRate: 0.68,
            usageCount: 8,
          },
          {
            condition: 'phase === THRIVE && conversionRate > 0.03',
            action: 'increase_spend',
            successRate: 0.65,
            usageCount: 12,
          },
        ],
        prioritizationWeights: {
          impact: 0.35,
          feasibility: 0.25,
          discoveryPotential: 0.25,
          riskTolerance: 0.15,
        },
      },
    };
  }

  /**
   * Make a decision based on learned weights and rules
   */
  async makeDecision(
    context: DecisionContext,
    options: DecisionOption[]
  ): Promise<{ decision: DecisionOption; confidence: number; source: string }> {
    // First, check if any learned rules apply
    const applicableRule = this.findApplicableRule(context);

    if (applicableRule && applicableRule.successRate > 0.7) {
      const matchingOption = options.find(o => o.action === applicableRule.action);
      if (matchingOption) {
        return {
          decision: matchingOption,
          confidence: applicableRule.successRate,
          source: 'learned_rule',
        };
      }
    }

    // Otherwise, score options using learned weights
    const weights = this.state.policyWeights.prioritizationWeights;
    const scoredOptions = options.map(option => ({
      option,
      score: this.scoreOption(option, weights),
    }));

    scoredOptions.sort((a, b) => b.score - a.score);
    const bestOption = scoredOptions[0];

    return {
      decision: bestOption.option,
      confidence: Math.min(0.85, bestOption.score),
      source: 'weighted_scoring',
    };
  }

  /**
   * Perceive feedback from a decision outcome
   */
  async perceive(
    action: { id: string; prediction: Record<string, number>; context: any },
    feedback: { actual: Record<string, number>; success: boolean }
  ): Promise<void> {
    const outcome: OutcomeRecord = {
      actionId: action.id,
      prediction: action.prediction,
      actual: feedback.actual,
      success: feedback.success,
      timestamp: new Date(),
    };

    this.state.outcomeHistory.push(outcome);

    // Update prediction accuracy based on recent outcomes
    this.updatePredictionAccuracy();
  }

  /**
   * Improve the model based on accumulated outcomes
   */
  async improve(): Promise<void> {
    const recentOutcomes = this.state.outcomeHistory.slice(-20);

    if (recentOutcomes.length < 5) return;

    // Calculate improvement velocity
    const oldAccuracy = this.predictionAccuracy;
    this.updatePredictionAccuracy();
    this.improvementVelocity = this.predictionAccuracy - oldAccuracy;

    // Adjust weights based on successful outcomes
    const successfulOutcomes = recentOutcomes.filter(o => o.success);
    const successRate = successfulOutcomes.length / recentOutcomes.length;

    // Slightly adjust weights toward what's working
    if (successRate > 0.6) {
      this.state.policyWeights.prioritizationWeights.impact *= 1.02;
      this.state.policyWeights.prioritizationWeights.feasibility *= 0.99;
    } else {
      this.state.policyWeights.prioritizationWeights.feasibility *= 1.02;
      this.state.policyWeights.prioritizationWeights.riskTolerance *= 0.98;
    }

    // Normalize weights
    this.normalizeWeights();
  }

  /**
   * Get current metrics
   */
  async getMetrics(): Promise<{ predictionAccuracy: number; improvementVelocity: number }> {
    return {
      predictionAccuracy: this.predictionAccuracy,
      improvementVelocity: this.improvementVelocity,
    };
  }

  /**
   * Get current state
   */
  async getState(): Promise<SEEDState> {
    return this.state;
  }

  private findApplicableRule(context: DecisionContext): DecisionRule | null {
    // Simple rule matching based on context
    for (const rule of this.state.policyWeights.decisionRules) {
      if (this.evaluateRule(rule.condition, context)) {
        return rule;
      }
    }
    return null;
  }

  private evaluateRule(condition: string, context: DecisionContext): boolean {
    // Simple condition evaluation
    if (condition.includes('STABILIZE') && context.constraints?.phase === 'STABILIZE') {
      if (condition.includes('cac > 60') && (context.currentMetrics?.cac || 0) > 60) {
        return true;
      }
      if (condition.includes('cashPosition < 500000') && (context.currentMetrics?.cashPosition || 0) < 500000) {
        return true;
      }
    }
    if (condition.includes('THRIVE') && context.constraints?.phase === 'THRIVE') {
      if (condition.includes('conversionRate > 0.03') && (context.currentMetrics?.conversionRate || 0) > 0.03) {
        return true;
      }
    }
    return false;
  }

  private scoreOption(
    option: DecisionOption,
    weights: SEEDState['policyWeights']['prioritizationWeights']
  ): number {
    const impact = option.impact || 0.5;
    const feasibility = option.feasibility || 0.5;
    const discovery = option.discoveryPotential || 0.5;

    return (
      impact * weights.impact +
      feasibility * weights.feasibility +
      discovery * weights.discoveryPotential
    );
  }

  private updatePredictionAccuracy(): void {
    const recentOutcomes = this.state.outcomeHistory.slice(-10);
    if (recentOutcomes.length === 0) return;

    const successCount = recentOutcomes.filter(o => o.success).length;
    this.predictionAccuracy = successCount / recentOutcomes.length;
  }

  private normalizeWeights(): void {
    const weights = this.state.policyWeights.prioritizationWeights;
    const sum = weights.impact + weights.feasibility + weights.discoveryPotential + weights.riskTolerance;

    weights.impact /= sum;
    weights.feasibility /= sum;
    weights.discoveryPotential /= sum;
    weights.riskTolerance /= sum;
  }
}
