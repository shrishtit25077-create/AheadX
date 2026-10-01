import React from "react";

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  accentColor = "cyan",
  badge,
}) {
  const colorMap = {
    cyan: {
      border: "border-cyan-500/20 hover:border-cyan-500/40",
      iconBg: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
      glow: "group-hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]",
      valText: "text-white",
    },
    red: {
      border: "border-red-500/20 hover:border-red-500/40",
      iconBg: "bg-red-500/10 text-red-400 border border-red-500/20",
      glow: "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]",
      valText: "text-red-400",
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/40",
      iconBg: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]",
      valText: "text-amber-400",
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]",
      valText: "text-emerald-400",
    },
  };

  const scheme = colorMap[accentColor] || colorMap.cyan;

  return (
    <div
      className={`group bg-[#0F172A] border ${scheme.border} ${scheme.glow} rounded-lg p-4 transition-all duration-200 relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400 font-medium">
            {title}
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight mt-1 ${scheme.valText}`}>
            {value}
          </div>
          {subtext && (
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{subtext}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`w-9 h-9 rounded flex items-center justify-center ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>{badge.label}</span>
          <span className="font-semibold text-slate-300">{badge.value}</span>
        </div>
      )}
    </div>
  );
}
