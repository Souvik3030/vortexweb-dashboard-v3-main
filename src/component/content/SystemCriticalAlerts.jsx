import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ChevronRight, Pause, Play, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SystemCriticalAlerts = ({ criticalAlerts }) => {
    if (!criticalAlerts || criticalAlerts.length === 0) return null;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const topAlerts = criticalAlerts.slice(0, 10);
    const totalAlerts = topAlerts.length;
    const currentAlert = topAlerts[currentIndex];

    useEffect(() => {
        if (totalAlerts > 1 && !isPaused) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % totalAlerts);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [totalAlerts, isPaused]);

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % totalAlerts);
    };

    return (
        <div className="col-span-12 w-full my-2 font-sans">
            <div 
                // FIXED HEIGHT: h-24 ensures the component never grows/shrinks
                className="relative group h-24 overflow-hidden rounded-xl shadow-2xl cursor-default select-none transition-all duration-300 hover:shadow-rose-900/40 border border-rose-900/30"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* 1. Classy "Deep Wine" Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-700 to-red-600"></div>
                
                {/* 2. Sophisticated Glow (Subtle) */}
                <div className="absolute -left-10 top-0 w-1/3 h-full bg-rose-500/10 blur-3xl pointer-events-none"></div>

                {/* 3. Mesh Texture for Premium feel */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
                </div>

                {/* Content Layout */}
                <div className="relative flex items-center justify-between px-4 h-full">
                    
                    {/* Left: Icon Indicator */}
                    <div className="shrink-0 mr-5 flex flex-col items-center justify-center border-r border-rose-400/20 pr-1 h-12">
                         <div className="relative">
                            <Activity className="w-6 h-6 text-rose-400 absolute animate-ping opacity-50" />
                            <AlertTriangle className="w-6 h-6 text-white relative z-10 drop-shadow-md" />
                         </div>
                    </div>

                    {/* Center: THE TASK NAME (Fixed & Truncated) */}
                    <div className="flex-1 gap-1 min-w-0 flex flex-col justify-center overflow-hidden">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentAlert.id || currentIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="flex flex-col gap-1"
                            >
                                <h3 className="text-[20px] font-black text-white/95 leading-none tracking-tight drop-shadow-sm truncate pr-4">
                                    {currentAlert.msg}
                                </h3>
                                
                                {/* Metadata Row */}
                                <div className="flex items-center gap-3 opacity-80">
                                    <div className="flex items-center gap-1.5 text-xs font-medium font-mono text-white">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{currentAlert.time}</span>
                                    </div>
                                    <span className="text-xs text-white">•</span>
                                    <span className="text-xs text-white text-bold font-medium uppercase tracking-wide">
                                        Critical Alert
                                    </span>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right: Controls (Minimalist) */}
                    <div className="shrink-0 flex items-center gap-1 pl-1">
                         <button 
                            onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }}
                            className="p-2 rounded-full text-rose-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                        </button>
                        <button 
                            onClick={handleNext}
                            className="p-2 rounded-full text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Refined Progress Bar (Gold/Rose tint) */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-rose-950">
                    {!isPaused && totalAlerts > 1 && (
                        <motion.div
                            key={currentIndex}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5, ease: "linear" }}
                            className="h-full bg-gradient-to-r from-rose-400 to-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemCriticalAlerts;