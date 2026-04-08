import React, { useEffect, useState } from "react";
import { Flame, Maximize2 } from "lucide-react";
import { apiService } from "../../services/apiService";
import ActiveSprintModal from "../../modals/ActiveSprintModal";
import { data } from "autoprefixer";

const ActiveSprint = () => {
  const [kanbanTasks, setKanbanTasks] = useState({
    todo: [],
    inProgress: [],
    review: [],
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const data = await apiService.getActiveSprintTasks(); // fetch latest 10 days tasks
        setKanbanTasks(data);
      } catch (error) {
        console.error("Error fetching Active Sprint tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 flex flex-col shadow-sm overflow-hidden flex-[1.5] min-h-[350px] justify-center items-center text-slate-400 font-bold">
        Loading Active Sprint...
      </div>
    );
  }

  return (
    <>
      {/* Main Kanban Card */}
      <div className="bg-white rounded-3xl border border-slate-200 flex flex-col shadow-sm overflow-hidden flex-[1.5] min-h-[350px]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" /> Active Sprint
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-lg font-bold text-slate-600 shadow-sm">
              Current
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-lg bg-white hover:bg-orange-50 text-slate-400 hover:text-orange-500 border border-slate-200 hover:border-orange-200 transition-colors shadow-sm"
              title="Expand Board"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-3 gap-0 divide-x divide-slate-100 overflow-hidden">
          {/* To Do Column */}
          <KanbanColumn
            title="To Do"
            tasks={kanbanTasks.todo}
            bg="bg-slate-50/30"
            borderColor="border-l-slate-300"
            dotColor="bg-orange-400"
          />

          {/* In Progress Column */}
          <KanbanColumn
            title="In Progress"
            tasks={kanbanTasks.inProgress}
            bg="bg-blue-50/20"
            borderColor="border-l-blue-500"
            dotColor="bg-blue-400 animate-pulse"
          />

          {/* Review Column */}
          <KanbanColumn
            title="QA Review"
            tasks={kanbanTasks.review}
            bg="bg-slate-50/30"
            borderColor="border-l-emerald-400"
            dotColor="bg-green-400"
          />
        </div>
      </div>

      {/* Active Sprint Modal */}
      {isModalOpen && (
        <ActiveSprintModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tasks={kanbanTasks} // pass the same tasks
        />
      )}
    </>
  );
};

// Reusable Kanban Column Component
const KanbanColumn = ({ title, tasks, bg, borderColor, dotColor }) => (
  <div className={`flex flex-col h-full ${bg} min-h-0`}>
    <div className="p-2.5 text-center border-b border-slate-100">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase">
        {title} ({tasks.length})
      </h3>
    </div>
    <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar flex-1 min-h-0">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white p-3 rounded-xl border border-slate-200 shadow-sm border-l-4 ${borderColor}`}
          >
            <p className="text-sm font-bold text-slate-800 mb-1.5 leading-tight line-clamp-2">
              {task.title}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {task.assignee}
              </span>
              {task.priority && (
                <div
                  className={`w-2 h-2 rounded-full ${dotColor}`}
                  title={`${task.priority} Priority`}
                ></div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center mt-10 text-xs text-slate-300 font-bold uppercase">
          Empty
        </div>
      )}
    </div>
  </div>
);

export default ActiveSprint;
