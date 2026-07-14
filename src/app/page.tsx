"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Video, Shield, MessageSquare, Database, ArrowRight, Activity } from "lucide-react";

export default function Home() {
  const { user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0B0F19]">
        <div className="w-10 h-10 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-zinc-400 text-xs font-semibold">Initializing VibeSync Suite...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0B0F19] text-zinc-100 overflow-y-auto">
      {/* Top Banner Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#111625]/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-blue/20 animate-pulse">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white">VibeSync</h1>
            <span className="text-[9px] text-accent-blue font-bold uppercase tracking-wider block -mt-0.5">Enterprise Portal</span>
          </div>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shadow-accent-blue/15"
        >
          Enter Portal <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center space-y-12">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-accent-blue/10 border border-accent-blue/20 px-3 py-1 rounded-full text-[10px] font-bold text-accent-blue uppercase tracking-wider">
            <Activity className="w-3 h-3" /> Next-Gen Collaboration
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent leading-none">
            Secure Video Conferences & Unified Team Channels
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Enterprise-grade virtual whiteboard, live screen sharing, AI meeting summaries, searchable transcripts, and real-time team messaging.
          </p>
        </div>

        {/* Call to action button */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3.5 rounded-xl bg-accent-blue hover:bg-blue-600 text-white text-sm font-bold transition-all hover:scale-105 shadow-xl shadow-accent-blue/20"
          >
            Get Started Free
          </button>
          <a
            href="#features"
            className="px-6 py-3.5 rounded-xl hover:bg-white/5 border border-white/5 text-zinc-300 text-sm font-bold transition-all"
          >
            Explore Capabilities
          </a>
        </div>

        {/* Feature Cards Grid */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full pt-16 border-t border-white/5">
          {[
            {
              title: "Video Conferencing",
              desc: "WebRTC P2P/room conferencing, screen sharing, custom canvas virtual backgrounds, filters.",
              icon: Video,
              color: "text-accent-blue",
              bg: "bg-accent-blue/5 border-accent-blue/10",
            },
            {
              title: "Interactive Workspace",
              desc: "HTML5 collaborative whiteboard, drawing shapes, team notes editor, live surveys & Q&A.",
              icon: MessageSquare,
              color: "text-accent-purple",
              bg: "bg-accent-purple/5 border-accent-purple/10",
            },
            {
              title: "AI Meeting Copilot",
              desc: "Automated real-time transcripts, live language translations, smart summaries & action checklist extraction.",
              icon: Activity,
              color: "text-pink-500",
              bg: "bg-pink-500/5 border-pink-500/10",
            },
            {
              title: "Cloud Recording Vault",
              desc: "Record session meetings, play back recorded videos with interactive synchronized transcripts.",
              icon: Database,
              color: "text-green-500",
              bg: "bg-green-500/5 border-green-500/10",
            },
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className={`p-6 rounded-2xl border flex flex-col items-center text-center space-y-4 ${feat.bg}`}>
                <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/5 ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-white">{feat.title}</h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-zinc-600 text-xs">
        © 2026 VibeSync Inc. All Rights Reserved. Built with Next.js, Tailwind CSS, & SQLite.
      </footer>
    </div>
  );
}
