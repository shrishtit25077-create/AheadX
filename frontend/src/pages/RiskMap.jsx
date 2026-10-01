import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { riskMarkersData } from "../data/mockData";
import { MapPin, ShieldAlert, AlertTriangle, Video, Layers, Info } from "lucide-react";

// Custom Leaflet DivIcons with pulsing glow for dark command center
const createCustomIcon = (riskColor) => {
  const colorMap = {
    red: {
      bg: "bg-red-500",
      border: "border-red-400",
      ping: "bg-red-400",
      shadow: "shadow-[0_0_15px_rgba(239,68,68,0.8)]",
    },
    yellow: {
      bg: "bg-amber-400",
      border: "border-amber-300",
      ping: "bg-amber-300",
      shadow: "shadow-[0_0_15px_rgba(245,158,11,0.8)]",
    },
    green: {
      bg: "bg-emerald-400",
      border: "border-emerald-300",
      ping: "bg-emerald-300",
      shadow: "shadow-[0_0_15px_rgba(16,185,129,0.8)]",
    },
  };

  const scheme = colorMap[riskColor] || colorMap.green;

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${scheme.ping} opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 ${scheme.bg} border-2 ${scheme.border} ${scheme.shadow}"></span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export default function RiskMap() {
  const [selectedZone, setSelectedZone] = useState(riskMarkersData[0]);

  // Center around NH-48 Corridor (28.46° N, 77.06° E)
  const mapCenter = [28.4600, 77.0600];

  return (
    <div className="space-y-4">
      {/* Top Banner Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-amber-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>PROTOTYPE / DEMO DATA:</strong> Road risk markers and incident clusters shown below are illustrative prototype coordinates. They do not claim to be actual geographic risk measurements yet.
          </span>
        </div>
        <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
          GIS SECTOR 4 DEMO
        </div>
      </div>

      {/* Main Map & Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Side: Leaflet Interactive Dark Map (3 cols) */}
        <div className="lg:col-span-3 bg-[#0F172A] border border-slate-800 rounded-lg overflow-hidden shadow-2xl flex flex-col h-[600px] relative">
          {/* Map Header Overlay */}
          <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded bg-black/80 backdrop-blur-md border border-slate-700 text-xs font-mono text-white flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-bold tracking-wider">SECTOR 4 GIS RISK TELEMETRY</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-red-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> High Risk
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Medium Risk
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Low Risk
              </span>
            </div>
          </div>

          {/* Leaflet Map Container */}
          <div className="w-full h-full">
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              style={{ width: "100%", height: "100%" }}
            >
              {/* Dark CartoDB Matter Tile Layer */}
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                maxZoom={19}
              />

              {riskMarkersData.map((marker) => (
                <Marker
                  key={marker.id}
                  position={marker.coordinates}
                  icon={createCustomIcon(marker.riskColor)}
                  eventHandlers={{
                    click: () => setSelectedZone(marker),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1.5 min-w-[200px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="text-xs font-bold text-white uppercase">
                          {marker.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            marker.riskColor === "red"
                              ? "bg-red-950 text-red-400 border border-red-800"
                              : marker.riskColor === "yellow"
                              ? "bg-amber-950 text-amber-400 border border-amber-800"
                              : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          }`}
                        >
                          {marker.riskLevel} Risk
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                        <div>
                          Events: <strong className="text-white">{marker.recentEventsCount}</strong>
                        </div>
                        <div>
                          Linked: <strong className="text-cyan-400">{marker.camera}</strong>
                        </div>
                        <div>
                          Last: <span className="text-slate-400">{marker.lastDetectedEvent}</span>
                        </div>
                      </div>

                      <div className="pt-1 text-[9px] font-mono text-slate-500 border-t border-slate-800/80">
                        {marker.roadType} • {marker.speedLimit}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Right Side: Selected Zone Telemetry Panel (1 col) */}
        <div className="lg:col-span-1 bg-[#0F172A] border border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-xl space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                ROAD ZONE DETAILS
              </h3>
            </div>

            {selectedZone ? (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Sector Zone</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {selectedZone.name}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0B0F17] border border-slate-800">
                  <span className="text-slate-400">Risk Level</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedZone.riskColor === "red"
                        ? "bg-red-950 text-red-400 border border-red-800"
                        : selectedZone.riskColor === "yellow"
                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    }`}
                  >
                    {selectedZone.riskLevel}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Recent Events:</span>
                    <span className="font-bold text-white">{selectedZone.recentEventsCount} detected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Linked Camera:</span>
                    <span className="text-cyan-400 font-bold">{selectedZone.camera}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Road Geometry:</span>
                    <span className="text-slate-300">{selectedZone.roadType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Speed Limit:</span>
                    <span className="text-slate-300">{selectedZone.speedLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Traffic Volume:</span>
                    <span className="text-slate-300">{selectedZone.hourlyDensity}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-black/40 border border-slate-800 text-[10px] text-slate-400">
                  <span className="text-slate-500 block uppercase mb-0.5">Last Detected Event</span>
                  <span className="text-amber-300 font-semibold">{selectedZone.lastDetectedEvent}</span>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-slate-500 text-xs font-mono">
                Click any marker on the map to inspect zone risk telemetry.
              </div>
            )}
          </div>

          {/* Bottom Card */}
          <div className="p-3 bg-[#0B0F17] rounded border border-slate-800 text-[10px] font-mono text-slate-500">
            <div>COORDINATES:</div>
            <div className="text-cyan-400 font-bold mt-0.5">
              {selectedZone ? selectedZone.coordinates.join(", ") : "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
