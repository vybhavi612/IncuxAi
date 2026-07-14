"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Plus, Vote, Trash } from "lucide-react";

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  isActive: boolean;
  userVotedIndex: number | null;
}

export const PollsPanel: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: "poll-1",
      question: "Should we migrate the dashboard to Next.js App Router this week?",
      options: [
        { text: "Yes, immediately", votes: 4 },
        { text: "No, after the Q3 release", votes: 2 },
        { text: "Need more research", votes: 1 },
      ],
      isActive: true,
      userVotedIndex: null,
    },
  ]);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isCreating, setIsCreating] = useState(false);

  const addOptionInput = () => {
    if (options.length < 5) setOptions([...options, ""]);
  };

  const updateOptionText = (index: number, val: string) => {
    const nextOpts = [...options];
    nextOpts[index] = val;
    setOptions(nextOpts);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const filteredOptions = options
      .map((o) => o.trim())
      .filter((o) => o !== "")
      .map((o) => ({ text: o, votes: 0 }));

    if (filteredOptions.length < 2) return;

    const newPoll: Poll = {
      id: "poll-" + Math.random().toString(36).substr(2, 9),
      question: question.trim(),
      options: filteredOptions,
      isActive: true,
      userVotedIndex: null,
    };

    setPolls([newPoll, ...polls]);
    setIsCreating(false);
    setQuestion("");
    setOptions(["", ""]);
  };

  const handleVote = (pollId: string, optionIndex: number) => {
    setPolls(
      polls.map((poll) => {
        if (poll.id !== pollId || poll.userVotedIndex !== null) return poll;
        
        const updatedOptions = [...poll.options];
        updatedOptions[optionIndex].votes += 1;
        
        return {
          ...poll,
          options: updatedOptions,
          userVotedIndex: optionIndex,
        };
      })
    );

    // Simulate bot votes after voting!
    setTimeout(() => {
      setPolls((currentPolls) =>
        currentPolls.map((poll) => {
          if (poll.id !== pollId) return poll;
          
          const updatedOptions = [...poll.options];
          // Distribute 1-3 random votes across options to simulate other participants
          const numVotes = Math.floor(Math.random() * 3) + 1;
          for (let i = 0; i < numVotes; i++) {
            const randIdx = Math.floor(Math.random() * updatedOptions.length);
            updatedOptions[randIdx].votes += 1;
          }
          return { ...poll, options: updatedOptions };
        })
      );
    }, 1200);
  };

  const deletePoll = (pollId: string) => {
    setPolls(polls.filter((p) => p.id !== pollId));
  };

  return (
    <div className="flex flex-col h-full bg-[#111625] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 bg-[#161D2F] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent-blue" />
          <h3 className="text-sm font-semibold text-white">Live Polls</h3>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent-blue hover:bg-blue-600 text-white text-[10px] font-bold transition-all"
          >
            <Plus className="w-3 h-3" /> Create Poll
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {isCreating ? (
          <form onSubmit={handleCreatePoll} className="space-y-3.5 bg-white/[0.02] border border-white/5 p-3.5 rounded-xl">
            <h4 className="text-xs font-semibold text-white">Create New Poll</h4>
            <div>
              <label className="block text-[10px] text-zinc-400 font-medium mb-1 uppercase tracking-wider">Question</label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask something..."
                className="w-full bg-white/[0.03] border border-white/5 px-3 py-2 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Options</label>
              {options.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  required={idx < 2}
                  value={opt}
                  onChange={(e) => updateOptionText(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  className="w-full bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-xl text-xs text-zinc-200 outline-none focus:border-accent-blue"
                />
              ))}
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={addOptionInput}
                  className="text-[10px] text-accent-blue hover:text-blue-400 font-semibold"
                >
                  + Add option
                </button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-xl hover:bg-white/5 text-zinc-400 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-accent-blue hover:bg-blue-600 text-white text-xs font-bold"
              >
                Launch Poll
              </button>
            </div>
          </form>
        ) : null}

        {polls.length === 0 && !isCreating ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 py-12">
            <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs">No active polls.</p>
            <p className="text-[10px] opacity-75">Click "Create Poll" to gather participant feedback.</p>
          </div>
        ) : (
          polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
            const hasVoted = poll.userVotedIndex !== null;

            return (
              <div key={poll.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3 relative group">
                <button
                  onClick={() => deletePoll(poll.id)}
                  className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="Delete Poll"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>

                <h4 className="text-xs font-semibold text-zinc-200 pr-6">{poll.question}</h4>

                {/* Option Voting & Results Display */}
                <div className="space-y-2">
                  {poll.options.map((opt, idx) => {
                    const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    const isSelected = poll.userVotedIndex === idx;

                    return (
                      <div key={idx} className="relative">
                        {hasVoted ? (
                          // Results view
                          <div className="text-xs flex items-center justify-between p-2.5 rounded-xl bg-white/[0.01] border border-white/5 overflow-hidden">
                            {/* Visual progress overlay */}
                            <div
                              className="absolute top-0 left-0 bottom-0 bg-accent-blue/10 border-r border-accent-blue/20 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                            <span className="relative font-medium text-zinc-300 flex items-center gap-1.5">
                              {opt.text}
                              {isSelected && <span className="text-[9px] bg-accent-blue/20 text-accent-blue px-1.5 py-0.5 rounded-full font-bold">Your Vote</span>}
                            </span>
                            <span className="relative font-bold text-zinc-400">{percentage}% ({opt.votes})</span>
                          </div>
                        ) : (
                          // Vote view
                          <button
                            onClick={() => handleVote(poll.id, idx)}
                            className="w-full flex items-center gap-2.5 text-xs text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-zinc-300 transition-all font-medium"
                          >
                            <Vote className="w-3.5 h-3.5 text-zinc-500 group-hover:text-accent-blue" />
                            {opt.text}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-zinc-500 flex justify-between font-medium">
                  <span>Total votes: {totalVotes}</span>
                  {hasVoted && <span className="text-green-400 font-semibold">Thank you for voting!</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
