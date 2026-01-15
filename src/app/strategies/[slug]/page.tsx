"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Share2,
  Eye,
  Calendar,
  User,
  FileText,
  Lock,
  ExternalLink,
  Printer,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";

interface StrategyMetadata {
  title: string;
  description: string;
  owner: string;
  updated: string;
  version: string;
  status: "draft" | "review" | "active" | "archived";
  access: string;
  confidentiality: string;
  htmlPath: string;
}

const strategyMetadata: Record<string, StrategyMetadata> = {
  "capital-strategy-2026": {
    title: "Capital Strategy 2026",
    description: "Multi-path capital strategy including AP restructuring, Kick Further debt, SPV crowdfunding, and institutional equity",
    owner: "Aaron Nosbisch",
    updated: "January 14, 2026",
    version: "1.0",
    status: "active",
    access: "ELT",
    confidentiality: "Confidential",
    htmlPath: "/strategies/capital-strategy-2026.html",
  },
};

export default function StrategyViewerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [isLoading, setIsLoading] = useState(true);

  const metadata = strategyMetadata[slug];
  const currentUser = devStore.getCurrentUser();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!metadata) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <Card className="max-w-md text-center">
          <FileText className="w-12 h-12 text-[#676986] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Strategy Not Found</h2>
          <p className="text-[#a8a8a8] mb-4">
            This strategy document doesn&apos;t exist or hasn&apos;t been created yet.
          </p>
          <Link href="/strategies">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Strategies
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleExportPDF = () => {
    // Open the HTML in a new tab for printing
    window.open(metadata.htmlPath, "_blank");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // Would show toast here
      alert("Link copied to clipboard!");
    } catch {
      console.error("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <Link
          href="/strategies"
          className="flex items-center gap-2 text-[#676986] hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Strategies</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {metadata.title}
            </h1>
            <p className="text-[#a8a8a8] max-w-2xl">
              {metadata.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportPDF}
            >
              <Printer className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Metadata Bar */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#676986]" />
            <span className="text-[#a8a8a8]">Owner:</span>
            <span className="text-white font-medium">{metadata.owner}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#676986]" />
            <span className="text-[#a8a8a8]">Updated:</span>
            <span className="text-white font-medium">{metadata.updated}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#676986]" />
            <span className="text-[#a8a8a8]">Version:</span>
            <span className="text-white font-medium">{metadata.version}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#676986]" />
            <span className="text-[#a8a8a8]">Access:</span>
            <Badge variant="warning" size="sm">{metadata.access}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#676986]" />
            <Badge variant="danger" size="sm">{metadata.confidentiality}</Badge>
          </div>
          <Badge
            variant={metadata.status === "active" ? "success" : "default"}
            size="sm"
            className="uppercase"
          >
            {metadata.status}
          </Badge>
        </div>
      </Card>

      {/* Document Viewer */}
      <Card className="overflow-hidden" padding="none">
        {isLoading ? (
          <div className="h-[80vh] flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#e3f98a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[#676986]">Loading document...</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <iframe
              src={metadata.htmlPath}
              className="w-full h-[80vh] border-0"
              title={metadata.title}
            />
            <a
              href={metadata.htmlPath}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D0D2A]/90 text-[#e3f98a] text-sm hover:bg-[#0D0D2A] transition-colors border border-[#e3f98a]/30"
            >
              <ExternalLink className="w-4 h-4" />
              Open Full Screen
            </a>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/plan">
          <Button variant="ghost" size="sm">
            View Master Plan
          </Button>
        </Link>
        <a href={metadata.htmlPath} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
        </a>
      </div>
    </div>
  );
}
