import React from 'react';
import { CalendarHeart } from 'lucide-react';

const TeamVibes = ({ events = [] }) => {
    
    const displayEvents = events;

    return (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 shadow-sm shrink-0 flex flex-col">
            <h3 className="text-xs font-bold text-indigo-900 uppercase mb-3 flex items-center gap-2 shrink-0">
                <CalendarHeart className="w-4 h-4" /> Team Vibes
            </h3>
            
            {displayEvents.length === 0 ? (
                // --- Empty State Rendering ---
                <div className="flex flex-col items-center justify-center h-24 text-indigo-300">
                    <p className="text-xs font-medium">No upcoming vibes</p>
                </div>
            ) : (
                // --- Event List Rendering ---
                <div className="space-y-2.5 overflow-y-auto custom-scrollbar pr-1 max-h-[140px]">
                    {displayEvents.map((evt) => {
                        // The isFallback check is no longer needed since dummy data is gone
                        const isBirthday = evt.icon === '🎂';

                        return (
                            <div
                                key={evt.id}
                                className={`flex items-center gap-3 p-2.5 rounded-xl border shadow-sm transition-all hover:scale-[1.02] ${
                                    isBirthday
                                        ? 'bg-gradient-to-r from-pink-50 via-rose-50 to-orange-50 border-pink-200 shadow-pink-100'
                                        : 'bg-white border-indigo-100/50'
                                }`}
                            >
                                <span className="text-lg">{evt.icon}</span>
                                <div className="flex-1">
                                    <p
                                        className={`text-sm font-bold ${
                                            isBirthday ? 'text-rose-700' : 'text-indigo-900'
                                        }`}
                                    >
                                        {evt.event}
                                    </p>
                                    <p
                                        className={`text-[11px] font-bold uppercase ${
                                            isBirthday ? 'text-rose-400' : 'text-indigo-400'
                                        }`}
                                    >
                                        {evt.time}
                                    </p>
                                </div>
                                {isBirthday && <div className="text-xs">🎉</div>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TeamVibes;