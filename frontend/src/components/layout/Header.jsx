import React, { useState, useEffect } from "react";
import { Activity, Clock, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { systemMeta } from "../../data/mockData";

export default function Header({ pageTitle = "Command Center", pageSubtitle }) {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-GB", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " UTC+5:30"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0B0F17] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-wide uppercase">
              {pageTitle}
            </h1>
            <span className="text-slate-600 font-mono text-xs">/</span>
            <span className="text-xs font-mono text-cyan-400 tracking-wider uppercase">
              ROAD INTELLIGENCE CENTER
            </span>
          </div>
          {pageSubtitle && (
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center Telemetry Banner */}
      <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-emerald-400">
            {systemMeta.status}
          </span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="text-[11px] font-mono text-slate-400">
          Corridor: <span className="text-slate-200">NH-48 Sector 4</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span className="text-cyan-300 font-bold">{timeStr || systemMeta.currentTime}</span>
        </div>
      </div>

      {/* Prototype Tag & Refresh */}
      <div className="flex items-center gap-3">
        <div className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold tracking-wider uppercase flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          PROTOTYPE INTERFACE
        </div>

        <button
          title="Telemetry Feed Synchronized"
          className="p-2 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-400 transition flex items-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
