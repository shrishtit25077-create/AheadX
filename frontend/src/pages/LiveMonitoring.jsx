import React, { useState } from "react";
import CameraCard from "../components/video/CameraCard";
import Modal from "../components/common/Modal";
import { camerasData } from "../data/mockData";
import { Video, ShieldAlert, Search, Filter, Radio, Sliders } from "lucide-react";

export default function LiveMonitoring() {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCameras = camerasData.filter((cam) => {
    if (filterMode === "alerts" && cam.activeEventsCount === 0) return false;
    if (filterMode === "highway" && !cam.label.toLowerCase().includes("highway") && !cam.label.toLowerCase().includes("overpass")) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cam.name.toLowerCase().includes(q);
      const matchLabel = cam.label.toLowerCase().includes(q);
      const matchLoc = cam.location.toLowerCase().includes(q);
      if (!matchName && !matchLabel && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Executive Page Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-soft-pulse"></span>
            <span className="text-xs font-bold font-mono-tech uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              Corridor Optical Network
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">· 6 Active Ingestion Channels</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            CCTV Surveillance Matrix & Optical Ingestion
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-angle optical feeds with automated spatial trajectory tracking
          </p>
        </div>

        {/* Search & Quick Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter camera or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs">
            {[
              { id: "all", label: "All Cameras", count: camerasData.length },
              { id: "alerts", label: "Active Alerts", count: camerasData.filter(c => c.activeEventsCount > 0).length },
              { id: "highway", label: "Highway Sector", count: 3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  filterMode === tab.id
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 font-mono-tech text-[10px] text-slate-400">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6-Up Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCameras.map((camera) => (
          <CameraCard
            key={camera.id}
            camera={camera}
            onClick={() => setSelectedCamera(camera)}
          />
        ))}
      </div>

      {/* Camera Inspection Modal */}
      {selectedCamera && (
        <Modal
          isOpen={!!selectedCamera}
          onClose={() => setSelectedCamera(null)}
          title={`${selectedCamera.name} — ${selectedCamera.label}`}
          subtitle={`${selectedCamera.location} · Resolution ${selectedCamera.resolution} · ${selectedCamera.fps} FPS`}
        >
          <div className="space-y-5">
            <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-200 shadow-md flex items-center justify-center">
              <video
                src={
                  selectedCamera.id === "cam-02"
                    ? "/videos/traffic_blockage.mp4"
                    : selectedCamera.id === "cam-03"
                    ? "/videos/traffic_tracked.mp4"
                    : selectedCamera.id === "cam-04"
                    ? "/videos/traffic_detected.mp4"
                    : "/videos/traffic_wrong_side.mp4"
                }
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />

              <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-mono-tech px-2.5 py-1 rounded-lg border border-white/10">
                {selectedCamera.fps} FPS · LIVE INGESTION
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="glass-panel p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Stream Status</span>
                <span className="font-bold text-emerald-700 font-mono-tech mt-0.5 block">ONLINE</span>
              </div>
              <div className="glass-panel p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Active Vehicles</span>
                <span className="font-bold text-slate-900 font-mono-tech mt-0.5 block">{selectedCamera.activeVehicles}</span>
              </div>
              <div className="glass-panel p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Allowed Direction</span>
                <span className="font-bold text-slate-900 font-mono-tech mt-0.5 block">{selectedCamera.allowedDirection}</span>
              </div>
              <div className="glass-panel p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Active Triggers</span>
                <span className="font-bold text-rose-700 font-mono-tech mt-0.5 block">{selectedCamera.activeEventsCount} Alerts</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
