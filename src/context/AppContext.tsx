"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string; // "ADMIN" | "ORGANIZER" | "ATTENDEE"
  mfaEnabled: boolean;
  mfaSecret?: string;
  ssoProvider?: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  isInstant: boolean;
  scheduledAt: string;
  durationMinutes: number;
  hostId: string;
  hostName: string;
  personalRoom: boolean;
  passcode?: string;
  waitingRoomEnabled: boolean;
  recordingEnabled: boolean;
  endedAt?: string | null;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  meetingId?: string | null;
  channelId?: string | null;
  createdAt: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  isGroup: boolean;
}

export interface Recording {
  id: string;
  meetingId: string;
  meetingTitle: string;
  videoUrl: string;
  transcript: { time: string; speaker: string; text: string }[];
  summary: string;
  actionItems: string[];
  durationSeconds: number;
  sizeBytes: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}

interface AppContextType {
  user: User | null;
  theme: "dark" | "light";
  activeMeeting: Meeting | null;
  meetings: Meeting[];
  channels: Channel[];
  messages: Message[];
  recordings: Recording[];
  auditLogs: AuditLog[];
  loading: boolean;
  toggleTheme: () => void;
  login: (email: string, passwordHash: string) => Promise<boolean>;
  loginSSO: (provider: string) => Promise<boolean>;
  register: (email: string, name: string, passwordHash: string, role: string) => Promise<boolean>;
  logout: () => void;
  createMeeting: (meetingData: Omit<Meeting, "id" | "hostId" | "hostName">) => Promise<Meeting>;
  deleteMeeting: (id: string) => Promise<boolean>;
  addMessage: (content: string, meetingId?: string | null, channelId?: string | null, senderId?: string, senderName?: string) => Promise<Message>;
  createChannel: (name: string, description: string) => Promise<Channel>;
  addRecording: (recording: Omit<Recording, "id" | "createdAt">) => Promise<Recording>;
  deleteRecording: (id: string) => Promise<boolean>;
  updateProfile: (name: string, mfaEnabled: boolean) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_CHANNELS: Channel[] = [
  { id: "chan-general", name: "general", description: "General company-wide announcements", isGroup: true },
  { id: "chan-marketing", name: "marketing", description: "Marketing campaigns discussion", isGroup: true },
  { id: "chan-eng", name: "engineering", description: "Tech stack and architecture sync", isGroup: true },
];

const DEFAULT_MESSAGES: Message[] = [
  { id: "msg-1", content: "Hey everyone! Welcome to the virtual collaboration space.", senderId: "bot-1", senderName: "Sarah Jenkins", channelId: "chan-general", createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "msg-2", content: "We have our engineering sync at 10 AM today. Make sure to update your boards.", senderId: "bot-2", senderName: "Alex Rivera", channelId: "chan-eng", createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "msg-3", content: "Great! I have uploaded the Q3 strategy doc in the shared notes.", senderId: "bot-3", senderName: "David Chen", channelId: "chan-marketing", createdAt: new Date(Date.now() - 900000).toISOString() },
];

const DEFAULT_MEETINGS: Meeting[] = [
  {
    id: "meet-1",
    title: "Weekly Engineering Sync",
    description: "Review current sprints and resolve blockers.",
    isInstant: false,
    scheduledAt: new Date(Date.now() + 3600000).toISOString(), // in 1 hour
    durationMinutes: 45,
    hostId: "bot-2",
    hostName: "Alex Rivera",
    personalRoom: false,
    passcode: "123456",
    waitingRoomEnabled: true,
    recordingEnabled: true,
  },
  {
    id: "meet-2",
    title: "Marketing Campaign Kickoff",
    description: "Launch details for Q3 product features.",
    isInstant: false,
    scheduledAt: new Date(Date.now() + 3600000 * 4).toISOString(), // in 4 hours
    durationMinutes: 60,
    hostId: "bot-3",
    hostName: "David Chen",
    personalRoom: false,
    passcode: "987654",
    waitingRoomEnabled: false,
    recordingEnabled: true,
  },
];

const DEFAULT_RECORDINGS: Recording[] = [
  {
    id: "rec-1",
    meetingId: "meet-old-1",
    meetingTitle: "Sprint Review & Demo - July 12",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    transcript: [
      { time: "00:02", speaker: "Alex Rivera", text: "Welcome everyone. Let's start the sprint review. Sarah, do you want to show the new whiteboard?" },
      { time: "00:15", speaker: "Sarah Jenkins", text: "Sure! I've completed the canvas syncing module. Users can draw, write text, and clear layers in real-time." },
      { time: "00:32", speaker: "David Chen", text: "Nice! What about the export options? Can we export to PDF or PNG?" },
      { time: "00:45", speaker: "Sarah Jenkins", text: "Yes, currently we support PNG exports directly from the whiteboard toolbar." },
    ],
    summary: "The team reviewed sprint items. Sarah demonstrated the new real-time whiteboard canvas including drawing controls, shape support, and PNG image exports. The team approved the features for release and discussed future export expansions.",
    actionItems: [
      "Sarah Jenkins: Add PDF export option to whiteboard in the next sprint.",
      "Alex Rivera: Schedule staging deployment for Thursday morning.",
      "David Chen: Update product documentation for the new collaboration tools.",
    ],
    durationSeconds: 61,
    sizeBytes: 12450000,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize and load from local storage
  useEffect(() => {
    const localUser = localStorage.getItem("vc_user");
    const localTheme = localStorage.getItem("vc_theme") as "dark" | "light";
    const localMeetings = localStorage.getItem("vc_meetings");
    const localChannels = localStorage.getItem("vc_channels");
    const localMessages = localStorage.getItem("vc_messages");
    const localRecordings = localStorage.getItem("vc_recordings");
    const localLogs = localStorage.getItem("vc_logs");

    if (localUser) setUser(JSON.parse(localUser));
    if (localTheme) setTheme(localTheme);
    
    setMeetings(localMeetings ? JSON.parse(localMeetings) : DEFAULT_MEETINGS);
    setChannels(localChannels ? JSON.parse(localChannels) : DEFAULT_CHANNELS);
    setMessages(localMessages ? JSON.parse(localMessages) : DEFAULT_MESSAGES);
    setRecordings(localRecordings ? JSON.parse(localRecordings) : DEFAULT_RECORDINGS);
    setAuditLogs(localLogs ? JSON.parse(localLogs) : [
      {
        id: "log-seed-1",
        userName: "System Seed",
        action: "INITIALIZE",
        details: "Mock database initialized successfully.",
        createdAt: new Date().toISOString(),
      }
    ]);
    
    setLoading(false);
  }, []);

  // Save changes to local storage
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("vc_theme", nextTheme);
  };

  const login = async (email: string, passwordHash: string): Promise<boolean> => {
    // Basic mock authentication
    const name = email.split("@")[0];
    const uppercaseName = name.charAt(0).toUpperCase() + name.slice(1);
    const mockUser: User = {
      id: "usr-" + Math.random().toString(36).substr(2, 9),
      email: email,
      name: uppercaseName,
      role: email.includes("admin") ? "ADMIN" : email.includes("org") ? "ORGANIZER" : "ATTENDEE",
      mfaEnabled: false,
    };
    setUser(mockUser);
    saveState("vc_user", mockUser);

    const log: AuditLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      userName: mockUser.name,
      action: "LOGIN",
      details: `User logged in using email authentication. Role: ${mockUser.role}`,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...auditLogs];
    setAuditLogs(nextLogs);
    saveState("vc_logs", nextLogs);

    return true;
  };

