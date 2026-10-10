import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Modal from "../common/Modal";
import StatusBadge from "../common/StatusBadge";

export default function EventFeed({ events = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <>
      <div className="bg-[#080B11] border border-white/[0.08] rounded-lg flex flex-col h-full shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-[#06080D] border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            <h2 className="text-xs font-semibold tracking-wider uppercase text-white">
              ACTIVE EVENTS
            </h2>
            <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300">
              {events.length}
            </span>
          </div>

          <Link
            to="/incidents"
            className="text-[11px] font-medium text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition"
          >
            <span>All Incidents</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Compact Events List */}
        <div className="p-3 divide-y divide-white/[0.05] overflow-y-auto flex-1">
          {events.length === 0 ? (
            <div className="p-6 text-center text-slate-500 font-mono-tech text-xs">
              No active events detected.
            </div>
          ) : (
            events.map((evt) => {
              const isWrongSide = evt.type.toLowerCase().includes("wrong-side");
              return (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className="w-full text-left py-3 px-2 rounded hover:bg-white/[0.03] transition group cursor-pointer block"
                >
                  {/* Top Line: Emoji + Event Title */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold tracking-wide uppercase ${
                        isWrongSide ? "text-red-400" : "text-amber-400"
                      }`}
                    >
                      {isWrongSide ? "🚨 WRONG-SIDE" : "⚠ BLOCKAGE"}
                    </span>
                    <span className="text-[10px] font-mono-tech text-slate-500 group-hover:text-cyan-400 transition">
                      Inspect →
                    </span>
                  </div>

                  {/* Middle Line: Vehicle ID */}
                  <div className="text-sm font-semibold text-white mt-1 font-mono-tech">
                    Vehicle #{evt.vehicleId}
                  </div>

                  {/* Bottom Line: Camera · Timestamp */}
                  <div className="text-[11px] font-mono-tech text-slate-400 mt-0.5">
                    {evt.camera} · {evt.time.slice(0, 5)}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Progressive Disclosure Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title={`EVENT INSPECTION · VEHICLE #${selectedEvent.vehicleId}`}
          subtitle={`${selectedEvent.type} on ${selectedEvent.camera}`}
        >
          <div className="space-y-4">
            {/* Top Key Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded bg-[#06080D] border border-white/[0.06]">
              <div>
                <span className="text-[10px] uppercase font-mono-tech text-slate-500">
                  Vehicle ID & Class
                </span>
                <div className="text-sm font-semibold font-mono-tech text-white mt-0.5">
                  #{selectedEvent.vehicleId} ({selectedEvent.vehicleClass})
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono-tech text-slate-500">
                  Event Classification
                </span>
                <div
                  className={`text-sm font-semibold mt-0.5 ${
                    selectedEvent.type.toLowerCase().includes("wrong-side")
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                >
                  {selectedEvent.type}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono-tech text-slate-500">
                  Confidence Score
                </span>
                <div className="text-sm font-semibold font-mono-tech text-cyan-400 mt-0.5">
                  {selectedEvent.confidence}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono-tech text-slate-500">
                  Camera Feed
                </span>
                <div className="text-sm font-semibold font-mono-tech text-slate-200 mt-0.5">
                  {selectedEvent.camera}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono-tech text-slate-500">
                  Timestamp
                </span>
                <div className="text-sm font-semibold font-mono-tech text-slate-200 mt-0.5">
                  {selectedEvent.time} IST
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono-tech text-slate-500">
                  Verification Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={selectedEvent.status} type="status" />
                </div>
              </div>
            </div>

            {/* Movement Vector / Telemetry Information */}
            <div className="p-4 rounded bg-[#06080D] border border-white/[0.06] space-y-1.5">
              <span className="text-[10px] uppercase font-mono-tech text-slate-500 block">
                Movement Information & Trajectory Analysis
              </span>
              <p className="text-xs font-mono-tech text-slate-300 leading-relaxed">
                {selectedEvent.details}
              </p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-white/[0.04]">
                Location: {selectedEvent.location}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

