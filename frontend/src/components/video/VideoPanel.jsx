import React, { useState } from "react";
import {
  Play,
  Pause,
  Maximize2,
  SlidersHorizontal,
  Layers,
  Radio,
  Eye,
  EyeOff,
  Video,
  ShieldAlert,
} from "lucide-react";

export default function VideoPanel({
  cameraName = "CAMERA 01",
  location = "HIGHWAY JUNCTION",
  activeVehicles = 42,
  fps = 31.5,
  resolution = "1920x1080",
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showTrails, setShowTrails] = useState(true);

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl">
      {/* Panel Header */}
      <div className="px-4 py-2.5 bg-[#0B0F17] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-widest">
              LIVE TRAFFIC FEED
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="text-xs font-mono font-semibold text-white">
            {cameraName}
          </div>
          <span className="text-slate-700">|</span>
          <div className="text-[11px] font-mono text-cyan-400">
            {location}
          </div>
        </div>

        {/* Top Control Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1.5 transition ${
              showOverlays
                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            {showOverlays ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            AI Bounding Boxes
          </button>

          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1.5 transition ${
              showTrails
                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <Layers className="w-3 h-3" />
            Trajectories
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative aspect-video w-full bg-[#070A0F] overflow-hidden flex items-center justify-center select-none group">
        {/* Background Visual Pattern (Road Highway Grid Simulation) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-black pointer-events-none">
          {/* Subtle grid lines mimicking CCTV perspective */}
          <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#38BDF8" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="20%" y1="0" x2="10%" y2="100%" stroke="#38BDF8" strokeWidth="0.5" />
            <line x1="80%" y1="0" x2="90%" y2="100%" stroke="#38BDF8" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Road ROI Outline Overlay */}
        <div className="absolute inset-6 border border-cyan-500/20 rounded pointer-events-none">
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-[9px] font-mono text-cyan-400">
            MONITORED ROAD ROI (SECTOR 4)
          </div>
        </div>

        {/* Video Integration Readiness Notice & Status Centerpiece */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-md">
          <div className="w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.2)] mb-3">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
            PRIMARY INTELLIGENCE FEED
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Engine pipeline ready for video stream ingestion:
          </p>
          <div className="mt-2.5 px-3 py-1.5 rounded bg-slate-900/90 border border-slate-700/80 font-mono text-[11px] text-cyan-300">
            data/output/traffic_wrong_side.mp4
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2">
            OpenCV & YOLOv8 + ByteTrack inference active on host
          </p>
        </div>

        {/* Simulated AI Overlays (when toggled on) */}
        {showOverlays && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Suspected Wrong-Side Vehicle #185 (RED) */}
            <div className="absolute top-[28%] left-[24%] border-2 border-red-500 bg-red-500/10 rounded w-28 h-20 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
              <div className="absolute -top-6 left-0 bg-red-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-t font-bold flex items-center gap-1">
                <ShieldAlert className="w-2.5 h-2.5" />
                #185 CAR | SUSPECTED WRONG SIDE
              </div>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-red-300 bg-black/70 px-1 rounded">
                conf: 0.88
              </div>
            </div>

            {/* Trajectory path trail for vehicle #185 */}
            {showTrails && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                  points="280,220 250,225 210,230 170,235"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
              </svg>
            )}

            {/* Normal Flow Vehicle #192 (GREEN) */}
            <div className="absolute top-[45%] right-[32%] border border-emerald-500 bg-emerald-500/10 rounded w-24 h-16">
              <div className="absolute -top-5 left-0 bg-emerald-600 text-black font-mono text-[9px] px-1.5 py-0.5 rounded-t font-bold">
                #192 CAR | NORMAL
              </div>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-emerald-300 bg-black/70 px-1 rounded">
                conf: 0.92
              </div>
            </div>

            {/* Normal Flow Truck #188 (GREEN) */}
            <div className="absolute top-[60%] right-[18%] border border-emerald-500 bg-emerald-500/10 rounded w-36 h-24">
              <div className="absolute -top-5 left-0 bg-emerald-600 text-black font-mono text-[9px] px-1.5 py-0.5 rounded-t font-bold">
                #188 TRUCK | NORMAL
              </div>
              <div className="absolute bottom-1 right-1 text-[8px] font-mono text-emerald-300 bg-black/70 px-1 rounded">
                conf: 0.94
              </div>
            </div>
          </div>
        )}

        {/* HUD Watermark & Timestamp Top-Right */}
        <div className="absolute top-3 right-3 z-30 px-2 py-1 rounded bg-black/70 border border-slate-800 text-[10px] font-mono text-slate-400">
          AHEADX CV CORE | 1080P @ 23.98 FPS
        </div>
      </div>

      {/* Bottom Telemetry HUD Bar */}
      <div className="px-4 py-2 bg-[#0B0F17] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <span>
            STATUS: <span className="text-emerald-400 font-semibold">STREAMING</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            ACTIVE VEHICLES: <span className="text-white font-bold">{activeVehicles}</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            INFERENCE: <span className="text-cyan-400 font-bold">{fps} FPS</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">RES: {resolution}</span>
          <span className="text-slate-700">|</span>
          <button
            title="Maximize Viewport"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
