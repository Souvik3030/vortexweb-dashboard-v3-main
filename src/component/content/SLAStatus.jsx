import React from 'react';

const SLAStatus = ({ slaData }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl flex-1 flex flex-col shadow-sm min-h-[200px]">
      <div className="p-4 border-b border-slate-100 shrink-0">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          SLA Status
        </h3>
      </div>
      <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
        {slaData && slaData.length > 0 ? (
          slaData.map((sla, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-3 rounded-xl border border-slate-100"
            >
              <div className="flex justify-between items-start mb-0.5">
                <span className="font-bold text-slate-700 text-sm truncate max-w-[70%]">
                  {sla.task}
                </span>
                <span
                  className={`font-black text-[11px] uppercase ${sla.color} shrink-0`}
                >
                  {sla.status}
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {sla.owner}
              </span>
            </div>
          ))
        ) : (
            <div className="text-center py-4 text-xs text-slate-400 font-bold uppercase">
                All Systems Nominal
            </div>
        )}
      </div>
    </div>
  );
};

export default SLAStatus;