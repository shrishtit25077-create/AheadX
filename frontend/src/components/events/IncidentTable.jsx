import React from "react";
import StatusBadge from "../common/StatusBadge";
import { ShieldAlert, AlertTriangle, Info, ExternalLink } from "lucide-react";

export default function IncidentTable({ incidents = [], onSelectIncident }) {
  if (incidents.length === 0) {
    return (
      <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-12 text-center">
        <Info className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <p className="text-sm font-mono text-slate-300">
          No incidents match the selected filter criteria.
        </p>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Adjust the filter tab or search parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B0F17] border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Event Type</th>
              <th className="py-3 px-4">Vehicle ID</th>
              <th className="py-3 px-4">Camera Feed</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-xs font-mono">
            {incidents.map((item) => {
              const isWrongSide = item.event.toLowerCase().includes("wrong-side");
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectIncident && onSelectIncident(item)}
                  className="hover:bg-slate-800/40 cursor-pointer transition"
                >
                  {/* Event Type */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {isWrongSide ? (
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="font-bold text-white tracking-wide">
                        {item.event}
                      </span>
                    </div>
                  </td>

                  {/* Vehicle ID */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-cyan-300">
                      {item.vehicleId}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5 font-sans">
                      ({item.vehicleClass})
                    </span>
                  </td>

                  {/* Camera */}
                  <td className="py-3 px-4 text-slate-300 font-semibold">
                    {item.camera}
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 text-slate-400">
                    {item.location}
                  </td>

                  {/* Time */}
                  <td className="py-3 px-4 text-slate-400">
                    {item.time}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} type="status" />
                  </td>

                  {/* Severity */}
                  <td className="py-3 px-4">
                    <StatusBadge status={item.severity} type="severity" />
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectIncident) onSelectIncident(item);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition inline-flex items-center gap-1"
                    >
                      <span>Review</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
