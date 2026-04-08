import React from 'react';
import { Flame, Maximize2, Users, Clock } from 'lucide-react';
import ActiveSprint from './ActiveSprint';
import WorkMode from '../sections/centre/WorkMode';
import TeamStatusWidget from '../sections/centre/TeamStatus';
import PunctualityWidget from '../sections/centre/PunctualityWidget';
import QATicketsTable from '../sections/centre/QATicketsTable';
import WeeklyMVPBanner from './WeeklyMVPBanner';


const DashboardCentre = ({
  workMode,
  setIsActiveSprintModalOpen,
  kanbanTasks,
}) => {
  return (
    <div className="col-span-6 flex flex-col gap-5 h-full min-h-min">
      {/* Work Mode Component */}
      <WorkMode 
        workMode={workMode}
      />
      {/* 1. Active Sprint */}
      <ActiveSprint 
        kanbanTasks={kanbanTasks} 
        setIsActiveSprintModalOpen={setIsActiveSprintModalOpen} 
      />

      {/* 2. Presence & Punctuality */}
      <div className="flex gap-5 flex-1 min-h-[180px]">
        <TeamStatusWidget />
        <PunctualityWidget />
      </div>

      {/* 3. QA Tickets Section */}
      {/* <div className="flex-1">
        <QATicketsTable data={qaTicketsData} />
      </div> */}

    </div>
  );
};

export default DashboardCentre;
