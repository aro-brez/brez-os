"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  Database,
  Upload,
  Search,
  FileSpreadsheet,
  FileText,
  Image,
  Film,
  File as FileIcon,
  Trash2,
  Download,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  ShoppingBag,
  BarChart3,
  DollarSign,
  Megaphone,
  Settings,
  Users,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card, Button, Badge, Modal, Input, Textarea, EmptyState } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { File } from "@/lib/data/schemas";
import { brain, DATA_SOURCES, DataSource } from "@/lib/ai/brain";

const DEPARTMENT_ICONS: Record<string, React.ReactNode> = {
  marketing: <Megaphone className="w-4 h-4" />,
  sales: <ShoppingBag className="w-4 h-4" />,
  finance: <DollarSign className="w-4 h-4" />,
  operations: <Settings className="w-4 h-4" />,
  product: <BarChart3 className="w-4 h-4" />,
  exec: <Users className="w-4 h-4" />,
};

const DEPARTMENT_COLORS: Record<string, string> = {
  marketing: "#8533fc",
  sales: "#65cdd8",
  finance: "#6BCB77",
  operations: "#ffce33",
  product: "#ff6b6b",
  exec: "#e3f98a",
};

export default function DataHubPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"sources" | "files">("sources");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    setFiles(devStore.getFiles());
  };

  const dataStatus = brain.getDataSourceStatus();
  const connectedCount = DATA_SOURCES.filter(d => d.status === "connected").length;
  const disconnectedCount = DATA_SOURCES.filter(d => d.status === "disconnected" || d.status === "missing").length;

  const filteredFiles = searchQuery
    ? devStore.searchFiles(searchQuery)
    : files;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="w-6 h-6 text-[#65cdd8]" />;
    if (mimeType.startsWith("video/")) return <Film className="w-6 h-6 text-[#8533fc]" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("csv")) return <FileSpreadsheet className="w-6 h-6 text-[#6BCB77]" />;
    if (mimeType.includes("pdf")) return <FileText className="w-6 h-6 text-[#ff6b6b]" />;
    return <FileIcon className="w-6 h-6 text-[#a8a8a8]" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      const url = URL.createObjectURL(file);

      devStore.addFile({
        name: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        tags: [],
        uploadedBy: devStore.getCurrentUser().id,
        linkedChannelId: null,
        linkedGoalId: null,
        linkedTaskId: null,
        source: "upload",
      });
    });

    loadFiles();
  };

  const deleteFile = (fileId: string) => {
    devStore.deleteFile(fileId);
    loadFiles();
    setSelectedFile(null);
  };

  const getStatusIcon = (status: DataSource["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-[#6BCB77]" />;
      case "needs_update":
        return <Clock className="w-5 h-5 text-[#ffce33]" />;
      case "disconnected":
        return <AlertCircle className="w-5 h-5 text-[#ff6b6b]" />;
      case "missing":
        return <Plus className="w-5 h-5 text-[#676986]" />;
    }
  };

  const getStatusText = (status: DataSource["status"]) => {
    switch (status) {
      case "connected": return "Connected";
      case "needs_update": return "Needs Update";
      case "disconnected": return "Disconnected";
      case "missing": return "Not Set Up";
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Database className="w-8 h-8 text-[#e3f98a]" />
            Data Hub
          </h1>
          <p className="text-[#676986] mt-1">Connect data sources to power AI recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a3e] rounded-xl border border-white/5">
            <CheckCircle className="w-4 h-4 text-[#6BCB77]" />
            <span className="text-sm text-white">{connectedCount} Connected</span>
            <span className="text-[#676986]">•</span>
            <AlertCircle className="w-4 h-4 text-[#ff6b6b]" />
            <span className="text-sm text-white">{disconnectedCount} Missing</span>
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      {dataStatus.recommendations.length > 0 && (
        <Card className="mb-6 bg-gradient-to-r from-[#e3f98a]/10 to-[#65cdd8]/10 border-[#e3f98a]/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e3f98a] to-[#65cdd8] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#0D0D2A]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">AI Recommendations</h3>
              <ul className="space-y-2">
                {dataStatus.recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#a8a8a8]">
                    <ArrowRight className="w-4 h-4 text-[#e3f98a] flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#1a1a3e] rounded-xl w-fit mb-6">
        <button
          onClick={() => setActiveTab("sources")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "sources"
              ? "bg-[#e3f98a] text-[#0D0D2A]"
              : "text-[#676986] hover:text-white"
          }`}
        >
          Data Sources ({DATA_SOURCES.length})
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "files"
              ? "bg-[#e3f98a] text-[#0D0D2A]"
              : "text-[#676986] hover:text-white"
          }`}
        >
          Files ({files.length})
        </button>
      </div>

      {activeTab === "sources" ? (
        <>
          {/* Data Sources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DATA_SOURCES.map((source) => (
              <Card
                key={source.id}
                hover
                className="cursor-pointer"
                onClick={() => {
                  setSelectedSource(source);
                  setShowConnectModal(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${DEPARTMENT_COLORS[source.department]}20` }}
                    >
                      <span style={{ color: DEPARTMENT_COLORS[source.department] }}>
                        {DEPARTMENT_ICONS[source.department]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{source.name}</h3>
                      <p className="text-xs text-[#676986] capitalize">{source.department}</p>
                    </div>
                  </div>
                  {getStatusIcon(source.status)}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#a8a8a8]">{getStatusText(source.status)}</span>
                  <Badge
                    variant={source.priority === "critical" ? "danger" : source.priority === "high" ? "warning" : "default"}
                    size="sm"
                  >
                    {source.priority}
                  </Badge>
                </div>

                {source.dataPoints && (
                  <div className="flex flex-wrap gap-1">
                    {source.dataPoints.slice(0, 4).map((point) => (
                      <span
                        key={point}
                        className="px-2 py-0.5 bg-white/5 rounded text-xs text-[#676986]"
                      >
                        {point}
                      </span>
                    ))}
                    {source.dataPoints.length > 4 && (
                      <span className="px-2 py-0.5 text-xs text-[#676986]">
                        +{source.dataPoints.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {source.lastSync && (
                  <p className="text-xs text-[#676986] mt-3">
                    Last synced: {format(new Date(source.lastSync), "MMM d, h:mm a")}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Files Section */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Search files by name, tags, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4" />
              Upload CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {filteredFiles.length === 0 ? (
            <EmptyState
              icon={<FileSpreadsheet className="w-8 h-8 text-[#676986]" />}
              title={searchQuery ? "No files found" : "No files yet"}
              description={searchQuery ? "Try a different search term" : "Upload CSV files to import data"}
              action={
                !searchQuery && (
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </Button>
                )
              }
            />
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => {
                const uploader = devStore.getUser(file.uploadedBy);
                return (
                  <Card
                    key={file.id}
                    hover
                    onClick={() => setSelectedFile(file)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#0D0D2A] rounded-lg flex items-center justify-center flex-shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{file.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-[#676986]">
                          <span>{formatFileSize(file.size)}</span>
                          <span>{format(new Date(file.createdAt), "MMM d, yyyy")}</span>
                          <span>by {uploader?.name}</span>
                        </div>
                      </div>
                      {file.tags.length > 0 && (
                        <div className="flex gap-1">
                          {file.tags.map((tag) => (
                            <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Connect Data Source Modal */}
      <Modal
        isOpen={showConnectModal}
        onClose={() => {
          setShowConnectModal(false);
          setSelectedSource(null);
        }}
        title={`Connect ${selectedSource?.name || "Data Source"}`}
        size="md"
      >
        {selectedSource && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${DEPARTMENT_COLORS[selectedSource.department]}20` }}
              >
                <span style={{ color: DEPARTMENT_COLORS[selectedSource.department] }}>
                  {DEPARTMENT_ICONS[selectedSource.department]}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">{selectedSource.name}</h3>
                <p className="text-sm text-[#676986] capitalize">{selectedSource.department} • {selectedSource.type}</p>
              </div>
            </div>

            <div className="p-4 bg-[#0D0D2A] rounded-xl">
              <h4 className="font-medium text-white mb-2">Data Points Available</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSource.dataPoints?.map((point) => (
                  <Badge key={point} variant="info" size="sm">{point}</Badge>
                ))}
              </div>
            </div>

            {selectedSource.type === "csv" ? (
              <div className="space-y-4">
                <p className="text-sm text-[#a8a8a8]">
                  Upload a CSV file to import {selectedSource.name.toLowerCase()} data.
                </p>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
                  <Upload className="w-8 h-8 text-[#676986] mx-auto mb-3" />
                  <p className="text-sm text-[#676986] mb-4">Drag and drop or click to upload</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowConnectModal(false);
                    }}
                  >
                    Select File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[#a8a8a8]">
                  Connect your {selectedSource.name} account to automatically sync data.
                </p>
                <Input
                  label="API Key or Access Token"
                  type="password"
                  placeholder="Enter your API key..."
                />
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setShowConnectModal(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={() => setShowConnectModal(false)}>
                    <LinkIcon className="w-4 h-4" />
                    Connect
                  </Button>
                </div>
                <p className="text-xs text-[#676986] text-center">
                  <ExternalLink className="w-3 h-3 inline mr-1" />
                  <a href="#" className="text-[#65cdd8] hover:underline">
                    How to get your {selectedSource.name} API key
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* File Details Modal */}
      <FileDetailsModal
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={deleteFile}
      />
    </div>
  );
}

function FileDetailsModal({
  file,
  onClose,
  onDelete,
}: {
  file: File | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (file) {
      setTags(file.tags);
      setNotes(file.notes || "");
    }
  }, [file]);

  if (!file) return null;

  const uploader = devStore.getUser(file.uploadedBy);

  const addTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    setTags([...tags, newTag.trim()]);
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Image className="w-8 h-8 text-[#65cdd8]" />;
    if (mimeType.startsWith("video/")) return <Film className="w-8 h-8 text-[#8533fc]" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("csv")) return <FileSpreadsheet className="w-8 h-8 text-[#6BCB77]" />;
    if (mimeType.includes("pdf")) return <FileText className="w-8 h-8 text-[#ff6b6b]" />;
    return <FileIcon className="w-8 h-8 text-[#a8a8a8]" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal isOpen={!!file} onClose={onClose} title="File Details" size="md">
      <div className="space-y-6">
        {/* Preview */}
        <div className="aspect-video bg-[#0D0D2A] rounded-xl flex items-center justify-center overflow-hidden">
          {file.mimeType.startsWith("image/") ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="text-center">
              {getFileIcon(file.mimeType)}
              <p className="text-sm text-[#676986] mt-2">{file.mimeType}</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h3 className="font-semibold text-white text-lg mb-2">{file.name}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[#676986]">Size</p>
              <p className="text-white">{formatFileSize(file.size)}</p>
            </div>
            <div>
              <p className="text-[#676986]">Uploaded</p>
              <p className="text-white">{format(new Date(file.createdAt), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-[#676986]">By</p>
              <p className="text-white">{uploader?.name}</p>
            </div>
            <div>
              <p className="text-[#676986]">Source</p>
              <p className="text-white capitalize">{file.source.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-[#a8a8a8] mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="info" size="md">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-white"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              className="flex-1"
            />
            <Button variant="secondary" onClick={addTag}>Add</Button>
          </div>
        </div>

        {/* Notes */}
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this file..."
          rows={3}
        />

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-white/10">
          <Button variant="danger" onClick={() => onDelete(file.id)}>
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => window.open(file.url, "_blank")}>
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
