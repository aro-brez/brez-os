import { NextRequest, NextResponse } from 'next/server';
import { seedService } from '@/lib/ai/seed-integration';

/**
 * POST /api/decisions/outcome
 *
 * Records the actual outcome of a decision made by SEED Learning Engine.
 * This enables the SEED → Execute → Measure → Learn feedback loop.
 *
 * Request Body:
 * {
 *   decisionId: string;           // ID from original decision
 *   actualMetrics: {              // Actual results observed
 *     cac?: number;
 *     ltv?: number;
 *     conversionRate?: number;
 *     retentionRate?: number;
 *     contributionMargin?: number;
 *     revenue?: number;
 *   };
 *   success: boolean;             // Did this decision achieve its goal?
 *   learnings?: string[];         // Optional human insights
 * }
 *
 * Response:
 * {
 *   success: true;
 *   message: string;
 *   learningState?: {             // Current SEED learning state
 *     predictionAccuracy: number;
 *     decisionsTracked: number;
 *     topRules: any[];
 *   }
 * }
 */

interface OutcomeRequest {
  decisionId: string;
  actualMetrics: {
    cac?: number;
    ltv?: number;
    conversionRate?: number;
    retentionRate?: number;
    contributionMargin?: number;
    revenue?: number;
  };
  success: boolean;
  learnings?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: OutcomeRequest = await request.json();

    // Validate required fields
    if (!body.decisionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: decisionId',
        },
        { status: 400 }
      );
    }

    if (body.success === undefined || body.success === null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: success (boolean)',
        },
        { status: 400 }
      );
    }

    if (!body.actualMetrics || typeof body.actualMetrics !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: actualMetrics (object)',
        },
        { status: 400 }
      );
    }

    // Record the outcome with SEED Learning Engine
    await seedService.recordOutcome(
      body.decisionId,
      body.actualMetrics,
      body.success,
      body.learnings || []
    );

    // Get updated learning state to show improvement
    const learningState = await seedService.getLearningState();

    return NextResponse.json({
      success: true,
      message: `Outcome recorded for decision ${body.decisionId}. SEED has learned from this result.`,
      learningState: {
        predictionAccuracy: learningState.predictionAccuracy,
        decisionsTracked: learningState.decisionsTracked,
        topRules: learningState.topRules.slice(0, 3), // Top 3 only for API response
        currentWeights: learningState.currentWeights,
        improvementVelocity: learningState.improvementVelocity,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Outcome recording error:', error);

    // Check if error is about decision not found
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Decision ID not found. This decision may have already been recorded or expired.',
        },
        { status: 404 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record outcome',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/decisions/outcome
 *
 * Optional endpoint to check SEED learning state without recording an outcome.
 * Useful for monitoring SEED's improvement over time.
 */
export async function GET() {
  try {
    const learningState = await seedService.getLearningState();

    return NextResponse.json({
      success: true,
      learningState: {
        predictionAccuracy: learningState.predictionAccuracy,
        decisionsTracked: learningState.decisionsTracked,
        topRules: learningState.topRules,
        currentWeights: learningState.currentWeights,
        improvementVelocity: learningState.improvementVelocity,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Learning state fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch learning state',
      },
      { status: 500 }
    );
  }
}
