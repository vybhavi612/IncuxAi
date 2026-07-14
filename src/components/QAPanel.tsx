"use client";

import React, { useState } from "react";
import { HelpCircle, ThumbsUp, Send, Trash, CheckCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface Question {
  id: string;
  author: string;
  content: string;
  votes: number;
  answer?: string;
  isAnswered: boolean;
  userVoted: boolean;
  createdAt: string;
}

export const QAPanel: React.FC = () => {
  const { user } = useApp();
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q-1",
      author: "David Chen",
      content: "Does the current WebRTC implementation support automatic reconnects if connection drops?",
      votes: 3,
      answer: "Yes, the WebRTC signaling client includes automatic ICE restart logic which attempts connection reconnects for up to 15 seconds.",
      isAnswered: true,
      userVoted: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "q-2",
      author: "Sarah Jenkins",
      content: "Will the recording capture both active speaker view and the shared whiteboard simultaneously?",
      votes: 5,
      isAnswered: false,
      userVoted: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);

  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | "unanswered" | "answered">("all");
  const [answerInputs, setAnswerInputs] = useState<{ [key: string]: string }>({});

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newQuestion: Question = {
      id: "q-" + Math.random().toString(36).substr(2, 9),
      author: user?.name || "Guest Participant",
      content: text.trim(),
      votes: 1,
      isAnswered: false,
      userVoted: true,
      createdAt: new Date().toISOString(),
    };

    setQuestions([newQuestion, ...questions]);
    setText("");

    // Simulate bot upvotes or question responses
    setTimeout(() => {
      setQuestions((curr) =>
        curr.map((q) => {
          if (q.id !== newQuestion.id) return q;
          return { ...q, votes: q.votes + Math.floor(Math.random() * 3) + 1 };
        })
      );
    }, 2000);
  };

  const handleVote = (id: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id !== id) return q;
        const diff = q.userVoted ? -1 : 1;
        return {
          ...q,
          votes: q.votes + diff,
          userVoted: !q.userVoted,
        };
      })
    );
  };

  const handleAnswerSubmit = (qId: string) => {
    const answerText = answerInputs[qId]?.trim();
    if (!answerText) return;

    setQuestions(
      questions.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          answer: answerText,
          isAnswered: true,
        };
      })
    );

    // Clear input
    setAnswerInputs((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const filteredQuestions = questions
    .filter((q) => {
      if (filter === "unanswered") return !q.isAnswered;
      if (filter === "answered") return q.isAnswered;
      return true;
    })
    .sort((a, b) => b.votes - a.votes); // Sort by highest upvotes first

  return (
    <div className="flex flex-col h-full bg-[#111625] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-[#161D2F] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-accent-blue" />
          <h3 className="text-sm font-semibold text-white">Q&A Session</h3>
        </div>
        <div className="flex gap-1">
          {(["all", "unanswered", "answered"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize transition-colors ${
                filter === t ? "bg-accent-blue text-white" : "text-zinc-500 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Scroll List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-12">
            <HelpCircle className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs">No questions found.</p>
            <p className="text-[10px] opacity-75">Ask a question below or upvote others.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3 relative group">
              {/* Question header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block">{q.author}</span>
                  <span className="text-[8px] text-zinc-600 block mt-0.5">
                    {new Date(q.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(q.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all text-[10px] font-bold ${
                      q.userVoted
                        ? "bg-accent-blue/10 border-accent-blue/30 text-accent-blue"
                        : "border-white/5 text-zinc-500 hover:text-white"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{q.votes}</span>
                  </button>

                  {user?.role === "ADMIN" || user?.role === "ORGANIZER" ? (
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Question"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Question Body */}
              <p className="text-xs text-zinc-200 leading-relaxed font-medium">{q.content}</p>

              {/* Answer details */}
              {q.isAnswered ? (
                <div className="bg-accent-blue/5 border-l-2 border-accent-blue p-2.5 rounded-r-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-accent-blue">
                    <CheckCircle className="w-3 h-3" />
                    <span>Answered by Host</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">{q.answer}</p>
                </div>
              ) : (
                // Only allow hosts (admin/organizer) to answer
                (user?.role === "ADMIN" || user?.role === "ORGANIZER") && (
                  <div className="flex gap-1.5 pt-1.5">
                    <input
                      type="text"
                      placeholder="Type answer..."
                      value={answerInputs[q.id] || ""}
                      onChange={(e) =>
                        setAnswerInputs({ ...answerInputs, [q.id]: e.target.value })
                      }
                      className="flex-1 bg-white/[0.03] border border-white/5 px-2.5 py-1 rounded-lg text-[11px] text-zinc-200 outline-none placeholder-zinc-600 focus:border-accent-blue"
                    />
                    <button
                      onClick={() => handleAnswerSubmit(q.id)}
                      className="px-2.5 rounded-lg bg-accent-blue hover:bg-blue-600 text-white text-[10px] font-bold transition-all"
                    >
                      Answer
                    </button>
                  </div>
                )
              )}
            </div>
          ))
        )}
      </div>

      {/* Question Submitter */}
      <form onSubmit={handleAsk} className="p-3 bg-[#161D2F] border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-white/[0.03] border border-white/5 px-3 py-2 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-accent-blue transition-colors"
        />
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
