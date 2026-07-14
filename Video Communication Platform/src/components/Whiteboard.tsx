"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  PenTool,
  Square,
  Circle,
  TrendingUp, // For drawing lines
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
} from "lucide-react";

interface Point {
  x: number;
  y: number;
}

export const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#F4F4F6"); // Default light text color
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<"pen" | "rect" | "circle" | "line" | "eraser">("pen");
  
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // We set drawing coordinates matching display size to prevent fuzzy lines
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(2, 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    // Fill background as dark-blue
    context.fillStyle = "#111625";
    context.fillRect(0, 0, rect.width, rect.height);

    // Save initial blank state
    const initialState = canvas.toDataURL();
    setHistory([initialState]);
    setHistoryIndex(0);

    // Handle canvas resize on window resize
    const handleResize = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) tempCtx.drawImage(canvas, 0, 0);

      const newRect = canvas.getBoundingClientRect();
      canvas.width = newRect.width * 2;
      canvas.height = newRect.height * 2;
      canvas.style.width = `${newRect.width}px`;
      canvas.style.height = `${newRect.height}px`;

      context.scale(2, 2);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.drawImage(tempCanvas, 0, 0, newRect.width, newRect.height);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update canvas stroke configurations when color or brush size updates
  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = tool === "eraser" ? "#111625" : color;
    contextRef.current.lineWidth = lineWidth;
  }, [color, lineWidth, tool]);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const currentState = canvas.toDataURL();
    const cleanHistory = history.slice(0, historyIndex + 1);
    setHistory([...cleanHistory, currentState]);
    setHistoryIndex(cleanHistory.length);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });

    if (tool === "pen" || tool === "eraser") {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ctx = contextRef.current;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // Shape tools need to redraw the background layout from history
      // to simulate fluid drawing drag and dropping
      const img = new Image();
      img.src = history[historyIndex];
      img.onload = () => {
        ctx.fillStyle = "#111625";
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);

        ctx.beginPath();
        if (tool === "rect") {
          ctx.strokeRect(startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y);
        } else if (tool === "circle") {
          const radius = Math.sqrt(Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2));
          ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (tool === "line") {
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      };
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    contextRef.current?.closePath();
    saveHistoryState();
  };

  const undo = () => {
    if (historyIndex <= 0 || !canvasRef.current || !contextRef.current) return;
    const prevIndex = historyIndex - 1;
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    const rect = canvas.getBoundingClientRect();

    const img = new Image();
    img.src = history[prevIndex];
    img.onload = () => {
      ctx.fillStyle = "#111625";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      setHistoryIndex(prevIndex);
    };
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !canvasRef.current || !contextRef.current) return;
    const nextIndex = historyIndex + 1;
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    const rect = canvas.getBoundingClientRect();

    const img = new Image();
    img.src = history[nextIndex];
    img.onload = () => {
      ctx.fillStyle = "#111625";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
      setHistoryIndex(nextIndex);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#111625";
    ctx.fillRect(0, 0, rect.width, rect.height);
    saveHistoryState();
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `vibesync-whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = [
    { value: "#F4F4F6", name: "White" },
    { value: "#0E78F9", name: "Blue" },
    { value: "#10B981", name: "Green" },
    { value: "#EF4444", name: "Red" },
    { value: "#EAB308", name: "Yellow" },
    { value: "#830EF9", name: "Purple" },
    { value: "#EC4899", name: "Pink" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111625] rounded-2xl overflow-hidden border border-white/5 relative shadow-2xl">
      {/* Canvas Workspace */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full flex-1 cursor-crosshair touch-none"
      />

      {/* Floating Suspended Canvas Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#161D2F]/90 backdrop-blur-xl border border-white/5 px-4 py-2.5 rounded-full shadow-2xl z-20">
        {/* Tool Selectors */}
        <div className="flex items-center gap-1 border-r border-white/5 pr-3">
          <button
            onClick={() => setTool("pen")}
            className={`p-2 rounded-full transition-all duration-200 ${
              tool === "pen" ? "bg-accent-blue text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Pen Tool"
          >
            <PenTool className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("rect")}
            className={`p-2 rounded-full transition-all duration-200 ${
              tool === "rect" ? "bg-accent-blue text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Rectangle Tool"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("circle")}
            className={`p-2 rounded-full transition-all duration-200 ${
              tool === "circle" ? "bg-accent-blue text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Circle Tool"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("line")}
            className={`p-2 rounded-full transition-all duration-200 ${
              tool === "line" ? "bg-accent-blue text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Line Tool"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-full transition-all duration-200 ${
              tool === "eraser" ? "bg-accent-blue text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
            title="Eraser Tool"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Thickness Selector */}
        <div className="flex items-center gap-1.5 border-r border-white/5 pr-3">
          {[2, 4, 8].map((size, index) => (
            <button
              key={size}
              onClick={() => setLineWidth(size)}
              className={`rounded-full transition-all flex items-center justify-center ${
                lineWidth === size
                  ? "bg-white/10 ring-2 ring-accent-blue"
                  : "hover:bg-white/5"
              }`}
              style={{ width: "24px", height: "24px" }}
              title={`Brush Size ${index + 1}`}
            >
              <div
                className="bg-zinc-300 rounded-full"
                style={{ width: `${size + 2}px`, height: `${size + 2}px` }}
              />
            </button>
          ))}
        </div>

        {/* Colors Palette */}
        {tool !== "eraser" && (
          <div className="flex items-center gap-1.5 border-r border-white/5 pr-3">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-5 h-5 rounded-full border border-white/10 transition-all scale-100 hover:scale-110 active:scale-95 ${
                  color === c.value ? "ring-2 ring-offset-2 ring-offset-[#161D2F] ring-accent-blue" : ""
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Undo/Redo/Clear/Download Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-full text-zinc-400 hover:text-red-400 hover:bg-white/5"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={exportPNG}
            className="p-2 rounded-full text-zinc-400 hover:text-accent-blue hover:bg-white/5"
            title="Export Image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
