"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Hash,
  Send,
  Smile,
  MessageSquare,
  Target,
  CheckSquare,
  Zap,
  Archive,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Plus,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Bell,
  BellOff,
  AlertCircle,
  Sparkles,
  BarChart3,
  Search,
} from "lucide-react";
import { Card, Button, Avatar, Modal, Textarea, Input } from "@/components/ui";

// ============ TYPES (matching thread-system.ts) ============

type ThreadType = 'task' | 'goal' | 'decision' | 'discussion' | 'standup' | 'meeting' | 'incident' | 'celebration';
type ThreadStatus = 'active' | 'waiting' | 'resolved' | 'archived';
type NotificationLevel = 'all' | 'mentions' | 'decisions' | 'none';

interface ThreadMember {
  userId: string;
  name: string;
  role: 'owner' | 'contributor' | 'observer';
  notificationLevel: NotificationLevel;
  unreadCount: number;
}

interface Message {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  type: 'message' | 'decision' | 'action' | 'ai_summary' | 'system';
  reactions: { emoji: string; userIds: string[] }[];
}

interface Decision {
  id: string;
  content: string;
  madeBy: string;
  madeAt: string;
  status: 'proposed' | 'approved' | 'rejected';
}

interface Thread {
  id: string;
  type: ThreadType;
  title: string;
  description?: string;
  status: ThreadStatus;
  linkedTaskId?: string;
  linkedGoalId?: string;
  groupId?: string;
  tags: string[];
  priority: 'urgent' | 'high' | 'normal' | 'low';
  members: ThreadMember[];
  messages: Message[];
  decisions: Decision[];
  aiSummary?: string;
  keyPoints: string[];
  actionItems: string[];
  createdAt: string;
  createdBy: string;
  lastActivity: string;
  metrics: {
    messageCount: number;
    participantCount: number;
    decisionCount: number;
  };
}

interface Group {
  id: string;
  name: string;
  type: 'department' | 'project' | 'cross-functional';
  memberCount: number;
}

// ============ MOCK DATA ============

const MOCK_GROUPS: Group[] = [
  { id: 'group_all', name: 'All Threads', type: 'cross-functional', memberCount: 60 },
  { id: 'group_growth', name: 'Growth', type: 'department', memberCount: 8 },
  { id: 'group_retail', name: 'Retail', type: 'department', memberCount: 12 },
  { id: 'group_ops', name: 'Operations', type: 'department', memberCount: 10 },
  { id: 'group_product', name: 'Product', type: 'department', memberCount: 6 },
  { id: 'group_exec', name: 'Executive', type: 'cross-functional', memberCount: 5 },
];

