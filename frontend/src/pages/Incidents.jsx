import React, { useState } from "react";
import IncidentTable from "../components/events/IncidentTable";
import Modal from "../components/common/Modal";
import StatusBadge from "../components/common/StatusBadge";
import { allIncidents } from "../data/mockData";
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Car,
  Video,
} from "lucide-react";

export default function Incidents() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);

  const filters = [
    { id: "all", label: "All Incidents" },
    { id: "wrong-side", label: "Wrong-Side" },
    { id: "blockage", label: "Blockage" },
    { id: "accident", label: "Accident / Hazard" },
    { id: "under-review", label: "Under Review" },
    { id: "resolved", label: "Resolved" },
  ];

  const filteredIncidents = allIncidents.filter((item) => {
    // Category or status filter
    if (activeFilter === "wrong-side" && item.category !== "wrong-side") return false;
    if (activeFilter === "blockage" && item.category !== "blockage") return false;
    if (activeFilter === "accident" && item.category !== "accident") return false;
    if (activeFilter === "under-review" && !item.status.toLowerCase().includes("review")) return false;
    if (activeFilter === "resolved" && !item.status.toLowerCase().includes("resolved")) return false;

    // Search query filter
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
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 px-4 flex items-center justify-between text-xs font-mono text-amber-300">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            OPERATOR NOTICE: All flagged events are classified as <strong>"Possible"</strong> or{" "}
            <strong>"Suspected"</strong> events pending operator verification. They do not constitute certified legal violations.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition ${
                  activeFilter === f.id
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, camera, road..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0B0F17] border border-slate-800 rounded px-3 py-1.5 pl-8 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Quick Counts Summary */}
        <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
          <span>Showing: <strong className="text-white">{filteredIncidents.length}</strong> incidents</span>
          <span className="text-slate-700">•</span>
          <span>Detected: <strong className="text-red-400">{allIncidents.filter(i => i.status === "Detected").length}</strong></span>
          <span className="text-slate-700">•</span>
          <span>Under Review: <strong className="text-amber-400">{allIncidents.filter(i => i.status === "Under Review").length}</strong></span>
          <span className="text-slate-700">•</span>
          <span>Resolved: <strong className="text-emerald-400">{allIncidents.filter(i => i.status === "Resolved").length}</strong></span>
        </div>
      </div>

      {/* Incidents Table */}
      <IncidentTable
        incidents={filteredIncidents}
        onSelectIncident={(incident) => setSelectedIncident(incident)}
      />

      {/* Incident Review Modal */}
      {selectedIncident && (
        <Modal
          isOpen={!!selectedIncident}
          onClose={() => setSelectedIncident(null)}
          title={`INCIDENT REVIEW: ${selectedIncident.id}`}
          subtitle={`${selectedIncident.event} • ${selectedIncident.camera} (${selectedIncident.location})`}
        >
          <div className="space-y-4 text-xs font-mono">
            {/* Header Status Card */}
            <div className="bg-[#0B0F17] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Classification</span>
                <div className="text-base font-bold text-white mt-0.5">
                  {selectedIncident.event}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedIncident.status} type="status" />
                <StatusBadge status={selectedIncident.severity} type="severity" />
              </div>
            </div>

            {/* Evidence Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0B0F17] p-4 rounded-lg border border-slate-800">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Vehicle ID</div>
                <div className="text-cyan-300 font-bold text-sm mt-0.5">
                  {selectedIncident.vehicleId}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Vehicle Class</div>
                <div className="text-slate-200 font-bold text-sm mt-0.5">
                  {selectedIncident.vehicleClass}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Detection Time</div>
                <div className="text-slate-200 font-bold text-sm mt-0.5">
                  {selectedIncident.time} IST
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Camera Feed</div>
                <div className="text-slate-200 font-bold text-sm mt-0.5">
                  {selectedIncident.camera}
                </div>
              </div>
            </div>

            {/* Simulated Frame Evidence */}
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
              <div className="text-center p-6">
                <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-white uppercase">
                  EVENT EVIDENCE FRAME CAPTURE
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  YOLOv8 Bounding Box + ByteTrack Trajectory Point
                </div>
                <div className="mt-3 inline-block px-3 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-cyan-300">
                  Target: {selectedIncident.vehicleId} | Location: {selectedIncident.location}
                </div>
              </div>
            </div>

            {/* Operator Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                PROTOTYPE EVENT • ACTION LOGGED LOCALLY
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Incident ${selectedIncident.id} marked as Verified (Prototype Action).`);
                    setSelectedIncident(null);
                  }}
                  className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
                >
                  Verify Incident
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
