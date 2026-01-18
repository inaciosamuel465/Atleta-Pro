import React from 'react';
import { AppScreen } from '../types';

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { screen: AppScreen.DASHBOARD, icon: 'home', label: 'Feed' },
    { screen: AppScreen.HISTORY, icon: 'history', label: 'Atividade' },
    { screen: AppScreen.START_ACTIVITY, icon: 'add', label: 'Iniciar', isFab: true }, // FAB central
    { screen: AppScreen.TRAINING_PROGRAMS, icon: 'fitness_center', label: 'Progrm' },
    { screen: AppScreen.STATS, icon: 'analytics', label: 'Stats' }, // Adicionado: Tela de Estatísticas
    { screen: AppScreen.PROFILE, icon: 'account_circle', label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-24 bg-background-light/95 backdrop-blur-2xl border-t border-surface-medium flex justify-around items-center px-4 z-50 pb-safe max-w-md mx-auto">
      {navItems.map((item) => (
        item.isFab ? (
          <div key={item.screen} className="relative -top-8">
            <button 
              onClick={() => onNavigate(item.screen)}
              className="flex items-center justify-center size-18 rounded-[2rem] bg-primary text-white shadow-[0_15px_30px_rgba(233,84,32,0.6)] ring-4 ring-background-light hover:scale-105 active:scale-90 transition-all border-t border-primary/30"
            >
              <span className="material-symbols-outlined text-[36px] font-black">{item.icon}</span>
            </button>
          </div>
        ) : (
          <button 
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center gap-1.5 p-2 w-16 transition-all ${currentScreen === item.screen ? 'text-primary scale-110' : 'text-text-light hover:text-text-dark'}`}
          >
            <span className={`material-symbols-outlined text-[28px] ${currentScreen === item.screen ? 'fill-current font-bold' : ''}`}>{item.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        )
      ))}
    </nav>
  );
};

export default BottomNav;