import React from 'react';
import { Ban } from 'lucide-react';

const BlockedTasks = ({ blockers }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm shrink-0 flex flex-col">
      <h3 className="text-xs font-bold text-red-600 uppercase mb-3 flex items-center gap-2 shrink-0">
        <Ban className="w-4 h-4" /> Blocked Tasks
      </h3>
      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 max-h-36">
        {blockers && blockers.length > 0 ? (
          blockers.map((item) => (
            <div
              key={item.id}
              className="bg-red-50/50 p-3 rounded-xl border border-red-100 flex justify-between items-center group"
            >
              <div className="min-w-0 flex-1 mr-2">
                <span className="font-bold text-slate-800 text-sm block truncate">
                  {item.name}
                </span>
                <span className="text-xs text-red-600 font-medium block truncate" title={item.reason}>
                  {item.reason}
                </span>
              </div>
              <span className="text-xs bg-white text-red-700 px-2 py-0.5 rounded font-bold shadow-sm shrink-0">
                {item.time}
              </span>
            </div>
          ))
        ) : (
            <div className="text-center py-4 text-xs text-slate-400 font-bold uppercase">
                No Blockers Detected
            </div>
        )}
      </div>
    </div>
  );
};

export default BlockedTasks;