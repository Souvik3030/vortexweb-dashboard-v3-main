import React from 'react';
import { Server, ArrowUpDown, Star } from 'lucide-react';
import SLAStatus from './SLAStatus';
import PerformanceWidget from '../sections/right/PerformanceWidget';
import WeeklyMVPBanner from './WeeklyMVPBanner';

const DashboardRight = ({
  sortOrder,
  setSortOrder,
  sortedPerformers,
  slaData,
  serverMetrics,
}) => {
  return (
    <div className="col-span-3 flex flex-col gap-5 h-full min-h-min">
      <PerformanceWidget/>
      <SLAStatus slaData={slaData} />
      <WeeklyMVPBanner/>
    </div>
  );
};

export default DashboardRight;