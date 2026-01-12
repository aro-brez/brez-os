/**
 * BREZ Journey Engine
 *
 * The intelligence layer that:
 * - Tracks customer journeys
 * - Measures event/campaign impact
 * - Correlates changes to business outcomes
 * - Generates recommendations
 * - Requests and rewards data contributions
 */

import {
  JOURNEY_STAGES,
  SamplingEvent,
  ChangeLogEntry,
  DataRequest,
  DataContribution,
  JourneyStageMetrics,
} from "./types";

// ============ SAMPLE DATA (Will be replaced with real data) ============

const SAMPLE_EVENTS: SamplingEvent[] = [
  {
    id: "event-1",
    name: "Coachella 2025",
    type: "festival",
    location: "Indio, CA",
    date: "2025-04-11",
    cansDistributed: 15000,
    costTotal: 85000,
    costPerCan: 5.67,
    estimatedReach: 125000,
    emailsCollected: 2400,
    qrScans: 3800,
    socialMentions: 450,
    utmCampaign: "coachella-2025",
    promoCode: "COACHELLA25",
    attributedSales: 42000,
    attributedNewCustomers: 380,
    attributedRetailVelocityLift: 0.15,
    roi: 0.49,
    createdAt: "2025-02-01T00:00:00Z",
    updatedAt: "2025-05-01T00:00:00Z",
  },
  {
    id: "event-2",
    name: "Venice Beach Sampling",
    type: "community",
    location: "Venice, CA",
    date: "2025-03-15",
    cansDistributed: 2000,
    costTotal: 4500,
    costPerCan: 2.25,
    estimatedReach: 8000,
    emailsCollected: 320,
    qrScans: 580,
    socialMentions: 85,
    utmCampaign: "venice-sampling-mar",
    attributedSales: 12000,
    attributedNewCustomers: 95,
    attributedRetailVelocityLift: 0.08,
    roi: 1.67,
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-04-01T00:00:00Z",
  },
];

const SAMPLE_CHANGE_LOG: ChangeLogEntry[] = [
  {
    id: "change-1",
    title: "Launched Elevate 2.0 formula",
    description: "Updated Elevate formula with improved onset time and taste profile",
    category: "product",
    significance: "major",
    changedBy: "Product Team",
    department: "product",
    expectedImpact: "Improved NPS, higher repeat rate",
    actualImpact: "+8 NPS points, +12% repeat rate in first 30 days",
    changedAt: "2025-01-15T00:00:00Z",
    measuredAt: "2025-02-15T00:00:00Z",
    lessonsLearned: "Formula improvements directly correlate to retention",
    shouldRepeat: true,
  },
  {
    id: "change-2",
    title: "Reduced DTC CAC from $55 to $48",
    description: "Optimized Meta creative and targeting, improved landing page conversion",
    category: "marketing",
    significance: "major",
    changedBy: "Growth Team",
    department: "growth",
    expectedImpact: "15% CAC reduction",
    actualImpact: "13% CAC reduction achieved, contribution margin up 2 points",
    changedAt: "2025-02-01T00:00:00Z",
    measuredAt: "2025-03-01T00:00:00Z",
    lessonsLearned: "Landing page conversion has higher leverage than creative alone",
    shouldRepeat: true,
  },
];

// ============ JOURNEY ENGINE CLASS ============

class JourneyEngine {
  private events: SamplingEvent[] = SAMPLE_EVENTS;
  private changeLog: ChangeLogEntry[] = SAMPLE_CHANGE_LOG;
  private dataRequests: DataRequest[] = [];
  private contributions: DataContribution[] = [];

  // ============ CANS IN HANDS METRICS ============

