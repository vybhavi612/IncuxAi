"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/ChatPanel";
import {
  Hash,
  Plus,
  Search,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Send,
  User as UserIcon,
} from "lucide-react";

export default function TeamChatPage() {
  const { user, channels, messages, createChannel, addMessage } = useApp();
  const router = useRouter();

  const [activeChannelId, setActiveChannelId] = useState("chan-general");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // New Channel Form State
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChanName, setNewChanName] = useState("");
  const [newChanDesc, setNewChanDesc] = useState("");

  // Thread Sidebar State
  const [activeThreadMsgId, setActiveThreadMsgId] = useState<string | null>(null);
  const [threadInput, setThreadInput] = useState("");
  const [threadReplies, setThreadReplies] = useState<{ [msgId: string]: any[] }>({
    "msg-1": [
      { id: "tr-1", senderName: "Sarah Jenkins", content: "Yeah, this workspace is really fast!", createdAt: new Date().toISOString() },
      { id: "tr-2", senderName: "David Chen", content: "Agreed! Excited to try the screen sharing.", createdAt: new Date().toISOString() },
    ]
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleCreateChannelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;

    try {
      const newChan = await createChannel(newChanName.trim(), newChanDesc.trim());
      setActiveChannelId(newChan.id);
      setShowCreateChannel(false);
      setNewChanName("");
      setNewChanDesc("");
    } catch (err) {
      console.error(err);
    }
  };

  const activeChannel = channels.find((c) => c.id === activeChannelId);

  // Search filter
  const allChannelMessages = messages.filter((m) => m.channelId === activeChannelId);
  const filteredMessages = searchQuery.trim()
    ? allChannelMessages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allChannelMessages;

  const handleThreadReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadInput.trim() || !activeThreadMsgId) return;

    const newReply = {
      id: "tr-" + Math.random().toString(36).substr(2, 9),
      senderName: user?.name || "You",
      content: threadInput.trim(),
      createdAt: new Date().toISOString(),
    };

    const currentReplies = threadReplies[activeThreadMsgId] || [];
    setThreadReplies({
      ...threadReplies,
      [activeThreadMsgId]: [...currentReplies, newReply],
    });

    setThreadInput("");

    // Simulate bot reply in thread!
    setTimeout(() => {
      const botReplies = [
        "Perfect, thank you!",
        "Understood, checking now.",
        "Let's sync up on that topic during the weekly call.",
      ];
      const botNames = ["Sarah Jenkins", "Alex Rivera", "David Chen"];
      const simulatedReply = {
        id: "tr-" + Math.random().toString(36).substr(2, 9),
        senderName: botNames[Math.floor(Math.random() * botNames.length)],
        content: botReplies[Math.floor(Math.random() * botReplies.length)],
        createdAt: new Date().toISOString(),
      };
      setThreadReplies((prev) => ({
        ...prev,
        [activeThreadMsgId]: [...(prev[activeThreadMsgId] || []), simulatedReply],
      }));
    }, 1500);
  };

  const getThreadMessageOwner = () => {
    return messages.find((m) => m.id === activeThreadMsgId);
  };

  const activeThreadMsg = getThreadMessageOwner();

  if (!user) return null;

  return (
    <div className="flex flex-row flex-1 min-h-screen bg-[#0B0F19]">
      <Sidebar />

      <div className="flex-1 flex flex-row overflow-hidden h-screen">
        
        {/* Sub-Sidebar: Channels & Direct Messages list */}
        <aside className="w-60 bg-[#111625]/60 border-r border-white/5 flex flex-col justify-between shrink-0 h-full">
          <div className="p-4 space-y-6 overflow-y-auto">
            
            {/* Header / Title */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Team Messaging</h3>
              <button
                onClick={() => setShowCreateChannel(true)}
                className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Create Channel"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List Channels */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-1.5 flex items-center justify-between">
                <span>Channels</span>
                <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-zinc-400 font-bold">{channels.length}</span>
              </div>
              {channels.map((chan) => (
                <button
                  key={chan.id}
                  onClick={() => {
                    setActiveChannelId(chan.id);
                    setActiveThreadMsgId(null);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeChannelId === chan.id
                      ? "bg-accent-blue/15 text-accent-blue border border-accent-blue/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <Hash className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{chan.name}</span>
                </button>
              ))}
            </div>

            {/* List Direct Messages (Simulated) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-1.5">
                Direct Messages
              </div>
              {[
                { name: "Sarah Jenkins", avatar: "bg-pink-500", status: "online" },
                { name: "Alex Rivera", avatar: "bg-accent-blue", status: "online" },
                { name: "David Chen", avatar: "bg-emerald-500", status: "offline" },
              ].map((dm, idx) => (
                <button
                  key={idx}
                  onClick={() => alert(`Direct Messaging with ${dm.name} will be added in the next release.`)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className={`w-2 h-2 rounded-full ${dm.status === "online" ? "bg-green-500 animate-pulse" : "bg-zinc-600"}`} />
                    <span className="truncate">{dm.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN COMPONENT: Channel Message Space */}
        <section className="flex-1 flex flex-col h-full bg-[#0B0F19] overflow-hidden min-w-0">
          
          {/* Header */}
          <div className="px-6 py-4 bg-[#111625] border-b border-white/5 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-zinc-500" /> {activeChannel?.name || "general"}
              </h2>
              {activeChannel?.description && (
                <p className="text-[10px] text-zinc-500 truncate max-w-md mt-0.5 font-medium">
                  {activeChannel.description}
                </p>
              )}
            </div>

            {/* Search Trigger */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/[0.03] border border-white/5 pl-9 pr-4 py-1.5 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-accent-blue transition-colors w-44 md:w-56"
                />
              </div>
            </div>
          </div>

          {/* Messages viewport */}
          <div className="flex-1 overflow-hidden relative">
            {searchQuery.trim() ? (
              // Search Results mode
              <div className="h-full flex flex-col p-4 overflow-y-auto space-y-4">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-2">
                  Search Results for "{searchQuery}" ({filteredMessages.length} matches)
                </div>
                {filteredMessages.map((msg) => (
                  <div key={msg.id} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-400">{msg.senderName}</span>
                      <span className="text-[9px] text-zinc-600">
                        {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed font-medium">{msg.content}</p>
                    <button
                      onClick={() => {
                        setActiveThreadMsgId(msg.id);
                        setSearchQuery("");
                      }}
                      className="text-[10px] text-accent-blue hover:text-blue-400 font-semibold pt-1 block"
                    >
                      Jump to thread replies
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              // Standard channel messages viewport (housed in ChatPanel component)
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {allChannelMessages.map((msg) => {
                    const repliesCount = threadReplies[msg.id]?.length || 0;
                    return (
                      <div key={msg.id} className="group relative flex items-start gap-3 bg-white/[0.01] hover:bg-white/[0.03] border border-transparent hover:border-white/5 p-3 rounded-2xl transition-all">
                        <div className="w-8 h-8 rounded-full bg-accent-purple/15 border border-accent-purple/30 flex items-center justify-center text-accent-purple font-bold text-xs uppercase">
                          {msg.senderName.substring(0, 2)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{msg.senderName}</span>
                            <span className="text-[9px] text-zinc-600">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed font-medium mt-1">{msg.content}</p>
                          
                          {/* Thread reply actions */}
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => setActiveThreadMsgId(msg.id)}
                              className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-accent-blue font-bold transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              {repliesCount > 0 ? `${repliesCount} replies` : "Reply in thread"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Submitter */}
                <ChatPanel channelId={activeChannelId} />
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COMPONENT: Thread Side Panel */}
        {activeThreadMsgId && activeThreadMsg && (
          <div className="w-80 border-l border-white/5 bg-[#111625]/90 backdrop-blur-xl h-full flex flex-col shrink-0 overflow-hidden z-10 animate-slideLeft">
            
            {/* Header */}
            <div className="px-4 py-3 bg-[#161D2F] border-b border-white/5 flex items-center justify-between shrink-0">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Thread</h3>
              <button
                onClick={() => setActiveThreadMsgId(null)}
                className="text-zinc-500 hover:text-white text-xs font-bold px-1"
              >
                Close
              </button>
            </div>

            {/* Parent message details */}
            <div className="p-4 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue font-bold text-xs uppercase">
                  {activeThreadMsg.senderName.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{activeThreadMsg.senderName}</h4>
                  <span className="text-[8px] text-zinc-600">
                    {new Date(activeThreadMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-semibold">{activeThreadMsg.content}</p>
            </div>

            {/* Replies Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(threadReplies[activeThreadMsgId] || []).length === 0 ? (
                <div className="text-center text-zinc-600 py-10 text-[10px]">
                  No replies yet. Start the thread below.
                </div>
              ) : (
                (threadReplies[activeThreadMsgId] || []).map((rep) => (
                  <div key={rep.id} className="space-y-1 border-l-2 border-white/5 pl-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400">{rep.senderName}</span>
                      <span className="text-[8px] text-zinc-600">
                        {new Date(rep.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-medium">{rep.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <form onSubmit={handleThreadReplySubmit} className="p-3 bg-[#161D2F] border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={threadInput}
                onChange={(e) => setThreadInput(e.target.value)}
                placeholder="Reply in thread..."
                className="flex-1 bg-white/[0.03] border border-white/5 px-2.5 py-2 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-accent-blue transition-colors"
              />
              <button
                type="submit"
                disabled={!threadInput.trim()}
                className="p-2 rounded-xl bg-accent-blue text-white hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-accent-blue"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* CREATE CHANNEL MODAL */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#111625] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Channel</h3>
            
            <form onSubmit={handleCreateChannelSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Channel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. general-discussion"
                  value={newChanName}
                  onChange={(e) => setNewChanName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 px-3 py-2.5 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chat logs regarding sprint plans..."
                  value={newChanDesc}
                  onChange={(e) => setNewChanDesc(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 px-3 py-2.5 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateChannel(false)}
                  className="px-4 py-2 rounded-xl hover:bg-white/5 text-zinc-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
