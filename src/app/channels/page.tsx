"use client";

import { useState, useEffect, useRef } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Hash,
  Send,
  Smile,
  Phone,
  Target,
  CheckSquare,
  Reply,
  Zap,
} from "lucide-react";
import { Card, Button, Avatar, Badge, Modal, Textarea } from "@/components/ui";
import { devStore } from "@/lib/data/devStore";
import { Channel, Message, Department } from "@/lib/data/schemas";
import { getNextBestAction } from "@/lib/ai/prioritizer";

const EMOJI_OPTIONS = ["thumbsup", "heart", "fire", "tada", "rocket", "eyes", "think", "100"];

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showHuddleModal, setShowHuddleModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = devStore.getCurrentUser();

  useEffect(() => {
    const allChannels = devStore.getChannels();
    setChannels(allChannels);
    if (allChannels.length > 0 && !selectedChannel) {
      setSelectedChannel(allChannels[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      const channelMessages = devStore.getMessages(selectedChannel.id);
      setMessages(channelMessages.filter((m) => !m.parentId));
    }
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;

    devStore.addMessage({
      channelId: selectedChannel.id,
      parentId: replyingTo?.id || null,
      authorId: currentUser.id,
      content: newMessage,
      attachments: [],
      reactions: [],
      mentions: [],
    });

    setNewMessage("");
    setReplyingTo(null);

    // Refresh messages
    const channelMessages = devStore.getMessages(selectedChannel.id);
    setMessages(channelMessages.filter((m) => !m.parentId));
  };

  const toggleReaction = (messageId: string, emoji: string) => {
    devStore.addReaction(messageId, emoji, currentUser.id);
    // Refresh messages
    if (selectedChannel) {
      const channelMessages = devStore.getMessages(selectedChannel.id);
      setMessages(channelMessages.filter((m) => !m.parentId));
    }
    setShowEmojiPicker(null);
  };

  const getUser = (userId: string) => devStore.getUser(userId);
  const getThreadReplies = (parentId: string) => devStore.getThreadReplies(parentId);

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

  return (
    <div className="h-screen flex">
      {/* Channel List - Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-[#0D0D2A] border-r border-white/5">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Channels</h2>
          <p className="text-xs text-[#676986]">Team communication</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                selectedChannel?.id === channel.id
                  ? "bg-[#e3f98a]/10 text-[#e3f98a]"
                  : "text-[#a8a8a8] hover:bg-white/5 hover:text-white"
              }`}
            >
              <Hash className="w-4 h-4" />
              <span className="font-medium truncate">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0D0D2A]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e3f98a]/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-[#e3f98a]" />
                </div>
                <div>
                  <h1 className="font-semibold text-white">{selectedChannel.name}</h1>
                  <p className="text-xs text-[#676986]">{selectedChannel.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowHuddleModal(true)}
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Huddle</span>
                </Button>
              </div>
            </div>

            <div className="flex-1 flex min-h-0">
              {/* Messages */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Hash className="w-12 h-12 text-[#676986] mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Welcome to #{selectedChannel.name}
                      </h3>
                      <p className="text-sm text-[#676986] max-w-md">
                        This is the beginning of the {selectedChannel.name} channel.
                        Start a conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const author = getUser(message.authorId);
                      const replies = getThreadReplies(message.id);

                      return (
                        <div key={message.id} className="group">
                          <div className="flex gap-3 hover:bg-white/5 rounded-lg p-2 -mx-2">
                            <Avatar name={author?.name || "Unknown"} size="md" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-semibold text-white">
                                  {author?.name || "Unknown"}
                                </span>
                                <span className="text-xs text-[#676986]">
                                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-[#a8a8a8] whitespace-pre-wrap break-words">
                                {message.content}
                              </p>

                              {/* Reactions */}
                              {message.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {Object.entries(
                                    message.reactions.reduce((acc, r) => {
                                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                      return acc;
                                    }, {} as Record<string, number>)
                                  ).map(([emoji, count]) => (
                                    <button
                                      key={emoji}
                                      onClick={() => toggleReaction(message.id, emoji)}
                                      className="flex items-center gap-1 px-2 py-0.5 bg-[#1a1a3e] rounded-full text-xs hover:bg-[#242445] transition-colors"
                                    >
                                      <span>{emojiMap[emoji] || emoji}</span>
                                      <span className="text-[#a8a8a8]">{count}</span>
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Thread Replies Preview */}
                              {replies.length > 0 && (
                                <button className="flex items-center gap-2 mt-2 text-xs text-[#65cdd8] hover:underline">
                                  <Reply className="w-3 h-3" />
                                  {replies.length} {replies.length === 1 ? "reply" : "replies"}
                                </button>
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
                                <button
                                  onClick={() => setReplyingTo(message)}
                                  className="p-1.5 rounded-lg text-[#676986] hover:text-white hover:bg-white/10 transition-colors"
                                >
                                  <Reply className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply Banner */}
                {replyingTo && (
                  <div className="px-4 py-2 bg-[#1a1a3e] border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Reply className="w-4 h-4 text-[#65cdd8]" />
                      <span className="text-[#676986]">Replying to</span>
                      <span className="text-white font-medium">
                        {getUser(replyingTo.authorId)?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="text-[#676986] hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Message Input */}
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
                        placeholder={`Message #${selectedChannel.name}`}
                        className="w-full bg-transparent px-4 py-3 text-white placeholder-[#676986] resize-none focus:outline-none"
                        rows={1}
                      />
                    </div>
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - Channel Context */}
              <div className="hidden lg:block w-80 border-l border-white/5 overflow-y-auto">
                <div className="p-4 space-y-6">
                  {/* Next Best Action */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-[#e3f98a]" />
                      <h3 className="font-semibold text-white text-sm">Next Best Action</h3>
                    </div>
                    <Card padding="sm" className="bg-[#e3f98a]/5 border-[#e3f98a]/20">
                      <p className="text-sm text-white">
                        {getNextBestAction(selectedChannel.department as Department).action}
                      </p>
                    </Card>
                  </div>

                  {/* Department Goals */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-[#65cdd8]" />
                      <h3 className="font-semibold text-white text-sm">Goals</h3>
                    </div>
                    <div className="space-y-2">
                      {devStore.getGoalsByDepartment(selectedChannel.department as Department).slice(0, 3).map((goal) => (
                        <Card key={goal.id} padding="sm" hover>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm text-white font-medium truncate">{goal.title}</p>
                              <p className="text-xs text-[#676986]">{goal.metricTarget}</p>
                            </div>
                            <Badge
                              variant={goal.status === "on_track" ? "success" : goal.status === "at_risk" ? "warning" : "danger"}
                              size="sm"
                            >
                              {goal.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Top Tasks */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckSquare className="w-4 h-4 text-[#8533fc]" />
                      <h3 className="font-semibold text-white text-sm">Top Tasks</h3>
                    </div>
                    <div className="space-y-2">
                      {devStore.getTasksByDepartment(selectedChannel.department as Department)
                        .filter((t) => t.status !== "done")
                        .slice(0, 3)
                        .map((task) => (
                          <Card key={task.id} padding="sm" hover>
                            <p className="text-sm text-white truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={task.priority === "urgent" ? "danger" : task.priority === "high" ? "warning" : "default"}
                                size="sm"
                              >
                                {task.priority}
                              </Badge>
                              {task.dueDate && (
                                <span className="text-xs text-[#676986]">
                                  {format(new Date(task.dueDate), "MMM d")}
                                </span>
                              )}
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#676986]">Select a channel to start chatting</p>
          </div>
        )}
      </div>

      {/* Huddle Modal */}
      <HuddleModal
        isOpen={showHuddleModal}
        onClose={() => setShowHuddleModal(false)}
        channel={selectedChannel}
      />
    </div>
  );
}

// Huddle Modal Component
function HuddleModal({ isOpen, onClose, channel }: { isOpen: boolean; onClose: () => void; channel: Channel | null }) {
  const [notes, setNotes] = useState("");
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState<{ summary: string; decisions: string[]; actionItems: { text: string }[]; keyTopics: string[] } | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);

  const users = devStore.getUsers();

  const generateSummary = () => {
    // Import summarizer
    import("@/lib/ai/summarizer").then(({ summarizeHuddle }) => {
      const result = summarizeHuddle(notes, transcript);
      setSummary(result);
    });
  };

  const finalize = () => {
    if (!summary || !channel) return;

    // Create huddle record
    const huddle = devStore.addHuddle({
      channelId: channel.id,
      title: `Huddle - ${format(new Date(), "MMM d, h:mm a")}`,
      participants,
      notes,
      transcript,
      summary: summary.summary,
      decisions: summary.decisions.map((decision, i) => ({
        id: `dec-${Date.now()}-${i}`,
        text: decision,
        approved: false,
      })),
      actionItems: summary.actionItems.map((item, i) => ({
        id: `item-${Date.now()}-${i}`,
        text: item.text,
        assigneeId: null,
        taskId: null,
        approved: false,
      })),
      status: "finalized",
      endedAt: new Date().toISOString(),
    });

    // Post summary to channel
    import("@/lib/ai/summarizer").then(({ generateHuddleUpdateMessage }) => {
      const message = generateHuddleUpdateMessage(summary, huddle.title);
      devStore.addMessage({
        channelId: channel.id,
        parentId: null,
        authorId: devStore.getCurrentUser().id,
        content: message,
        attachments: [],
        reactions: [],
        mentions: [],
      });
    });

    onClose();
    setNotes("");
    setTranscript("");
    setSummary(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start Huddle" size="lg">
      <div className="space-y-6">
        {/* Mock Video Area */}
        <div className="aspect-video bg-[#0D0D2A] rounded-xl border border-white/10 flex items-center justify-center">
          <div className="text-center">
            <Phone className="w-12 h-12 text-[#676986] mx-auto mb-2" />
            <p className="text-[#676986]">Video huddle coming in V2</p>
            <p className="text-xs text-[#676986]/50">Daily/LiveKit integration</p>
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-sm font-medium text-[#a8a8a8] mb-2">Participants</label>
          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  setParticipants((prev) =>
                    prev.includes(user.id)
                      ? prev.filter((p) => p !== user.id)
                      : [...prev, user.id]
                  );
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  participants.includes(user.id)
                    ? "bg-[#e3f98a] text-[#0D0D2A]"
                    : "bg-[#1a1a3e] text-[#a8a8a8] hover:bg-[#242445]"
                }`}
              >
                <Avatar name={user.name} size="sm" />
                {user.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <Textarea
          label="Meeting Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Take notes during the huddle..."
          rows={4}
        />

        {/* Transcript Upload */}
        <Textarea
          label="Paste Transcript (optional)"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste meeting transcript here..."
          rows={3}
        />

        {/* Generate Summary */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={generateSummary} disabled={!notes && !transcript}>
            Generate Summary
          </Button>
        </div>

        {/* Summary Preview */}
        {summary && (
          <Card className="bg-[#e3f98a]/5 border-[#e3f98a]/20">
            <h4 className="font-semibold text-white mb-2">Summary</h4>
            <p className="text-sm text-[#a8a8a8] mb-4">{summary.summary}</p>

            {summary.decisions.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-white mb-1">Decisions</h5>
                <ul className="text-sm text-[#a8a8a8] list-disc list-inside">
                  {summary.decisions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.actionItems.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-white mb-1">Action Items</h5>
                <ul className="text-sm text-[#a8a8a8] list-disc list-inside">
                  {summary.actionItems.map((item, i) => (
                    <li key={i}>{item.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={finalize} disabled={!summary}>
            Finalize & Post to Channel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
