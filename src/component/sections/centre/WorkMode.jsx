import React, { useState, useEffect } from "react";
import { Zap, Coffee, Lock, Activity } from "lucide-react";
import {apiService} from "../../../services/apiService";

export default function WorkMode() {
  const [sprintPercentage, setSprintPercentage] = useState(0);

  // Default Work Mode State
  const [workMode, setWorkMode] = useState({
    mode: "DEEP WORK",
    subtext: "FOCUS BLOCK",
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    icon: Lock,
  });

  // --- 1. Bitrix Data Polling ---
  useEffect(() => {
    const fetchData = async () => {
      const percentage = await apiService.getSprintProgress();
      setSprintPercentage(percentage);
    };

    // Fetch immediately on load
    fetchData();

    // Poll every 5 minutes (300000ms) to keep data fresh
    const intervalId = setInterval(fetchData, 300000);

    return () => clearInterval(intervalId);
  }, []);

  // --- 2. Time-Based Work Mode Logic ---
  useEffect(() => {
    const updateMode = () => {
      const date = new Date();
      const hour = date.getHours();
      const minutes = date.getMinutes();
      const time = hour + minutes / 60;

      if (time >= 10.5 && time < 13.5) {
        setWorkMode({
          mode: "DEEP WORK",
          subtext: "NO INTERRUPTIONS",
          color: "text-rose-600",
          bg: "bg-rose-50",
          border: "border-rose-100",
          icon: Lock,
        });
      } else if (time >= 13.5 && time < 15.5) {
        setWorkMode({
          mode: "LUNCH BREAK",
          subtext: "RECHARGE",
          color: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          icon: Coffee,
        });
      } else if (time >= 15.5 && time < 19.0) {
        setWorkMode({
          mode: "DEEP WORK",
          subtext: "FOCUS BLOCK",
          color: "text-rose-600",
          bg: "bg-rose-50",
          border: "border-rose-100",
          icon: Lock,
        });
      } else {
        setWorkMode({
          mode: "WRAP UP",
          subtext: "PLAN FOR TOMORROW",
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
          icon: Activity,
        });
      }
    };

    updateMode();
    // Check every minute to update the UI if the time block changes
    const timer = setInterval(updateMode, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center bg-slate-50 p-4">
      {/* Work Mode Component */}
      <div
        className={`w-full max-w-2xl rounded-3xl border-2 ${workMode.border} ${workMode.bg} p-10 flex items-center justify-between shadow-sm shrink-0 relative overflow-hidden transition-all duration-500`}
      >
        <div
          className="absolute -right-10 -top-10 w-56 h-56 bg-current opacity-5 rounded-full pointer-events-none"
          style={{ color: "currentColor" }}
        ></div>
        <div className="flex items-center gap-6 z-10">
          <div className="bg-white/80 p-4 rounded-2xl backdrop-blur-sm">
            <workMode.icon className={`w-10 h-10 ${workMode.color}`} />
          </div>
          <div>
            <h2
              className={`text-4xl font-black ${workMode.color} uppercase tracking-tighter leading-none`}
            >
              {workMode.mode}
            </h2>
            <span className="text-base font-bold text-slate-500 uppercase tracking-widest mt-1 block">
              {workMode.subtext}
            </span>
          </div>
        </div>
        <div className="w-1/3 z-10">
          <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-1.5">
            <span>Sprint Goal</span>
            <span>{sprintPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-slate-800 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${sprintPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
