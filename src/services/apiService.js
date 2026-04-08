import {
  parseISO,
  isToday,
  isBefore,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
  isWithinInterval,
} from "date-fns";

import { fetchFast } from "./apiClient";
import {
  parseBitrixDate,
  calculateTimeAgo,
  getBitrixUpcomingBirthdays,
} from "../utils/dataService";
import axios from "axios";

const EXCLUDED_USERS = [1, 11, 55, 201, 291, 603, 217, 669, 705];

const filterExcludedUsers = (data) =>
  data.filter((item) => !EXCLUDED_USERS.includes(Number(item.ID || item.id)));

const mapTask = (task) => {
  const responsibleName =
    task.responsible?.name || task.RESPONSIBLE_NAME || "Unknown";
  const responsibleLast =
    task.responsible?.lastName || task.RESPONSIBLE_LAST_NAME || "";
  return {
    id: task.ID || task.id,
    title: task.TITLE || task.title,
    assignee: responsibleName.split(" ")[0] || responsibleName,
    priority:
      task.priority === "2" ? "High" : task.priority === "1" ? "Med" : "Low",
    status: task.STATUS || task.status,
    createdDate: task.createdDate || task.CREATED_DATE || null,
  };
};

export const getAgentTasks = async () => {
  const EXCLUDED_USERS = [1, 11, 69, 55, 201, 291, 603, 217, 669];

  const params = {
    order: { ID: "desc" },
    select: [
      "ID",
      "TITLE",
      "DEADLINE",
      "DESCRIPTION",
      "STATUS",
      "GROUP_ID",
      "RESPONSIBLE_ID",
      "CREATED_DATE",
      "CLOSED_DATE",
    ],
    filter: {
      "!RESPONSIBLE_ID": EXCLUDED_USERS,
    },
  };

  return await fetchFast("tasks.task.list", params);
};

