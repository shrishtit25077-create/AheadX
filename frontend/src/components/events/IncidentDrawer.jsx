import React, { useState } from "react";
import { X, ShieldAlert, CheckCircle2, Send, AlertTriangle, Eye, Compass, Gauge, Clock, Car } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

export default function IncidentDrawer({ incident, isOpen, onClose }) {
  const [triageStatus, setTriageStatus] = useState(null);

  if (!isOpen || !incident) return null;

  const isWrongSide = (incident.event || incident.type || "").toLowerCase().includes("wrong-side");
  const movementDirection = incident.direction || (isWrongSide ? "Westbound (Opposing)" : "Stationary (0 km/h)");
  const expectedDirection = incident.expectedDirection || "Eastbound (Right)";
  const confidenceVal = incident.confidence
    ? (parseFloat(incident.confidence) > 1 ? (parseFloat(incident.confidence) / 100).toFixed(2) : incident.confidence)
    : "0.94";

  const eventTitle = incident.event || incident.type || "Possible incident";
  const vehicleId = String(incident.vehicleId).startsWith("#") ? incident.vehicleId : `#${incident.vehicleId}`;
  const cameraName = incident.camera || "Camera 01";
  const locationName = incident.location || "Highway Junction";
  const timeDetected = incident.time?.slice(0, 5) || "09:42";

  // Determine appropriate evidence video
  const videoSrc = isWrongSide ? "/videos/traffic_wrong_side.mp4" : "/videos/traffic_blockage.mp4";

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white/95 backdrop-blur-2xl border-l border-slate-200/90 h-full flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono-tech text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                {incident.id || "INC-2026-081"}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono-tech text-slate-500">{timeDetected} IST</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Incident Investigation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition"
            title="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Header Status & Type */}
          <div className="glass-panel p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <StatusBadge status={incident.status || "Under Review"} type="status" />
              <StatusBadge status={incident.severity || "HIGH"} type="severity" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 leading-snug">
              {eventTitle}
            </h4>
            <p className="text-xs text-slate-500">
              Verified automated trigger by YOLOv8 detection + ByteTrack spatial vector analyzer.
            </p>
          </div>

          {/* Evidence Frame Preview with Video Stream */}
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-950">
            <div className="relative aspect-video w-full flex items-center justify-center">
              <video
                src={videoSrc}
                muted
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-mono-tech px-2 py-0.5 rounded border border-white/10">
                Evidence Clip: {cameraName}
              </div>
              <div className="absolute bottom-2.5 right-2.5 bg-rose-600/90 text-white text-[10px] font-mono-tech px-2 py-0.5 rounded font-bold shadow-md">
                CONFIDENCE: {Math.round(parseFloat(confidenceVal) * 100)}%
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between font-mono-tech">
              <span>Synchronized Optical Log</span>
              <span className="text-slate-400">FPS: 24.0 · 1080p</span>
            </div>
          </div>

          {/* Key-Value Operational Parameters */}
          <div className="glass-panel rounded-xl border border-slate-200/80 divide-y divide-slate-100 text-xs overflow-hidden">
            <div className="p-3.5 flex justify-between items-center bg-white/50">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-blue-600" /> Tracked Vehicle:
              </span>
              <span className="font-mono-tech font-bold text-slate-900">{vehicleId} ({incident.vehicleClass || "car"})</span>
            </div>
            <div className="p-3.5 flex justify-between items-center bg-white/50">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-indigo-600" /> Camera Feed:
              </span>
              <span className="font-semibold text-slate-800">{cameraName}</span>
            </div>
            <div className="p-3.5 flex justify-between items-center bg-white/50">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-emerald-600" /> Monitored Location:
              </span>
              <span className="font-medium text-slate-700 text-right max-w-[240px] truncate">{locationName}</span>
            </div>
            <div className="p-3.5 flex justify-between items-center bg-white/50">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-rose-600" /> Observed Movement:
              </span>
              <span className="font-mono-tech font-bold text-rose-700">{movementDirection}</span>
            </div>
            <div className="p-3.5 flex justify-between items-center bg-white/50">
              <span className="text-slate-500 font-medium">Designated Corridor Flow:</span>
              <span className="font-mono-tech font-semibold text-slate-800">{expectedDirection}</span>
            </div>
          </div>

          {/* Feedback banner if triage taken */}
          {triageStatus && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{triageStatus}</span>
            </div>
          )}

          {/* Operator Triage Actions */}
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono-tech">
              Operator Incident Actions
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTriageStatus("Incident verified. Log sent to Highway Operations authority.")}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify Event</span>
              </button>

              <button
                onClick={() => setTriageStatus("Highway Patrol Unit #14 dispatched to Chainage 34+200.")}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Patrol</span>
              </button>
            </div>

            <button
              onClick={() => setTriageStatus("Event marked as false positive / dismissed by operator.")}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition"
            >
              Dismiss / False Trigger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