const generateMockThreads = (): Thread[] => [
  {
    id: 'thread_1',
    type: 'decision',
    title: 'Q1 Spend Cap Approval',
    description: 'Decide on ad spend limits for Q1 based on CAC trends',
    status: 'active',
    linkedGoalId: 'goal_dtc',
    groupId: 'group_growth',
    tags: ['spend', 'q1', 'urgent'],
    priority: 'urgent',
    members: [
      { userId: 'aaron', name: 'Aaron', role: 'owner', notificationLevel: 'all', unreadCount: 0 },
      { userId: 'al', name: 'Al Huynh', role: 'contributor', notificationLevel: 'all', unreadCount: 2 },
      { userId: 'brian', name: 'Brian Dewey', role: 'observer', notificationLevel: 'decisions', unreadCount: 0 },
    ],
    messages: [
      { id: 'msg_1', threadId: 'thread_1', authorId: 'al', authorName: 'Al Huynh', content: 'CAC is trending at $52, down from $58 last week. We have room to scale.', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'message', reactions: [{ emoji: 'thumbsup', userIds: ['aaron'] }] },
      { id: 'msg_2', threadId: 'thread_1', authorId: 'aaron', authorName: 'Aaron', content: 'Great progress. What\'s the max we can push without breaking payback?', timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'message', reactions: [] },
      { id: 'msg_3', threadId: 'thread_1', authorId: 'al', authorName: 'Al Huynh', content: 'Based on the Growth Generator model, we can safely go to $220k/week if we maintain current conversion rates.', timestamp: new Date(Date.now() - 900000).toISOString(), type: 'message', reactions: [] },
    ],
    decisions: [
      { id: 'dec_1', content: 'Increase spend cap to $200k/week starting Monday', madeBy: 'aaron', madeAt: new Date().toISOString(), status: 'proposed' },
    ],
    aiSummary: 'Discussion about Q1 spend optimization. CAC has improved to $52. Team is proposing $200k/week spend cap increase.',
    keyPoints: ['CAC down to $52', 'Growth Generator supports $220k/week', 'Proposal for $200k starting Monday'],
    actionItems: ['Al to prepare spend schedule', 'Aaron to approve final cap'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'al',
    lastActivity: new Date(Date.now() - 900000).toISOString(),
    metrics: { messageCount: 3, participantCount: 3, decisionCount: 1 },
  },
  {
    id: 'thread_2',
    type: 'task',
    title: 'Retail Velocity Report - Week 2',
    description: 'Weekly velocity analysis for retail accounts',
    status: 'active',
    linkedTaskId: 'task_velocity',
    groupId: 'group_retail',
    tags: ['retail', 'weekly', 'report'],
    priority: 'high',
    members: [
      { userId: 'niall', name: 'Niall Little', role: 'owner', notificationLevel: 'all', unreadCount: 1 },
      { userId: 'brian', name: 'Brian Dewey', role: 'contributor', notificationLevel: 'mentions', unreadCount: 0 },
    ],
    messages: [
      { id: 'msg_4', threadId: 'thread_2', authorId: 'niall', authorName: 'Niall Little', content: 'Week 2 data is in. Velocity coupling is holding at 0.14 alpha - right on target.', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'message', reactions: [{ emoji: 'fire', userIds: ['brian'] }] },
    ],
    decisions: [],
    aiSummary: 'Weekly retail velocity update. Alpha holding steady at 0.14.',
    keyPoints: ['Alpha at 0.14', 'On target for Q1'],
    actionItems: ['Generate executive summary'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    createdBy: 'niall',
    lastActivity: new Date(Date.now() - 7200000).toISOString(),
    metrics: { messageCount: 1, participantCount: 2, decisionCount: 0 },
  },
  {
    id: 'thread_3',
    type: 'meeting',
    title: 'Weekly ELT Sync - Jan 13',
    description: 'Executive leadership team weekly sync',
    status: 'resolved',
    groupId: 'group_exec',
    tags: ['elt', 'weekly', 'sync'],
    priority: 'normal',
    members: [
      { userId: 'aaron', name: 'Aaron', role: 'owner', notificationLevel: 'all', unreadCount: 0 },
      { userId: 'dan', name: 'Dan', role: 'contributor', notificationLevel: 'all', unreadCount: 0 },
      { userId: 'abla', name: 'Abla Jad', role: 'contributor', notificationLevel: 'all', unreadCount: 0 },
      { userId: 'andrea', name: 'Andrea Golan', role: 'contributor', notificationLevel: 'all', unreadCount: 0 },
    ],
    messages: [
      { id: 'msg_5', threadId: 'thread_3', authorId: 'system', authorName: 'AI Assistant', content: '**Meeting Summary**\n\nKey decisions made:\n- AP vendor payments on track\n- Q1 spend cap approved at $200k/week\n- Regulatory timeline confirmed\n\nAction items assigned to respective owners.', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), type: 'ai_summary', reactions: [] },
    ],
    decisions: [
      { id: 'dec_2', content: 'AP vendor payments continue on current schedule', madeBy: 'dan', madeAt: new Date(Date.now() - 3600000 * 4).toISOString(), status: 'approved' },
      { id: 'dec_3', content: 'Regulatory reformulation planning starts in Q2', madeBy: 'andrea', madeAt: new Date(Date.now() - 3600000 * 4).toISOString(), status: 'approved' },
    ],
    aiSummary: 'Weekly ELT sync completed. AP payments on track, spend cap approved, regulatory timeline set.',
    keyPoints: ['AP payments on schedule', 'Spend cap $200k/week', 'Regulatory planning Q2'],
    actionItems: [],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdBy: 'aaron',
    lastActivity: new Date(Date.now() - 3600000 * 4).toISOString(),
    metrics: { messageCount: 1, participantCount: 4, decisionCount: 2 },
  },
  {
    id: 'thread_4',
    type: 'celebration',
    title: 'CAC Below $50 Milestone!',
    description: 'First time hitting sub-$50 CAC',
    status: 'active',
    groupId: 'group_growth',
    tags: ['win', 'cac', 'milestone'],
    priority: 'low',
    members: [
      { userId: 'al', name: 'Al Huynh', role: 'owner', notificationLevel: 'all', unreadCount: 0 },
      { userId: 'amy', name: 'Amy Endemann', role: 'contributor', notificationLevel: 'mentions', unreadCount: 0 },
    ],
    messages: [
      { id: 'msg_6', threadId: 'thread_4', authorId: 'al', authorName: 'Al Huynh', content: 'We hit $49.80 CAC yesterday! First time ever sub-$50. Creative optimizations are paying off.', timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'message', reactions: [{ emoji: 'tada', userIds: ['amy', 'aaron', 'brian'] }, { emoji: 'rocket', userIds: ['amy'] }] },
    ],
    decisions: [],
    aiSummary: 'Celebration of hitting sub-$50 CAC milestone.',
    keyPoints: ['CAC at $49.80', 'Creative optimizations working'],
    actionItems: [],
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    createdBy: 'al',
    lastActivity: new Date(Date.now() - 1800000).toISOString(),
    metrics: { messageCount: 1, participantCount: 2, decisionCount: 0 },
  },
];

// ============ COMPONENT ============

const EMOJI_OPTIONS = ["thumbsup", "heart", "fire", "tada", "rocket", "eyes", "think", "100"];

const emojiMap: Record<string, string> = {
  thumbsup: "👍",
  heart: "❤️",
  fire: "🔥",
  tada: "🎉",
  rocket: "🚀",
  eyes: "👀",
  think: "🤔",
  "100": "💯",
};

const typeIcons: Record<ThreadType, React.ReactNode> = {
  task: <CheckSquare className="w-4 h-4" />,
  goal: <Target className="w-4 h-4" />,
  decision: <Zap className="w-4 h-4" />,
  discussion: <MessageSquare className="w-4 h-4" />,
  standup: <Users className="w-4 h-4" />,
  meeting: <Users className="w-4 h-4" />,
  incident: <AlertCircle className="w-4 h-4" />,
  celebration: <Sparkles className="w-4 h-4" />,
};

const typeColors: Record<ThreadType, string> = {
  task: 'text-[#8533fc]',
  goal: 'text-[#65cdd8]',
  decision: 'text-[#e3f98a]',
  discussion: 'text-[#a8a8a8]',
  standup: 'text-[#65cdd8]',
  meeting: 'text-[#65cdd8]',
  incident: 'text-[#ff6b6b]',
  celebration: 'text-[#ffce33]',
};

const statusConfig: Record<ThreadStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Active', color: 'bg-green-500/20 text-green-400', icon: <Clock className="w-3 h-3" /> },
  waiting: { label: 'Waiting', color: 'bg-yellow-500/20 text-yellow-400', icon: <Clock className="w-3 h-3" /> },
  resolved: { label: 'Resolved', color: 'bg-blue-500/20 text-blue-400', icon: <CheckCircle className="w-3 h-3" /> },
  archived: { label: 'Archived', color: 'bg-gray-500/20 text-gray-400', icon: <Archive className="w-3 h-3" /> },
};

