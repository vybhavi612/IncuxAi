"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp, Recording } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import {
  Play,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ListTodo,
  FileText,
  Video as VideoIcon,
  Search,
} from "lucide-react";

export default function RecordingsPage() {
  const { user, recordings, deleteRecording } = useApp();
  const router = useRouter();

  const [activeRecId, setActiveRecId] = useState<string | null>(null);
  const [activeRecTab, setActiveRecTab] = useState<"transcript" | "summary" | "actions">("transcript");
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [recSearch, setRecSearch] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Set default active recording if available
  useEffect(() => {
    if (recordings.length > 0 && !activeRecId) {
      setActiveRecId(recordings[0].id);
    }
  }, [recordings, activeRecId]);

  const activeRec = recordings.find((r) => r.id === activeRecId);

  // Jump video player to specific transcript timestamp
  // timestamp format: "MM:SS" (e.g. "00:15") or "HH:MM:SS"
  const jumpToTime = (timestamp: string) => {
    if (!videoRef.current) return;
    
    const parts = timestamp.split(":").map(Number);
    let seconds = 0;
    
    if (parts.length === 2) {
      // MM:SS
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      // HH:MM:SS
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    
    videoRef.current.currentTime = seconds;
    videoRef.current.play();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Filter recordings
  const filteredRecordings = recordings.filter((r) =>
    r.meetingTitle.toLowerCase().includes(recSearch.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="flex flex-row flex-1 min-h-screen bg-[#0B0F19]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 flex flex-col md:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN: Video Player & AI Details Panels */}
        <section className="flex-1 space-y-6 w-full min-w-0">
          
          {/* Main Video Window */}
          {activeRec ? (
            <div className="bg-[#111625] border border-white/5 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/5">
                <video
                  ref={videoRef}
                  src={activeRec.videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-start justify-between px-2 pt-2">
                <div className="space-y-1.5">
                  <h2 className="text-base font-bold text-white leading-tight">{activeRec.meetingTitle}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(activeRec.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Duration: {formatDuration(activeRec.durationSeconds)}
                    </span>
                    <span className="flex items-center gap-1">
                      <VideoIcon className="w-3.5 h-3.5" />
                      Size: {formatSize(activeRec.sizeBytes)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    deleteRecording(activeRec.id);
                    setActiveRecId(null);
                  }}
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all"
                  title="Delete Recording"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#161D2F] border border-white/5 rounded-3xl p-16 text-center text-zinc-500 w-full shadow-lg">
              <VideoIcon className="w-10 h-10 mx-auto mb-2 opacity-20 text-accent-blue" />
              <h3 className="text-sm font-bold text-white">No recording selected</h3>
              <p className="text-xs mt-1">Select a meeting recording from the list to start reviewing.</p>
            </div>
          )}

          {/* AI Transcription & Analytics Split Panel */}
          {activeRec && (
            <div className="bg-[#111625] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-96">
              
              {/* Tab Selector Header */}
              <div className="flex bg-[#161D2F] border-b border-white/5 shrink-0">
                {[
                  { id: "transcript", label: "Interactive Transcript", icon: FileText },
                  { id: "summary", label: "AI Summary", icon: Sparkles },
                  { id: "actions", label: "Action Items Checklist", icon: ListTodo },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveRecTab(tab.id as any)}
                      className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-xs font-bold border-b-2 transition-all capitalize ${
                        activeRecTab === tab.id
                          ? "border-accent-blue text-white bg-white/[0.01]"
                          : "border-transparent text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content viewport */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                
                {/* 1. Transcript panel with timestamp jumping */}
                {activeRecTab === "transcript" && (
                  <div className="space-y-4">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b border-white/5 pb-2">
                      💡 Click on any transcript line to jump video playback to that exact timestamp.
                    </p>
                    {activeRec.transcript.map((line, idx) => (
                      <button
                        key={idx}
                        onClick={() => jumpToTime(line.time)}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all text-xs font-semibold leading-relaxed"
                      >
                        <span className="text-accent-blue font-bold font-mono bg-accent-blue/10 px-1.5 py-0.5 rounded text-[10px] tracking-wide mt-0.5">
                          {line.time}
                        </span>
                        <div className="flex-1">
                          <span className="font-bold text-white block mb-0.5">{line.speaker}</span>
                          <span className="text-zinc-300 font-medium">{line.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. AI Summary */}
                {activeRecTab === "summary" && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Automated Call Chapter Summary</h3>
                    <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                      {activeRec.summary}
                    </p>
                  </div>
                )}

                {/* 3. Action Items */}
                {activeRecTab === "actions" && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Extracted Action Items</h3>
                    {activeRec.actionItems.map((act, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-white/[0.01] border border-white/5 p-3 rounded-xl text-xs text-zinc-300 font-medium leading-relaxed"
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 rounded border-zinc-700 bg-zinc-800 text-accent-blue focus:ring-accent-blue outline-none cursor-pointer"
                        />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Available Recordings List Sidebar */}
        <section className="w-full md:w-80 space-y-4 shrink-0">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Recordings List</h3>
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-500 font-bold uppercase">
              {filteredRecordings.length} Saved
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input
              type="text"
              placeholder="Search recordings..."
              value={recSearch}
              onChange={(e) => setRecSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 pl-9 pr-4 py-2 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue"
            />
          </div>

          {/* Cards List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredRecordings.length === 0 ? (
              <div className="text-center text-zinc-600 py-10 text-xs font-medium bg-[#161D2F] border border-white/5 rounded-2xl">
                No recordings found.
              </div>
            ) : (
              filteredRecordings.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => setActiveRecId(rec.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 relative overflow-hidden group ${
                    activeRecId === rec.id
                      ? "bg-accent-blue/15 border-accent-blue/40"
                      : "bg-[#161D2F] border-white/5 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    activeRecId === rec.id ? "bg-accent-blue text-white" : "bg-white/[0.02] border border-white/5 text-zinc-400"
                  }`}>
                    <Play className="w-4 h-4 fill-current" />
                  </div>

                  <div className="space-y-1.5 overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate pr-4">{rec.meetingTitle}</h4>
                    <div className="flex items-center gap-3 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span>{formatDuration(rec.durationSeconds)}</span>
                      <span>{formatSize(rec.sizeBytes)}</span>
                    </div>
                  </div>
                </button>
              )))}
          </div>
        </section>
      </main>
    </div>
  );
}
