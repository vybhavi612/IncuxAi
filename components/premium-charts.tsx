"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"

// Types for Charts data
interface BarChartData {
  label: string
  value: number // primary value (e.g. attendance count or hours)
}

interface DonutChartData {
  name: string
  value: number
  color: string
}

// ----------------------------------------------------
// 1. PREMIUM BAR CHART (e.g. Weekly hours or active count)
// ----------------------------------------------------
interface PremiumBarChartProps {
  data: BarChartData[]
  title?: string
  subtitle?: string
  yLabel?: string
  maxVal?: number
}

export function PremiumBarChart({ data, title, subtitle, yLabel = "Hours", maxVal }: PremiumBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  const values = data.map(d => d.value)
  const max = maxVal || Math.max(...values, 1)

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col h-full">
      {title && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/* Chart Layout */}
      <div className="flex-1 flex gap-4 items-end relative min-h-[160px] pb-6 pt-4">
        {/* Y Axis line helper */}
        <div className="absolute left-0 bottom-6 right-0 border-b border-white/5"></div>
        <div className="absolute left-0 bottom-[50%] right-0 border-b border-dashed border-white/5"></div>
        <div className="absolute left-0 top-4 right-0 border-b border-dashed border-white/5"></div>

        {data.map((item, idx) => {
          const percentage = (item.value / max) * 100
          
          return (
            <div 
              key={idx} 
              className="flex-1 flex flex-col items-center group relative z-10"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {hoveredIndex === idx && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: -4, scale: 1 }}
                  className="absolute -top-8 px-2 py-1 bg-indigo-950 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded shadow-lg pointer-events-none whitespace-nowrap z-30"
                >
                  {item.value} {yLabel}
                </motion.div>
              )}

              {/* Bar */}
              <div className="w-full max-w-[32px] bg-white/5 rounded-t-lg overflow-hidden h-[120px] flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 rounded-t-lg relative"
                >
                  {/* Inner subtle glow */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </motion.div>
              </div>

              {/* Label */}
              <span className="text-[10px] text-slate-500 font-medium mt-3 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 2. PREMIUM DONUT CHART (e.g. Present vs Late vs Absent)
// ----------------------------------------------------
interface PremiumDonutChartProps {
  data: DonutChartData[]
  title?: string
  subtitle?: string
}

export function PremiumDonutChart({ data, title, subtitle }: PremiumDonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  // SVG calculations
  const size = 160
  const strokeWidth = 16
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let accumulatedPercentage = 0

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col h-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Circle container */}
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth={strokeWidth}
            />

            {data.map((item, idx) => {
              if (item.value === 0 || total === 0) return null

              const percentage = (item.value / total) * 100
              const strokeLength = (percentage / 100) * circumference
              const strokeOffset = circumference - strokeLength
              const rotation = (accumulatedPercentage / 100) * 360
              accumulatedPercentage += percentage

              const isHovered = hoveredIdx === idx

              return (
                <motion.circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                  strokeDashoffset={0}
                  transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
                  style={{
                    transformOrigin: "center",
                    cursor: "pointer",
                    transition: "stroke-width 0.2s ease"
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${strokeLength} ${circumference - strokeLength}` }}
                  transition={{ duration: 1, ease: "easeInOut", delay: idx * 0.1 }}
                />
              )
            })}
          </svg>

          {/* Central text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white">
              {hoveredIdx !== null && total > 0
                ? `${Math.round((data[hoveredIdx].value / total) * 100)}%`
                : total}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              {hoveredIdx !== null ? data[hoveredIdx].name : "Total Records"}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5">
          {data.map((item, idx) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0
            return (
              <div 
                key={idx}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  hoveredIdx === idx 
                    ? "bg-white/5 border-white/10" 
                    : "bg-transparent border-transparent"
                }`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-300">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.value} ({percentage}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
