"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Insight } from "@/lib/insights-engine";

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) {
    return null;
  }

  const getSeverityStyles = (severity: Insight["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-l-[#ff6b6b] bg-[#ff6b6b]/5";
      case "warning":
        return "border-l-[#ffce33] bg-[#ffce33]/5";
      case "success":
        return "border-l-[#6BCB77] bg-[#6BCB77]/5";
      default:
        return "border-l-[#65cdd8] bg-[#65cdd8]/5";
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💡</span>
        <h3 className="text-sm font-semibold text-white">Key Insights</h3>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border-l-[3px] ${getSeverityStyles(insight.severity)}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base flex-shrink-0">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">{insight.title}</h4>
                  </div>
                  <p className="text-xs text-[#a8a8a8] mt-0.5">{insight.description}</p>
                  {insight.metric && insight.value && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px] text-[#676986] uppercase">{insight.metric}:</span>
                      <span className="text-xs font-medium text-white">{insight.value}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