  getCansInHandsSummary(months: number = 3): {
    totalCans: number;
    totalCost: number;
    avgCostPerCan: number;
    totalAttributedRevenue: number;
    avgRoi: number;
    eventCount: number;
    bestPerformingEvent: SamplingEvent | null;
    worstPerformingEvent: SamplingEvent | null;
  } {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    const recentEvents = this.events.filter(
      (e) => new Date(e.date) >= cutoffDate
    );

    if (recentEvents.length === 0) {
      return {
        totalCans: 0,
        totalCost: 0,
        avgCostPerCan: 0,
        totalAttributedRevenue: 0,
        avgRoi: 0,
        eventCount: 0,
        bestPerformingEvent: null,
        worstPerformingEvent: null,
      };
    }

    const totalCans = recentEvents.reduce((sum, e) => sum + e.cansDistributed, 0);
    const totalCost = recentEvents.reduce((sum, e) => sum + e.costTotal, 0);
    const totalAttributedRevenue = recentEvents.reduce(
      (sum, e) => sum + (e.attributedSales || 0),
      0
    );

    const eventsWithRoi = recentEvents.filter((e) => e.roi !== undefined);
    const avgRoi =
      eventsWithRoi.length > 0
        ? eventsWithRoi.reduce((sum, e) => sum + (e.roi || 0), 0) / eventsWithRoi.length
        : 0;

    const sortedByRoi = [...eventsWithRoi].sort((a, b) => (b.roi || 0) - (a.roi || 0));

    return {
      totalCans,
      totalCost,
      avgCostPerCan: totalCans > 0 ? totalCost / totalCans : 0,
      totalAttributedRevenue,
      avgRoi,
      eventCount: recentEvents.length,
      bestPerformingEvent: sortedByRoi[0] || null,
      worstPerformingEvent: sortedByRoi[sortedByRoi.length - 1] || null,
    };
  }

  // ============ IMPACT CORRELATION ============

  getImpactCorrelations(): {
    topCorrelations: {
      activity: string;
      metric: string;
      impact: number;
      confidence: "high" | "medium" | "low";
    }[];
    recommendations: string[];
  } {
    // Analyze events + changes → business metrics
    const correlations: {
      activity: string;
      metric: string;
      impact: number;
      confidence: "high" | "medium" | "low";
    }[] = [];

    // Event correlations
    for (const event of this.events) {
      if (event.attributedRetailVelocityLift) {
        correlations.push({
          activity: event.name,
          metric: "Retail Velocity",
          impact: event.attributedRetailVelocityLift * 100,
          confidence: event.attributedRetailVelocityLift > 0.1 ? "high" : "medium",
        });
      }
      if (event.roi && event.roi > 0) {
        correlations.push({
          activity: event.name,
          metric: "ROI",
          impact: event.roi * 100,
          confidence: event.roi > 1 ? "high" : "medium",
        });
      }
    }

    // Change correlations
    for (const change of this.changeLog) {
      if (change.actualImpact) {
        // Parse impact from text (simplified)
        const match = change.actualImpact.match(/([+-]?\d+)/);
        if (match) {
          correlations.push({
            activity: change.title,
            metric: change.category,
            impact: parseInt(match[1]),
            confidence: change.shouldRepeat ? "high" : "medium",
          });
        }
      }
    }

    // Sort by absolute impact
    correlations.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    // Generate recommendations
    const recommendations: string[] = [];

    // Events recommendation
    const eventSummary = this.getCansInHandsSummary(3);
    if (eventSummary.avgRoi > 1) {
      recommendations.push(
        `Events showing ${(eventSummary.avgRoi * 100).toFixed(0)}% ROI - consider increasing sampling budget`
      );
    } else if (eventSummary.avgRoi > 0 && eventSummary.avgRoi < 0.5) {
      recommendations.push(
        `Event ROI at ${(eventSummary.avgRoi * 100).toFixed(0)}% - focus on higher-converting venues`
      );
    }

    // Best event type
    if (eventSummary.bestPerformingEvent) {
      recommendations.push(
        `"${eventSummary.bestPerformingEvent.name}" had best ROI (${((eventSummary.bestPerformingEvent.roi || 0) * 100).toFixed(0)}%) - replicate this format`
      );
    }

    // Change that worked
    const successfulChanges = this.changeLog.filter((c) => c.shouldRepeat);
    if (successfulChanges.length > 0) {
      recommendations.push(
        `"${successfulChanges[0].title}" delivered results - apply similar approach to other areas`
      );
    }

    return {
      topCorrelations: correlations.slice(0, 5),
      recommendations,
    };
  }

