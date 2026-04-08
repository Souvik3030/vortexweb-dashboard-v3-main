import React, { useState, useEffect } from "react";
import { LayoutGrid, Trophy, ShieldCheck, Smile } from "lucide-react";
import { apiService } from "../../services/apiService";
import SpaTimer from "./SpaTimer";
import WeeklyMVPBanner from "../content/WeeklyMVPBanner";

const Header = ({ timeLeft, stabilityStreak, formattedTime }) => {
  return (
    <header className="relative bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-30 shrink-0 h-20 w-full min-w-[1400px]">
      {/* --- LEFT SECTION: Logo & Mood --- */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 p-0.5 rounded-lg shadow-lg shadow-blue-200/50">
            <img
              src="/src/assets/22.png"
              alt="VortexWeb Logo"
              className="w-18 h-15 object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none flex items-center">
              <span className="drop-shadow-sm">Vortex</span>
              <span className="bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent ml-0.5">
                Web
              </span>
            </h1>
            <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-0.5">
              Command Center
            </p>
          </div>
        </div>
      </div>

      {/* --- CENTER SECTION: Damac Release (Absolutely Centered) --- */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <SpaTimer />
      </div>

      {/* --- RIGHT SECTION: MVP, Stability, Clock --- */}
      <div className="flex items-center gap-8">
        {/* Clock */}
        <div className="text-4xl font-black text-slate-900 tabular-nums tracking-tight pl-4 border-l border-slate-200">
          {formattedTime}
        </div>
      </div>
    </header>
  );
};

export default Header;
