import React from 'react';
import { useToast } from '../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getStyles = (type: string) => {
    switch(type) {
      case 'success': return 'bg-green-500 text-white border-green-600';
      case 'error': return 'bg-red-500 text-white border-red-600';
      case 'xp': return 'bg-yellow-400 text-slate-900 border-yellow-500 font-black';
      case 'achievement': return 'bg-purple-600 text-white border-purple-400 font-bold shadow-purple-500/50';
      default: return 'bg-slate-800 text-white border-slate-900';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'xp': return 'bolt';
      case 'achievement': return 'emoji_events';
      default: return 'info';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-b-4 cursor-pointer animate-in slide-in-from-right fade-in duration-300 hover:scale-105 transition-transform ${getStyles(toast.type)}`}
        >
          <span className="material-symbols-outlined">{getIcon(toast.type)}</span>
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};