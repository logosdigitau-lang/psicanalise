
import React from 'react';

interface NavbarProps {
  onNavigate: (view: any) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-6 py-4 md:py-8 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="pointer-events-auto flex items-center gap-2 md:gap-3 cursor-pointer group bg-white/90 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-full shadow-lg border border-white/50 transition-all hover:shadow-xl active:scale-95" 
          onClick={() => onNavigate('landing')}
        >
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-serif text-xs md:text-sm">M</div>
          <span className="text-sm md:text-lg font-serif font-bold text-slate-900 whitespace-nowrap">Messias Tavares</span>
        </div>
        
        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-2 rounded-full shadow-sm border border-white/50">
          <button onClick={() => onNavigate('landing')} className={`px-5 py-2 text-xs uppercase tracking-widest font-bold transition-all rounded-full ${currentView === 'landing' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Início</button>
          <button onClick={() => onNavigate('booking')} className={`px-5 py-2 text-xs uppercase tracking-widest font-bold transition-all rounded-full ${currentView === 'booking' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Agendar</button>
          <button onClick={() => onNavigate('patient-portal')} className={`px-5 py-2 text-xs uppercase tracking-widest font-bold transition-all rounded-full ${currentView === 'patient-portal' ? 'bg-[#7E9084] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Portal do Paciente</button>
          <div className="w-[1px] h-4 bg-slate-100 mx-2"></div>
          <button onClick={() => onNavigate('admin')} className={`p-2 transition-colors ${currentView === 'admin' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </button>
        </div>

        <div className="flex gap-2 md:hidden">
          <button 
            onClick={() => onNavigate('patient-portal')}
            className="pointer-events-auto bg-white/90 backdrop-blur-md text-[#7E9084] w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-white/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </button>
          <button 
            onClick={() => onNavigate('admin')}
            className="pointer-events-auto bg-white/90 backdrop-blur-md text-slate-900 w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-white/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </button>
          <button 
            onClick={() => onNavigate('booking')}
            className="pointer-events-auto bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>
    </nav>
  );
};
