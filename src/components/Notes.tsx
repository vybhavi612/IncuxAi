"use client";

import React, { useState } from "react";
import {
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Trash2,
  Copy,
  Check,
  FileText,
} from "lucide-react";

export const Notes: React.FC = () => {
  const [content, setContent] = useState<string>(
    "# Meeting Notes & Agenda\n\n- Discuss Q3 roadmap and timelines\n- Assign developer leads for the WebRTC channels module\n- Security audit review schedule\n\n## Action Items:\n- Sarah to complete whiteboard improvements.\n- David to update API integration guides."
  );
  const [copied, setCopied] = useState(false);

  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById("meeting-notes-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;

    const nextContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(nextContent);

    // Focus back on the textarea and select the newly formatted block
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 50);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadNotes = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `vibesync-meeting-notes-${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-full bg-[#111625] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161D2F] border-b border-white/5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => insertText("**", "**")}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText("*", "*")}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/5 mx-1" />
          <button
            onClick={() => insertText("# ", "")}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText("## ", "")}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText("- ", "")}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1 text-xs"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={downloadNotes}
            className="p-1.5 rounded text-zinc-400 hover:text-accent-blue hover:bg-white/5 transition-all flex items-center gap-1 text-xs"
            title="Download Notes"
          >
            <FileText className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            onClick={() => setContent("")}
            className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-white/5 transition-all"
            title="Clear Text"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 p-4 relative">
        <textarea
          id="meeting-notes-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start typing your collaborative notes here (Markdown supported)..."
          className="w-full h-full bg-transparent text-zinc-200 outline-none resize-none border-0 font-mono text-sm leading-relaxed placeholder-zinc-600"
        />
      </div>
    </div>
  );
};
