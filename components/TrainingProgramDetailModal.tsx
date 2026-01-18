import React from 'react';
import { TrainingProgram, ProgramActivity } from '../types';

interface TrainingProgramDetailModalProps {
  program: TrainingProgram;
  onClose: () => void;
  onEnroll: (programId: string) => void;
  isEnrolled: boolean;
  userCompletedProgramActivities?: { [programId: string]: string[] }; // Nova prop
}

const TrainingProgramDetailModal: React.FC<TrainingProgramDetailModalProps> = ({ program, onClose, onEnroll, isEnrolled, userCompletedProgramActivities }) => {
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

  const completedActivitiesForProgram = userCompletedProgramActivities?.[program.id] || [];
  const completedCount = completedActivitiesForProgram.length;
  const totalActivities = program.activities.length;
  const progressPercent = totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center px-4 pb-10 bg-background-light/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-surface-light rounded-[3.5rem] p-10 border border-surface-medium shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-text-dark text-2xl font-black italic tracking-tighter uppercase">Detalhes do Programa</h4>
          <button onClick={onClose} className="size-10 rounded-xl bg-surface-medium/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-text-dark">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-6">
          <img 
            src={program.image} 
            alt={program.name} 
            className="w-full h-40 object-cover rounded-3xl border border-surface-medium shadow-lg" 
          />
          <h3 className="text-text-dark text-3xl font-black italic uppercase tracking-tight font-lexend">{program.name}</h3>
          <p className="text-text-light text-sm font-bold leading-relaxed">{program.description}</p>
          
          <div className="w-full flex justify-around items-center pt-4 border-t border-surface-medium">
            <div className="text-center">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${levelColors[program.level]}`}>
                {program.level}
              </span>
              <p className="text-text-light text-[9px] font-black uppercase tracking-widest mt-2">Nível</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-text-light text-[9px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined text-base">{focusIcons[program.focus]}</span>
                <span>{program.focus}</span>
              </div>
              <p className="text-text-light text-[9px] font-black uppercase tracking-widest mt-2">Foco</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-text-light text-[9px] font-black uppercase tracking-widest">
                <span className="material-symbols-outlined text-base">calendar_month</span>
                <span>{program.durationWeeks} Semanas</span>
              </div>
              <p className="text-text-light text-[9px] font-black uppercase tracking-widest mt-2">Duração</p>
            </div>
          </div>

          {isEnrolled && (
            <div className="w-full space-y-2 pt-4 border-t border-surface-medium">
              <p className="text-text-light text-[10px] font-black uppercase tracking-widest">Progresso do Programa</p>
              <div className="w-full h-3 bg-surface-medium rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-text-dark text-lg font-black italic">{completedCount} de {totalActivities} Atividades Concluídas</p>
            </div>
          )}

          <div className="w-full space-y-4 pt-6 border-t border-surface-medium">
            <h4 className="text-text-dark text-xl font-black italic uppercase tracking-tighter text-left">Atividades do Programa</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar pr-2">
              {program.activities.map((activity: ProgramActivity) => {
                const isActivityCompleted = completedActivitiesForProgram.includes(activity.id);
                return (
                  <div 
                    key={activity.id} 
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isActivityCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-surface-medium/40 border-surface-medium'}`}
                  >
                    <div className={`size-10 rounded-xl flex items-center justify-center ${isActivityCompleted ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary'}`}>
                      <span className="material-symbols-outlined text-xl">{isActivityCompleted ? 'check_circle' : 'directions_run'}</span>
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${isActivityCompleted ? 'text-emerald-700 line-through' : 'text-text-dark'}`}>Dia {activity.day}: {activity.title}</p>
                      <p className={`text-xs ${isActivityCompleted ? 'text-emerald-600 line-through' : 'text-text-light'}`}>{activity.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onEnroll(program.id)} 
            disabled={isEnrolled}
            className={`w-full h-16 ${isEnrolled ? 'bg-surface-medium text-text-light' : 'bg-primary text-white'} rounded-[2rem] font-black uppercase italic shadow-lg active:scale-95 transition-all mt-8`}
          >
            {isEnrolled ? 'Programa Ativo' : 'Iniciar Programa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingProgramDetailModal;