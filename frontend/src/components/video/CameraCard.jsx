import React, { useRef, useState } from "react";
import { Video, Maximize2, AlertTriangle, ShieldAlert, Eye, Volume2, VolumeX } from "lucide-react";

export default function CameraCard({ camera, onClick, onSpotlight }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  const hasEvents = camera.activeEventsCount > 0;
  
  // Map camera ID to corresponding processed video asset
  const videoMap = {
    "cam-01": "/videos/traffic_wrong_side.mp4",
    "cam-02": "/videos/traffic_blockage.mp4",
    "cam-03": "/videos/traffic_tracked.mp4",
    "cam-04": "/videos/traffic_detected.mp4",
    "cam-05": "/videos/traffic_wrong_side.mp4",
    "cam-06": "/videos/traffic_blockage.mp4",
  };

  const videoSrc = videoMap[camera.id] || "/videos/traffic_wrong_side.mp4";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 relative ${
        hasEvents
          ? "border-rose-300/80 ring-2 ring-rose-500/10 shadow-md shadow-rose-500/5"
          : "border-slate-200/80 hover:border-blue-400/80"
      }`}
    >
      {/* Card Header */}
      <div className="px-4 py-3 bg-white/90 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5 truncate">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-soft-pulse"></span>
          <span className="text-xs font-bold text-slate-900 font-mono-tech tracking-tight">
            {camera.name}
          </span>
          <span className="text-slate-300 font-light">|</span>
          <span className="text-xs font-medium text-slate-600 truncate">
            {camera.label}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasEvents ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 animate-pulse shadow-2xs font-mono-tech">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              {camera.activeEventsCount} {camera.activeEventsCount > 1 ? "ALERTS" : "ALERT"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 font-mono-tech">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              LIVE {camera.fps} FPS
            </span>
          )}
        </div>
      </div>

      {/* Video Viewport / CCTV Stream */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Ambient Top HUD Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-mono-tech px-2.5 py-1 rounded-md border border-white/10 shadow-sm flex items-center gap-2">
            <span className="text-cyan-400 font-bold">REC</span>
            <span>{camera.resolution}</span>
          </div>

          <div className="bg-slate-900/85 backdrop-blur-md text-slate-300 text-[10px] font-mono-tech px-2.5 py-1 rounded-md border border-white/10">
            {camera.id.toUpperCase()}
          </div>
        </div>

        {/* Dynamic Alert Banner or Stream Type Overlay */}
        {hasEvents ? (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-rose-950/90 backdrop-blur-md text-rose-200 text-[11px] font-mono-tech px-3 py-1.5 rounded-lg border border-rose-500/40 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-1.5 truncate">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
              <span className="font-semibold truncate">{camera.latestEvent}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-900/80 px-1.5 py-0.5 rounded border border-rose-500/30 shrink-0">
              ACTION REQ.
            </span>
          </div>
        ) : (
          <div className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-[10px] font-mono-tech px-2 py-0.5 rounded border border-white/10">
            Flow: {camera.allowedDirection}
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
              }}
              className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-semibold shadow-xl hover:bg-slate-50 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Inspect Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Footer Telemetry */}
      <div className="p-3.5 bg-white/95 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="flex items-center gap-1">
            <span className="text-[11px]">Vehicles:</span>
            <span className="font-mono-tech font-bold text-slate-900">{camera.activeVehicles}</span>
          </div>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-400 truncate max-w-[130px]">{camera.location.split("(")[0]}</span>
        </div>

        <div className="text-[11px] text-blue-600 font-semibold group-hover:text-blue-700 flex items-center gap-1">
          <span>Details</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </div>
  );
}