export default function ChannelsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [groups] = useState<Group[]>(MOCK_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<Group>(MOCK_GROUPS[0]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ThreadStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ThreadType | 'all'>('all');
  const [showEffectiveness, setShowEffectiveness] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = 'aaron'; // Would come from auth

  useEffect(() => {
    setThreads(generateMockThreads());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages]);

  // Filter threads
  const filteredThreads = threads.filter(thread => {
    // Group filter
    if (selectedGroup.id !== 'group_all' && thread.groupId !== selectedGroup.id) return false;
    // Status filter
    if (statusFilter !== 'all' && thread.status !== statusFilter) return false;
    // Type filter
    if (typeFilter !== 'all' && thread.type !== typeFilter) return false;
    // Search filter
    if (searchQuery && !thread.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calculate unread count for current user
  const getTotalUnread = () => {
    return threads.reduce((total, thread) => {
      const member = thread.members.find(m => m.userId === currentUserId);
      return total + (member?.unreadCount || 0);
    }, 0);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;

    const updatedThread = { ...selectedThread };
    updatedThread.messages.push({
      id: `msg_${Date.now()}`,
      threadId: selectedThread.id,
      authorId: currentUserId,
      authorName: 'Aaron',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'message',
      reactions: [],
    });
    updatedThread.lastActivity = new Date().toISOString();
    updatedThread.metrics.messageCount++;

    setSelectedThread(updatedThread);
    setThreads(threads.map(t => t.id === updatedThread.id ? updatedThread : t));
    setNewMessage("");
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    if (!selectedThread) return;

    const updatedThread = { ...selectedThread };
    const message = updatedThread.messages.find(m => m.id === messageId);
    if (!message) return;

    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      if (existingReaction.userIds.includes(currentUserId)) {
        existingReaction.userIds = existingReaction.userIds.filter(id => id !== currentUserId);
      } else {
        existingReaction.userIds.push(currentUserId);
      }
    } else {
      message.reactions.push({ emoji, userIds: [currentUserId] });
    }

    setSelectedThread(updatedThread);
    setThreads(threads.map(t => t.id === updatedThread.id ? updatedThread : t));
    setShowEmojiPicker(null);
  };

  const resolveThread = () => {
    if (!selectedThread) return;

    const updatedThread = { ...selectedThread, status: 'resolved' as ThreadStatus };
    setSelectedThread(updatedThread);
    setThreads(threads.map(t => t.id === updatedThread.id ? updatedThread : t));
  };

  // Effectiveness metrics (from learning layer)
  const effectivenessScore = {
    overall: 72,
    contextSwitching: 65,
    resolutionTime: 78,
    decisionVelocity: 80,
    satisfaction: 70,
  };

  return (
    <div className="h-screen flex">
      {/* Left Sidebar - Groups & Filters */}
      <div className="hidden md:flex w-72 flex-col bg-[#0D0D2A] border-r border-white/5">
        {/* Header with Effectiveness Score */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-white">Threads</h2>
            <button
              onClick={() => setShowEffectiveness(!showEffectiveness)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Communication Effectiveness"
            >
              <BarChart3 className={`w-4 h-4 ${showEffectiveness ? 'text-[#e3f98a]' : 'text-[#676986]'}`} />
            </button>
          </div>
          <p className="text-xs text-[#676986]">Thread-first communication</p>

          {/* Effectiveness Panel */}
          {showEffectiveness && (
            <div className="mt-3 p-3 bg-[#1a1a3e] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#a8a8a8]">Effectiveness Score</span>
                <span className="text-lg font-bold text-[#e3f98a]">{effectivenessScore.overall}%</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#676986]">Context Switching</span>
                  <span className="text-[#a8a8a8]">{effectivenessScore.contextSwitching}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#676986]">Resolution Time</span>
                  <span className="text-[#a8a8a8]">{effectivenessScore.resolutionTime}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#676986]">Decision Velocity</span>
                  <span className="text-[#a8a8a8]">{effectivenessScore.decisionVelocity}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#676986]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threads..."
              className="w-full bg-[#1a1a3e] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#676986] focus:outline-none focus:border-[#e3f98a]/50"
            />
          </div>
        </div>

        {/* Groups */}
        <div className="px-3 pb-2">
          <div className="text-xs font-medium text-[#676986] uppercase tracking-wider px-2 mb-2">Groups</div>
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                selectedGroup.id === group.id
                  ? "bg-[#e3f98a]/10 text-[#e3f98a]"
                  : "text-[#a8a8a8] hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span className="font-medium">{group.name}</span>
              </div>
              {group.id === 'group_all' && getTotalUnread() > 0 && (
                <span className="px-2 py-0.5 text-xs bg-[#e3f98a] text-[#0D0D2A] rounded-full font-medium">
                  {getTotalUnread()}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="px-3 py-2 border-t border-white/5">
          <div className="text-xs font-medium text-[#676986] uppercase tracking-wider px-2 mb-2">Filters</div>
          <div className="space-y-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ThreadStatus | 'all')}
              className="w-full bg-[#1a1a3e] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e3f98a]/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ThreadType | 'all')}
              className="w-full bg-[#1a1a3e] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#e3f98a]/50"
            >
              <option value="all">All Types</option>
              <option value="task">Tasks</option>
              <option value="decision">Decisions</option>
              <option value="meeting">Meetings</option>
              <option value="discussion">Discussions</option>
              <option value="celebration">Celebrations</option>
            </select>
          </div>
        </div>

        {/* Create Thread Button */}
        <div className="mt-auto p-3 border-t border-white/5">
          <Button className="w-full" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Thread
          </Button>
        </div>
      </div>

      {/* Thread List */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0D0D2A]/50">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-semibold text-white">{selectedGroup.name}</h3>
          <p className="text-xs text-[#676986]">{filteredThreads.length} threads</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="p-4 text-center text-[#676986]">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No threads found</p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const member = thread.members.find(m => m.userId === currentUserId);
              const hasUnread = member && member.unreadCount > 0;

              return (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`w-full p-4 text-left border-b border-white/5 hover:bg-white/5 transition-colors ${
                    selectedThread?.id === thread.id ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${typeColors[thread.type]}`}>
                      {typeIcons[thread.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium truncate ${hasUnread ? 'text-white' : 'text-[#a8a8a8]'}`}>
                          {thread.title}
                        </span>
                        {hasUnread && (
                          <span className="flex-shrink-0 w-2 h-2 bg-[#e3f98a] rounded-full" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#676986]">
                        <span className={`px-1.5 py-0.5 rounded ${statusConfig[thread.status].color}`}>
                          {thread.status}
                        </span>
                        <span>{formatDistanceToNow(new Date(thread.lastActivity), { addSuffix: true })}</span>
                      </div>
                      {thread.aiSummary && (
                        <p className="text-xs text-[#676986] mt-1 line-clamp-2">
                          {thread.aiSummary.slice(0, 100)}...
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Thread View */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedThread ? (
          <>
            {/* Thread Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0D0D2A]/50">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${typeColors[selectedThread.type]}`}>
                  {typeIcons[selectedThread.type]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-semibold text-white">{selectedThread.title}</h1>
                    <span className={`px-2 py-0.5 rounded text-xs ${statusConfig[selectedThread.status].color}`}>
                      {selectedThread.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#676986]">
                    {selectedThread.members.length} members • {selectedThread.metrics.messageCount} messages • {selectedThread.metrics.decisionCount} decisions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedThread.status === 'active' && (
                  <Button variant="secondary" size="sm" onClick={resolveThread}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 flex min-h-0">
              {/* Messages */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* AI Summary Banner */}
                {selectedThread.aiSummary && (
                  <div className="px-6 py-3 bg-[#e3f98a]/5 border-b border-[#e3f98a]/20">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-[#e3f98a] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-[#a8a8a8]">{selectedThread.aiSummary}</p>
                        {selectedThread.keyPoints.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedThread.keyPoints.slice(0, 3).map((point, i) => (
                              <span key={i} className="px-2 py-0.5 bg-[#1a1a3e] rounded text-xs text-[#676986]">
                                {point}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedThread.messages.map((message) => (
                    <div key={message.id} className="group">
                      <div className="flex gap-3 hover:bg-white/5 rounded-lg p-2 -mx-2">
                        <Avatar name={message.authorName} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-white">{message.authorName}</span>
                            {message.type !== 'message' && (
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                message.type === 'decision' ? 'bg-[#e3f98a]/20 text-[#e3f98a]' :
                                message.type === 'ai_summary' ? 'bg-[#65cdd8]/20 text-[#65cdd8]' :
                                message.type === 'action' ? 'bg-[#8533fc]/20 text-[#8533fc]' :
                                'bg-white/10 text-[#676986]'
                              }`}>
                                {message.type.replace('_', ' ')}
                              </span>
                            )}
                            <span className="text-xs text-[#676986]">
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-[#a8a8a8] whitespace-pre-wrap break-words">
                            {message.content}
                          </p>

                          {/* Reactions */}
                          {message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.reactions.filter(r => r.userIds.length > 0).map((reaction) => (
                                <button
                                  key={reaction.emoji}
                                  onClick={() => toggleReaction(message.id, reaction.emoji)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                                    reaction.userIds.includes(currentUserId)
                                      ? 'bg-[#e3f98a]/20 text-[#e3f98a]'
                                      : 'bg-[#1a1a3e] text-[#a8a8a8] hover:bg-[#242445]'
                                  }`}
                                >
                                  <span>{emojiMap[reaction.emoji] || reaction.emoji}</span>
                                  <span>{reaction.userIds.length}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="relative">
                              <button
                                onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                                className="p-1.5 rounded-lg text-[#676986] hover:text-white hover:bg-white/10 transition-colors"
                              >
                                <Smile className="w-4 h-4" />
                              </button>
                              {showEmojiPicker === message.id && (
                                <div className="absolute bottom-full left-0 mb-1 p-2 bg-[#1a1a3e] rounded-xl border border-white/10 flex gap-1 z-10">
                                  {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => toggleReaction(message.id, emoji)}
                                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-lg"
                                    >
                                      {emojiMap[emoji]}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                {selectedThread.status !== 'archived' && (
                  <div className="p-4 border-t border-white/5">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 bg-[#1a1a3e] rounded-xl border border-white/10 focus-within:border-[#e3f98a]/50 transition-colors">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          placeholder={`Message this thread...`}
                          className="w-full bg-transparent px-4 py-3 text-white placeholder-[#676986] resize-none focus:outline-none"
                          rows={1}
                        />
                      </div>
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Thread Context */}
              <div className="hidden xl:block w-80 border-l border-white/5 overflow-y-auto">
                <div className="p-4 space-y-6">
                  {/* Members */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white text-sm">Members ({selectedThread.members.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedThread.members.map((member) => (
                        <div key={member.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                          <div className="flex items-center gap-2">
                            <Avatar name={member.name} size="sm" />
                            <div>
                              <p className="text-sm text-white">{member.name}</p>
                              <p className="text-xs text-[#676986]">{member.role}</p>
                            </div>
                          </div>
                          {member.notificationLevel === 'none' ? (
                            <BellOff className="w-3 h-3 text-[#676986]" />
                          ) : (
                            <Bell className="w-3 h-3 text-[#676986]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decisions */}
                  {selectedThread.decisions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-[#e3f98a]" />
                        <h3 className="font-semibold text-white text-sm">Decisions</h3>
                      </div>
                      <div className="space-y-2">
                        {selectedThread.decisions.map((decision) => (
                          <Card key={decision.id} padding="sm" className="bg-[#e3f98a]/5 border-[#e3f98a]/20">
                            <p className="text-sm text-white">{decision.content}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-[#676986]">
                              <span className={`px-1.5 py-0.5 rounded ${
                                decision.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                decision.status === 'proposed' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {decision.status}
                              </span>
                              <span>by {decision.madeBy}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  {selectedThread.actionItems.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckSquare className="w-4 h-4 text-[#8533fc]" />
                        <h3 className="font-semibold text-white text-sm">Action Items</h3>
                      </div>
                      <div className="space-y-2">
                        {selectedThread.actionItems.map((item, i) => (
                          <Card key={i} padding="sm">
                            <p className="text-sm text-[#a8a8a8]">{item}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs text-[#676986] mb-2">Was this thread helpful?</p>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a3e] rounded-lg text-sm text-[#a8a8a8] hover:text-white hover:bg-white/10 transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                        Yes
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a3e] rounded-lg text-sm text-[#a8a8a8] hover:text-white hover:bg-white/10 transition-colors">
                        <ThumbsDown className="w-3 h-3" />
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[#e3f98a]/10 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-[#e3f98a]" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Thread-First Communication</h2>
            <p className="text-[#676986] max-w-md mb-6">
              Every conversation is a thread with a purpose. Auto-managed membership, AI summaries,
              and automatic archiving when work completes.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div className="p-4 bg-[#1a1a3e] rounded-xl text-left">
                <Brain className="w-5 h-5 text-[#65cdd8] mb-2" />
                <p className="text-sm text-white font-medium">AI Summaries</p>
                <p className="text-xs text-[#676986]">Never read 100 messages again</p>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl text-left">
                <Users className="w-5 h-5 text-[#8533fc] mb-2" />
                <p className="text-sm text-white font-medium">Auto Membership</p>
                <p className="text-xs text-[#676986]">Right people, automatically</p>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl text-left">
                <CheckCircle className="w-5 h-5 text-[#6BCB77] mb-2" />
                <p className="text-sm text-white font-medium">Auto Archive</p>
                <p className="text-xs text-[#676986]">Resolved = hidden</p>
              </div>
              <div className="p-4 bg-[#1a1a3e] rounded-xl text-left">
                <TrendingUp className="w-5 h-5 text-[#e3f98a] mb-2" />
                <p className="text-sm text-white font-medium">Always Learning</p>
                <p className="text-xs text-[#676986]">Gets better with use</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Thread Modal */}
      <CreateThreadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        groups={groups}
        onCreateThread={(thread) => {
          setThreads([thread, ...threads]);
          setSelectedThread(thread);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

// Create Thread Modal
function CreateThreadModal({
  isOpen,
  onClose,
  groups,
  onCreateThread,
}: {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onCreateThread: (thread: Thread) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ThreadType>("discussion");
  const [groupId, setGroupId] = useState("group_all");
  const [priority, setPriority] = useState<Thread['priority']>("normal");

  const createThread = () => {
    if (!title.trim()) return;

    const newThread: Thread = {
      id: `thread_${Date.now()}`,
      type,
      title,
      description,
      status: 'active',
      groupId,
      tags: [],
      priority,
      members: [
        { userId: 'aaron', name: 'Aaron', role: 'owner', notificationLevel: 'all', unreadCount: 0 },
      ],
      messages: [
        {
          id: `msg_${Date.now()}`,
          threadId: `thread_${Date.now()}`,
          authorId: 'system',
          authorName: 'System',
          content: `Thread created: ${title}`,
          timestamp: new Date().toISOString(),
          type: 'system',
          reactions: [],
        },
      ],
      decisions: [],
      keyPoints: [],
      actionItems: [],
      createdAt: new Date().toISOString(),
      createdBy: 'aaron',
      lastActivity: new Date().toISOString(),
      metrics: { messageCount: 1, participantCount: 1, decisionCount: 0 },
    };

    onCreateThread(newThread);
    setTitle("");
    setDescription("");
    setType("discussion");
    setPriority("normal");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Thread" size="md">
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's this thread about?"
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more context..."
          rows={2}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#a8a8a8] mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ThreadType)}
              className="w-full bg-[#1a1a3e] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#e3f98a]/50"
            >
              <option value="discussion">Discussion</option>
              <option value="task">Task</option>
              <option value="decision">Decision</option>
              <option value="meeting">Meeting</option>
              <option value="incident">Incident</option>
              <option value="celebration">Celebration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#a8a8a8] mb-2">Group</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full bg-[#1a1a3e] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#e3f98a]/50"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a8a8a8] mb-2">Priority</label>
          <div className="flex gap-2">
            {(['low', 'normal', 'high', 'urgent'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  priority === p
                    ? p === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                      p === 'high' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                      'bg-[#e3f98a]/20 text-[#e3f98a] border border-[#e3f98a]/50'
                    : 'bg-[#1a1a3e] text-[#a8a8a8] hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={createThread} disabled={!title.trim()}>
            Create Thread
          </Button>
        </div>
      </div>
    </Modal>
  );
}
