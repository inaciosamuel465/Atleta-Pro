import React from 'react';
import { AppScreen } from '../types';

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-22 bg-surface-dark/95 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-6 z-50 pb-safe max-w-md mx-auto">
      <button 
        onClick={() => onNavigate(AppScreen.DASHBOARD)}
        className={`flex flex-col items-center gap-1.5 p-2 w-16 transition-all ${currentScreen === AppScreen.DASHBOARD ? 'text-primary scale-110' : 'text-slate-500 hover:text-white'}`}
      >
        <span className={`material-symbols-outlined text-[28px] ${currentScreen === AppScreen.DASHBOARD ? 'fill-current font-bold' : ''}`}>grid_view</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Dash</span>
      </button>
      
      <button 
        onClick={() => onNavigate(AppScreen.HISTORY)}
        className={`flex flex-col items-center gap-1.5 p-2 w-16 transition-all ${currentScreen === AppScreen.HISTORY ? 'text-primary scale-110' : 'text-slate-500 hover:text-white'}`}
      >
        <span className={`material-symbols-outlined text-[28px] ${currentScreen === AppScreen.HISTORY ? 'fill-current font-bold' : ''}`}>history</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Ativs</span>
      </button>

      <div className="relative -top-8">
        <button 
          onClick={() => onNavigate(AppScreen.START_ACTIVITY)}
          className="flex items-center justify-center size-18 rounded-[2rem] bg-primary text-white shadow-[0_15px_30px_rgba(37,140,244,0.6)] ring-4 ring-background-dark hover:scale-105 active:scale-90 transition-all border-t border-white/30"
        >
          <span className="material-symbols-outlined text-[36px] font-black">add</span>
        </button>
      </div>

      {/* Novo botão para Programas de Treino */}
      <button 
        onClick={() => onNavigate(AppScreen.TRAINING_PROGRAMS)}
        className={`flex flex-col items-center gap-1.5 p-2 w-16 transition-all ${currentScreen === AppScreen.TRAINING_PROGRAMS ? 'text-primary scale-110' : 'text-slate-500 hover:text-white'}`}
      >
        <span className={`material-symbols-outlined text-[28px] ${currentScreen === AppScreen.TRAINING_PROGRAMS ? 'fill-current font-bold' : ''}`}>fitness_center</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Progrm</span>
      </button>

      <button 
        onClick={() => onNavigate(AppScreen.PROFILE)}
        className={`flex flex-col items-center gap-1.5 p-2 w-16 transition-all ${currentScreen === AppScreen.PROFILE ? 'text-primary scale-110' : 'text-slate-500 hover:text-white'}`}
      >
        <span className={`material-symbols-outlined text-[28px] ${currentScreen === AppScreen.PROFILE ? 'fill-current font-bold' : ''}`}>account_circle</span>
        <span className="text-[8px] font-black uppercase tracking-widest">Perfil</span>
      </button>
    </nav>
  );
};

export default BottomNav;