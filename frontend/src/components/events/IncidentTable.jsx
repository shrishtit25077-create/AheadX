import React from "react";
import StatusBadge from "../common/StatusBadge";
import { Info, ArrowUpRight, ShieldAlert, AlertTriangle } from "lucide-react";

export default function IncidentTable({ incidents = [], onSelectIncident }) {
  if (incidents.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-slate-200">
        <Info className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-800">
          No incidents match the selected filter criteria.
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Adjust the filter tab or search parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider font-mono-tech text-[11px]">
            <tr>
              <th className="py-3 px-4">Event Type</th>
              <th className="py-3 px-4">Vehicle ID</th>
              <th className="py-3 px-4">Camera Feed</th>
              <th className="py-3 px-4">Corridor Location</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4 text-right">Triage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 bg-white/70">
            {incidents.map((item) => {
              const isWrongSide = item.event.toLowerCase().includes("wrong-side");
              return (
                <tr
                  key={item.id}
                  onClick={() => onSelectIncident && onSelectIncident(item)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors duration-150 group"
                >
                  {/* Event Type */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {isWrongSide ? (
                        <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <span className={`font-semibold ${isWrongSide ? "text-rose-900" : "text-amber-900"}`}>
                        {item.event}
                      </span>
                    </div>
                  </td>

                  {/* Vehicle ID */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono-tech font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {item.vehicleId}
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1.5 capitalize">
                      {item.vehicleClass}
                    </span>
                  </td>

                  {/* Camera */}
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {item.camera}
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                    {item.location}
                  </td>

                  {/* Time */}
                  <td className="py-3.5 px-4 font-mono-tech text-slate-600">
                    {item.time}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} type="status" size="xs" />
                  </td>

                  {/* Severity */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.severity} type="severity" size="xs" />
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-blue-600 font-semibold group-hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/80 transition shadow-2xs">
                      <span>Investigate</span>
                      <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
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
