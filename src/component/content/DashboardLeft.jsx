import React from 'react';
import { GitCommit } from 'lucide-react';
import BlockedTasks from './BlockedTasks';
import TeamVibes from './TeamVibes';
import SystemCriticalAlerts from './SystemCriticalAlerts';
import { CompletedTasks } from '../sections/left/CompletedTask';

const DashboardLeft = ({ criticalAlerts, cultureEvents, blockers, commitLogData }) => {
  return (
    <div className="col-span-3 flex flex-col gap-4 h-full min-h-min">
      
      {/* Critical Alert Card - Using dedicated component with dynamic data */}
      <SystemCriticalAlerts criticalAlerts={criticalAlerts} />

      {/* Events / Team Vibes */}
      <TeamVibes events={cultureEvents} />

      {/* Blocked List */}
      <BlockedTasks blockers={blockers} />

      {/* Commit Log */}
      {/* <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1 min-h-[200px] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <h3 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-purple-600" /> Commit Log
          </h3>
        </div>

        
        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          {commitLogData.map((commit) => (
            <div key={commit.id} className="flex items-start gap-3 relative">
              
              {commit.id !== commitLogData.length && (
                <div className="absolute left-[5px] top-3 bottom-[-16px] w-[2px] bg-slate-100"></div>
              )}
              <div
                className={`w-2.5 h-2.5 rounded-full ${commit.color} mt-1.5 shrink-0 relative z-10`}
              ></div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-slate-800 leading-snug font-mono">
                  <span className="text-purple-600">{commit.type}:</span>{' '}
                  {commit.msg}
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {commit.author} • {commit.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div> */}
      <CompletedTasks/>
    </div>
  );
};

export default DashboardLeft;