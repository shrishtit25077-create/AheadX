import React, { useState, useEffect } from "react";
import { Shield, Radio, Bell, Search, Activity, Clock } from "lucide-react";

export default function Header() {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " IST"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs">
      {/* Left: Brand Identity & Active Sector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                AHEAD<span className="text-blue-600">X</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-mono-tech px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                TOC v1.4
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Road Safety & Traffic Intelligence Platform
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* Corridor breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-50/80 border border-slate-200/80 px-3 py-1.5 rounded-lg">
          <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span className="font-medium text-slate-700">NH-48 National Corridor</span>
          <span className="text-slate-400">·</span>
          <span className="font-mono-tech text-slate-500 text-[11px]">Chainage 34+200</span>
        </div>
      </div>

      {/* Right: Operational Status, Search, Clock & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">Optical Engine:</span>
          <span>Online</span>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono-tech font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr || "16:42:00 IST"}</span>
        </div>

        {/* Notifications Icon with active badge */}
        <button 
          title="Active safety alerts"
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        {/* Operator Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-blue-500/20">
            OP
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-none">Command Desk 1</div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Supervisor Active</div>
          </div>
        </div>
      </div>
    </header>
  );
}
