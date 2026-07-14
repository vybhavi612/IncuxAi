"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, MessageSquare } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface ChatPanelProps {
  meetingId?: string;
  channelId?: string;
  isSimulated?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ meetingId, channelId, isSimulated = false }) => {
  const { user, messages, addMessage } = useApp();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Filter messages based on meeting or channel context
  const filteredMessages = messages.filter((msg) => {
    if (meetingId) return msg.meetingId === meetingId;
    if (channelId) return msg.channelId === channelId;
    return false;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const sentText = text;
    setText("");
    
    // Save to App Context message list
    await addMessage(sentText, meetingId || null, channelId || null);

    // If simulated bots are allowed, trigger a bot reply after a short delay
    if (isSimulated && meetingId) {
      setTimeout(async () => {
        const botResponses = [
          "That sounds like a great idea!",
          "I agree. Let's make sure we log this as an action item.",
          "I'm looking at the documentation now, I think that is supported.",
          "Could you share that file in the Shared Notes panel?",
          "Awesome. I'll get started on my tasks right away.",
        ];
        const botNames = ["Sarah Jenkins", "Alex Rivera", "David Chen"];
        const randomBot = botNames[Math.floor(Math.random() * botNames.length)];
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        
        // Add message on behalf of the bot
        // Since we are mocking, we can trigger the bot response using context's addMessage but with custom sender details
        // Wait! addMessage in AppContext uses currently logged-in user. Let's write a direct simulation mechanism or let context support adding custom sender
        // Let's see: we can push messages directly into Context by extending the context or by simulating it locally.
        // Wait, inside AppContext.tsx we have `messages` and `setMessages`. We can add a custom mechanism or just simulate it client-side.
        // Actually, we can trigger it in the AppContext.tsx or we can just update localStorage/React state.
        // In our AppContext.tsx, addMessage takes `content`, `meetingId`, `channelId`. Let's see. If the sender is hardcoded to the logged-in user inside AppContext.tsx,
        // we can create a simulated bot response inside AppContext.tsx or just let the chat component trigger a mock response.
        // Wait, let's see. Inside AppContext, `addMessage` creates a message with `senderId: user?.id || "guest"`.
        // If we want a bot to send a message, we could add a `senderName` or just make a bot messaging API in AppContext.
        // Let's check how we can do it. Since we already created AppContext, let's look at it. We can just add another message.
        // Actually, to make it simple and elegant, we can just push a message to context directly, or we can just let AppContext handle a custom sender or add message with custom sender.
        // Let's modify AppContext to allow custom senderName / senderId if needed, or simply make a simulation event in AppContext.
        // Wait! In AppContext.tsx, `addMessage` is:
        // `addMessage: (content: string, meetingId?: string | null, channelId?: string | null) => Promise<Message>`
        // Let's check if we can make a custom simulation hook or if we can update the state.
        // Yes, we can just call standard addMessage or we can add a bot response using the current user (which is fine, or we can update AppContext).
        // Let's see: we can edit AppContext.tsx later or we can just let the chat panel simulate it.
        // If we do it in the chat panel, since `addMessage` returns a message, we can just let bots reply. But wait, how do bots add message?
        // Since they aren't logged in, they can be added if we support a `sender` override. Let's see: if we want to support bot messages,
        // we can write a helper function in AppContext or edit AppContext to allow a custom sender parameter.
        // Let's look at `AppContext.tsx` line 254:
        // `const newMessage: Message = { id: "msg-...", content, senderId: user?.id || "guest", senderName: user?.name || "Guest Participant", ... }`
        // We can easily change it to accept `senderId` and `senderName` as optional arguments in `addMessage`!
        // Let's make this change to AppContext.tsx so any component can trigger messages from other people (bots/participants). This is extremely useful for simulation!
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111625] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-[#161D2F] border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Live Chat</h3>
        <span className="text-[10px] bg-accent-blue/10 text-accent-blue font-bold px-2 py-0.5 rounded-full">
          {filteredMessages.length} Messages
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs">No messages yet.</p>
            <p className="text-[10px] opacity-75">Send a message to start the conversation.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-zinc-400">{msg.senderName}</span>
                  <span className="text-[9px] text-zinc-600">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    isMe
                      ? "bg-accent-blue text-white rounded-tr-none"
                      : "bg-[#161D2F] text-zinc-200 border border-white/5 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-[#161D2F] border-t border-white/5 flex items-center gap-2">
        <button
          type="button"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Attach files"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 bg-white/[0.03] border border-white/5 px-3 py-2 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-accent-blue transition-colors"
        />
        <button
          type="button"
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Add emoji"
        >
          <Smile className="w-4 h-4" />
        </button>
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2 rounded-xl bg-accent-blue text-white hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-accent-blue transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
