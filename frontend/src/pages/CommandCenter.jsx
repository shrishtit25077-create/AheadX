import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Maximize2,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Video,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import CameraCard from "../components/video/CameraCard";
import VideoPanel from "../components/video/VideoPanel";
import IncidentTable from "../components/events/IncidentTable";
import IncidentDrawer from "../components/events/IncidentDrawer";
import Modal from "../components/common/Modal";
import { systemMeta, camerasData, allIncidents } from "../data/mockData";

export default function CommandCenter() {
  const { summaryMetrics } = systemMeta;

  // View state: 'grid' (4-channel matrix) or 'spotlight' (dominant single feed)
  const [viewMode, setViewMode] = useState("grid");
  const [spotlightCam, setSpotlightCam] = useState(camerasData[0]);
  const [modalCamera, setModalCamera] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentFilter, setIncidentFilter] = useState("all");

  // The 4 main primary CCTV channels for the 4-up matrix
  const matrixCameras = camerasData.slice(0, 4);

  // Filter incidents for table
  const filteredIncidents = allIncidents.filter((inc) => {
    if (incidentFilter === "all") return true;
    if (incidentFilter === "wrong-side") return inc.category === "wrong-side";
    if (incidentFilter === "blockage") return inc.category === "blockage";
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Executive Command Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-soft-pulse"></span>
            <span className="text-xs font-bold font-mono-tech uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
              Corridor Operations Live
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">· 4-Channel Synchronized Ingestion</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            Corridor Intelligence & Surveillance Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated computer vision telemetry across NH-48 Express (Sector 4 Carriageway)
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs shadow-inner">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>4-Cam Grid</span>
            </button>
            <button
              onClick={() => setViewMode("spotlight")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-200 ${
                viewMode === "spotlight"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Spotlight Feed</span>
            </button>
          </div>

          <Link
            to="/monitoring"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
          >
            <span>All 6 Feeds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Executive KPI Stat Cards (4-Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Vehicles Monitored */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono-tech">
              Active Vehicles
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-tech">
              {summaryMetrics.vehiclesMonitored}
            </span>
            <span className="text-xs font-semibold text-emerald-600 font-mono-tech flex items-center">
              +14% <TrendingUp className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Corridor density: Normal flow (avg 68 km/h)
          </p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Active AI Incidents */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-rose-500 font-mono-tech">
              Active Incidents
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-2xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700 font-mono-tech">
              {summaryMetrics.activeEvents}
            </span>
            <span className="text-xs font-semibold text-rose-600 font-mono-tech px-2 py-0.5 rounded-full bg-rose-100/80">
              2 Critical
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Automated triggers under active supervision
          </p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* High-Risk Triage */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-600 font-mono-tech">
              Triage Priority
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-800 font-mono-tech">
              {summaryMetrics.highRiskIncidents}
            </span>
            <span className="text-xs font-semibold text-amber-700 font-mono-tech">
              Requires Action
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Wrong-side vehicle #185 & Stopped car #72
          </p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Optical Grid Health */}
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono-tech">
              Optical Pipeline
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-2xs">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-tech">
              {summaryMetrics.camerasOnline} / {summaryMetrics.totalCameras}
            </span>
            <span className="text-xs font-semibold text-emerald-600 font-mono-tech">
              100% Online
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-mono-tech">
            Pipeline: 31.5 FPS · Latency: 32ms
          </p>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* CORE SECTION: Multi-Camera Monitoring Grid or Spotlight Mode */}
      {viewMode === "grid" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Synchronized CCTV Matrix (4 Channels)
              </h2>
              <span className="text-xs font-mono-tech text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                QUAD VIEW
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Click any feed to open high-definition inspection & telemetry
            </p>
          </div>

          {/* 4-Channel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matrixCameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onClick={() => setModalCamera(camera)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Spotlight View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Spotlight Optical Stream — {spotlightCam.name} ({spotlightCam.label})
              </h2>
            </div>
            <button
              onClick={() => setViewMode("grid")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Back to 4-Cam Grid</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <VideoPanel
            cameraName={spotlightCam.name}
            location={spotlightCam.location}
            activeVehicles={spotlightCam.activeVehicles}
            fps={spotlightCam.fps}
            resolution={spotlightCam.resolution}
            videoSrc={
              spotlightCam.id === "cam-02"
                ? "/videos/traffic_blockage.mp4"
                : spotlightCam.id === "cam-03"
                ? "/videos/traffic_tracked.mp4"
                : spotlightCam.id === "cam-04"
                ? "/videos/traffic_detected.mp4"
                : "/videos/traffic_wrong_side.mp4"
            }
            alertBadge={spotlightCam.latestEvent}
          />

          {/* Quick channel switch carousel below spotlight */}
          <div className="grid grid-cols-4 gap-3 pt-2">
            {matrixCameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setSpotlightCam(cam)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  spotlightCam.id === cam.id
                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 shadow-xs"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="text-[11px] font-mono-tech font-bold text-slate-900">{cam.name}</div>
                <div className="text-xs font-medium text-slate-600 truncate">{cam.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Incident Stream & Triage Center */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Active Incident Stream & Triage Queue
            </h2>
            <span className="text-xs font-mono-tech text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
              {filteredIncidents.length} EVENTS
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs">
            {[
              { id: "all", label: "All Events" },
              { id: "wrong-side", label: "Wrong-Side" },
              { id: "blockage", label: "Road Blockage" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setIncidentFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  incidentFilter === tab.id
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Incidents Table */}
        <IncidentTable
          incidents={filteredIncidents}
          onSelectIncident={(incident) => setSelectedIncident(incident)}
        />
      </div>

      {/* Camera Inspection Modal */}
      {modalCamera && (
        <Modal
          isOpen={!!modalCamera}
          onClose={() => setModalCamera(null)}
          title={`${modalCamera.name} — ${modalCamera.label}`}
          subtitle={`${modalCamera.location} · Resolution ${modalCamera.resolution} · ${modalCamera.fps} FPS`}
        >
          <div className="space-y-5">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-md">
              <video
                src={
                  modalCamera.id === "cam-02"
                    ? "/videos/traffic_blockage.mp4"
                    : modalCamera.id === "cam-03"
                    ? "/videos/traffic_tracked.mp4"
                    : modalCamera.id === "cam-04"
                    ? "/videos/traffic_detected.mp4"
                    : "/videos/traffic_wrong_side.mp4"
                }
                controls
                autoPlay
                loop
                playsInline
                className="w-full aspect-video object-cover"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="glass-panel p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Stream Status</span>
                <span className="font-bold text-emerald-700 font-mono-tech mt-0.5 block">ONLINE 100%</span>
              </div>
              <div className="glass-panel p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Active Vehicles</span>
                <span className="font-bold text-slate-900 font-mono-tech mt-0.5 block">{modalCamera.activeVehicles}</span>
              </div>
              <div className="glass-panel p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Allowed Direction</span>
                <span className="font-bold text-slate-900 font-mono-tech mt-0.5 block">{modalCamera.allowedDirection}</span>
              </div>
              <div className="glass-panel p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Active Triggers</span>
                <span className="font-bold text-rose-700 font-mono-tech mt-0.5 block">{modalCamera.activeEventsCount} Alerts</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModalCamera(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close View
              </button>
              <button
                onClick={() => {
                  setSpotlightCam(modalCamera);
                  setViewMode("spotlight");
                  setModalCamera(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Spotlight in Console
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Incident Detail Drawer */}
      <IncidentDrawer
        incident={selectedIncident}
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
}