  // ============ JOURNEY STAGE METRICS ============

  getJourneyStageMetrics(): JourneyStageMetrics[] {
    // This would pull from real customer data
    // For now, return estimates based on industry benchmarks + BREZ specifics
    return JOURNEY_STAGES.map((stage, index) => ({
      stage: stage.id,
      customersInStage: Math.round(14000 * Math.pow(0.6, index)), // Funnel decay
      customersEnteredThisMonth: Math.round(2000 * Math.pow(0.7, index)),
      customersExitedThisMonth: Math.round(1500 * Math.pow(0.7, index)),
      conversionToNextStage: stage.targetConversion,
      avgDaysInStage: stage.avgDaysInStage,
      avgLtv: 45 * Math.pow(1.5, index), // LTV increases with stage
      totalRevenue: Math.round(14000 * Math.pow(0.6, index) * 45 * Math.pow(1.5, index)),
      byChannel: {} as JourneyStageMetrics["byChannel"],
    }));
  }

  // ============ DATA REQUESTS ============

  getPendingDataRequests(department?: string): DataRequest[] {
    const pending = this.dataRequests.filter((r) => r.status === "pending");
    if (department) {
      return pending.filter((r) => r.targetDepartment === department);
    }
    return pending;
  }

  getNextCriticalDataRequest(department?: string): DataRequest | null {
    const pending = this.getPendingDataRequests(department);
    const sorted = pending.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    return sorted[0] || null;
  }

  createDataRequest(request: Omit<DataRequest, "id" | "requestedAt" | "status">): DataRequest {
    const newRequest: DataRequest = {
      ...request,
      id: `req-${Date.now()}`,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };
    this.dataRequests.push(newRequest);
    return newRequest;
  }

  submitDataContribution(
    requestId: string,
    userId: string,
    userName: string,
    department: string,
    value: unknown
  ): DataContribution {
    const request = this.dataRequests.find((r) => r.id === requestId);
    if (!request) throw new Error("Request not found");

    request.status = "completed";
    request.completedAt = new Date().toISOString();
    request.completedBy = userId;

    const contribution: DataContribution = {
      id: `contrib-${Date.now()}`,
      requestId,
      userId,
      userName,
      department,
      dataType: request.dataType,
      value,
      systemImprovements: [
        "Updated forecasting model accuracy",
        "Improved personalized recommendations",
      ],
      insightsUnlocked: [
        `New insight: ${request.title} data now available`,
      ],
      xpAwarded: request.xpReward,
      celebrationMessage: `${userName} just made the system smarter! +${request.xpReward} XP`,
      contributedAt: new Date().toISOString(),
    };

    this.contributions.push(contribution);
    return contribution;
  }

  // ============ CHANGE LOG ============

