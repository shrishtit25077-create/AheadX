import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Layers,
  Eye,
  AlertTriangle,
  RotateCcw,
  Film,
  Radio,
} from "lucide-react";

export default function VideoPanel({
  cameraName = "CAMERA 01",
  location = "HIGHWAY JUNCTION",
  activeVehicles = 42,
  fps = 31.5,
  resolution = "1920x1080",
  videoSrc = "/videos/traffic_wrong_side.mp4",
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showTrails, setShowTrails] = useState(true);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  // Mute / Unmute toggle
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Seek handler
  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Format time mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Reset error on retry
  const handleRetry = () => {
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-[#0F172A] border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl"
    >
      {/* Panel Header */}
      <div className="px-4 py-2.5 bg-[#0B0F17] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Label: PROCESSED DEMO FEED */}
          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
              PROCESSED DEMO FEED
            </span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="text-xs font-mono font-semibold text-white">
            {cameraName}
          </div>

          <span className="text-slate-700">|</span>

          <div className="text-[11px] font-mono text-slate-300">
            {location}
          </div>

          <span className="text-slate-700">|</span>

          {/* Status Label: SOURCE: AHEADX CV PIPELINE */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
            <span className="text-slate-500">SOURCE:</span>
            <span className="text-emerald-400 font-semibold">AHEADX CV PIPELINE</span>
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
            title="Toggle CV detection annotations banner"
          >
            <Eye className="w-3 h-3" />
            AI Bounding Boxes: {showOverlays ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1.5 transition ${
              showTrails
                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
            title="Toggle trajectory trails display"
          >
            <Layers className="w-3 h-3" />
            Trajectories: {showTrails ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative aspect-video w-full bg-[#070A0F] overflow-hidden flex items-center justify-center select-none group">
        {!hasError ? (
          <>
            {/* Real HTML5 Video Player */}
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onError={() => setHasError(true)}
              className="w-full h-full object-contain bg-black"
            />

            {/* Video HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Top-Right Watermark */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/75 backdrop-blur-sm border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>AHEADX CV STREAM | 1080P @ 23.98 FPS</span>
              </div>

              {/* Road ROI Tag Top-Left */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/75 backdrop-blur-sm border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                MONITORED ROAD ROI • SECTOR 4
              </div>

              {/* Status Banner when overlays enabled */}
              {showOverlays && (
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/75 backdrop-blur-sm border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">YOLOv8 + ByteTrack:</span>
                  <span>Vehicle Bounding Boxes & Trajectories Rendered</span>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Graceful Fallback if Video Cannot Be Loaded */
          <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-md bg-[#0B0F17]/90 border border-slate-800 rounded-lg m-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              VIDEO FEED UNAVAILABLE
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Could not load video source from:
            </p>
            <div className="mt-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-amber-300">
              {videoSrc}
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-2">
              Ensure data/output/traffic_wrong_side.mp4 is available in public/videos/.
            </p>
            <button
              onClick={handleRetry}
              className="mt-3 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              Retry Stream Ingestion
            </button>
          </div>
        )}
      </div>

      {/* Video Interactive Controls Bar */}
      <div className="px-4 py-2 bg-[#0B0F17] border-t border-slate-800 flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition shrink-0"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* Timeline Scrubber */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
            title="Seek timeline"
          />
        </div>

        {/* Time Stamp mm:ss / mm:ss */}
        <div className="text-[11px] font-mono text-slate-400 shrink-0 select-none">
          <span className="text-white font-semibold">{formatTime(currentTime)}</span>
          <span className="text-slate-600"> / </span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Volume / Mute Button */}
        <button
          onClick={toggleMute}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition shrink-0"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
          title="Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Telemetry HUD Bar */}
      <div className="px-4 py-2 bg-[#0F172A] border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span>
            FEED: <span className="text-cyan-300 font-semibold">PROCESSED DEMO</span>
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

        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>RES: {resolution}</span>
          <span className="text-slate-700">|</span>
          <span>CODEC: MP4V / H.264</span>
        </div>
      </div>
    </div>
  );
}
