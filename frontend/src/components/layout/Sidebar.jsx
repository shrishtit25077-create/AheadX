import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Video,
  AlertTriangle,
  MapPin,
  BarChart3,
  Activity,
  Cpu,
  Layers,
} from "lucide-react";

export default function Sidebar() {
  const navItems = [
    {
      to: "/dashboard",
      label: "Command Center",
      badge: "LIVE",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: LayoutGrid,
    },
    {
      to: "/monitoring",
      label: "CCTV Matrix",
      badge: "6 CAM",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Video,
    },
    {
      to: "/incidents",
      label: "Incident Triage",
      badge: "4",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      icon: AlertTriangle,
    },
    {
      to: "/risk-map",
      label: "Spatial Risk Map",
      badge: null,
      icon: MapPin,
    },
    {
      to: "/analytics",
      label: "Intelligence Reports",
      badge: null,
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 bg-white/85 backdrop-blur-xl border-r border-slate-200/80 flex flex-col justify-between select-none shrink-0 h-screen sticky top-0 z-20 shadow-xs">
      <div>
        {/* Navigation Category Header */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 font-mono-tech">
            Platform Modules
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50/60 text-blue-700 font-semibold shadow-xs border border-blue-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-slate-500 group-hover:text-blue-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded-full border shadow-2xs ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry & Engine Health Card */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/60 m-3 rounded-2xl border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[11px] font-bold text-slate-700">Vision Engine</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-soft-pulse"></span>
            ACTIVE
          </span>
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-500 font-mono-tech">
          <div className="flex justify-between items-center">
            <span>Model:</span>
            <span className="font-semibold text-slate-800">YOLOv8 + ByteTrack</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Throughput:</span>
            <span className="font-semibold text-blue-700">31.5 FPS</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Inference Latency:</span>
            <span className="font-semibold text-slate-800">32 ms</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
          <span>Corridor Security</span>
          <span className="font-semibold text-slate-600 font-mono-tech">TLS Encrypted</span>
        </div>
      </div>
    </aside>
  );
}
