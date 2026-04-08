import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';
import {apiService} from '../../../services/apiService';



const PunctualityWidget = () => {
  const [attendanceRank, setAttendanceRank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAttendanceRanking();
      setAttendanceRank(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex-1 overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
          <Clock className="w-4 h-4" /> 
          Punctuality
          {loading && <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />}
        </h3>
      </div>

      {/* Content Area */}
      <div className="space-y-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
        
        {/* Error State */}
        {error && !loading && attendanceRank.length === 0 && (
           <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
             <AlertCircle className="w-5 h-5" />
             <span className="text-xs">{error}</span>
             <button onClick={loadData} className="text-[10px] text-blue-500 underline">Retry</button>
           </div>
        )}

        {/* Loading State */}
        {loading && attendanceRank.length === 0 && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Data List */}
        {!loading && attendanceRank.map((a, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group"
          >
            <span className="font-bold text-slate-700 flex gap-3 items-center text-sm">
              <span
                className={`text-sm font-black w-5 text-center ${
                  idx === 0 ? "text-amber-500" : 
                  idx === 1 ? "text-slate-400" :
                  idx === 2 ? "text-orange-400" :
                  "text-slate-300"
                }`}
              >
                #{a.rank}
              </span>
              <div className="flex flex-col">
                <span>{a.name}</span>
              </div>
            </span>
            
            <span
              className={`text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wide border ${
                a.streak === "0"
                  ? "bg-red-50 text-red-600 border-red-100"
                  : parseInt(a.streak) > 100 
                    ? "bg-purple-50 text-purple-600 border-purple-100" // Special color for high streaks
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
              }`}
            >
              {a.streak} Day Streak
            </span>
          </div>
        ))}
        
        {!loading && attendanceRank.length === 0 && (
            <div className="text-center text-xs text-slate-400 py-4">No active users found.</div>
        )}
      </div>
    </div>
  );
};

export default PunctualityWidget;