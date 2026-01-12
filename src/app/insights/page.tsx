"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  AlertCircle,
  Database,
  Sparkles,
} from "lucide-react";
import { Card, Button, Badge, Select } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { CustomerDemographicSnapshot, CustomerMessage } from "@/lib/data/schemas";
import { brain, DATA_SOURCES } from "@/lib/ai/brain";

export default function CustomerInsightsPage() {
  const [demographics, setDemographics] = useState<CustomerDemographicSnapshot[]>([]);
  const [reviews, setReviews] = useState<CustomerMessage[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [period1, setPeriod1] = useState("");
  const [period2, setPeriod2] = useState("");
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const demos = devStore.getCustomerDemographics();
    setDemographics(demos);

    // Set default periods
    if (demos.length >= 2) {
      setPeriod2(demos[demos.length - 1].date);
      setPeriod1(demos[demos.length - 2].date);
    }

    // Get reviews sorted by date
    const allReviews = devStore.getCustomerMessages()
      .filter((m) => m.rating !== undefined)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReviews(allReviews);
  }, []);

  const latestDemo = demographics[demographics.length - 1];
  const comparison = devStore.compareDemographics(period1, period2);

  const periodOptions = demographics.map((d) => ({
    value: d.date,
    label: format(new Date(d.date), "MMMM yyyy"),
  }));

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment === "positive") return <ThumbsUp className="w-4 h-4 text-[#6BCB77]" />;
    if (sentiment === "negative") return <ThumbsDown className="w-4 h-4 text-[#ff6b6b]" />;
    return <Minus className="w-4 h-4 text-[#676986]" />;
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (direction === "left" && currentReviewIndex > 0) {
      setCurrentReviewIndex(currentReviewIndex - 1);
    } else if (direction === "right" && currentReviewIndex < reviews.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    }
  };

  // Touch/swipe handling for mobile
  const [touchStart, setTouchStart] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      scrollCarousel(diff > 0 ? "right" : "left");
    }
  };

  if (!latestDemo) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <Card className="py-12 px-8 text-center">
          <Users className="w-12 h-12 text-[#676986] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Customer Data</h2>
          <p className="text-[#676986]">Import customer data to see insights</p>
        </Card>
      </div>
    );
  }

  // Check data source status
  const shopifySource = DATA_SOURCES.find(d => d.id === "shopify");
  const reviewsSource = DATA_SOURCES.find(d => d.id === "customer_reviews");
  const gaSource = DATA_SOURCES.find(d => d.id === "google_analytics");
  const systemMetrics = brain.getSystemMetrics();

  const missingCriticalData = !shopifySource || shopifySource.status !== "connected";

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#e3f98a]" />
            Customer Insights
          </h1>
          <p className="text-[#676986] mt-1">DTC customer demographics and trends</p>
        </div>
        <Button
          variant={compareMode ? "primary" : "secondary"}
          onClick={() => setCompareMode(!compareMode)}
        >
          <RefreshCw className="w-4 h-4" />
          {compareMode ? "Exit Comparison" : "Compare Periods"}
        </Button>
      </div>

      {/* Data Source Status Banner */}
      {missingCriticalData && (
        <Card className="mb-6 bg-gradient-to-r from-[#ffce33]/10 to-transparent border-[#ffce33]/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#ffce33]/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-[#ffce33]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Connect data sources for real insights</h3>
              <p className="text-sm text-[#a8a8a8] mb-4">
                Currently showing sample data. Connect your real data sources to get accurate customer insights.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                  shopifySource?.status === "connected"
                    ? "bg-[#6BCB77]/10 border-[#6BCB77]/30"
                    : "bg-[#ff6b6b]/10 border-[#ff6b6b]/30"
                }`}>
                  {shopifySource?.status === "connected" ? (
                    <span className="w-2 h-2 bg-[#6BCB77] rounded-full" />
                  ) : (
                    <span className="w-2 h-2 bg-[#ff6b6b] rounded-full" />
                  )}
                  <span className="text-sm text-white">Shopify</span>
                  <span className="text-xs text-[#676986]">Customers, Orders, Subscriptions</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                  gaSource?.status === "connected"
                    ? "bg-[#6BCB77]/10 border-[#6BCB77]/30"
                    : "bg-[#ff6b6b]/10 border-[#ff6b6b]/30"
                }`}>
                  {gaSource?.status === "connected" ? (
                    <span className="w-2 h-2 bg-[#6BCB77] rounded-full" />
                  ) : (
                    <span className="w-2 h-2 bg-[#ff6b6b] rounded-full" />
                  )}
                  <span className="text-sm text-white">Google Analytics</span>
                  <span className="text-xs text-[#676986]">Traffic, Demographics</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                  reviewsSource?.status === "connected"
                    ? "bg-[#6BCB77]/10 border-[#6BCB77]/30"
                    : "bg-[#ffce33]/10 border-[#ffce33]/30"
                }`}>
                  {reviewsSource?.status === "connected" ? (
                    <span className="w-2 h-2 bg-[#6BCB77] rounded-full" />
                  ) : (
                    <span className="w-2 h-2 bg-[#ffce33] rounded-full" />
                  )}
                  <span className="text-sm text-white">Reviews CSV</span>
                  <span className="text-xs text-[#676986]">Ratings, Sentiment</span>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button size="sm" variant="secondary" onClick={() => window.location.href = "/files"}>
                  <Database className="w-4 h-4" />
                  Go to Data Hub
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* AI-Generated Insights Summary */}
      <Card className="mb-6 bg-gradient-to-r from-[#e3f98a]/5 to-[#65cdd8]/5 border-[#e3f98a]/10">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#0D0D2A]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">AI Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-[#0D0D2A]/50 rounded-xl">
                <p className="text-xs text-[#676986] mb-1">Active Subscribers</p>
                <p className="text-xl font-bold text-white">{systemMetrics.subscribers.toLocaleString()}</p>
                <p className="text-xs text-[#6BCB77]">DTC primary channel</p>
              </div>
              <div className="p-3 bg-[#0D0D2A]/50 rounded-xl">
                <p className="text-xs text-[#676986] mb-1">LTV:CAC Ratio</p>
                <p className="text-xl font-bold text-white">{(systemMetrics.dtcLTV / systemMetrics.dtcCAC).toFixed(1)}x</p>
                <p className="text-xs text-[#6BCB77]">Healthy ratio (above 3x)</p>
              </div>
              <div className="p-3 bg-[#0D0D2A]/50 rounded-xl">
                <p className="text-xs text-[#676986] mb-1">Monthly Churn</p>
                <p className="text-xl font-bold text-white">{(systemMetrics.churnRate * 100).toFixed(1)}%</p>
                <p className="text-xs text-[#ffce33]">Target: under 5%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Period Selector (Compare Mode) */}
      {compareMode && (
        <Card className="mb-6 bg-gradient-to-r from-[#e3f98a]/10 to-transparent border-[#e3f98a]/30">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#a8a8a8]">Compare</span>
              <Select
                options={periodOptions}
                value={period1}
                onChange={(e) => setPeriod1(e.target.value)}
                className="w-40"
              />
            </div>
            <ArrowRight className="w-4 h-4 text-[#676986]" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#a8a8a8]">to</span>
              <Select
                options={periodOptions}
                value={period2}
                onChange={(e) => setPeriod2(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Customers"
          value={latestDemo.totalCustomers.toLocaleString()}
          change={compareMode ? comparison.changes.totalCustomers : undefined}
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          label="Avg Order Value"
          value={`$${latestDemo.averageOrderValue.toFixed(2)}`}
          change={compareMode ? comparison.changes.averageOrderValue : undefined}
          icon={<Target className="w-5 h-5" />}
        />
        <MetricCard
          label="Subscription Rate"
          value={`${latestDemo.subscriptionRate.toFixed(1)}%`}
          change={compareMode ? comparison.changes.subscriptionRate : undefined}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <MetricCard
          label="Repeat Purchase"
          value={`${latestDemo.repeatPurchaseRate.toFixed(1)}%`}
          change={compareMode ? comparison.changes.repeatPurchaseRate : undefined}
          icon={<RefreshCw className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Age Demographics */}
        <Card>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#65cdd8]" />
            Age Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(latestDemo.ageGroups).map(([age, count]) => {
              const percent = (count / latestDemo.totalCustomers) * 100;
              return (
                <div key={age}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#a8a8a8]">{age}</span>
                    <span className="text-white">{percent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#65cdd8] to-[#8533fc] rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#e3f98a]" />
            Gender Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(latestDemo.gender).map(([gender, count]) => {
              const percent = (count / latestDemo.totalCustomers) * 100;
              const colors: Record<string, string> = {
                female: "#e3f98a",
                male: "#65cdd8",
                other: "#8533fc",
              };
              return (
                <div key={gender}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#a8a8a8] capitalize">{gender}</span>
                    <span className="text-white">{percent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${percent}%`, backgroundColor: colors[gender] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Acquisition Channels */}
        <Card>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#6BCB77]" />
            Acquisition Channels
          </h3>
          <div className="space-y-3">
            {Object.entries(latestDemo.acquisitionChannels).map(([channel, count]) => {
              const percent = (count / latestDemo.totalCustomers) * 100;
              return (
                <div key={channel}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[#a8a8a8] capitalize">{channel}</span>
                    <span className="text-white">{percent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6BCB77] rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top States */}
      <Card className="mb-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#ff6b6b]" />
          Top States by Customers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {latestDemo.topStates.map((state, i) => (
            <div key={state.state} className="p-4 bg-[#1a1a3e] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-[#e3f98a]/20 text-[#e3f98a] text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="font-medium text-white">{state.state}</span>
              </div>
              <p className="text-2xl font-bold text-white">{state.count.toLocaleString()}</p>
              <p className="text-xs text-[#676986]">${(state.revenue / 1000).toFixed(0)}K revenue</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Review Carousel */}
      <Card padding="none">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-[#ffce33]" />
            Recent Reviews ({reviews.length})
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollCarousel("left")}
              disabled={currentReviewIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-[#676986]">
              {currentReviewIndex + 1} / {reviews.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => scrollCarousel("right")}
              disabled={currentReviewIndex === reviews.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
          >
            {reviews.map((review) => (
              <div key={review.id} className="min-w-full p-6">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    {getSentimentIcon(review.sentiment)}
                    <div className="flex items-center gap-1">
                      {review.rating && [...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating! ? "text-[#ffce33] fill-[#ffce33]" : "text-[#676986]"}`}
                        />
                      ))}
                    </div>
                    <Badge variant="default">{review.platform}</Badge>
                    <span className="text-xs text-[#676986]">
                      {format(new Date(review.date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <blockquote className="text-lg text-white leading-relaxed mb-4">
                    &ldquo;{review.content}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a8a8a8]">— {review.customerName}</span>
                    <div className="flex gap-2">
                      {review.themes.map((theme) => (
                        <Badge key={theme} variant="info" size="sm">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center gap-2 p-4 border-t border-white/5">
          {reviews.slice(0, 10).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentReviewIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentReviewIndex ? "bg-[#e3f98a] w-6" : "bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
          {reviews.length > 10 && (
            <span className="text-xs text-[#676986]">+{reviews.length - 10} more</span>
          )}
        </div>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  icon,
}: {
  label: string;
  value: string;
  change?: { value1: number; value2: number; change: number; percentChange: number };
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#a8a8a8]">
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 ${change.percentChange > 0 ? "text-[#6BCB77]" : change.percentChange < 0 ? "text-[#ff6b6b]" : "text-[#676986]"}`}>
            {change.percentChange > 0 ? <TrendingUp className="w-4 h-4" /> : change.percentChange < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {change.percentChange > 0 ? "+" : ""}{change.percentChange.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-[#676986] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </Card>
  );
}
