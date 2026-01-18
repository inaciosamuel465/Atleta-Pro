import React, { useState, useMemo } from 'react'; // Importar useMemo
import { AppScreen, TrainingProgram, ProgramActivity } from '../types';
import TrainingProgramCard from '../components/TrainingProgramCard';
import TrainingProgramDetailModal from '../components/TrainingProgramDetailModal';

interface TrainingProgramsProps {
  navigate: (screen: AppScreen) => void;
  trainingPrograms: TrainingProgram[];
  onEnrollInProgram: (programId: string) => void;
  userActiveProgramId?: string;
  userCompletedProgramActivities?: { [programId: string]: string[] };
  onStartProgramActivity: (programId: string, activity: ProgramActivity) => void;
}

const TrainingPrograms: React.FC<TrainingProgramsProps> = ({ navigate, trainingPrograms, onEnrollInProgram, userActiveProgramId, userCompletedProgramActivities, onStartProgramActivity }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [levelFilter, setLevelFilter] = useState<'Todos' | 'Iniciante' | 'Intermediário' | 'Avançado'>('Todos');
  const [focusFilter, setFocusFilter] = useState<'Todos' | 'Resistência' | 'Velocidade' | 'Força'>('Todos');

  const handleViewProgram = (program: TrainingProgram) => {
    setSelectedProgram(program);
    setShowDetailModal(true);
  };

  const handleEnroll = (programId: string) => {
    onEnrollInProgram(programId);
    setShowDetailModal(false);
  };

  const filteredPrograms = useMemo(() => {
    return trainingPrograms.filter(program => {
      const matchesLevel = levelFilter === 'Todos' || program.level === levelFilter;
      const matchesFocus = focusFilter === 'Todos' || program.focus === focusFilter;
      return matchesLevel && matchesFocus;
    });
  }, [trainingPrograms, levelFilter, focusFilter]);

  return (
    <div className="bg-background-light min-h-screen pb-40 no-scrollbar overflow-y-auto animate-in fade-in duration-500">
      <header className="flex flex-col px-6 pt-10 pb-6 border-b border-surface-medium sticky top-0 bg-background-light/90 backdrop-blur-xl z-20">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(AppScreen.DASHBOARD)} className="size-11 flex items-center justify-center rounded-2xl bg-surface-light border border-surface-medium hover:bg-surface-medium transition-colors">
            <span className="material-symbols-outlined text-text-dark">arrow_back</span>
          </button>
          <h2 className="text-text-dark text-3xl font-black tracking-tight italic uppercase">Programas</h2>
          <div className="size-11"></div> {/* Placeholder for alignment */}
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-4">
          {/* Filtro por Nível */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['Todos', 'Iniciante', 'Intermediário', 'Avançado'].map((level) => (
              <button
                key={level}
                onClick={() => setLevelFilter(level as any)}
                className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${levelFilter === level ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-light text-text-medium border border-surface-medium'}`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Filtro por Foco */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['Todos', 'Resistência', 'Velocidade', 'Força'].map((focus) => (
              <button
                key={focus}
                onClick={() => setFocusFilter(focus as any)}
                className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${focusFilter === focus ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-light text-text-medium border border-surface-medium'}`}
              >
                {focus}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-6 pt-8 space-y-6">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <TrainingProgramCard 
              key={program.id} 
              program={program} 
              onClick={handleViewProgram} 
            />
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <span className="material-symbols-outlined text-6xl text-text-light">fitness_center</span>
            <div>
              <p className="text-text-dark font-black">Nenhum programa de treino disponível</p>
              <p className="text-xs text-text-light mt-1 uppercase tracking-widest">Ajuste os filtros ou crie um no Admin Portal</p>
            </div>
          </div>
        )}
      </main>

      {showDetailModal && selectedProgram && (
        <TrainingProgramDetailModal
          program={selectedProgram}
          onClose={() => setShowDetailModal(false)}
          onEnroll={handleEnroll}
          isEnrolled={userActiveProgramId === selectedProgram.id}
          userCompletedProgramActivities={userCompletedProgramActivities}
          onStartProgramActivity={onStartProgramActivity}
        />
      )}
    </div>
  );
};

export default TrainingPrograms;