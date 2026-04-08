import React, { useEffect, useState } from 'react';
import { Trophy, Star, Target, Zap, AlertTriangle } from 'lucide-react';
import { getWeeklyMVP } from '../../services/apiService';

const WeeklyMVPBanner = () => {
  const [mvp, setMvp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMVP = async () => {
      try {
        setLoading(true);
        const winner = await getWeeklyMVP();
        

        // Debug: If winner exists but score is 0, we'll still show it for now 
        // so you can see the component is working.
        if (winner) {
          setMvp(winner);
        } else {
          console.warn("MVP: No winner object returned from service.");
        }
      } catch (err) {
        console.error("MVP: Component Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMVP();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-2xl h-32 bg-slate-50 animate-pulse rounded-[2rem] border border-slate-100 flex items-center justify-center text-slate-400">
        Calculating Weekly MVP...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 flex items-center gap-2">
        <AlertTriangle size={18} />
        <span>Error loading MVP: {error}</span>
      </div>
    );
  }

  // If we have no MVP data at all (null/undefined)
  if (!mvp) {
    return (
      <div className="w-full max-w-2xl p-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-center text-slate-400">
        No MVP data available for this week yet.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/60 rounded-[2rem] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden mb-6">
      
      <div className="flex items-center gap-5 z-10">
        <div className="relative">
          <div className="p-4 bg-white rounded-2xl shadow-md border border-amber-100">
            <Trophy className="w-8 h-8 text-amber-500" />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1 rounded-full border-2 border-white shadow-sm">
            <Star className="w-3 h-3 fill-current" />
          </div>
        </div>
        
        <div className="flex flex-col text-center sm:text-left">
          <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1 flex items-center justify-center sm:justify-start gap-1">
            <Zap className="w-3 h-3 fill-amber-500" />
            Weekly MVP
          </span>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
            {mvp.name || "Unknown User"}
          </h2>
          <span className="text-xs font-bold text-amber-700/60 mt-1 uppercase">
            {mvp.role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyMVPBanner;