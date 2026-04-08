import React from 'react';
import { AlertCircle } from 'lucide-react';

const Footer = ({ currentPointer }) => {
  return (
    <footer className="bg-white border-t border-slate-200 h-10 flex items-center justify-center overflow-hidden relative shadow-sm z-30 shrink-0">
      <div
        className={`flex items-center gap-3 transition-all duration-500 ease-in-out ${
          currentPointer.type === 'critical'
            ? 'text-red-600'
            : currentPointer.type === 'warning'
            ? 'text-amber-600'
            : 'text-blue-600'
        }`}
      >
        <AlertCircle className="w-4 h-4 animate-pulse" />
        <span className="text-xs font-black uppercase tracking-widest">
          {currentPointer.text}
        </span>
        <AlertCircle className="w-4 h-4 animate-pulse" />
      </div>
    </footer>
  );
};

export default Footer;