import React from 'react';
import { TrainingProgram } from '../types';

interface TrainingProgramCardProps {
  program: TrainingProgram;
  onClick: (program: TrainingProgram) => void;
}

const TrainingProgramCard: React.FC<TrainingProgramCardProps> = ({ program, onClick }) => {
  const levelColors = {
    'Iniciante': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/10',
    'Intermediário': 'bg-blue-500/20 text-blue-400 border-blue-500/10',
    'Avançado': 'bg-red-500/20 text-red-400 border-red-500/10',
  };

  const focusIcons = {
    'Resistência': 'fitness_center',
    'Velocidade': 'speed',
    'Força': 'sports_gymnastics',
  };

  return (
    <button 
      onClick={() => onClick(program)}
      className="relative w-full h-48 rounded-[2.5rem] overflow-hidden shadow-lg border border-surface-medium group active:scale-[0.98] transition-all hover:border-primary/30"
    >
      <img 
        src={program.image} 
        alt={program.name} 
        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background-light/80 via-background-light/40 to-transparent"></div>
      
      <div className="relative z-10 p-6 flex flex-col justify-end h-full text-left">
        <h3 className="text-text-dark text-xl font-black italic uppercase tracking-tight font-lexend leading-tight mb-2">
          {program.name}
        </h3>
        <p className="text-text-light text-xs font-bold leading-snug mb-4 line-clamp-2">
          {program.description}
        </p>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${levelColors[program.level]}`}>
            {program.level}
          </span>
          <div className="flex items-center gap-1.5 text-text-light text-[9px] font-black uppercase tracking-widest">
            <span className="material-symbols-outlined text-base">{focusIcons[program.focus]}</span>
            <span>{program.focus}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-light text-[9px] font-black uppercase tracking-widest">
            <span className="material-symbols-outlined text-base">calendar_month</span>
            <span>{program.durationWeeks} Semanas</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default TrainingProgramCard;