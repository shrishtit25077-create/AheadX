import React from "react";

export default function StatusBadge({ status, type = "status", size = "sm" }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  const sizeClasses = size === "xs" 
    ? "px-2 py-0.5 text-[10px]" 
    : "px-2.5 py-1 text-xs";

  // Status mapping
  if (type === "status") {
    if (normalized.includes("detected") || normalized.includes("critical") || normalized.includes("alert")) {
      return (
        <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-mono-tech font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 shadow-xs ring-1 ring-rose-500/10`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          {status}
        </span>
      );
    }
    if (normalized.includes("review") || normalized.includes("investigat") || normalized.includes("warning")) {
      return (
        <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-mono-tech font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 shadow-xs ring-1 ring-amber-500/10`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Under Review
        </span>
      );
    }
    if (normalized.includes("resolved") || normalized.includes("cleared") || normalized.includes("online") || normalized.includes("normal")) {
      return (
        <span className={`inline-flex items-center gap-1.5 ${sizeClasses} rounded-full font-mono-tech font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 shadow-xs ring-1 ring-emerald-500/10`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-soft-pulse"></span>
          {status}
        </span>
      );
    }
  }

  // Severity mapping
  if (type === "severity") {
    if (normalized === "high" || normalized === "critical") {
      return (
        <span className={`inline-flex items-center ${sizeClasses} rounded-full font-mono-tech font-bold text-rose-700 bg-rose-100/70 border border-rose-300/80 shadow-xs`}>
          HIGH
        </span>
      );
    }
    if (normalized === "medium") {
      return (
        <span className={`inline-flex items-center ${sizeClasses} rounded-full font-mono-tech font-semibold text-amber-800 bg-amber-100/70 border border-amber-300/80 shadow-xs`}>
          MEDIUM
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center ${sizeClasses} rounded-full font-mono-tech font-medium text-slate-600 bg-slate-100 border border-slate-200 shadow-xs`}>
        LOW
      </span>
    );
  }

  // Generic fallback
  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-mono-tech font-medium text-slate-700 bg-slate-100 border border-slate-200`}>
      {status}
    </span>
  );
}
