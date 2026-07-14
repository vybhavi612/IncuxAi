"use client";

import React, { useState } from "react";

export const AdminCharts: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; value: number; x: number; y: number } | null>(null);

  // Data for Area Chart: Daily Active Users
  const areaData = [
    { day: "Mon", users: 320, x: 40, y: 150 },
    { day: "Tue", users: 450, x: 100, y: 110 },
    { day: "Wed", users: 580, x: 160, y: 70 },
    { day: "Thu", users: 510, x: 220, y: 90 },
    { day: "Fri", users: 690, x: 280, y: 40 },
    { day: "Sat", users: 240, x: 340, y: 180 },
    { day: "Sun", users: 190, x: 400, y: 200 },
  ];

  // Data for Bar Chart: Meeting Minutes by Department
  const barData = [
    { dept: "Engineering", mins: 1240, color: "#0E78F9", height: 110 },
    { dept: "Marketing", mins: 820, color: "#830EF9", height: 75 },
    { dept: "Sales", mins: 980, color: "#10B981", height: 90 },
    { dept: "HR / Ops", mins: 450, color: "#EAB308", height: 40 },
    { dept: "Product", mins: 1100, color: "#EC4899", height: 100 },
  ];

  // Helper to draw Area path
  const areaPath = areaData.map((d) => `${d.x},${d.y}`).join(" L ");
  const areaFillPath = `M ${areaData[0].x},220 L ${areaPath} L ${areaData[areaData.length - 1].x},220 Z`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Area Chart: Active Users Daily */}
      <div className="bg-[#161D2F] border border-white/5 p-5 rounded-2xl relative shadow-lg">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white">Daily Active Users (DAU)</h3>
          <p className="text-[10px] text-zinc-400">Unique participants joining video sessions over the last 7 days.</p>
        </div>

        <div className="relative h-60 w-full">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 440 240">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E78F9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0E78F9" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="40" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="40" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="40" y1="160" x2="400" y2="160" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="40" y1="220" x2="400" y2="220" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

            {/* Area Fill */}
            <path d={areaFillPath} fill="url(#areaGrad)" />

            {/* Line Path */}
            <path d={`M ${areaPath}`} fill="none" stroke="#0E78F9" strokeWidth="2.5" />

            {/* Coordinate Dots */}
            {areaData.map((d, idx) => (
              <circle
                key={idx}
                cx={d.x}
                cy={d.y}
                r="4.5"
                fill="#161D2F"
                stroke="#0E78F9"
                strokeWidth="2.5"
                className="cursor-pointer transition-all hover:r-6 hover:fill-accent-blue"
                onMouseEnter={() => setHoveredPoint({ day: d.day, value: d.users, x: d.x, y: d.y })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

            {/* Labels */}
            {areaData.map((d, idx) => (
              <text
                key={idx}
                x={d.x}
                y="238"
                fill="#71717A"
                fontSize="10"
                textAnchor="middle"
                className="font-bold font-sans"
              >
                {d.day}
              </text>
            ))}

            {/* Y Axis Values */}
            <text x="32" y="44" fill="#71717A" fontSize="9" textAnchor="end" className="font-sans font-bold">750</text>
            <text x="32" y="104" fill="#71717A" fontSize="9" textAnchor="end" className="font-sans font-bold">500</text>
            <text x="32" y="164" fill="#71717A" fontSize="9" textAnchor="end" className="font-sans font-bold">250</text>
            <text x="32" y="224" fill="#71717A" fontSize="9" textAnchor="end" className="font-sans font-bold">0</text>
          </svg>

          {/* Interactive Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute bg-[#1C253B] border border-[#0E78F9]/40 px-2 py-1 rounded shadow-xl text-[10px] pointer-events-none transition-all duration-150 z-20"
              style={{
                left: `${(hoveredPoint.x / 440) * 100}%`,
                top: `${(hoveredPoint.y / 240) * 100 - 18}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="font-semibold text-white">{hoveredPoint.day}</div>
              <div className="text-accent-blue font-bold">{hoveredPoint.value} Active</div>
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart: Call Volume by Department */}
      <div className="bg-[#161D2F] border border-white/5 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white">Call Volume by Department</h3>
          <p className="text-[10px] text-zinc-400">Total collaborative meeting minutes tracked this month.</p>
        </div>

        <div className="space-y-4">
          {barData.map((b, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300">{b.dept}</span>
                <span className="text-zinc-400 font-bold">{b.mins.toLocaleString()} mins</span>
              </div>
              <div className="w-full bg-white/[0.02] border border-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    backgroundColor: b.color,
                    width: `${(b.mins / 1500) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-[9px] text-zinc-500 font-bold pt-4 border-t border-white/5 mt-4 uppercase tracking-wider">
          <span>Target Capacity: 1,500 mins/dept</span>
          <span className="text-accent-blue font-semibold">Metrics Active</span>
        </div>
      </div>
    </div>
  );
};
