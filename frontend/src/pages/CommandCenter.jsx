import React from "react";
import MetricCard from "../components/common/MetricCard";
import VideoPanel from "../components/video/VideoPanel";
import EventFeed from "../components/events/EventFeed";
import {
  Car,
  AlertTriangle,
  Flame,
  Video,
  Radio,
  Clock,
  Layers,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { systemMeta, activeEventsFeed } from "../data/mockData";

export default function CommandCenter() {
  const { summaryMetrics } = systemMeta;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>CORRIDOR:</span>
          <span className="text-white font-bold">{systemMeta.locationName}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <span>
            PIPELINE: <span className="text-emerald-400 font-semibold">{systemMeta.summaryMetrics.pipelineFps} FPS</span>
          </span>
          <span className="text-slate-700">|</span>
          <span>
            LATENCY: <span className="text-cyan-400 font-semibold">{systemMeta.summaryMetrics.processingLatencyMs}ms</span>
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-amber-400/90 font-medium">DEMO / PROTOTYPE DATA</span>
        </div>
      </div>

      {/* Main Grid: Video Intelligence (Left) & Active Events (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Video Feed & Primary Intelligence */}
        <div className="lg:col-span-2 space-y-4">
          <VideoPanel
            cameraName="CAMERA 01"
            location="HIGHWAY JUNCTION (SECTOR 4)"
            activeVehicles={42}
            fps={31.5}
            resolution="1920x1080"
          />

          {/* Quick Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0F172A] border border-slate-800 rounded-lg p-3 text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Detection Engine</div>
              <div className="text-slate-200 font-semibold mt-0.5">YOLOv8 Nano (COCO)</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Tracking Tracker</div>
              <div className="text-cyan-400 font-semibold mt-0.5">ByteTrack v2</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Allowed Road Flow</div>
              <div className="text-emerald-400 font-semibold mt-0.5">EASTBOUND (RIGHT)</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Road ROI Status</div>
              <div className="text-purple-400 font-semibold mt-0.5">ACTIVE GATED</div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Active Events Feed */}
        <div className="lg:col-span-1">
          <EventFeed events={activeEventsFeed} />
        </div>
      </div>

      {/* Bottom Summary Metrics Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400">
            CORRIDOR TELEMETRY SUMMARY
          </h2>
          <span className="text-[10px] font-mono text-slate-500">
            PROTOTYPE INDICATORS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Vehicles Monitored"
            value={summaryMetrics.vehiclesMonitored}
            subtext="Tracked across active sector"
            icon={Car}
            accentColor="cyan"
            badge={{ label: "PEAK CAPACITY", value: "240 veh" }}
          />

          <MetricCard
            title="Active Events"
            value={summaryMetrics.activeEvents}
            subtext="Requiring operator review"
            icon={AlertTriangle}
            accentColor="amber"
            badge={{ label: "RESOLUTION RATE", value: "85%" }}
          />

          <MetricCard
            title="High Risk"
            value={summaryMetrics.highRiskIncidents}
            subtext="Suspected wrong-side / hazard"
            icon={Flame}
            accentColor="red"
            badge={{ label: "PRIORITY ALERT", value: "2 CRITICAL" }}
          />

          <MetricCard
            title="Cameras Online"
            value={`${summaryMetrics.camerasOnline} / ${summaryMetrics.totalCameras}`}
            subtext="All optical feeds nominal"
            icon={Video}
            accentColor="emerald"
            badge={{ label: "UPTIME", value: "99.98%" }}
          />
        </div>
      </div>
    </div>
  );
}
