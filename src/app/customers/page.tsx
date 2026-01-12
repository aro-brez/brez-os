"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Users,
  Upload,
  Search,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Card, Button, Badge, Input, Textarea, EmptyState, ProgressBar } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { CustomerMessage } from "@/lib/data/schemas";
import { analyzeCustomerFeedback, CustomerInsights } from "@/lib/ai/summarizer";
import Papa from "papaparse";

export default function CustomersPage() {
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerMessage[]>([]);
  const [filterSentiment, setFilterSentiment] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const customerMessages = devStore.getCustomerMessages();
    setMessages(customerMessages);
    if (customerMessages.length > 0) {
      setInsights(analyzeCustomerFeedback());
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = devStore.searchCustomerMessages(searchQuery);
    setSearchResults(results);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      complete: (results) => {
        const newMessages: Omit<CustomerMessage, "id" | "importedAt">[] = results.data
          .filter((row) => row.content || row.message || row.review)
          .map((row) => {
            const content = row.content || row.message || row.review || "";
            const sentiment = detectSentiment(content, Number(row.rating) || undefined);
            const themes = extractThemes(content);
            const prices = extractPrices(content);

            return {
              source: (row.source as CustomerMessage["source"]) || "review",
              platform: row.platform || "CSV Import",
              content,
              rating: row.rating ? Number(row.rating) : undefined,
              sentiment,
              themes,
              pricesMentioned: prices,
              customerName: row.customer_name || row.name || undefined,
              date: row.date || new Date().toISOString(),
            };
          });

        devStore.addCustomerMessages(newMessages);
        loadData();
      },
    });
  };

  // Simple sentiment detection
  const detectSentiment = (text: string, rating?: number): CustomerMessage["sentiment"] => {
    if (rating) {
      if (rating >= 4) return "positive";
      if (rating <= 2) return "negative";
      return "neutral";
    }

    const positiveWords = ["love", "great", "amazing", "excellent", "best", "fantastic", "perfect", "wonderful"];
    const negativeWords = ["hate", "terrible", "awful", "worst", "bad", "disappointed", "horrible", "poor"];

    const lower = text.toLowerCase();
    const positiveCount = positiveWords.filter((w) => lower.includes(w)).length;
    const negativeCount = negativeWords.filter((w) => lower.includes(w)).length;

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  };

  // Simple theme extraction
  const extractThemes = (text: string): string[] => {
    const themeKeywords: Record<string, string[]> = {
      taste: ["taste", "flavor", "delicious", "tasty"],
      price: ["price", "expensive", "cheap", "value", "cost", "afford"],
      shipping: ["shipping", "delivery", "arrived", "package"],
      efficacy: ["effect", "works", "relaxation", "calm", "sleep", "stress"],
      quality: ["quality", "premium", "good", "bad"],
      service: ["service", "support", "help", "response"],
    };

    const themes: string[] = [];
    const lower = text.toLowerCase();

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some((k) => lower.includes(k))) {
        themes.push(theme);
      }
    });

    return themes;
  };

  // Extract price mentions
  const extractPrices = (text: string): string[] => {
    const priceRegex = /\$\d+\.?\d*/g;
    return text.match(priceRegex) || [];
  };

  const filteredMessages = messages.filter((m) => {
    if (filterSentiment !== "all" && m.sentiment !== filterSentiment) return false;
    return true;
  });

  const getSentimentIcon = (sentiment?: CustomerMessage["sentiment"]) => {
    switch (sentiment) {
      case "positive": return <ThumbsUp className="w-4 h-4 text-[#6BCB77]" />;
      case "negative": return <ThumbsDown className="w-4 h-4 text-[#ff6b6b]" />;
      default: return <Minus className="w-4 h-4 text-[#676986]" />;
    }
  };

  const getSentimentBadge = (sentiment?: CustomerMessage["sentiment"]) => {
    switch (sentiment) {
      case "positive": return <Badge variant="success">Positive</Badge>;
      case "negative": return <Badge variant="danger">Negative</Badge>;
      default: return <Badge variant="default">Neutral</Badge>;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-[#e3f98a]" />
            Ask Our Customers
          </h1>
          <p className="text-[#676986] mt-1">Analyze customer feedback and reviews</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="hidden"
          />
        </div>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8" />}
          title="No customer feedback yet"
          description="Import a CSV file with customer reviews, support tickets, or survey responses"
          action={
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" />
              Import CSV
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Insights */}
          <div className="space-y-6">
            {/* Overall Sentiment */}
            {insights && (
              <Card>
                <h3 className="font-semibold text-white mb-4">Overall Sentiment</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#6BCB77]">Positive</span>
                      <span className="text-white">{insights.overallSentiment.positive}</span>
                    </div>
                    <ProgressBar
                      value={insights.overallSentiment.positive}
                      max={messages.length}
                      variant="success"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#676986]">Neutral</span>
                      <span className="text-white">{insights.overallSentiment.neutral}</span>
                    </div>
                    <ProgressBar
                      value={insights.overallSentiment.neutral}
                      max={messages.length}
                      variant="default"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#ff6b6b]">Negative</span>
                      <span className="text-white">{insights.overallSentiment.negative}</span>
                    </div>
                    <ProgressBar
                      value={insights.overallSentiment.negative}
                      max={messages.length}
                      variant="danger"
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Top Complaints */}
            {insights && insights.topComplaints.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-[#ff6b6b]" />
                  <h3 className="font-semibold text-white">Top Complaints</h3>
                </div>
                <div className="space-y-3">
                  {insights.topComplaints.map((complaint, i) => (
                    <div key={i} className="p-3 bg-[#ff6b6b]/10 rounded-lg border border-[#ff6b6b]/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white capitalize">{complaint.theme}</span>
                        <Badge variant="danger">{complaint.count} mentions</Badge>
                      </div>
                      <p className="text-xs text-[#a8a8a8] line-clamp-2">{complaint.examples[0]}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Top Praises */}
            {insights && insights.topPraises.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-[#6BCB77]" />
                  <h3 className="font-semibold text-white">Top Praises</h3>
                </div>
                <div className="space-y-3">
                  {insights.topPraises.map((praise, i) => (
                    <div key={i} className="p-3 bg-[#6BCB77]/10 rounded-lg border border-[#6BCB77]/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white capitalize">{praise.theme}</span>
                        <Badge variant="success">{praise.count} mentions</Badge>
                      </div>
                      <p className="text-xs text-[#a8a8a8] line-clamp-2">{praise.examples[0]}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Price Sensitivity */}
            {insights && insights.priceSensitivity.mentions.length > 0 && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-[#ffce33]" />
                  <h3 className="font-semibold text-white">Price Sensitivity</h3>
                </div>
                <div className="space-y-2">
                  {insights.priceSensitivity.averagePrice && (
                    <p className="text-sm text-[#a8a8a8]">
                      Average mentioned price:{" "}
                      <span className="text-white font-semibold">
                        ${insights.priceSensitivity.averagePrice.toFixed(2)}
                      </span>
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(insights.priceSensitivity.mentions)].map((price, i) => (
                      <Badge key={i} variant="warning">{price}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Messages & Search */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Card>
              <h3 className="font-semibold text-white mb-4">Ask a Question</h3>
              <div className="flex gap-2">
                <Input
                  icon={<Search className="w-4 h-4" />}
                  placeholder="Search customer feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              <p className="text-xs text-[#676986] mt-2">
                V2: Will use AI embeddings for semantic search
              </p>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-[#a8a8a8] mb-3">
                    Found {searchResults.length} results
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {searchResults.map((msg) => (
                      <div key={msg.id} className="p-3 bg-[#1a1a3e] rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {getSentimentIcon(msg.sentiment)}
                          <span className="text-xs text-[#676986]">{msg.platform}</span>
                          {msg.rating && (
                            <span className="text-xs text-[#ffce33]">★ {msg.rating}</span>
                          )}
                        </div>
                        <p className="text-sm text-white">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Filter & Messages List */}
            <Card padding="none">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-semibold text-white">All Feedback ({filteredMessages.length})</h3>
                <div className="flex gap-1">
                  {(["all", "positive", "neutral", "negative"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterSentiment(filter)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        filterSentiment === filter
                          ? "bg-[#e3f98a] text-[#0D0D2A]"
                          : "text-[#676986] hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                {filteredMessages.map((msg) => (
                  <div key={msg.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getSentimentBadge(msg.sentiment)}
                          <Badge variant="default">{msg.source}</Badge>
                          <span className="text-xs text-[#676986]">{msg.platform}</span>
                          {msg.rating && (
                            <span className="text-xs text-[#ffce33]">★ {msg.rating}</span>
                          )}
                        </div>
                        <p className="text-sm text-white mb-2">{msg.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.themes.map((theme) => (
                            <Badge key={theme} variant="info" size="sm">{theme}</Badge>
                          ))}
                          {msg.pricesMentioned.map((price, i) => (
                            <Badge key={i} variant="warning" size="sm">{price}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right text-xs text-[#676986]">
                        {msg.customerName && <p>{msg.customerName}</p>}
                        <p>{format(new Date(msg.date), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