  const loginSSO = async (provider: string): Promise<boolean> => {
    const mockUser: User = {
      id: "usr-" + Math.random().toString(36).substr(2, 9),
      email: `${provider}.user@enterprise.com`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Workspace User`,
      role: "ORGANIZER",
      mfaEnabled: false,
      ssoProvider: provider,
    };
    setUser(mockUser);
    saveState("vc_user", mockUser);

    const log: AuditLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      userName: mockUser.name,
      action: "LOGIN_SSO",
      details: `User authenticated via SSO (${provider}).`,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...auditLogs];
    setAuditLogs(nextLogs);
    saveState("vc_logs", nextLogs);

    return true;
  };

  const register = async (email: string, name: string, passwordHash: string, role: string): Promise<boolean> => {
    const mockUser: User = {
      id: "usr-" + Math.random().toString(36).substr(2, 9),
      email: email,
      name: name,
      role: role,
      mfaEnabled: false,
    };
    setUser(mockUser);
    saveState("vc_user", mockUser);

    const log: AuditLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      userName: mockUser.name,
      action: "REGISTER",
      details: `User account created: ${email} with role: ${role}`,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...auditLogs];
    setAuditLogs(nextLogs);
    saveState("vc_logs", nextLogs);

    return true;
  };

  const logout = () => {
    if (user) {
      const log: AuditLog = {
        id: "log-" + Math.random().toString(36).substr(2, 9),
        userName: user.name,
        action: "LOGOUT",
        details: "User logged out successfully.",
        createdAt: new Date().toISOString(),
      };
      const nextLogs = [log, ...auditLogs];
      setAuditLogs(nextLogs);
      saveState("vc_logs", nextLogs);
    }
    setUser(null);
    localStorage.removeItem("vc_user");
    setActiveMeeting(null);
  };

  const createMeeting = async (meetingData: Omit<Meeting, "id" | "hostId" | "hostName">): Promise<Meeting> => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: "meet-" + Math.random().toString(36).substr(2, 9),
      hostId: user?.id || "anonymous-host",
      hostName: user?.name || "Anonymous",
    };
    const nextMeetings = [newMeeting, ...meetings];
    setMeetings(nextMeetings);
    saveState("vc_meetings", nextMeetings);

    const log: AuditLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      userName: user?.name || "Anonymous",
      action: "CREATE_MEETING",
      details: `Meeting "${newMeeting.title}" created. Scheduled: ${newMeeting.scheduledAt}`,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...auditLogs];
    setAuditLogs(nextLogs);
    saveState("vc_logs", nextLogs);

    return newMeeting;
  };

  const deleteMeeting = async (id: string): Promise<boolean> => {
    const meetingToDelete = meetings.find(m => m.id === id);
    const nextMeetings = meetings.filter(m => m.id !== id);
    setMeetings(nextMeetings);
    saveState("vc_meetings", nextMeetings);

    if (meetingToDelete) {
      const log: AuditLog = {
        id: "log-" + Math.random().toString(36).substr(2, 9),
        userName: user?.name || "Anonymous",
        action: "DELETE_MEETING",
        details: `Meeting "${meetingToDelete.title}" deleted.`,
        createdAt: new Date().toISOString(),
      };
      const nextLogs = [log, ...auditLogs];
      setAuditLogs(nextLogs);
      saveState("vc_logs", nextLogs);
    }

    return true;
  };

  const addMessage = async (
    content: string,
    meetingId?: string | null,
    channelId?: string | null,
    senderId?: string,
    senderName?: string
  ): Promise<Message> => {
    const newMessage: Message = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      content,
      senderId: senderId || user?.id || "guest",
      senderName: senderName || user?.name || "Guest Participant",
      meetingId,
      channelId,
      createdAt: new Date().toISOString(),
    };
    const nextMessages = [...messages, newMessage];
    setMessages(nextMessages);
    saveState("vc_messages", nextMessages);
    return newMessage;
  };

  const createChannel = async (name: string, description: string): Promise<Channel> => {
    const cleanName = name.trim().toLowerCase().replace(/\s+/g, "-");
    const newChannel: Channel = {
      id: "chan-" + Math.random().toString(36).substr(2, 9),
      name: cleanName,
      description,
      isGroup: true,
    };
    const nextChannels = [...channels, newChannel];
    setChannels(nextChannels);
    saveState("vc_channels", nextChannels);

    const log: AuditLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      userName: user?.name || "System",
      action: "CREATE_CHANNEL",
      details: `New team channel #${cleanName} created.`,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...auditLogs];
    setAuditLogs(nextLogs);
    saveState("vc_logs", nextLogs);

    return newChannel;
  };

  const addRecording = async (recordingData: Omit<Recording, "id" | "createdAt">): Promise<Recording> => {
    const newRecording: Recording = {
      ...recordingData,
      id: "rec-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const nextRecordings = [newRecording, ...recordings];
    setRecordings(nextRecordings);
    saveState("vc_recordings", nextRecordings);

    const log: AuditLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      userName: user?.name || "System",
      action: "ADD_RECORDING",
      details: `New meeting recording added: "${newRecording.meetingTitle}"`,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...auditLogs];
    setAuditLogs(nextLogs);
    saveState("vc_logs", nextLogs);

    return newRecording;
  };

  const deleteRecording = async (id: string): Promise<boolean> => {
    const recordingToDelete = recordings.find(r => r.id === id);
    const nextRecordings = recordings.filter(r => r.id !== id);
    setRecordings(nextRecordings);
    saveState("vc_recordings", nextRecordings);

    if (recordingToDelete) {
      const log: AuditLog = {
        id: "log-" + Math.random().toString(36).substr(2, 9),
        userName: user?.name || "Anonymous",
        action: "DELETE_RECORDING",
        details: `Recording "${recordingToDelete.meetingTitle}" deleted.`,
        createdAt: new Date().toISOString(),
      };
      const nextLogs = [log, ...auditLogs];
      setAuditLogs(nextLogs);
      saveState("vc_logs", nextLogs);
    }
    return true;
  };

  const updateProfile = async (name: string, mfaEnabled: boolean): Promise<boolean> => {
    if (!user) return false;
    const nextUser = { ...user, name, mfaEnabled };
    if (mfaEnabled && !user.mfaEnabled) {
      nextUser.mfaSecret = "GE3TMMZSGV2DGOBXOV3G22LOMVZA"; // Mock secret key for authenticator apps
    }
    setUser(nextUser);
    saveState("vc_user", nextUser);

    const log: AuditLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      userName: name,
      action: "UPDATE_PROFILE",
      details: `Profile updated. MFA Enabled: ${mfaEnabled}`,
      createdAt: new Date().toISOString(),
    };
    const nextLogs = [log, ...auditLogs];
    setAuditLogs(nextLogs);
    saveState("vc_logs", nextLogs);

    return true;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        theme,
        activeMeeting,
        meetings,
        channels,
        messages,
        recordings,
        auditLogs,
        loading,
        toggleTheme,
        login,
        loginSSO,
        register,
        logout,
        createMeeting,
        deleteMeeting,
        addMessage,
        createChannel,
        addRecording,
        deleteRecording,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