export const apiService = {
  getAllUsers: async () => {
    try {
      const users = await fetchFast("user.get", {
        FILTER: {
          ACTIVE: "true",
          USER_TYPE: "employee",
        },
      });

      const allUsers = users || [];

      return filterExcludedUsers(allUsers);
    } catch (error) {
      console.warn("API Error in getAllUsers:", error);
      return [];
    }
  },

  getAllUsersWithStatus: async () => {
    const BITRIX_WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_API_URL;
    const isToday = (dateString) => {
      if (!dateString) return false;
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const startDay = new Date(dateString).toISOString().split("T")[0];
      return today === startDay;
    };

    const allUsers = await apiService.getAllUsers();

    if (!allUsers || allUsers.length === 0) return [];
    const users = allUsers.filter(
      (u) => !EXCLUDED_USERS.includes(Number(u.ID))
    );

    const statusMap = {};
    const userChunks = [];
    for (let i = 0; i < users.length; i += 50)
      userChunks.push(users.slice(i, i + 50));

    for (const chunk of userChunks) {
      const cmd = {};
      chunk.forEach((u) => {
        cmd[`u_${u.ID}`] = `timeman.status?USER_ID=${u.ID}`;
      });
      try {
        const response = await axios.post(`${BITRIX_WEBHOOK_URL}/batch`, {
          halt: 0,
          cmd,
        });
        Object.assign(statusMap, response.data?.result?.result || {});
      } catch (err) {
        console.error(err);
      }
    }

    return users.map((user) => {
      const timeData = statusMap[`u_${user.ID}`];
      const bStatus = timeData?.STATUS;
      const timeStart = timeData?.TIME_START;

      let finalStatus = "absent";

      if (bStatus === "OPENED") {
        finalStatus = "online";
      } else if (bStatus === "PAUSED") {
        finalStatus = "away";
      } else if (bStatus === "CLOSED" || bStatus === "EXPIRED") {
        finalStatus = isToday(timeStart) ? "away" : "absent";
      } else {
        finalStatus = isToday(timeStart) ? "away" : "absent";
      }

      return {
        id: user.ID,
        name: `${user.NAME} ${user.LAST_NAME}`.trim(),
        initials: `${user.NAME?.charAt(0)}${user.LAST_NAME?.charAt(
          0
        )}`.toUpperCase(),
        photoUrl: user.PERSONAL_PHOTO,
        position: user.WORK_POSITION,
        status: finalStatus,
      };
    });
  },

  getAttendanceRanking: async () => {
    const EXCLUDED_USERS = [1, 11, 55, 201, 291, 603, 217, 669];
    const today = new Date();
    const isSunday = today.getDay() === 0;

    const allUsers = await apiService.getAllUsers();
    const users = allUsers.filter(
      (u) => !EXCLUDED_USERS.includes(Number(u.ID))
    );

    const cmd = {};
    users.forEach((u) => {
      cmd[`u_${u.ID}`] = `timeman.status?USER_ID=${u.ID}`;
    });

    let statusMap = {};
    try {
      const response = await fetchFast("batch", { halt: 0, cmd });
      statusMap = response || {};
    } catch (err) {
      console.error("Attendance Batch Error:", err);
    }

    const processedData = users.map((user) => {
      const timeData = statusMap[`u_${user.ID}`];
      const timeStartStr = timeData?.TIME_START;

      let isOnTimeToday = false;
      let hasClockedInToday = false;

      if (timeStartStr) {
        const startDate = new Date(timeStartStr);
        if (startDate.toDateString() === today.toDateString()) {
          hasClockedInToday = true;

          const istOffset = 5.5 * 60 * 60 * 1000;
          const istDate = new Date(startDate.getTime() + istOffset);

          const hours = istDate.getUTCHours();
          const minutes = istDate.getUTCMinutes();
          const startTimeInMinutes = hours * 60 + minutes;
          const thresholdInMinutes = 10 * 60 + 35; // 10:35 AM

          isOnTimeToday = startTimeInMinutes <= thresholdInMinutes;
        }
      }

      let finalStreak = Number(user.UF_STREAK_CACHE || 0);

      if (isSunday) {
        finalStreak = Number(user.UF_STREAK_CACHE || 0);
      } else if (hasClockedInToday) {
        if (isOnTimeToday) {
          finalStreak = Number(user.UF_STREAK_CACHE || 0) + 1;
        } else {
          finalStreak = 0;
        }
      } else {
        finalStreak = Number(user.UF_STREAK_CACHE || 0);
      }

      return {
        id: user.ID,
        name: `${user.NAME} ${user.LAST_NAME}`.trim(),
        lastLogin: timeStartStr,
        streak: finalStreak,
        isOnTime: isOnTimeToday,
        hasClockedIn: hasClockedInToday,
      };
    });

    return processedData
      .sort((a, b) => b.streak - a.streak)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
  },

  getActiveSprintTasks: async () => {
    try {
      const tasks = await getAgentTasks();
      const kanbanBoard = { todo: [], inProgress: [], review: [] };

      tasks.forEach((task) => {
        const mappedTask = {
          id: task.id,
          title: task.title,
          assignee: task.assignee,
          priority: task.priority,
        };

        if (["2"].includes(String(task.status)))
          kanbanBoard.todo.push(mappedTask);
        else if (String(task.status) === "3")
          kanbanBoard.inProgress.push(mappedTask);
        else if (["4", "5"].includes(String(task.status)))
          kanbanBoard.review.push(mappedTask);
      });

      return kanbanBoard;
    } catch (error) {
      console.error("Failed to fetch active sprint tasks:", error);
      return { todo: [], inProgress: [], review: [] };
    }
  },

  getBitrixCriticalAlerts: async () => {
    try {
      const today = new Date();
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 10);

      const formatBitrixDate = (date) => date.toISOString().slice(0, 19);

      const tasks = await fetchFast("tasks.task.list", {
        filter: {
          STATUS: [2, 3], 
          ">=CHANGED_DATE": formatBitrixDate(pastDate),
        },
        order: { CHANGED_DATE: "DESC" },
        select: [
          "ID",
          "TITLE",
          "STATUS",
          "PRIORITY",
          "CHANGED_DATE",
          "STATUS_CHANGED_DATE",
        ],
      });

      if (!tasks || !Array.isArray(tasks)) return [];

      const criticalTasks = tasks.filter((t) =>
        ["0", "1", "2"].includes(String(t.PRIORITY || t.priority))
      );

      return criticalTasks.slice(0, 10).map((t) => {
        const dateToUse =
          t.STATUS_CHANGED_DATE ||
          t.statusChangedDate ||
          t.CHANGED_DATE ||
          t.changedDate;

        return {
          id: t.ID || t.id,
          type: "CRITICAL",
          msg: t.TITLE || t.title || `Critical Task ID ${t.ID || t.id}`,
          time: calculateTimeAgo(dateToUse),
        };
      });
    } catch (error) {
      console.error("Failed to fetch critical alerts", error);
      return [];
    }
  },

  getBitrixSprintTasks: async () => {
    try {
      const response = await getAgentTasks();

      const tasks = response || [];
      const kanbanBoard = { todo: [], inProgress: [], review: [] };

      tasks.forEach((task) => {
        const mapped = mapTask(task);

        if (["1", "2"].includes(String(task.STATUS || task.status)))
          kanbanBoard.todo.push(mapped);
        else if (String(task.STATUS || task.status) === "3")
          kanbanBoard.inProgress.push(mapped);
        else if (["4", "5"].includes(String(task.STATUS || task.status)))
          kanbanBoard.review.push(mapped);
      });

      return kanbanBoard;
    } catch (error) {
      console.error("Failed to fetch sprint tasks", error);
      return { todo: [], inProgress: [], review: [] };
    }
  },

  getBitrixBlockedTasks: async () => {
    try {
      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeekStr = lastWeekDate.toISOString();

      const EXCLUDED_USERS = [1, 11, 55, 201, 291, 603, 217, 669];

      const tasks = await fetchFast("tasks.task.list", {
        order: { CLOSED_DATE: "ASC" },
        select: [
          "ID",
          "TITLE",
          "DEADLINE",
          "CLOSED_DATE",
          "RESPONSIBLE_ID",
          "RESPONSIBLE_NAME",
          "RESPONSIBLE_LAST_NAME",
        ],
        filter: {
          STATUS: "5",
          "!DEADLINE": "",
          ">CLOSED_DATE": lastWeekStr,
          "!RESPONSIBLE_ID": EXCLUDED_USERS,
        },
      });

      const blockedTasks = tasks.filter((task) => {
        const closed = task.closedDate || task.CLOSED_DATE;
        const deadline = task.deadline || task.DEADLINE;

        if (!closed || !deadline) return false;

        const closedMs = new Date(closed).getTime();
        const deadlineMs = new Date(deadline).getTime();

        const fifteenMinutesInMs = 15 * 60 * 1000;
        return closedMs - deadlineMs > fifteenMinutesInMs;
      });

      return blockedTasks.map((task) => {
        const responsibleName =
          task.responsible?.name || task.RESPONSIBLE_NAME || "Unknown";
        const responsibleLast =
          task.responsible?.lastName || task.RESPONSIBLE_LAST_NAME || "";

        const closedDate = new Date(task.closedDate || task.CLOSED_DATE);
        const deadline = new Date(task.deadline || task.DEADLINE);

        const diffMs = closedDate - deadline; // Guaranteed to be > 15 mins based on filter above
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let timeDisplay;
        if (diffDays > 0) {
          timeDisplay = `${diffDays}d Late`;
        } else if (diffHours > 0) {
          timeDisplay = `${diffHours}h Late`;
        } else {
          timeDisplay = `${diffMins}m Late`;
        }

        return {
          id: task.id || task.ID,
          name: `${responsibleName} ${responsibleLast}`.trim().split(" ")[0],
          reason: task.title || task.TITLE,
          time: timeDisplay,
        };
      });
    } catch (error) {
      console.error("Failed to fetch blocked tasks", error);
      return [];
    }
  },

  getBitrixSLAStatus: async () => {
    try {
      const EXCLUDED_USERS = [1, 11, 55, 201, 291, 603, 217, 669];

      const now = new Date();
      const nowStr = now.toISOString(); // "Now"

      const lastWeekDate = new Date();
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      const lastWeekStr = lastWeekDate.toISOString(); // "7 Days Ago"

      const params = {
        order: { DEADLINE: "DESC" },
        select: [
          "ID",
          "TITLE",
          "DEADLINE",
          "STATUS",
          "RESPONSIBLE_ID",
          "RESPONSIBLE_NAME",
          "RESPONSIBLE_LAST_NAME",
        ],
        filter: {
          "!STATUS": 5,
          "!DEADLINE": "",

          ">DEADLINE": lastWeekStr,
          "<DEADLINE": nowStr,

          "!RESPONSIBLE_ID": EXCLUDED_USERS,
        },
      };

      const tasks = await fetchFast("tasks.task.list", params);
      const slaData = tasks.map((task) => {
        const deadline = new Date(task.deadline || task.DEADLINE);

        const timeDiff = Math.abs(now - deadline);

        const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const totalHours = Math.floor(timeDiff / (1000 * 60 * 60));
        const totalMins = Math.floor(timeDiff / (1000 * 60));

        let durationStr = "";

        if (totalDays > 0) {
          durationStr = `${totalDays}d`;
        } else if (totalHours > 0) {
          durationStr = `${totalHours}h`;
        } else {
          durationStr = `${totalMins}m`;
        }

        const firstName = (
          task.responsibleName ||
          task.responsible?.name ||
          task.RESPONSIBLE_NAME ||
          "Unknown"
        )
          .trim()
          .split(" ")[0];

        return {
          task: task.title || task.TITLE,
          owner: firstName,
          status: `${durationStr} Overdue`,
          color: "text-red-600",
          isRisk: true,
        };
      });

      return slaData.slice(0, 10);
    } catch (error) {
      console.error("Failed to fetch SLA status", error);
      return [];
    }
  },

  getBitrixUpcomingEvents: async () => {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setFullYear(today.getFullYear() + 1);
      const lookaheadDays = 365;

      const formatDate = (d) => d.toISOString().split("T")[0];
      const bufferStartDate = new Date(today);
      bufferStartDate.setDate(today.getDate() - 1);

      const [userEvents, companyEvents, bdayRes] = await Promise.all([
        fetchFast("calendar.event.get", {
          type: "user",
          ownerId: 201,
          from: formatDate(bufferStartDate),
          to: formatDate(futureDate),
        }),
        fetchFast("calendar.event.get", {
          type: "company_calendar",
          from: formatDate(bufferStartDate),
          to: formatDate(futureDate),
        }),
        getBitrixUpcomingBirthdays(lookaheadDays),
      ]);

      const allEvents = [
        ...(userEvents || []),
        ...(companyEvents || []),
        ...(bdayRes || []),
      ];

      return (
        allEvents
          .map((e) => {
            const parsedDate =
              e.parsedDate || parseBitrixDate(e.DATE_FROM || e.date_from);
            return {
              id: e.id || e.ID,
              event: e.event || e.NAME || e.name,
              parsedDate,
              icon: e.icon,
            };
          })
          .filter((e) => e.parsedDate && e.parsedDate >= new Date())
          .sort((a, b) => a.parsedDate - b.parsedDate)
          .slice(0, 5)
          .map((e) => {
            const isBirthday = e.icon === "🎂";
            const timeOptions = isBirthday
              ? { month: "short", day: "numeric" }
              : {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                };

            let icon = e.icon;
            if (!isBirthday) {
              const title = e.event?.toLowerCase() || "";
              if (title.includes("lunch") || title.includes("pizza"))
                icon = "🍕";
              else if (title.includes("meet") || title.includes("call"))
                icon = "📞";
              else if (title.includes("game") || title.includes("fun"))
                icon = "🎮";
              else if (title.includes("release") || title.includes("deploy"))
                icon = "🚀";
              else icon = "📅";
            }

            return {
              id: e.id,
              event: e.event,
              time: e.parsedDate.toLocaleDateString("en-US", timeOptions),
              icon,
            };
          })
      );
    } catch (error) {
      console.error("Failed to fetch upcoming events", error);
      return [];
    }
  },

  getSprintProgress: async () => {
    try {
      // 1. Fetch data specifically using your filtered Agent logic
      const tasks = await getAgentTasks();

      // Safety check: if tasks is undefined or empty
      if (!tasks || tasks.length === 0) return 0;

      const total = tasks.length;

      // 2. Calculate Completed (Status "5" is completed in Bitrix)
      const completed = tasks.filter(
        (t) => String(t.STATUS || t.status) === "5"
      ).length;

      // 3. Return percentage
      return Math.round((completed / total) * 100);
    } catch (error) {
      console.error("Failed to fetch sprint progress", error);
      return 0;
    }
  },

  getAttendanceRanking: async () => {
    try {
      const CUTOFF_DATE = new Date("2025-12-01");

      const users = await apiService.getAllUsers();

      if (!users || users.length === 0) return [];

      const filteredUsers = filterExcludedUsers(users);

      return apiService.calculatePunctuality(filteredUsers, CUTOFF_DATE);
    } catch (error) {
      console.warn("API Error in getAttendanceRanking:", error);
      return [];
    }
  },
  calculatePunctuality: (users, cutoffDate) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const processedUsers = users.map((user) => {
      const lastLoginDate = user.LAST_LOGIN ? new Date(user.LAST_LOGIN) : null;

      // 1. FILTER: Exclude users who haven't logged in since the cutoff
      // If cutoff is Dec 1, and last login was Nov 30, this returns null (removes user).
      if (cutoffDate && lastLoginDate && lastLoginDate < cutoffDate) {
        return null;
      }

      // Handle case where user exists but has NO login data at all
      if (cutoffDate && !lastLoginDate) {
        return null;
      }

      // 2. STREAK CALCULATION: Clamp the start date
      const registerDate = user.DATE_REGISTER
        ? new Date(user.DATE_REGISTER)
        : new Date();

      // If user registered BEFORE the cutoff, we treat their start date AS the cutoff.
      // If they registered AFTER the cutoff, we use their actual registration date.
      const effectiveStartDate =
        cutoffDate && registerDate < cutoffDate ? cutoffDate : registerDate;

      // Calculate days from the effective start date to now
      const diffTime = Math.abs(now - effectiveStartDate);
      const daysSinceStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: user.ID,
        name: `${user.NAME} ${user.LAST_NAME}`.trim(),
        isPresentToday:
          lastLoginDate && lastLoginDate.toISOString().startsWith(todayStr),
        lastLogin: lastLoginDate,
        streak: daysSinceStart.toString(), // Returns days from Dec 1 (or later)
      };
    });

    const activeUsers = processedUsers
      .filter((u) => u !== null && u.lastLogin !== null)
      .sort((a, b) => parseInt(b.streak) - parseInt(a.streak));

    return activeUsers.map((user, index) => ({ ...user, rank: index + 1 }));
  },

  getLatestSpaEndDate: async (entityTypeId) => {
    try {
      const items = await fetchFast("crm.item.list", { entityTypeId });

      if (!items || !items.length) {
        throw new Error("No SPA items found.");
      }

      const latestItem = items
        .sort((a, b) => {
          const timeA = new Date(b.createdTime || b.CREATED_TIME);
          const timeB = new Date(a.createdTime || a.CREATED_TIME);
          return timeA - timeB;
        })
        .find(
          (item) => item.ufCrm215_1764937752994 || item.UF_CRM_215_1764937752994
        );

      if (!latestItem) {
        throw new Error("No SPA item with a valid end date found.");
      }

      // Return the specific field
      return (
        latestItem.ufCrm215_1764937752994 || latestItem.UF_CRM_215_1764937752994
      );
    } catch (error) {
      console.error("Failed to fetch latest SPA end date:", error.message);
      throw error;
    }
  },
  getSpaItems: async (entityTypeId) => {
    try {
      // fetchFast handles the params serialization for entityTypeId automatically
      const items = await fetchFast("crm.item.list", { entityTypeId });
      return items || [];
    } catch (error) {
      console.error("Failed to fetch SPA items:", error.message);
      throw error;
    }
  },
};

