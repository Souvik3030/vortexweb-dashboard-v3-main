import React, { useState,useEffect } from 'react';
import { X, Search, Users,Filter,ArrowUpDown   } from 'lucide-react';

const OnlineStatusModal = ({ isOpen, onClose, users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setStatusFilter('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter Logic
  const filteredUsers = (users || []).filter(user => {
    const term = searchTerm.toLowerCase().trim();
    // Normalize status for comparison
    const userStatus = (user.status || '').toLowerCase();
    const filterStatus = statusFilter.toLowerCase();
    
    const statusMatch = statusFilter === 'all' ? true : userStatus === filterStatus;
    
    if (!term) return statusMatch;

    const nameMatch = (user.name || '').toLowerCase().includes(term);
    const searchStatusMatch = userStatus.includes(term); 

    return (nameMatch || searchStatusMatch) && statusMatch;
  });

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
        case 'online': return 'bg-emerald-500';
        case 'away': return 'bg-red-500';
        case 'absent': return 'bg-slate-300';
        default: return 'bg-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-slate-800">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Team Status</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                        {filteredUsers.length} Members {searchTerm && '(Filtered)'}
                    </p>
                </div>
            </div>
            
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search team members..." 
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <div className="relative shrink-0">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select 
                    className="pl-8 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer h-full"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="away">Away</option>
                    <option value="absent">absent</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ArrowUpDown className="w-3 h-3 opacity-50" />
                </div>
            </div>
        </div>

        {/* Modal User Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 custom-scrollbar">
            {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredUsers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                            <div className="relative shrink-0">
                                {member.photoUrl ? (
                                    <img src={member.photoUrl} alt={member.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-100 flex items-center justify-center text-sm font-black text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {member.initials}
                                    </div>
                                )}
                                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                            </div>
                            <div className="min-w-0">
                                <span className="text-xs font-bold text-slate-700 block truncate">{member.name}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                        {member.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                    <Search className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm font-bold">No members found</p>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>VortexWeb Systems</span>
            <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Online</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Away</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Busy</span>
            </div>
        </div>
      </div>
    </div>
  );
};
export default OnlineStatusModal;