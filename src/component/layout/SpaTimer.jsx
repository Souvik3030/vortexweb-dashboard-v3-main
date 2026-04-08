import React, { useEffect, useState } from "react";
import { apiService } from "../../services/apiService";


const SpaTimer = () => {
  const entityTypeId = 1472;
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    let timerInterval;

    async function initializeTimer() {
      try {
        // const endDateStr = await apiService.getLatestSpaEndDate(entityTypeId);

        const endDate = new Date(2025, 11, 10, 16, 0);

        if (isNaN(endDate.getTime())) return;

        timerInterval = setInterval(() => {
          const now = new Date();
          const diff = endDate - now;

          if (diff <= 0) {
            clearInterval(timerInterval);
            setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
            return;
          }

          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);

          setTimeLeft({
            days: String(days).padStart(2, "0"),
            hours: String(hours).padStart(2, "0"),
            minutes: String(minutes).padStart(2, "0"),
            seconds: String(seconds).padStart(2, "0"),
          });
        }, 1000);
      } catch (error) {
        console.error("Error initializing SPA timer:", error.message);
      }
    }

    initializeTimer();

    return () => clearInterval(timerInterval);
  }, []);

  return (
    <div className="flex items-center justify-center w-1/3 gap-4 ">
      <div className="flex items-center gap-4 bg-slate-100/80 px-5 py-2 rounded-full border border-slate-200">
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
         Springfield App {/* Damac Release: */}
        </span>
        <div className="flex gap-1.5 font-mono text-xl font-black text-slate-800 leading-none">
          <span>{timeLeft.days}d</span>
          <span className="text-slate-300">:</span>
          <span>{timeLeft.hours}h</span>
          <span className="text-slate-300">:</span>
          <span>{timeLeft.minutes}m</span>
          <span className="text-slate-300">:</span>
          <span className="text-red-500">{timeLeft.seconds}s</span>
          
        </div>
      </div>
    </div>
  );
};

export default SpaTimer;
