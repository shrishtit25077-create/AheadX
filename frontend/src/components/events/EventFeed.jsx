import React from "react";
import { ShieldAlert, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";

export default function EventFeed({ events = [] }) {
  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-lg flex flex-col h-full shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0B0F17] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
          <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-white">
            ACTIVE EVENTS
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
            {events.length}
          </span>
        </div>

        <Link
          to="/incidents"
          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
        >
          View All
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Events List */}
      <div className="p-3 space-y-2.5 overflow-y-auto flex-1 max-h-[520px]">
        {events.length === 0 ? (
          <div className="p-6 text-center text-slate-500 font-mono text-xs">
            No active events detected in this sector.
          </div>
        ) : (
          events.map((evt) => {
            const isWrongSide = evt.type.toLowerCase().includes("wrong-side");
            return (
              <div
                key={evt.id}
                className={`p-3 rounded-lg border transition-all ${
                  isWrongSide
                    ? "bg-red-500/[0.04] border-red-500/30 hover:border-red-500/50"
                    : "bg-amber-500/[0.04] border-amber-500/30 hover:border-amber-500/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                        isWrongSide
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {isWrongSide ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                        <span>{evt.type}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        Vehicle #{evt.vehicleId} ({evt.vehicleClass})
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={evt.status} type="status" />
                </div>

                {/* Event Context & Location */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-cyan-400 font-semibold">{evt.camera}</span>
                    <span className="text-slate-600">•</span>
                    <span className="truncate max-w-[120px]">{evt.location}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                    <Clock className="w-3 h-3" />
                    <span>{evt.time}</span>
                  </div>
                </div>

                {evt.details && (
                  <p className="mt-1.5 text-[10px] text-slate-400 font-sans leading-relaxed bg-black/30 p-1.5 rounded border border-slate-800/50">
                    {evt.details}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="p-2.5 bg-[#0B0F17] border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center">
        PROTOTYPE EVENTS • SUBJECT TO VERIFICATION
      </div>
    </div>
  );
}