export const filterCompletedTasks = (allTasks) => {
  // 1. Safety check
  if (!Array.isArray(allTasks)) return [];

  return (
    allTasks
      // 2. Filter: Check for 'status' (lowercase) equal to 5
      .filter((task) => {
        // Handle both number 5 and string "5"
        return task.status == 5;
      })
      // 3. Map: Ensure the keys match what your component expects
      .map((task) => ({
        id: task.id, // Already lowercase in your response
        title: task.title, // Already lowercase
        description: task.description, // Already lowercase
        deadline: task.deadline, // Already lowercase
        status: task.status,
        closedDate: task.closedDate,

        groupId: task.groupId || task.group_id,
      }))
  );
};

const toDateOnly = (d) => (d ? parseISO(d) : null);

export const getPerformanceData = async () => {
  // 1. Fetch Users
  const users = await apiService.getAllUsers();
  if (!users || !users.length) return [];

  const userIds = users.map((u) => u.ID);

  // 2. Fetch Tasks
  const tasks = await fetchFast("tasks.task.list", {
    filter: { RESPONSIBLE_ID: userIds },
    select: [
      "ID",
      "RESPONSIBLE_ID",
      "STATUS",
      "CREATED_DATE",
      "DATE_START",
      "DEADLINE",
      "CLOSED_DATE",
    ],
  });

  const perfMap = {};
  users.forEach((u) => {
    perfMap[u.ID] = {
      photoUrl: u.PERSONAL_PHOTO,
      id: u.ID,
      name: `${u.NAME} ${u.LAST_NAME}`.trim(),
      role: u.UF_USR_1693993295483 || u.USER_TYPE,
      scoredTasks: 0,
      totalTodayTasks: 0,
    };
  });

  tasks.forEach((task) => {
    const uid = task.responsibleId || task.RESPONSIBLE_ID;
    if (!perfMap[uid]) return;

    const created = toDateOnly(task.createdDate || task.CREATED_DATE);
    const start = toDateOnly(task.dateStart || task.DATE_START);
    const deadline = toDateOnly(task.deadline || task.DEADLINE);
    const closed = toDateOnly(task.closedDate || task.CLOSED_DATE);
    const status = Number(task.status || task.STATUS);

    const isNewToday = isToday(created) || (start && isToday(start));

    if (isNewToday) {
      perfMap[uid].totalTodayTasks++;

      // CRITERIA 2: Is it closed today?
      const closedToday = status === 5 && closed && isToday(closed);

      // CRITERIA 3: Is it closed before or on the deadline?
      const onTime =
        !deadline ||
        (closed && (isBefore(closed, deadline) || isSameDay(closed, deadline)));

      if (closedToday && onTime) {
        perfMap[uid].scoredTasks++;
      }
    }
  });

  return Object.values(perfMap).map((u) => {
    // Calculate percentage (e.g., if 2 tasks were created today and 1 was finished on time, score is 5.0)
    const score =
      u.totalTodayTasks > 0 ? (u.scoredTasks / u.totalTodayTasks) * 10 : 0;

    return {
      photoUrl: u.photoUrl,
      id: u.id,
      name: u.name,
      role: u.role,
      score: Number(score.toFixed(1)),
      trend: score >= 8 ? "up" : score >= 1 ? "flat" : "down",
    };
  });
};

