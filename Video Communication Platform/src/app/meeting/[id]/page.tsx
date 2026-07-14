"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp, Meeting, Recording } from "@/context/AppContext";
import { Whiteboard } from "@/components/Whiteboard";
import { Notes } from "@/components/Notes";
import { ChatPanel } from "@/components/ChatPanel";
import { PollsPanel } from "@/components/PollsPanel";
import { QAPanel } from "@/components/QAPanel";
import { AIAssistant } from "@/components/AIAssistant";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  Radio,
  PenTool,
  MessageSquare,
  BarChart3,
  HelpCircle,
  Sparkles,
  FileText,
  PhoneOff,
  ChevronRight,
  ChevronLeft,
  Tv,
  Sparkle,
} from "lucide-react";

interface SimulatedParticipant {
  id: string;
  name: string;
  avatarColor: string;
  micActive: boolean;
  videoActive: boolean;
  isSpeaker: boolean;
  avatarText: string;
}

export default function MeetingRoom() {
  const params = useParams();
  const router = useRouter();
  const { user, meetings, addRecording, addMessage } = useApp();
  const id = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);

  // Device & Stream States
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [videoFilter, setVideoFilter] = useState<"none" | "blur" | "grayscale" | "neon">("none");

  // Media streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Active Tool Panel State
  const [activePanel, setActivePanel] = useState<"whiteboard" | "notes" | "chat" | "polls" | "qa" | "ai" | null>(null);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Simulated Participants
  const [participants, setParticipants] = useState<SimulatedParticipant[]>([
    { id: "bot-1", name: "Sarah Jenkins", avatarColor: "bg-pink-500", micActive: true, videoActive: true, isSpeaker: false, avatarText: "SJ" },
    { id: "bot-2", name: "Alex Rivera (Host)", avatarColor: "bg-accent-blue", micActive: true, videoActive: true, isSpeaker: true, avatarText: "AR" },
    { id: "bot-3", name: "David Chen", avatarColor: "bg-emerald-500", micActive: false, videoActive: false, isSpeaker: false, avatarText: "DC" },
  ]);

  // Load meeting information
  useEffect(() => {
    const current = meetings.find((m) => m.id === id);
    if (current) {
      setMeeting(current);
    } else {
      // Create a temp meeting if not found (e.g. joined via code directly)
      setMeeting({
        id,
        title: `Meeting Room - ${id.substring(0, 8)}`,
        isInstant: true,
        scheduledAt: new Date().toISOString(),
        durationMinutes: 40,
        hostId: "host-id",
        hostName: "Organizer",
        personalRoom: false,
        waitingRoomEnabled: false,
        recordingEnabled: true,
      });
    }
  }, [id, meetings]);

  // Request camera and microphone access
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera or microphone access denied. Using mock representation.", err);
      }
    };

    if (videoActive) {
      startMedia();
    } else {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoActive]);

  // Handle active speaker animation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly rotate speaker status among participants
      setParticipants((curr) => {
        const next = curr.map((p) => ({ ...p, isSpeaker: false }));
        // 40% chance of changing speaker
        if (Math.random() < 0.4) {
          const randIdx = Math.floor(Math.random() * next.length);
          next[randIdx].isSpeaker = true;
          // Toggle mic indicator randomly to look alive
          next[randIdx].micActive = true;
        }
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Bot chat interaction simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const phrases = [
        "I'm updating the agenda on the shared notes right now.",
        "Check out the whiteboard, I added the database diagram.",
        "Are we still on track for the Thursday release?",
        "Don't forget to submit your vote on the active poll!",
        "Could someone check if the recording is running?",
      ];
      const botNames = ["Sarah Jenkins", "Alex Rivera", "David Chen"];
      const randName = botNames[Math.floor(Math.random() * botNames.length)];
      const randText = phrases[Math.floor(Math.random() * phrases.length)];
      
      // Post simulated messages to live chat context
      addMessage(randText, id, null, "bot-" + randName.charAt(0), randName);
    }, 18000);

    return () => clearInterval(interval);
  }, [id, addMessage]);

  // SCREEN SHARE FUNCTION
  const toggleScreenShare = async () => {
    if (screenShareActive) {
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
      setScreenStream(null);
      setScreenShareActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setScreenShareActive(true);
        
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }

        // Auto stop if user clicks "Stop Sharing" overlay in browser
        stream.getVideoTracks()[0].onended = () => {
          setScreenShareActive(false);
          setScreenStream(null);
        };
      } catch (err) {
        console.error("Screen sharing was cancelled or failed: ", err);
      }
    }
  };

  // MEETING RECORDING FUNCTION
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      recordedChunksRef.current = [];
      
      // Capture stream from canvas or local video stream
      const streamToRecord = localStream || (videoRef.current?.srcObject as MediaStream);
      
      if (!streamToRecord) {
        alert("Cannot start recording: No camera/audio stream available.");
        return;
      }

      try {
        const recorder = new MediaRecorder(streamToRecord, { mimeType: "video/webm" });
        mediaRecorderRef.current = recorder;
        setRecordingStartTime(Date.now());

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
          const videoUrl = URL.createObjectURL(blob);
          const duration = Math.round((Date.now() - (recordingStartTime || Date.now())) / 1000);

          // Add to recordings list in AppContext
          addRecording({
            meetingId: id,
            meetingTitle: meeting?.title || "Conference Recording",
            videoUrl,
            durationSeconds: duration || 10,
            sizeBytes: blob.size,
            transcript: [
              { time: "00:01", speaker: user?.name || "Organizer", text: "Meeting started. Let's record this sync." },
              { time: "00:05", speaker: "Alex Rivera", text: "Perfect. We are discussing the database schemas and the WebRTC signaling models." }
            ],
            summary: `Automated summary for ${meeting?.title || "Conference Call"}. Key highlights included setup of database schemas and discussions around WebRTC signaling models.`,
            actionItems: [
              `${user?.name || "Organizer"}: Deploy the changes to testing servers.`,
              "Alex Rivera: Complete signaling connection testing."
            ]
          });

          alert("Meeting recording completed and saved to the Recordings Vault!");
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Failed to start MediaRecorder: ", err);
      }
    }
  };

  const leaveMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
    router.push("/dashboard");
  };

  // Toggle control panels
  const togglePanel = (panel: typeof activePanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0B0F19] text-zinc-100 overflow-hidden font-sans">
      {/* Upper Navigation Header */}
      <header className="px-6 py-3.5 bg-[#111625] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue font-bold">
            VS
          </div>
          <div>
            <h2 className="text-xs font-bold text-white">{meeting?.title || "Meeting Room"}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <span className="text-[10px] text-zinc-500 font-semibold tracking-wide uppercase">
                Meeting Code: {id}
              </span>
            </div>
          </div>
        </div>

        {/* Action tags */}
        <div className="flex items-center gap-2">
          {isRecording && (
            <span className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> REC
            </span>
          )}
          <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-[10px] text-zinc-400 font-bold">
            {participants.length + (videoActive || micActive ? 1 : 0)} Participants
          </span>
        </div>
      </header>

      {/* Main Grid: Left Video Frame, Right Workspace Panel */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0">
        
        {/* LEFT COMPONENT: Video Grid */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4 relative min-h-0 justify-center">
          
          {/* Large Screen Share Box (If active, displaces normal gallery structure) */}
          {screenShareActive ? (
            <div className="flex-1 relative bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 group">
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-contain"
              />
              <div className="absolute top-4 left-4 bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-2 z-10">
                <Tv className="w-4 h-4 text-accent-blue" />
                <span className="text-xs font-semibold text-white">Presenting Screen</span>
              </div>
            </div>
          ) : (
            // NORMAL GALLERY/SPEAKER GRID
            <div className="gallery-grid flex-1">
              {/* User Local Stream Card */}
              <div
                className={`relative rounded-2xl overflow-hidden border bg-card-bg flex items-center justify-center shadow-lg transition-all ${
                  videoFilter === "blur" ? "[&_video]:blur-md" :
                  videoFilter === "grayscale" ? "[&_video]:grayscale" :
                  videoFilter === "neon" ? "border-accent-pink shadow-accent-pink/10" : "border-white/5"
                }`}
              >
                {videoActive && localStream ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {videoFilter === "neon" && (
                      <div className="absolute inset-0 border-[3px] border-accent-pink/40 animate-pulse pointer-events-none rounded-2xl" />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 text-center py-16">
                    <div className="w-14 h-14 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-accent-blue font-bold text-lg uppercase shadow-inner">
                      {user?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-zinc-300">{user?.name} (You)</span>
                  </div>
                )}
                
                {/* Visual tags */}
                <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-[10px] text-white font-bold backdrop-blur-md flex items-center gap-1.5">
                  {micActive ? <Mic className="w-3 h-3 text-green-400" /> : <MicOff className="w-3 h-3 text-red-400" />}
                  <span>{user?.name} (You)</span>
                </div>
              </div>

              {/* Simulated Participant Cards */}
              {participants.map((p) => (
                <div
                  key={p.id}
                  className={`relative rounded-2xl overflow-hidden border bg-card-bg flex items-center justify-center shadow-lg transition-all ${
                    p.isSpeaker ? "active-speaker ring-2 ring-accent-blue/50" : "border-white/5"
                  }`}
                >
                  {p.videoActive ? (
                    <div className="w-full h-full bg-[#1A1F2C] relative flex items-center justify-center">
                      {/* Simulated video canvas animations */}
                      <div className="flex flex-col items-center space-y-1">
                        <div className={`w-14 h-14 rounded-full ${p.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg relative ${p.isSpeaker ? "scale-105 transition-transform" : ""}`}>
                          {p.avatarText}
                          {p.isSpeaker && <span className="absolute -inset-1 border-2 border-accent-blue rounded-full animate-ping" />}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-semibold italic">Live Video Stream</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 text-center py-16">
                      <div className={`w-14 h-14 rounded-full ${p.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-inner`}>
                        {p.avatarText}
                      </div>
                      <span className="text-xs font-bold text-zinc-300">{p.name}</span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-[10px] text-white font-bold backdrop-blur-md flex items-center gap-1.5">
                    {p.micActive ? <Mic className="w-3 h-3 text-green-400" /> : <MicOff className="w-3 h-3 text-red-400" />}
                    <span>{p.name}</span>
                  </div>
                  
                  {p.isSpeaker && (
                    <span className="absolute top-3 right-3 bg-accent-blue/20 text-accent-blue text-[8px] font-bold px-2 py-0.5 rounded-full border border-accent-blue/30 uppercase tracking-widest flex items-center gap-0.5">
                      <Sparkle className="w-2.5 h-2.5 fill-accent-blue" /> Speaking
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COMPONENT: Split Panel Workspace */}
        {activePanel && (
          <div className="w-96 border-l border-white/5 bg-[#111625]/90 backdrop-blur-xl h-full flex flex-col shrink-0 overflow-hidden z-10 animate-slideLeft">
            {activePanel === "whiteboard" && <Whiteboard />}
            {activePanel === "notes" && <Notes />}
            {activePanel === "chat" && <ChatPanel meetingId={id} isSimulated={true} />}
            {activePanel === "polls" && <PollsPanel />}
            {activePanel === "qa" && <QAPanel />}
            {activePanel === "ai" && <AIAssistant />}
          </div>
        )}
      </div>

      {/* Control Actions Bottom Bar */}
      <footer className="px-6 py-4 bg-[#111625] border-t border-white/5 flex items-center justify-between shrink-0 z-20">
        
        {/* Toggle Filters Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider hidden sm:inline">Camera BG</span>
          <select
            value={videoFilter}
            onChange={(e) => setVideoFilter(e.target.value as any)}
            className="bg-[#161D2F] border border-white/5 px-2 py-1.5 rounded-lg text-[10px] text-zinc-300 outline-none cursor-pointer"
            title="Video Filters"
          >
            <option value="none">Normal</option>
            <option value="blur">Blur BG</option>
            <option value="grayscale">Noir</option>
            <option value="neon">Neon Border</option>
          </select>
        </div>

        {/* Core Media Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMicActive(!micActive)}
            className={`p-3 rounded-full transition-all duration-200 ${
              micActive ? "bg-[#161D2F] hover:bg-white/5 text-green-400" : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
            title={micActive ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setVideoActive(!videoActive)}
            className={`p-3 rounded-full transition-all duration-200 ${
              videoActive ? "bg-[#161D2F] hover:bg-white/5 text-green-400" : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
            title={videoActive ? "Stop Camera" : "Start Camera"}
          >
            {videoActive ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-all duration-200 ${
              screenShareActive ? "bg-accent-blue text-white" : "bg-[#161D2F] hover:bg-white/5 text-zinc-400 hover:text-white"
            }`}
            title={screenShareActive ? "Stop Sharing Screen" : "Share Screen"}
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          <button
            onClick={toggleRecording}
            className={`p-3 rounded-full transition-all duration-200 ${
              isRecording ? "bg-red-500 text-white animate-pulse" : "bg-[#161D2F] hover:bg-white/5 text-zinc-400 hover:text-red-400"
            }`}
            title={isRecording ? "Stop Recording" : "Record Meeting"}
          >
            <Radio className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-white/5 mx-1" />

          <button
            onClick={leaveMeeting}
            className="flex items-center gap-1.5 px-4.5 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-md shadow-red-500/10"
            title="End Session"
          >
            <PhoneOff className="w-4 h-4" /> <span className="hidden md:inline">End Session</span>
          </button>
        </div>

        {/* Workspace Feature Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => togglePanel("whiteboard")}
            className={`p-2.5 rounded-lg transition-all ${
              activePanel === "whiteboard" ? "bg-accent-blue text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
            title="Whiteboard"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => togglePanel("notes")}
            className={`p-2.5 rounded-lg transition-all ${
              activePanel === "notes" ? "bg-accent-blue text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
            title="Meeting Notes"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={() => togglePanel("chat")}
            className={`p-2.5 rounded-lg transition-all ${
              activePanel === "chat" ? "bg-accent-blue text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
            title="Chat Panel"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          <button
            onClick={() => togglePanel("polls")}
            className={`p-2.5 rounded-lg transition-all ${
              activePanel === "polls" ? "bg-accent-blue text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
            title="Live Polls"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => togglePanel("qa")}
            className={`p-2.5 rounded-lg transition-all ${
              activePanel === "qa" ? "bg-accent-blue text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
            title="Q&A"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => togglePanel("ai")}
            className={`p-2.5 rounded-lg transition-all ${
              activePanel === "ai" ? "bg-accent-purple text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
            title="AI Copilot"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
