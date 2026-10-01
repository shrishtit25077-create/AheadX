import React from "react";
import { NavLink } from "react-router-dom";
import {
  ShieldAlert,
  Video,
  AlertTriangle,
  MapPin,
  BarChart3,
  Activity,
  Radio,
  Sliders,
  Layers,
} from "lucide-react";
import { systemMeta } from "../../data/mockData";

export default function Sidebar() {
  const navItems = [
    {
      to: "/dashboard",
      label: "Command Center",
      icon: Activity,
    },
    {
      to: "/monitoring",
      label: "Live Monitoring",
      icon: Video,
      badge: "6 CAM",
    },
    {
      to: "/incidents",
      label: "Incidents",
      icon: AlertTriangle,
      badge: "4 ACTIVE",
      badgeColor: "bg-red-500/20 text-red-400 border border-red-500/30",
    },
    {
      to: "/risk-map",
      label: "Risk Map",
      icon: MapPin,
    },
    {
      to: "/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-slate-800 flex flex-col justify-between select-none shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 bg-[#0B0F17]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-wider text-white">AHEADX</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                  AI CORE
                </span>
              </div>
              <p className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
                Traffic Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Operational Status Pill */}
        <div className="mx-4 my-3 px-3 py-2 rounded border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-medium text-emerald-400">
              OPERATIONAL
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {systemMeta.summaryMetrics.processingLatencyMs}ms
          </span>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-2">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Command Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-400 shadow-[inset_0_0_12px_rgba(56,189,248,0.06)] font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        item.badgeColor || "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Live Sector Information */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-md bg-slate-900/40 border border-slate-800/80">
          <div className="text-[10px] font-mono uppercase text-slate-500 flex items-center gap-1.5 mb-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            Active Deployment
          </div>
          <p className="text-xs font-medium text-slate-200 leading-snug">
            NH-48 Corridor
          </p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Sector 4 Operations Hub
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
            <span>FPS: 31.5</span>
            <span className="text-cyan-400">ByteTrack v2</span>
          </div>
        </div>
      </div>

      {/* Footer Profile & Settings */}
      <div className="p-3 border-t border-slate-800 bg-[#0B0F17]/50">
        <div className="flex items-center justify-between px-2 py-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-300 font-bold">
              OP
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-300 leading-tight">
                Operator Station
              </div>
              <div className="text-[9px] font-mono text-slate-500">
                PROTOTYPE MODE
              </div>
            </div>
          </div>
          <button
            title="Console Settings"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