export const getWeeklyMVP = async () => {
  const today = new Date();
  // Monday start
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  // Saturday end
  const weekEnd = addDays(weekStart, 5);

  const users = await apiService.getAllUsers();
  const tasks = await fetchFast("tasks.task.list", {
    filter: {
      ">=CREATED_DATE": weekStart.toISOString(),
      RESPONSIBLE_ID: users.map((u) => u.ID),
    },
    select: [
      "ID",
      "TITLE",
      "RESPONSIBLE_ID",
      "STATUS",
      "CREATED_DATE",
      "DATE_START",
      "DEADLINE",
      "CLOSED_DATE",
    ],
  });

  // console.log("tasks",tasks)

  const stats = users.map((u) => {
    let points = 0;
    let totalCompleted = 0;
    let totalAssigned = 0;

    const userTasks = tasks.filter(
      (t) => (t.responsibleId || t.RESPONSIBLE_ID) === u.ID
    );

    userTasks.forEach((task) => {
      const created = toDateOnly(task.createdDate || task.CREATED_DATE);
      const start = toDateOnly(task.dateStart || task.DATE_START);
      const closed = toDateOnly(task.closedDate || task.CLOSED_DATE);
      const deadline = toDateOnly(task.deadline || task.DEADLINE);

      const isNewThisWeek =
        (created &&
          isWithinInterval(created, { start: weekStart, end: weekEnd })) ||
        (start && isWithinInterval(start, { start: weekStart, end: weekEnd }));

      if (isNewThisWeek) {
        totalAssigned++;
        const isClosedThisWeek =
          task.STATUS === "5" &&
          closed &&
          isWithinInterval(closed, { start: weekStart, end: weekEnd });
        const onTime =
          !deadline ||
          (closed &&
            (isBefore(closed, deadline) || isSameDay(closed, deadline)));

        if (isClosedThisWeek || onTime) {
          points++;
          totalCompleted++;
        }
      }
    });
    // console.log("user points",u.ID,points)

    const score = points > 0 ? (points / totalAssigned) * 10 : points;

    return {
      name: `${u.NAME} ${u.LAST_NAME}`,
      score: Number(score.toFixed(1)),
      completed: totalCompleted,
      role: u.UF_USR_1693993295483 || u.USER_TYPE,
    };
  });

  // TIE-BREAKER LOGIC: Sort by Score DESC, then by Completed Tasks DESC
  const sorted = stats.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.completed - a.completed;
  });

  return sorted[0]; // Return the top person
};
