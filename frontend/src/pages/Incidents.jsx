import React, { useState } from "react";
import IncidentTable from "../components/events/IncidentTable";
import IncidentDrawer from "../components/events/IncidentDrawer";
import { allIncidents } from "../data/mockData";
import { Search, Download, AlertTriangle, ShieldAlert, CheckCircle2, Clock } from "lucide-react";

export default function Incidents() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);

  const filters = [
    { id: "all", label: "All Incidents", count: allIncidents.length },
    { id: "wrong-side", label: "Wrong-Side", count: allIncidents.filter(i => i.category === "wrong-side").length },
    { id: "blockage", label: "Road Blockage", count: allIncidents.filter(i => i.category === "blockage").length },
    { id: "under-review", label: "Under Review", count: allIncidents.filter(i => i.status.toLowerCase().includes("review")).length },
    { id: "resolved", label: "Resolved", count: allIncidents.filter(i => i.status.toLowerCase().includes("resolved")).length },
  ];

  const filteredIncidents = allIncidents.filter((item) => {
    if (activeFilter === "wrong-side" && item.category !== "wrong-side") return false;
    if (activeFilter === "blockage" && item.category !== "blockage") return false;
    if (activeFilter === "under-review" && !item.status.toLowerCase().includes("review")) return false;
    if (activeFilter === "resolved" && !item.status.toLowerCase().includes("resolved")) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = item.vehicleId.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      const matchCam = item.camera.toLowerCase().includes(q);
      const matchEvent = item.event.toLowerCase().includes(q);
      if (!matchId && !matchLoc && !matchCam && !matchEvent) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Executive Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-bold font-mono-tech uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80">
              Automated Incident Triage
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">· Verified Telemetry Log</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            Safety Incidents & Violation Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervisory review registry for automated optical violation detections across monitored corridors
          </p>
        </div>

        {/* Export & Search Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vehicle ID, camera, road..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            />
          </div>

          <button
            onClick={() => alert("CSV incident export initiated.")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 text-xs overflow-x-auto w-fit">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3.5 py-2 rounded-xl transition font-medium flex items-center gap-2 whitespace-nowrap ${
              activeFilter === filter.id
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{filter.label}</span>
            <span className="font-mono-tech text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Incident Table */}
      <IncidentTable
        incidents={filteredIncidents}
        onSelectIncident={(incident) => setSelectedIncident(incident)}
      />

      {/* Detail Drawer */}
      <IncidentDrawer
        incident={selectedIncident}
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
}
