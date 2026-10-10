import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { analyticsData } from "../data/mockData";
import { TrendingUp, BarChart3, FileText, Download, Activity, Calendar, ShieldCheck } from "lucide-react";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("24h");

  // Modern frosted glass tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-3 rounded-xl shadow-xl text-xs font-sans">
          <p className="text-slate-900 font-bold mb-1.5 font-mono-tech">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
                  <span>{entry.name}:</span>
                </span>
                <span className="font-bold font-mono-tech text-slate-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Operations report table dataset
  const reportRows = [
    { date: "2026-10-02", location: "Sector 4 Main Carriageway (Chainage 34+200)", eventType: "Possible Wrong-Side", count: 2, status: "Under Review" },
    { date: "2026-10-02", location: "North Overpass Approach & Slip Road", eventType: "Possible Blockage", count: 1, status: "Investigated" },
    { date: "2026-10-02", location: "Interchange Exit 7 Ramp", eventType: "Slow Congestion Queue", count: 3, status: "Normalised" },
    { date: "2026-10-01", location: "Sector 4 Main Carriageway", eventType: "Possible Wrong-Side", count: 1, status: "Resolved" },
    { date: "2026-10-01", location: "Toll Plaza Inbound Gates 1-6", eventType: "Shoulder Obstruction", count: 2, status: "Cleared" },
    { date: "2026-09-30", location: "Mid-Block Open Section (Chainage 42+800)", eventType: "Stationary Vehicle", count: 1, status: "Cleared" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Executive Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-bold font-mono-tech uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80">
              Operations Intelligence & Safety Trends
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">· 30-Day Aggregation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            Corridor Analytics & Intelligence Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Statistical flow analysis, violation frequency curves, and vehicle density telemetry
          </p>
        </div>

        {/* Time Filter & Export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs">
            {["24h", "7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-lg transition uppercase font-semibold ${
                  timeRange === range
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert("Safety audit report exported successfully.")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export PDF Audit</span>
          </button>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Incident Frequency Trend */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Hourly Incident & Violation Distribution
              </h3>
              <span className="text-xs font-mono-tech text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-semibold">
                PEAK: 16:00
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Wrong-side driving and stationary blockage occurrences by time of day
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.hourlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorWrongSide" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                <Area type="monotone" dataKey="totalEvents" name="Total Events" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncidents)" />
                <Area type="monotone" dataKey="wrongSide" name="Wrong-Side Alerts" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWrongSide)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Classification Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Corridor Vehicle Classification & Modal Share
              </h3>
              <span className="text-xs font-mono-tech text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-semibold">
                YOLOv8 DETECTIONS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of tracked vehicle types across all monitored camera sectors
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.vehicleTypes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="type" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                <Bar dataKey="count" name="Vehicle Count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Corridor Operations Historical Audit Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Corridor Operations Historical Audit Log
          </h3>
          <span className="text-xs font-mono-tech text-slate-500">
            6 Recent Multi-Sector Logs
          </span>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider font-mono-tech text-[11px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Corridor Sector</th>
                <th className="py-3 px-4">Event Classification</th>
                <th className="py-3 px-4">Occurrence Count</th>
                <th className="py-3 px-4">Resolution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 bg-white/70">
              {reportRows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono-tech font-medium text-slate-900">{row.date}</td>
                  <td className="py-3 px-4 text-slate-600">{row.location}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{row.eventType}</td>
                  <td className="py-3 px-4 font-mono-tech font-bold text-slate-900">{row.count}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono-tech font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
