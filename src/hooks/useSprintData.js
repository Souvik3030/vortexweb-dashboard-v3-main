import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const useSprintData = (pollInterval = 60000) => {
  const [kanbanTasks, setKanbanTasks] = useState({ todo: [], inProgress: [], review: [] });
  const [blockers, setBlockers] = useState([]);
  const [slaData, setSlaData] = useState([]);
  const [events, setEvents] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        const [tasks, blocked, sla, vibeEvents, criticals] = await Promise.all([
          apiService.getBitrixSprintTasks(),
          apiService.getBitrixBlockedTasks(),
          apiService.getBitrixSLAStatus(),
          apiService.getBitrixUpcomingEvents(), // now exists
          apiService.getBitrixCriticalAlerts()
        ]);

        if (isMounted) {
          if (tasks) setKanbanTasks(tasks);
          if (blocked) setBlockers(blocked);
          if (sla && sla.length > 0) setSlaData(sla);
          if (vibeEvents) setEvents(vibeEvents);
          if (criticals) setCriticalAlerts(criticals);
        }
      } catch (err) {
        console.error("Error fetching sprint data", err);
      }
    };

    fetchAllData();
    const intervalId = setInterval(fetchAllData, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [pollInterval]);

  return { kanbanTasks, blockers, slaData, events, criticalAlerts };
};