  getChangeLog(limit: number = 10): ChangeLogEntry[] {
    return this.changeLog
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, limit);
  }

  addChangeLogEntry(entry: Omit<ChangeLogEntry, "id">): ChangeLogEntry {
    const newEntry: ChangeLogEntry = {
      ...entry,
      id: `change-${Date.now()}`,
    };
    this.changeLog.push(newEntry);
    return newEntry;
  }

  // ============ EVENTS MANAGEMENT ============

  getEvents(limit: number = 10): SamplingEvent[] {
    return this.events
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  addEvent(event: Omit<SamplingEvent, "id" | "costPerCan" | "createdAt" | "updatedAt">): SamplingEvent {
    const newEvent: SamplingEvent = {
      ...event,
      id: `event-${Date.now()}`,
      costPerCan: event.costTotal / event.cansDistributed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  // ============ GROWTH GENERATOR MACRO VIEW ============

  getGrowthGeneratorMacro(): {
    currentFocus: string;
    keyLever: string;
    expectedImpact: string;
    topActivity: {
      type: "event" | "campaign" | "optimization";
      name: string;
      projectedRoi: number;
    } | null;
    dataNeeded: string[];
  } {
    const eventSummary = this.getCansInHandsSummary(3);

    // Determine focus based on data
    let currentFocus = "Improve contribution margin through channel optimization";
    let keyLever = "Event sampling → Retail velocity";
    let expectedImpact = "Target: +15% retail velocity in sampled markets";

    if (eventSummary.avgRoi > 1.5) {
      currentFocus = "Scale high-ROI events";
      keyLever = "Replicate successful event format";
      expectedImpact = `Project: ${eventSummary.avgRoi.toFixed(1)}x ROI at 2x scale`;
    } else if (eventSummary.avgCostPerCan > 5) {
      currentFocus = "Reduce cost per can in hands";
      keyLever = "Optimize event selection and operations";
      expectedImpact = "Target: <$3.50 cost per can";
    }

    const topActivity = eventSummary.bestPerformingEvent
      ? {
          type: "event" as const,
          name: eventSummary.bestPerformingEvent.name,
          projectedRoi: eventSummary.bestPerformingEvent.roi || 0,
        }
      : null;

    return {
      currentFocus,
      keyLever,
      expectedImpact,
      topActivity,
      dataNeeded: [
        "Event attendance data for next 3 months",
        "Retail velocity by DMA for correlation",
        "Cost breakdown by event type",
      ],
    };
  }

  // ============ INITIAL DATA REQUESTS ============

  initializeDataRequests(): void {
    // Create initial data requests for key metrics
    const initialRequests: Omit<DataRequest, "id" | "requestedAt" | "status">[] = [
      {
        title: "Monthly Event Schedule",
        description: "Upcoming sampling events for the next 3 months",
        whyItMatters: "Allows forecasting of cans-in-hands impact on retail velocity",
        targetDepartment: "marketing",
        dataType: "csv",
        schema: {
          name: "Event name",
          date: "Event date",
          location: "City, State",
          expectedAttendance: "Number",
          plannedCans: "Number",
          estimatedCost: "Number",
        },
        priority: "high",
        xpReward: 100,
        impactPreview: "Unlocks: Event ROI forecasting, Retail velocity predictions",
      },
      {
        title: "Retail Velocity by DMA",
        description: "Weekly units sold per door by market (DMA)",
        whyItMatters: "Critical for measuring event impact on retail performance",
        targetDepartment: "retail",
        dataType: "csv",
        schema: {
          week: "Week start date",
          dma: "Market name",
          doors: "Number of doors",
          unitsSold: "Total units",
          velocity: "Units/door/week",
        },
        priority: "critical",
        xpReward: 150,
        impactPreview: "Unlocks: Event → Retail correlation, Market prioritization",
      },
      {
        title: "Marketing Spend by Channel",
        description: "Monthly spend breakdown by acquisition channel",
        whyItMatters: "Enables CAC optimization and budget allocation recommendations",
        targetDepartment: "growth",
        dataType: "csv",
        schema: {
          month: "Month",
          channel: "Channel name",
          spend: "Dollar amount",
          newCustomers: "Number",
          revenue: "Attributed revenue",
        },
        priority: "high",
        xpReward: 100,
        impactPreview: "Unlocks: Channel efficiency insights, Budget recommendations",
      },
    ];

    for (const request of initialRequests) {
      this.createDataRequest(request);
    }
  }
}

// Export singleton
export const journeyEngine = new JourneyEngine();

// Initialize data requests
journeyEngine.initializeDataRequests();
