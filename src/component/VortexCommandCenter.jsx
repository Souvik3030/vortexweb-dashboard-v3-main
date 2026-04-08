import React, { useState, useEffect } from 'react';
import { Lock, Coffee, Activity } from 'lucide-react';

// Custom Hooks
import { useSprintData } from '../hooks/useSprintData';

// Components
import OnlineStatusModal from '../Modals/OnlineStatusModal';
import ActiveSprintModal from '../Modals/ActiveSprintModal';
import Header from './layout/Header';
import Footer from './layout/Footer';
import DashboardLeft from './content/DashboardLeft';
import DashboardCentre from './content/DashboardCentre';
import DashboardRight from './content/DashboardRight';

const VortexCommandCenter = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [pointerIndex, setPointerIndex] = useState(0);
  
  // --- STATIC FALLBACK DEFINITION ---
  const FALLBACK_CRITICAL_ALERTS = [
    { id: 1, type: 'API DOWN', msg: 'System Status: Core Metrics Loading...', time: '---' },
  ];

  // -- API DATA (Hook) --
  // Destructure all data, renaming criticalAlerts from the hook to avoid naming conflict
  const { 
    kanbanTasks, 
    blockers, 
    slaData, 
    events, 
    criticalAlerts: apiAlerts // Renamed hook data to apiAlerts
  } = useSprintData(); 

  // --- FINAL CRITICAL ALERTS LOGIC (Fallback) ---
  const criticalAlerts = (apiAlerts && apiAlerts.length > 0)
    ? apiAlerts // Use API data if available
    : FALLBACK_CRITICAL_ALERTS; // Use dummy data if hook is empty or loading

  // -- MODAL STATES --
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false); 
  const [isActiveSprintModalOpen, setIsActiveSprintModalOpen] = useState(false); 
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [statusFilter, setStatusFilter] = useState('all'); 

  const [workMode, setWorkMode] = useState({ 
    mode: 'DEEP WORK', 
    subtext: 'NO INTERRUPTIONS',
    color: 'text-rose-600', 
    bg: 'bg-rose-50', 
    border: 'border-rose-100', 
    icon: Lock 
  });

  const kpiPointers = [
    { text: "IF IT'S NOT ON BITRIX, IT'S NOT DONE.", type: "critical" },
    { text: "LOG YOUR HOURS DAILY OR LOSE THEM.", type: "warning" },
    { text: "NO DEPLOYMENTS ON FRIDAYS.", type: "critical" },
    { text: "CLIENT FIRST. CODE SECOND.", type: "info" },
    { text: "RESPECT THE SPRINT GOAL.", type: "warning" },
    { text: "CLEAR COMMS: ACKNOWLEDGE EVERY MESSAGE.", type: "info" }
  ];

  // -- STATIC DATA (Restored per request) --
  const teamStatus = [
    { id: 1, name: 'Ishika', status: 'online' }, { id: 2, name: 'Aaryan', status: 'online' },
    { id: 3, name: 'Mansi', status: 'online' }, { id: 4, name: 'Ashwini', status: 'away' }, 
    { id: 5, name: 'Chetan', status: 'online' }, { id: 6, name: 'Navya', status: 'online' },
    { id: 7, name: 'Ajzal', status: 'online' }, { id: 8, name: 'Abhijeet', status: 'busy' },
    { id: 9, name: 'Suraj', status: 'online' }, { id: 10, name: 'Ravinder', status: 'online' },
    { id: 11, name: 'New Dev', status: 'online' }, { id: 12, name: 'Intern', status: 'online' },
    { id: 13, name: 'Dev 13', status: 'online' }, { id: 14, name: 'Dev 14', status: 'away' },
    { id: 15, name: 'Dev 15', status: 'busy' }, { id: 16, name: 'Dev 16', status: 'online' },
    { id: 17, name: 'Dev 17', status: 'online' }, { id: 18, name: 'Dev 18', status: 'online' },
    { id: 19, name: 'Dev 19', status: 'away' }, { id: 20, name: 'Dev 20', status: 'online' },
  ];

  const commitLogData = [
    { id: 1, type: "fix", msg: "imza sync timeout extended", author: "Ajzal", time: "2m ago", color: "bg-purple-500" },
    { id: 2, type: "style", msg: "updated navbar css", author: "Ravinder", time: "12m ago", color: "bg-indigo-500" },
    { id: 3, type: "feat", msg: "auth middleware logic", author: "Abhijeet", time: "45m ago", color: "bg-purple-500" },
    { id: 4, type: "refactor", msg: "database schema v2", author: "Suraj", time: "1h ago", color: "bg-purple-500" },
  ];

  const attendanceRank = [
    { name: 'Suraj', rank: 1, streak: '14' },
    { name: 'Mansi', rank: 2, streak: '12' },
    { name: 'Ashwini', rank: 3, streak: '10' },
    { name: 'Ravinder', rank: 4, streak: '5' },
    { name: 'Chetan', rank: 5, streak: '0' },
  ];

  const performanceScores = [
    { name: 'Mansi', score: 9.4, role: 'Coord', trend: 'up' },
    { name: 'Suraj', score: 9.1, role: 'Dev', trend: 'up' },
    { name: 'Ashwini', score: 8.8, role: 'Dev', trend: 'stable' },
    { name: 'Navya', score: 8.5, role: 'HR', trend: 'stable' },
    { name: 'Aaryan', score: 8.2, role: 'Ops', trend: 'down' },
    { name: 'Ajzal', score: 7.9, role: 'Dev', trend: 'stable' },
    { name: 'Chetan', score: 6.5, role: 'Sales', trend: 'down' },
  ];

  const qaTicketsData = [
  { clientName: 'Client A', high: 4, medium: 2, low: 1 },
  { clientName: 'Client B', high: 1, medium: 5, low: 3 },
  { clientName: 'Client C', high: 0, medium: 2, low: 6 },
];


  const serverMetrics = { cpu: 62, mem: 74 };
  const stabilityStreak = 12;

  const sortedPerformers = [...performanceScores].sort((a, b) => {
    return sortOrder === 'asc' ? a.score - b.score : b.score - a.score;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      determineWorkMode(now);
      calculateDoomsday(now);
    }, 1000);
    
    const pointerTimer = setInterval(() => {
        setPointerIndex((prev) => (prev + 1) % kpiPointers.length);
    }, 6000);

    return () => { 
        clearInterval(timer); 
        clearInterval(pointerTimer); 
    };
  }, []);

  const calculateDoomsday = (now) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + (5 - targetDate.getDay() + 7) % 7);
    targetDate.setHours(18, 0, 0, 0);
    const difference = targetDate - now;
    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    }
  };

  const determineWorkMode = (date) => {
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const time = hour + minutes / 60;

    if (time >= 9.5 && time < 12.5) {
      setWorkMode({ mode: 'DEEP WORK', subtext: 'NO INTERRUPTIONS', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: Lock });
    } else if (time >= 12.5 && time < 13.5) {
      setWorkMode({ mode: 'LUNCH BREAK', subtext: 'RECHARGE', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Coffee });
    } else if (time >= 13.5 && time < 16.5) {
      setWorkMode({ mode: 'DEEP WORK', subtext: 'FOCUS BLOCK', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: Lock });
    } else {
      setWorkMode({ mode: 'WRAP UP', subtext: 'PLAN FOR TOMORROW', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: Activity });
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const filteredTeamStatus = teamStatus.filter(member => 
    statusFilter === 'all' ? true : member.status === statusFilter
  );

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-x-auto overflow-y-hidden relative">
      <OnlineStatusModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} users={teamStatus} />
      <ActiveSprintModal isOpen={isActiveSprintModalOpen} onClose={() => setIsActiveSprintModalOpen(false)} tasks={kanbanTasks} />
      
      <div className="min-w-[1300px] h-full flex flex-col">
        <Header timeLeft={timeLeft} stabilityStreak={stabilityStreak} formattedTime={formatTime(currentTime)} />
        <main className="flex-1 overflow-y-auto p-5 grid grid-cols-12 gap-5 bg-slate-50/50">
            <DashboardLeft 
              criticalAlerts={criticalAlerts} // Passes the fallback or dynamic data
              cultureEvents={events} 
              blockers={blockers} 
              commitLogData={commitLogData} 
            />
            <DashboardCentre 
              workMode={workMode}
              setIsActiveSprintModalOpen={setIsActiveSprintModalOpen}
              kanbanTasks={kanbanTasks}
              setIsStatusModalOpen={setIsStatusModalOpen}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              filteredTeamStatus={filteredTeamStatus}
              attendanceRank={attendanceRank}
              qaTicketsData={qaTicketsData}
            />
            <DashboardRight sortOrder={sortOrder} setSortOrder={setSortOrder} sortedPerformers={sortedPerformers} slaData={slaData} serverMetrics={serverMetrics} />
        </main>
        <Footer currentPointer={kpiPointers[pointerIndex]} />
      </div> 
    </div>
  );
};

export default VortexCommandCenter;