import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { riskMarkersData, camerasData } from "../data/mockData";
import { MapPin, ShieldAlert, AlertTriangle, Eye, ArrowUpRight, Compass } from "lucide-react";
import Modal from "../components/common/Modal";

// Modern glowing circular pin icons for executive light map
const createExecutiveMarker = (riskColor) => {
  const colorMap = {
    red: {
      fill: "#EF4444",
      ring: "rgba(239, 68, 68, 0.25)",
      border: "#FFFFFF",
    },
    yellow: {
      fill: "#F59E0B",
      ring: "rgba(245, 158, 11, 0.25)",
      border: "#FFFFFF",
    },
    green: {
      fill: "#10B981",
      ring: "rgba(16, 185, 129, 0.25)",
      border: "#FFFFFF",
    },
  };

  const scheme = colorMap[riskColor] || colorMap.green;

  return L.divIcon({
    className: "executive-leaflet-marker",
    html: `
      <div style="
        position: relative;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: ${scheme.ring};
          animation: ${riskColor === 'red' ? 'rippleEffect 2s infinite' : 'none'};
        "></div>
        <div style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: ${scheme.fill};
          border: 2px solid ${scheme.border};
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        "></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
};

export default function RiskMap() {
  const [selectedZone, setSelectedZone] = useState(riskMarkersData[0]);
  const [inspectedCam, setInspectedCam] = useState(null);

  // Center around NH-48 Corridor (28.46° N, 77.06° E)
  const mapCenter = [28.4600, 77.0600];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Executive Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-bold font-mono-tech uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80">
              GIS Spatial Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">· 8 Corridor Checkpoints</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            Road Risk Density & Spatial Hotspots
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Geospatial incident clustering, trajectory variance, and automated risk classification
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-700 bg-white/90 px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>High Risk ({riskMarkersData.filter(m => m.riskColor === "red").length})</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Medium Risk ({riskMarkersData.filter(m => m.riskColor === "yellow").length})</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Normal ({riskMarkersData.filter(m => m.riskColor === "green").length})</span>
          </span>
        </div>
      </div>

      {/* Main Map & Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Leaflet Map */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden border border-slate-200/90 shadow-md h-[560px] relative">
          <MapContainer
            center={mapCenter}
            zoom={12}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            {/* CartoDB Positron - Clean Light Map Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {riskMarkersData.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={createExecutiveMarker(marker.riskColor)}
                eventHandlers={{
                  click: () => setSelectedZone(marker),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 font-sans">
                    <div className="font-bold text-slate-900 text-xs">{marker.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono-tech">{marker.location}</div>
                    <div className="text-[11px] font-semibold text-rose-700 pt-1">
                      {marker.details}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Map Watermark */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-mono-tech text-slate-600 shadow-md pointer-events-none">
            Spatial Projection: EPSG:3857 · CartoDB Positron
          </div>
        </div>

        {/* Selected Zone Deep Dive Panel */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between h-[560px] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold font-mono-tech text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  HOTSPOT DOSSIER
                </span>
                <span className={`text-[11px] font-bold font-mono-tech px-2.5 py-0.5 rounded-full border ${
                  selectedZone.riskColor === "red"
                    ? "text-rose-700 bg-rose-50 border-rose-200"
                    : selectedZone.riskColor === "yellow"
                    ? "text-amber-700 bg-amber-50 border-amber-200"
                    : "text-emerald-700 bg-emerald-50 border-emerald-200"
                }`}>
                  {selectedZone.level.toUpperCase()}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {selectedZone.title}
              </h3>
              <p className="text-xs text-slate-500 font-mono-tech mt-1">
                {selectedZone.location}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-6 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Primary Hazard:</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedZone.hazardType || "Wrong-Side & Weaving"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Optical Feeds:</span>
                  <span className="font-semibold text-slate-800 font-mono-tech mt-0.5 block">{selectedZone.activeCameras || "Cam 01, Cam 02"}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Hourly Incidents:</span>
                  <span className="font-bold text-rose-700 font-mono-tech mt-0.5 block">{selectedZone.hourlyIncidents || 3} recorded</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Peak Congestion:</span>
                  <span className="font-semibold text-slate-800 font-mono-tech mt-0.5 block">08:30 – 10:15</span>
                </div>
              </div>

              {/* Detailed Operational Context */}
              <div className="mt-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-semibold text-slate-800">Operational Assessment:</div>
                <p className="leading-relaxed">
                  {selectedZone.details || "High trajectory divergence detected at slip road merger. Vector angle deviations frequently violate designated lane discipline."}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setInspectedCam(camerasData[0])}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>Inspect Corridor CCTV Feed</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Inspection Modal */}
      {inspectedCam && (
        <Modal
          isOpen={!!inspectedCam}
          onClose={() => setInspectedCam(null)}
          title={`${inspectedCam.name} — ${inspectedCam.label}`}
          subtitle={`${inspectedCam.location} · Associated with Hotspot: ${selectedZone.title}`}
        >
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video flex items-center justify-center shadow-md">
              <video
                src="/videos/traffic_wrong_side.mp4"
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs text-slate-600 flex justify-between font-mono-tech">
              <span>Synchronized Live Optical Feed</span>
              <span className="text-emerald-700 font-bold">ONLINE · 24 FPS</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
