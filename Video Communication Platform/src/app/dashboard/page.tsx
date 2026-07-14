"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp, Meeting } from "@/context/AppContext";
import { Sidebar } from "@/components/Sidebar";
import {
  Video,
  Plus,
  Calendar,
  Layers,
  ArrowRight,
  Trash2,
  Clock,
  ExternalLink,
  Users,
} from "lucide-react";

export default function Dashboard() {
  const { user, meetings, createMeeting, deleteMeeting } = useApp();
  const router = useRouter();

  // Current Time / Date State
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  // Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [duration, setDuration] = useState(45);
  const [passcode, setPasscode] = useState("");
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [joinId, setJoinId] = useState("");

  useEffect(() => {
    // Redirection if not logged in
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setDate(
        now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInstantMeeting = async () => {
    try {
      const instantMeet = await createMeeting({
        title: `${user?.name || "User"}'s Instant Meeting`,
        isInstant: true,
        scheduledAt: new Date().toISOString(),
        durationMinutes: 40,
        personalRoom: false,
        passcode: Math.floor(100000 + Math.random() * 900000).toString(),
        waitingRoomEnabled: false,
        recordingEnabled: true,
      });
      router.push(`/meeting/${instantMeet.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dateTime) return;

    try {
      await createMeeting({
        title: title.trim(),
        description: desc.trim() || undefined,
        isInstant: false,
        scheduledAt: new Date(dateTime).toISOString(),
        durationMinutes: duration,
        personalRoom: false,
        passcode: passcode.trim() || undefined,
        waitingRoomEnabled: waitingRoom,
        recordingEnabled: true,
      });
      setShowScheduleModal(false);
      setTitle("");
      setDesc("");
      setDateTime("");
      setPasscode("");
      setWaitingRoom(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    router.push(`/meeting/${joinId.trim()}`);
  };

  if (!user) return null;

  return (
    <div className="flex flex-row flex-1 min-h-screen bg-[#0B0F19]">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-10">
        {/* Large Yoom-style Header Display Card */}
        <div className="relative h-60 md:h-72 rounded-3xl overflow-hidden bg-cover bg-center shadow-2xl flex flex-col justify-between p-8 border border-white/5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-blue/30 via-[#111625] to-[#0B0F19]">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl w-fit backdrop-blur-md">
            <span className="text-xs font-semibold text-zinc-300">
              Upcoming Meeting: Weekly Sync @ 10:00 AM
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white font-mono leading-none">
              {time}
            </h2>
            <p className="text-sm font-semibold text-accent-blue">{date}</p>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* New Meeting Card */}
          <button
            onClick={handleInstantMeeting}
            className="flex flex-col justify-between items-start p-5 h-44 rounded-2xl bg-accent-purple hover:bg-purple-700 text-white transition-all shadow-lg hover:-translate-y-1 shadow-accent-purple/15 text-left border border-white/5"
          >
            <div className="p-3 bg-white/10 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">New Meeting</h3>
              <p className="text-[10px] text-white/70 mt-1 leading-snug">Start an instant video conference room.</p>
            </div>
          </button>

          {/* Join Meeting Card */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex flex-col justify-between items-start p-5 h-44 rounded-2xl bg-accent-blue hover:bg-blue-600 text-white transition-all shadow-lg hover:-translate-y-1 shadow-accent-blue/15 text-left border border-white/5"
          >
            <div className="p-3 bg-white/10 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Join Meeting</h3>
              <p className="text-[10px] text-white/70 mt-1 leading-snug">Enter room code or copy-paste invitation link.</p>
            </div>
          </button>

          {/* Schedule Meeting Card */}
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex flex-col justify-between items-start p-5 h-44 rounded-2xl bg-[#161D2F] hover:bg-white/[0.04] text-zinc-300 hover:text-white border border-white/5 transition-all shadow-lg hover:-translate-y-1 text-left"
          >
            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-accent-blue">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Schedule Meeting</h3>
              <p className="text-[10px] text-zinc-400 mt-1 leading-snug">Plan upcoming video session and invite guests.</p>
            </div>
          </button>

          {/* Recordings Card */}
          <button
            onClick={() => router.push("/recordings")}
            className="flex flex-col justify-between items-start p-5 h-44 rounded-2xl bg-[#161D2F] hover:bg-white/[0.04] text-zinc-300 hover:text-white border border-white/5 transition-all shadow-lg hover:-translate-y-1 text-left"
          >
            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl text-pink-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">View Recordings</h3>
              <p className="text-[10px] text-zinc-400 mt-1 leading-snug">Access previous calls, summaries, action lists.</p>
            </div>
          </button>
        </section>

        {/* Upcoming Meetings List Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-blue" />
              Today's Scheduled Meetings
            </h3>
            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-400 font-semibold">
              {meetings.length} Scheduled
            </span>
          </div>

          {meetings.length === 0 ? (
            <div className="bg-[#161D2F] border border-white/5 p-8 rounded-2xl text-center text-zinc-500 py-12">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20 text-accent-blue" />
              <p className="text-xs">No meetings scheduled for today.</p>
              <p className="text-[10px] opacity-75">Click "Schedule Meeting" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map((meet) => (
                <div
                  key={meet.id}
                  className="bg-[#161D2F] border border-white/5 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-lg relative group"
                >
                  <button
                    onClick={() => deleteMeeting(meet.id)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Delete meeting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-2 pr-6">
                    <span className="text-[10px] bg-accent-blue/10 text-accent-blue font-bold px-2 py-0.5 rounded">
                      {meet.durationMinutes} Mins
                    </span>
                    <h4 className="text-sm font-semibold text-white truncate">{meet.title}</h4>
                    {meet.description && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {meet.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Scheduled Time</span>
                      <span className="text-[11px] text-zinc-300 font-semibold mt-0.5">
                        {new Date(meet.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        - {new Date(meet.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/meeting/${meet.id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shadow-accent-blue/10"
                    >
                      Start Call <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* SCHEDULE MEETING MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#111625] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Schedule a Meeting</h3>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Meeting Title</label>
                <input
                  type="text"
                  required
                  placeholder="Engineering Weekly Sprint Planning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 px-3 py-2 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Description (Optional)</label>
                <textarea
                  placeholder="Review sprint velocities, assign new tickets..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 px-3 py-2 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full bg-[#161D2F] border border-white/5 px-3 py-2 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Duration (Minutes)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-[#161D2F] border border-white/5 px-3 py-2 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Passcode (Optional)</label>
                  <input
                    type="password"
                    placeholder="e.g. 123456"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/5 px-3 py-2.5 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="waitingRoom"
                    checked={waitingRoom}
                    onChange={(e) => setWaitingRoom(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-accent-blue focus:ring-accent-blue outline-none cursor-pointer"
                  />
                  <label htmlFor="waitingRoom" className="text-xs text-zinc-300 font-medium cursor-pointer">
                    Enable Waiting Room
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-white/5 text-zinc-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN MEETING MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#111625] border border-white/5 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Join a Meeting</h3>
            
            <form onSubmit={handleJoinMeeting} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Room Code / ID</label>
                <input
                  type="text"
                  required
                  placeholder="Enter meet-xxxxxx..."
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 px-3 py-2.5 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 rounded-xl hover:bg-white/5 text-zinc-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold"
                >
                  Join Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
