import React, { useState } from "react";
import CameraCard from "../components/video/CameraCard";
import Modal from "../components/common/Modal";
import { camerasData } from "../data/mockData";
import {
  Video,
  Layers,
  Activity,
  Sliders,
  Maximize2,
  AlertTriangle,
  CheckCircle,
  Eye,
} from "lucide-react";

export default function LiveMonitoring() {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [filterMode, setFilterMode] = useState("all");

  const filteredCameras = camerasData.filter((cam) => {
    if (filterMode === "alerts") return cam.activeEventsCount > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0F172A] border border-slate-800 p-4 rounded-lg">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            MULTI-CAMERA OPTICAL SURVEILLANCE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time optical feeds connected to ByteTrack vehicle inference engine.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition ${
              filterMode === "all"
                ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            All Cameras ({camerasData.length})
          </button>
          <button
            onClick={() => setFilterMode("alerts")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition ${
              filterMode === "alerts"
                ? "bg-red-500/10 text-red-400 border border-red-500/30 font-semibold"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            Active Alerts Only (
            {camerasData.filter((c) => c.activeEventsCount > 0).length})
          </button>
        </div>
      </div>

      {/* Camera Grid (2x2 or 3x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCameras.map((camera) => (
          <CameraCard
            key={camera.id}
            camera={camera}
            onClick={() => setSelectedCamera(camera)}
          />
        ))}
      </div>

      {/* Detailed Modal Inspection View */}
      {selectedCamera && (
        <Modal
          isOpen={!!selectedCamera}
          onClose={() => setSelectedCamera(null)}
          title={`${selectedCamera.name} — ${selectedCamera.label}`}
          subtitle={`Location: ${selectedCamera.location} | Resolution: ${selectedCamera.resolution}`}
        >
          <div className="space-y-4">
            {/* Expanded Video Preview */}
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>

              {/* Watermark Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded border border-slate-800 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-white font-bold">{selectedCamera.name}</span>
                <span className="text-slate-500">|</span>
                <span className="text-cyan-400">{selectedCamera.fps} FPS</span>
              </div>

              <div className="text-center p-6 z-10">
                <Video className="w-12 h-12 text-cyan-400/80 mx-auto mb-2" />
                <h4 className="text-sm font-mono font-bold text-white uppercase">
                  ACTIVE CAMERA INSPECTION VIEW
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Optical feed pipeline ready for direct stream ingestion
                </p>
                <div className="mt-3 inline-block px-3 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300">
                  Allowed Flow: {selectedCamera.allowedDirection}
                </div>
              </div>

              {/* Simulated Active Event Tag if any */}
              {selectedCamera.activeEventsCount > 0 && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-600/50 p-3 rounded-lg text-xs font-mono text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>
                      ACTIVE EVENT:{" "}
                      <span className="font-bold text-red-300">
                        {selectedCamera.latestEvent}
                      </span>
                    </span>
                  </div>
                  <span className="text-[10px] bg-red-900 px-2 py-0.5 rounded font-bold uppercase">
                    Immediate Operator Review Required
                  </span>
                </div>
              )}
            </div>

            {/* Telemetry Metrics & Parameter Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0B0F17] p-4 rounded-lg border border-slate-800 text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Camera Status</div>
                <div className="text-emerald-400 font-semibold mt-1">
                  {selectedCamera.status}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Tracked Vehicles</div>
                <div className="text-white font-semibold mt-1">
                  {selectedCamera.activeVehicles} Current
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Configured Flow</div>
                <div className="text-cyan-400 font-semibold mt-1">
                  {selectedCamera.allowedDirection}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Resolution / Codec</div>
                <div className="text-slate-300 font-semibold mt-1">
                  {selectedCamera.resolution} (H.264)
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedCamera(null)}
                className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
