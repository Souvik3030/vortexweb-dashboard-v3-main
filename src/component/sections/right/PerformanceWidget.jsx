import React, { useState, useEffect, useMemo } from 'react';
import { Server, ArrowUp, ArrowDown, Star, RefreshCw, AlertCircle } from 'lucide-react';
import { getPerformanceData } from '../../../services/apiService';

const PerformanceWidget = () => {
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPerformanceData();
      const validPerformers = data || [];

      setPerformers(validPerformers);
    } catch (err) {
      console.error("Performance Widget Error:", err);
      setError("Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const sortedPerformers = useMemo(() => {
    return [...performers].sort((a, b) => {
      const scoreA = Number(a.score) || 0;
      const scoreB = Number(b.score) || 0;
      return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    });
  }, [performers, sortOrder]);

  const toggleSort = () =>
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));

  const getScoreColor = (score) => {
    const numScore = Number(score);
    if (numScore >= 9) return 'text-emerald-600';
    if (numScore >= 7.5) return 'text-blue-600';
    if (numScore >= 6) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-[1.5] overflow-hidden flex flex-col min-h-[300px]">

      {/* Header */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
          <Server className="w-4 h-4" />
          Performance
          <span className="text-slate-300 ml-1 font-normal lowercase">
            ({sortOrder === 'asc' ? 'low → high' : 'high → low'})
          </span>
          {loading && <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />}
        </h3>

        <button
          onClick={toggleSort}
          className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400"
        >
          {sortOrder === 'asc'
            ? <ArrowUp className="w-3.5 h-3.5" />
            : <ArrowDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2 overflow-y-auto h-full pb-2 custom-scrollbar pr-1">

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-2 p-2 bg-rose-50 rounded-lg text-rose-600 text-[10px]">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
            <button onClick={loadData} className="ml-auto underline font-bold">
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && performers.length === 0 && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Data List */}
        {!loading && sortedPerformers.map((p, idx) => {
          const name = p.name || "User";
          // Handle null scores by defaulting to 0 for the display
          const displayScore = p.score !== null ? Number(p.score).toFixed(1) : "0.0";

          return (
            <div
              key={p.id || idx}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                  {p.photoUrl ? (
                    <img
                      src={p.photoUrl}
                      alt={name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    name.charAt(0)
                  )}
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">
                    {name}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {p.role || "Agent"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-lg font-black ${getScoreColor(displayScore)}`}>
                  {displayScore}
                </span>
                <div className="w-4 flex justify-center">
                  {p.trend === 'up' ? (
                    <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                  ) : p.trend === 'down' ? (
                    <div className="w-3.5 h-1 bg-rose-400 rounded-full rotate-45" />
                  ) : (
                    <div className="w-3.5 h-1 bg-slate-300 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {!loading && performers.length === 0 && !error && (
          <div className="text-center text-xs text-slate-400 py-10">
            No recent task activity found.
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceWidget;