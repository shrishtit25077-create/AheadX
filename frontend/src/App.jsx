import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import CommandCenter from "./pages/CommandCenter";
import LiveMonitoring from "./pages/LiveMonitoring";
import Incidents from "./pages/Incidents";
import RiskMap from "./pages/RiskMap";
import Analytics from "./pages/Analytics";

function Layout() {
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case "/":
      case "/dashboard":
        return {
          title: "Command Center",
          subtitle: "Real-time road safety and traffic intelligence operations console",
        };
      case "/monitoring":
        return {
          title: "Live Monitoring",
          subtitle: "Multi-camera optical surveillance grid with ByteTrack inference",
        };
      case "/incidents":
        return {
          title: "Incidents",
          subtitle: "Suspected violation queue, event verification, and hazard logs",
        };
      case "/risk-map":
        return {
          title: "Risk Map",
          subtitle: "Geospatial road risk density and danger zone visualization",
        };
      case "/analytics":
        return {
          title: "Analytics",
          subtitle: "Telemetry patterns, vehicle density profiles, and event trends",
        };
      default:
        return {
          title: "Command Center",
          subtitle: "Real-time road safety and traffic intelligence operations console",
        };
    }
  };

  const { title, subtitle } = getPageMeta();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F17] text-slate-100">
      {/* Persistent Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header pageTitle={title} pageSubtitle={subtitle} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<CommandCenter />} />
            <Route path="/monitoring" element={<LiveMonitoring />} />
            <Route path="/incidents" element={<Incidents />} />
            <Route path="/risk-map" element={<RiskMap />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
