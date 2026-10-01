import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { analyticsData } from "../data/mockData";
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity, AlertCircle } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("24h");

  // Custom tooltip for dark command center
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B0F17] border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono">
          <p className="text-slate-300 font-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              CORRIDOR ANALYTICS & PATTERN INTELLIGENCE
            </h2>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-bold">
              DEMO ANALYTICS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Illustrative trend models for traffic safety evaluation and event recurrence analysis.
          </p>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#0B0F17] p-1 rounded border border-slate-800 text-xs font-mono">
          {["24h", "7d", "30d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded transition uppercase ${
                timeRange === range
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Event Trend Over Time (Full Width) */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              1. SUSPECTED EVENT TREND OVER TIME (24-HOUR PROFILE)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Wrong-Side vs Possible Blockage Instances
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData.eventTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWrongSide" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorBlockage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748B" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "ui-monospace" }} />
              <Area
                type="monotone"
                dataKey="wrongSide"
                name="Possible Wrong-Side"
                stroke="#EF4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWrongSide)"
              />
              <Area
                type="monotone"
                dataKey="blockage"
                name="Possible Blockage"
                stroke="#F59E0B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorBlockage)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Events by Type & Vehicle Monitoring Count */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Type */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                2. INCIDENT BREAKDOWN BY CATEGORY
              </h3>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.eventsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {analyticsData.eventsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center font-mono">
            {analyticsData.eventsByType.map((item, idx) => (
              <div key={idx} className="p-2 rounded bg-[#0B0F17]">
                <div className="text-[10px] text-slate-400 truncate">{item.name}</div>
                <div className="text-sm font-bold mt-0.5" style={{ color: item.color }}>
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Volume Hourly */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                3. VEHICLE MONITORING VOLUME (HOURLY DENSITY)
              </h3>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.vehicleVolumeHourly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="volume" name="Vehicles / Hr" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Peak Hour: <strong className="text-white">18:00 (2,280 veh)</strong></span>
            <span>Sensor Accuracy: <strong className="text-emerald-400">98.4%</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: Camera Activity Matrix */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              4. OPTICAL SENSOR TELEMETRY & EVENT DETECTION FREQUENCY
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Monitored Cameras 01 through 06
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.cameraActivity} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="camera" stroke="#64748B" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "ui-monospace" }} />
              <Bar dataKey="tracked" name="Vehicles Tracked" fill="#0284C7" radius={[3, 3, 0, 0]} />
              <Bar dataKey="events" name="Suspected Events" fill="#F43F5E" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
