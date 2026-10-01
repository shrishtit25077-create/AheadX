import React from "react";
import { Video, ShieldAlert, AlertTriangle, Eye, ArrowUpRight } from "lucide-react";

export default function CameraCard({ camera, onClick }) {
  const hasEvents = camera.activeEventsCount > 0;

  return (
    <div
      onClick={onClick}
      className={`group bg-[#0F172A] border rounded-lg overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:shadow-xl ${
        hasEvents
          ? "border-amber-500/30 hover:border-amber-500/60"
          : "border-slate-800 hover:border-cyan-500/40"
      }`}
    >
      {/* Header */}
      <div className="px-3 py-2 bg-[#0B0F17] border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              camera.status === "ONLINE"
                ? "bg-emerald-400"
                : "bg-slate-500"
            }`}
          ></span>
          <span className="text-xs font-mono font-bold text-white tracking-wide">
            {camera.name}
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-[11px] font-sans font-medium text-slate-300 truncate max-w-[140px]">
            {camera.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {hasEvents ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-[9px] font-mono font-bold text-red-400">
              <AlertTriangle className="w-2.5 h-2.5" />
              {camera.activeEventsCount} ALERT{camera.activeEventsCount > 1 ? "S" : ""}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400">
              NORMAL
            </span>
          )}
        </div>
      </div>

      {/* Simulated Feed Viewport */}
      <div className="relative aspect-video w-full bg-[#070A0F] overflow-hidden flex items-center justify-center group-hover:bg-[#090E17] transition">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-black/80 pointer-events-none"></div>

        {/* Center Camera Icon & Feed Label */}
        <div className="flex flex-col items-center justify-center text-center p-4">
          <Video className="w-7 h-7 text-slate-600 group-hover:text-cyan-400 transition mb-1.5" />
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {camera.thumbnailBadge || "LIVE STREAM"}
          </span>
          <span className="text-[9px] font-mono text-slate-500 mt-0.5">
            {camera.location}
          </span>
        </div>

        {/* Floating Telemetry Stats on Card */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-1 rounded border border-slate-800">
          <div>
            Vehicles: <span className="text-white font-bold">{camera.activeVehicles}</span>
          </div>
          <div>
            FPS: <span className="text-cyan-400">{camera.fps}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 group-hover:text-cyan-300">
            <span>INSPECT</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#0F172A] border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="text-[11px] font-mono text-slate-400 truncate">
          Last: <span className="text-slate-200">{camera.latestEvent}</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 shrink-0">
          {camera.resolution}
        </div>
      </div>
    </div>
  );
}
