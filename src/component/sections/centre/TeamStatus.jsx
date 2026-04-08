import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Maximize2, RefreshCw, AlertCircle } from 'lucide-react';
import { apiService } from '../../../services/apiService';
import OnlineStatusModal from '../../../Modals/OnlineStatusModal';

const TeamStatusWidget = () => {
  const [teamData, setTeamData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const loadTeamData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAllUsersWithStatus();
      setTeamData(data);
    } catch (err) {
      console.error("Widget Load Error:", err);
      setError('Could not sync status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeamData();
    const interval = setInterval(loadTeamData, 300000); // 5 min refresh
    return () => clearInterval(interval);
  }, [loadTeamData]);

  const filteredTeamStatus = useMemo(() => {
    if (statusFilter === 'all') return teamData;
    return teamData.filter((member) => 
      member.status.toLowerCase() === statusFilter.toLowerCase()
    );
  }, [teamData, statusFilter]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online': return 'bg-emerald-500';
      case 'away':   return 'bg-red-500';
      case 'absent': return 'bg-slate-300'; // Dimmed for absent
      default:       return 'bg-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex-1 overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
          <Users className="w-4 h-4" /> 
          Team Presence
          {loading && <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />}
        </h3>

        <div className="flex items-center gap-2">
          <select
            className="h-6 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500 rounded-lg pl-2 pr-1 focus:outline-none focus:border-blue-300 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="away">Away</option>
            <option value="absent">Absent</option>
          </select>
          
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="h-6 w-6 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <AlertCircle className="w-6 h-6" />
            <span className="text-xs text-center">{error}</span>
            <button onClick={loadTeamData} className="text-[10px] text-blue-500 underline">Retry</button>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-4 gap-3">
            {filteredTeamStatus.length > 0 ? (
              filteredTeamStatus.map((member) => (
                <div 
                  key={member.id} 
                  className={`flex flex-col items-center group cursor-pointer transition-opacity ${member.status === 'absent' ? 'opacity-50' : 'opacity-100'}`} 
                  title={`${member.name} - ${member.status}`}
                >
                  <div className="relative">
                    {member.photoUrl ? (
                      <img 
                        src={member.photoUrl} 
                        alt={member.name} 
                        className="w-10 h-10 rounded-2xl object-cover border border-slate-100"
                        onError={(e) => { e.target.style.display='none'; }} 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                        {member.initials}
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(member.status)} shadow-sm`}></div>
                  </div>
                  
                  <span className="text-[11px] font-bold text-slate-600 mt-1.5 truncate max-w-full w-full text-center">
                    {member.name.split(' ')[0]}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center text-[10px] text-slate-400 py-4">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>

      <OnlineStatusModal 
        isOpen={isStatusModalOpen} 
        onClose={() => setIsStatusModalOpen(false)} 
        users={teamData} 
      />
    </div>
  );
};

export default TeamStatusWidget;