import React from "react";
import { X, Flame } from "lucide-react";

const ActiveSprintModal = ({ isOpen, onClose, tasks }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-slate-800">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl flex flex-col h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                Active Sprint Board
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Week 24 • Full View
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Kanban Columns */}
        <div className="flex-1 p-6 bg-slate-50/50 overflow-hidden">
          <div className="grid grid-cols-3 gap-6 h-full">
            {/* To Do Column */}
            <div className="flex flex-col h-full bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-3 text-center border-b border-slate-200 bg-slate-100">
                <h3 className="text-sm font-black text-slate-500 uppercase">
                  To Do ({tasks.todo.length})
                </h3>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                {tasks.todo.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-slate-300 group hover:shadow-md transition-all"
                  >
                    <p className="text-base font-bold text-slate-800 mb-2 leading-tight">
                      {task.title}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">
                        {task.assignee}
                      </span>
                      {task.priority === "High" && (
                        <div
                          className="w-2.5 h-2.5 rounded-full bg-orange-400"
                          title="High Priority"
                        ></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="flex flex-col h-full bg-blue-50/30 rounded-2xl border border-blue-100 overflow-hidden">
              <div className="p-3 text-center border-b border-blue-200 bg-blue-100/50">
                <h3 className="text-sm font-black text-blue-600 uppercase">
                  In Progress ({tasks.inProgress.length})
                </h3>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                {tasks.inProgress.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm border-l-4 border-l-blue-500 group hover:shadow-md transition-all"
                  >
                    <p className="text-base font-bold text-slate-800 mb-2 leading-tight">
                      {task.title}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">
                        {task.assignee}
                      </span>
                      {task.priority === "Crit" && (
                        <div
                          className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"
                          title="Critical Priority"
                        ></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Column */}
            <div className="flex flex-col h-full bg-emerald-50/30 rounded-2xl border border-emerald-100 overflow-hidden">
              <div className="p-3 text-center border-b border-emerald-200 bg-emerald-100/50">
                <h3 className="text-sm font-black text-emerald-600 uppercase">
                  QA Review ({tasks.review.length})
                </h3>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
                {tasks.review.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm opacity-90 hover:opacity-100 transition-all border-l-4 border-l-emerald-400"
                  >
                    <p className="text-base font-bold text-slate-700 mb-2 leading-tight">
                      {task.title}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">
                        {task.assignee}
                      </span>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSprintModal;
