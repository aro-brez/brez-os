"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  Database,
  Cloud,
  ShoppingBag,
  CreditCard,
  BarChart3,
  HardDrive,
  RefreshCw,
  Upload,
  AlertTriangle,
  Sparkles,
  User,
  Bell,
  Shield,
  Server,
  GitBranch,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, Button, Badge, Input, Tabs, Modal } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { Connector } from "@/lib/data/schemas";

interface DeploymentInfo {
  ok: boolean;
  version: string;
  timestamp: string;
  env: string;
  features: {
    supabase: boolean;
    devMode: boolean;
    googleAuth: boolean;
    anthropicAI: boolean;
  };
  build: {
    commitSha: string;
    commitMessage: string;
    deployedAt: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("connectors");
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [, setDevMode] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);

  useEffect(() => {
    const settings = devStore.getSettings();
    setDevMode(settings.devMode);
    setConnectors(devStore.getConnectors());

    // Fetch deployment info from health endpoint
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setDeploymentInfo(data))
      .catch((err) => console.error("Failed to fetch deployment info:", err));
  }, []);

  const tabs = [
    { id: "connectors", label: "Connectors", icon: <Cloud className="w-4 h-4" /> },
    { id: "data", label: "Data", icon: <Database className="w-4 h-4" /> },
    { id: "deployment", label: "Deployment", icon: <Server className="w-4 h-4" /> },
    { id: "account", label: "Account", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#e3f98a]" />
          Settings
        </h1>
        <p className="text-[#676986] mt-1">Configure integrations and preferences</p>
      </div>

      {/* DEV MODE Banner */}
      <Card className="mb-6 bg-gradient-to-r from-[#8533fc]/20 to-[#65cdd8]/20 border-[#8533fc]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8533fc]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#8533fc]" />
            </div>
            <div>
              <p className="font-semibold text-white">DEV MODE Active</p>
              <p className="text-xs text-[#a8a8a8]">All data stored locally in browser • No external services required</p>
            </div>
          </div>
          <Badge variant="info">V1</Badge>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {/* Tab Content */}
      {activeTab === "connectors" && (
        <div className="space-y-6">
          {/* Connector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConnectorCard
              connector={connectors.find((c) => c.type === "shopify")}
              icon={<ShoppingBag className="w-6 h-6" />}
              name="Shopify"
              description="Import orders, customers, and product data"
              docsUrl="https://shopify.dev/docs/admin-api"
              envVars={["SHOPIFY_STORE_URL", "SHOPIFY_ACCESS_TOKEN"]}
            />
            <ConnectorCard
              connector={connectors.find((c) => c.type === "quickbooks")}
              icon={<CreditCard className="w-6 h-6" />}
              name="QuickBooks"
              description="Sync financial data and invoices"
              docsUrl="https://developer.intuit.com/app/developer/qbo/docs"
              envVars={["QUICKBOOKS_CLIENT_ID", "QUICKBOOKS_CLIENT_SECRET"]}
            />
            <ConnectorCard
              connector={connectors.find((c) => c.type === "meta_ads")}
              icon={<BarChart3 className="w-6 h-6" />}
              name="Meta Ads"
              description="Import Facebook & Instagram ad performance"
              docsUrl="https://developers.facebook.com/docs/marketing-apis"
              envVars={["META_ACCESS_TOKEN", "META_AD_ACCOUNT_ID"]}
            />
            <ConnectorCard
              connector={connectors.find((c) => c.type === "google_ads")}
              icon={<BarChart3 className="w-6 h-6" />}
              name="Google Ads"
              description="Import Google Ads campaign data"
              docsUrl="https://developers.google.com/google-ads/api/docs"
              envVars={["GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_ADS_DEVELOPER_TOKEN"]}
            />
            <ConnectorCard
              connector={connectors.find((c) => c.type === "google_drive")}
              icon={<HardDrive className="w-6 h-6" />}
              name="Google Drive"
              description="Index files and enable search across documents"
              docsUrl="https://developers.google.com/drive/api"
              envVars={["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"]}
              hasFileImport
            />
          </div>

          {/* V2 Roadmap */}
          <Card className="border-dashed border-[#676986]/50">
            <h3 className="font-semibold text-white mb-4">Coming in V2</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-[#676986]" />
                </div>
                <div>
                  <p className="font-medium text-white">OAuth Integration</p>
                  <p className="text-[#676986]">Secure authentication with all connectors</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4 text-[#676986]" />
                </div>
                <div>
                  <p className="font-medium text-white">Auto-Sync</p>
                  <p className="text-[#676986]">Scheduled data synchronization</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-[#676986]" />
                </div>
                <div>
                  <p className="font-medium text-white">AI Embeddings</p>
                  <p className="text-[#676986]">Semantic search across all connected data</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "data" && (
        <div className="space-y-6">
          {/* Data Storage Info */}
          <Card>
            <h3 className="font-semibold text-white mb-4">Data Storage</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-xl">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-[#65cdd8]" />
                  <div>
                    <p className="font-medium text-white">Local Storage (DEV MODE)</p>
                    <p className="text-xs text-[#676986]">Data persisted in browser localStorage</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-xl opacity-50">
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-[#8533fc]" />
                  <div>
                    <p className="font-medium text-white">Supabase (V2)</p>
                    <p className="text-xs text-[#676986]">PostgreSQL database with realtime sync</p>
                  </div>
                </div>
                <Badge variant="default">Coming Soon</Badge>
              </div>
            </div>
          </Card>

          {/* Supabase Config (Stub) */}
          <Card className="border-dashed border-[#676986]/50">
            <h3 className="font-semibold text-white mb-2">Supabase Configuration</h3>
            <p className="text-sm text-[#676986] mb-4">
              V2 will enable cloud sync with Supabase. Add these environment variables when ready:
            </p>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2 bg-[#0D0D2A] rounded-lg">
                <span className="text-[#676986]">NEXT_PUBLIC_SUPABASE_URL=</span>
                <span className="text-[#ff6b6b]">your-project.supabase.co</span>
              </div>
              <div className="p-2 bg-[#0D0D2A] rounded-lg">
                <span className="text-[#676986]">NEXT_PUBLIC_SUPABASE_ANON_KEY=</span>
                <span className="text-[#ff6b6b]">your-anon-key</span>
              </div>
            </div>
          </Card>

          {/* Reset Data */}
          <Card className="border-[#ff6b6b]/30 bg-[#ff6b6b]/5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1">Reset Demo Data</h3>
                <p className="text-sm text-[#676986]">
                  Clear all data and restore to initial demo state. This cannot be undone.
                </p>
              </div>
              <Button variant="danger" onClick={() => setShowResetModal(true)}>
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "deployment" && (
        <div className="space-y-6">
          {/* Environment Status */}
          <Card>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-[#e3f98a]" />
              Deployment Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#1a1a3e] rounded-xl">
                <p className="text-xs text-[#676986] uppercase tracking-wider mb-1">Environment</p>
                <div className="flex items-center gap-2">
                  <Badge variant={deploymentInfo?.env === "production" ? "success" : "info"}>
                    {deploymentInfo?.env || "development"}
                  </Badge>
                </div>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl">
                <p className="text-xs text-[#676986] uppercase tracking-wider mb-1">Version</p>
                <p className="text-lg font-mono text-white">{deploymentInfo?.version || "1.0.0"}</p>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl">
                <p className="text-xs text-[#676986] uppercase tracking-wider mb-1">Last Build</p>
                <p className="text-sm text-white">
                  {deploymentInfo?.build?.deployedAt
                    ? new Date(deploymentInfo.build.deployedAt).toLocaleString()
                    : "Local Development"}
                </p>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl">
                <p className="text-xs text-[#676986] uppercase tracking-wider mb-1">Commit</p>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[#676986]" />
                  <span className="font-mono text-sm text-white">{deploymentInfo?.build?.commitSha || "local"}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Feature Status */}
          <Card>
            <h3 className="font-semibold text-white mb-4">Feature Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-xl">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-[#8533fc]" />
                  <div>
                    <p className="font-medium text-white">Supabase</p>
                    <p className="text-xs text-[#676986]">Cloud database & auth</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {deploymentInfo?.features?.supabase ? (
                    <><CheckCircle className="w-4 h-4 text-[#6BCB77]" /><Badge variant="success">Connected</Badge></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-[#ffce33]" /><Badge variant="warning">DEV MODE</Badge></>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-xl">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#65cdd8]" />
                  <div>
                    <p className="font-medium text-white">Google OAuth</p>
                    <p className="text-xs text-[#676986]">Team authentication</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {deploymentInfo?.features?.googleAuth ? (
                    <><CheckCircle className="w-4 h-4 text-[#6BCB77]" /><Badge variant="success">Enabled</Badge></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-[#676986]" /><Badge variant="default">Not Configured</Badge></>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#1a1a3e] rounded-xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-[#e3f98a]" />
                  <div>
                    <p className="font-medium text-white">Claude AI</p>
                    <p className="text-xs text-[#676986]">AI-powered features</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {deploymentInfo?.features?.anthropicAI ? (
                    <><CheckCircle className="w-4 h-4 text-[#6BCB77]" /><Badge variant="success">Active</Badge></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-[#676986]" /><Badge variant="default">Not Configured</Badge></>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Health Endpoint */}
          <Card className="border-dashed border-[#676986]/50">
            <h3 className="font-semibold text-white mb-2">Health Endpoint</h3>
            <p className="text-sm text-[#676986] mb-4">
              Use this endpoint for monitoring and uptime checks:
            </p>
            <div className="p-3 bg-[#0D0D2A] rounded-lg font-mono text-sm">
              <span className="text-[#6BCB77]">GET</span>
              <span className="text-white ml-2">/api/health</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => window.open("/api/health", "_blank")}
            >
              Test Endpoint
            </Button>
          </Card>
        </div>
      )}

      {activeTab === "account" && (
        <div className="space-y-6">
          {/* Current User */}
          <Card>
            <h3 className="font-semibold text-white mb-4">Current User (DEV MODE)</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] flex items-center justify-center text-2xl font-bold text-[#0D0D2A]">
                {devStore.getCurrentUser().name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-semibold text-white text-lg">{devStore.getCurrentUser().name}</p>
                <p className="text-[#676986]">{devStore.getCurrentUser().email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="info">{devStore.getCurrentUser().role}</Badge>
                  <Badge variant="default">{devStore.getCurrentUser().department}</Badge>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#676986] mt-4 pt-4 border-t border-white/10">
              V2: Google OAuth authentication will replace dev mode user switching
            </p>
          </Card>

          {/* Notifications (Stub) */}
          <Card className="opacity-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Notifications</h3>
              <Badge variant="default">V2</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#676986]" />
                  <span className="text-[#a8a8a8]">Email notifications</span>
                </div>
                <div className="w-10 h-6 bg-[#1a1a3e] rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#676986]" />
                  <span className="text-[#a8a8a8]">Push notifications</span>
                </div>
                <div className="w-10 h-6 bg-[#1a1a3e] rounded-full" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Data?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-[#ff6b6b]/10 rounded-xl border border-[#ff6b6b]/20">
            <AlertTriangle className="w-5 h-5 text-[#ff6b6b] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-white">This action cannot be undone</p>
              <p className="text-sm text-[#a8a8a8]">
                All channels, messages, tasks, goals, files, and other data will be deleted and replaced with demo data.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowResetModal(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={() => {
                devStore.reset();
                window.location.reload();
              }}
            >
              Reset Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Connector Card Component
function ConnectorCard({
  connector,
  icon,
  name,
  description,
  docsUrl,
  envVars,
  hasFileImport = false,
}: {
  connector?: Connector;
  icon: React.ReactNode;
  name: string;
  description: string;
  docsUrl: string;
  envVars: string[];
  hasFileImport?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfig, setShowConfig] = useState(false);

  const isConnected = connector?.status === "connected";

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isConnected ? "bg-[#6BCB77]/20 text-[#6BCB77]" : "bg-white/5 text-[#676986]"
          }`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-white">{name}</h3>
            <p className="text-xs text-[#676986]">{description}</p>
          </div>
        </div>
        <Badge variant={isConnected ? "success" : "default"}>
          {isConnected ? "Connected" : "Not Connected"}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* V1: CSV Import */}
        <div className="p-3 bg-[#1a1a3e] rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#e3f98a] uppercase tracking-wider">V1: CSV Import</span>
            <Badge variant="success" size="sm">Available</Badge>
          </div>
          <p className="text-xs text-[#676986] mb-2">Import data manually via CSV file</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              // Handle CSV import - in real implementation this would parse and store data
              console.log("CSV import for", name, e.target.files?.[0]);
            }}
          />
        </div>

        {/* V2: OAuth/API */}
        <div className="p-3 bg-[#1a1a3e]/50 rounded-xl opacity-60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#676986] uppercase tracking-wider">V2: API Integration</span>
            <Badge variant="default" size="sm">Coming Soon</Badge>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs text-[#65cdd8] hover:underline"
          >
            {showConfig ? "Hide" : "Show"} required env vars
          </button>
          {showConfig && (
            <div className="mt-2 space-y-1 font-mono text-xs">
              {envVars.map((v) => (
                <div key={v} className="p-1.5 bg-[#0D0D2A] rounded text-[#676986]">
                  {v}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Google Drive specific: Folder ID input */}
        {hasFileImport && (
          <div className="p-3 bg-[#1a1a3e]/50 rounded-xl opacity-60">
            <Input
              label="Google Drive Folder ID (V2)"
              placeholder="Enter folder ID to index"
              disabled
              className="opacity-50"
            />
            <Button variant="secondary" size="sm" className="w-full mt-2" disabled>
              Index Drive (V2)
            </Button>
          </div>
        )}
      </div>

      {/* Docs Link */}
      <a
        href={docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-xs text-[#65cdd8] hover:underline mt-3 pt-3 border-t border-white/5"
      >
        View API Documentation →
      </a>
    </Card>
  );
}
