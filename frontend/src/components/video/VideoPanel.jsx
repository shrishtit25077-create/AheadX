import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Camera,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Sliders,
} from "lucide-react";

export default function VideoPanel({
  cameraName = "Camera 01",
  location = "Highway Junction",
  activeVehicles = 42,
  fps = 24,
  resolution = "1920x1080",
  videoSrc = "/videos/traffic_wrong_side.mp4",
  alertBadge = "POSSIBLE WRONG-SIDE DETECTED",
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showHudInfo, setShowHudInfo] = useState(true);
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSnapshot = () => {
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2000);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-slate-200/90 shadow-md transition-all duration-300"
    >
      {/* Top Bar: Feed Identification & Controls */}
      <div className="px-5 py-3.5 bg-white/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold font-mono-tech shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>CV INFERENCE FEED</span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-900">{cameraName}</span> · {location}
          </div>
        </div>

        {/* Feature Switches */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition font-medium ${
              showOverlays
                ? "bg-blue-50 text-blue-700 border-blue-200 shadow-2xs"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI Bounding Boxes</span>
          </button>

          <button
            onClick={handleSnapshot}
            className="px-3 py-1.5 rounded-lg border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition font-medium shadow-2xs"
          >
            <Camera className="w-3.5 h-3.5 text-slate-500" />
            <span>{snapshotTaken ? "Snapshot Saved!" : "Snapshot"}</span>
          </button>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden group">
        <video
          ref={videoRef}
          src={videoSrc}
          muted={isMuted}
          autoPlay
          loop
          playsInline
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${showOverlays ? "opacity-100" : "opacity-90"}`}
        />

        {/* Real-Time Live HUD Overlay Elements */}
        {showHudInfo && (
          <>
            {/* Top-Left Telemetry Box */}
            <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-xl p-3 text-white text-xs font-mono-tech shadow-xl pointer-events-none space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>OPTICAL TRACKER #348</span>
              </div>
              <div className="text-slate-300 text-[11px]">Vehicles in Frame: <span className="font-bold text-white">{activeVehicles}</span></div>
              <div className="text-slate-400 text-[10px]">Processing: {fps} FPS · {resolution}</div>
            </div>

            {/* Alert Banner if alert is active */}
            {alertBadge && (
              <div className="absolute top-4 right-4 bg-rose-950/90 backdrop-blur-md border border-rose-500/50 rounded-xl px-4 py-2.5 text-rose-200 text-xs font-mono-tech shadow-xl flex items-center gap-2.5 pointer-events-none">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                <div>
                  <div className="font-bold text-rose-100">{alertBadge}</div>
                  <div className="text-[10px] text-rose-300">Confidence: 94.2% · Vector: Negative Flow</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Video Player Bottom Controls Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-2">
          {/* Timeline Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono-tech text-white/80 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[11px] font-mono-tech text-white/80 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-lg hover:bg-white/10 transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/10 transition"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="px-5 py-3 bg-white/95 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>Corridor: <strong className="text-slate-800">NH-48 Express</strong></span>
          <span>·</span>
          <span>Camera ID: <strong className="text-slate-800 font-mono-tech">CAM-01-HWY</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-emerald-700">Real-Time Ingestion</span>
        </div>
      </div>
    </div>
  );
}
