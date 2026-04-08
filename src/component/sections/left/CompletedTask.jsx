import { useEffect, useState } from "react";
// 1. Import both functions
import {
  getAgentTasks,
  filterCompletedTasks,
} from "../../../services/apiService";
import { CheckCircle } from "lucide-react";

export const CompletedTasks = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Updated useEffect logic
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const allTasks = await getAgentTasks();
        if (isMounted) {
          // B. Filter and Map locally using your utility function
          const processedTasks = filterCompletedTasks(allTasks);

          // console.log('Filtered Completed Tasks:', processedTasks);
          setCompletedTasks(processedTasks);
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // ------------------ Skeleton Loader ------------------
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl p-5 shadow-lg flex-1 min-h-[260px] flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse"></div>
          <div className="h-3 w-32 bg-slate-200/70 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4 mt-2">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 animate-pulse mt-1.5"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-2.5 w-28 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ------------------ Main UI ------------------
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-5 shadow-md flex-1 min-h-[260px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2 tracking-wide">
          <CheckCircle className="w-5 h-5 text-emerald-500 drop-shadow-sm" />
          Completed Tasks
        </h3>
        {/* Optional: Show count */}
        {/* <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-mono border border-emerald-100">
          {completedTasks.length}
        </span> */}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4">
        {completedTasks.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-2">
            <CheckCircle className="w-8 h-8 text-slate-200" />
            <p className="text-xs text-slate-500 font-medium">
              No completed tasks found.
            </p>
          </div>
        ) : (
          completedTasks.slice(0,10).map((task, index) => (
            <div
              key={task.id || index}
              className="relative flex items-start gap-4 pl-1 group"
            >
              {/* Timeline Line */}
              {index < completedTasks.length - 1 && (
                <div className="absolute left-[6px] top-4 bottom-[-18px] w-[2px] bg-gradient-to-b from-slate-200 to-slate-100"></div>
              )}

              {/* Dot */}
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-md mt-1.5 z-10 relative border-2 border-white"></div>

              {/* Task Card */}
              <div className="flex-1 bg-slate-50/70 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 group-hover:bg-white">
                {/* 3. Using lowerCamelCase keys from filterCompletedTasks mapper */}
                <p className="text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2">
                  {task.title}
                </p>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-[11px] text-slate-400 font-mono">
                    #{task.id}
                  </p>

                  {/* Timestamp Badge */}
                  <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-md font-medium shadow-sm border border-emerald-200/50">
                    {task.closedDate
                      ? new Date(task.closedDate).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric", // Adds the Hour (e.g., 2)
                          minute: "2-digit", // Adds the Minute (e.g., 30)
                          hour12: true, // Ensures AM/PM format
                        })
                      : "Done"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
