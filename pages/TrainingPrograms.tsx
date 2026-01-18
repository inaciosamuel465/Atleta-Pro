import React, { useState } from 'react';
import { AppScreen, TrainingProgram } from '../types';
import TrainingProgramCard from '../components/TrainingProgramCard';
import TrainingProgramDetailModal from '../components/TrainingProgramDetailModal'; // Será criado a seguir

interface TrainingProgramsProps {
  navigate: (screen: AppScreen) => void;
  trainingPrograms: TrainingProgram[];
  onEnrollInProgram: (programId: string) => void;
  userActiveProgramId?: string;
}

const TrainingPrograms: React.FC<TrainingProgramsProps> = ({ navigate, trainingPrograms, onEnrollInProgram, userActiveProgramId }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);

  const handleViewProgram = (program: TrainingProgram) => {
    setSelectedProgram(program);
    setShowDetailModal(true);
  };

  const handleEnroll = (programId: string) => {
    onEnrollInProgram(programId);
    setShowDetailModal(false);
  };

  return (
    <div className="bg-[#101922] min-h-screen pb-40 no-scrollbar overflow-y-auto animate-in fade-in duration-500">
      <header className="flex items-center px-6 pt-10 pb-6 justify-between border-b border-white/5 sticky top-0 bg-[#101922]/90 backdrop-blur-xl z-20">
        <button onClick={() => navigate(AppScreen.DASHBOARD)} className="size-11 flex items-center justify-center rounded-2xl bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h2 className="text-white text-3xl font-black tracking-tight italic uppercase">Programas</h2>
        <div className="size-11"></div> {/* Placeholder for alignment */}
      </header>

      <main className="px-6 pt-8 space-y-6">
        {trainingPrograms.length > 0 ? (
          trainingPrograms.map((program) => (
            <TrainingProgramCard 
              key={program.id} 
              program={program} 
              onClick={handleViewProgram} 
            />
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <span className="material-symbols-outlined text-6xl">fitness_center</span>
            <div>
              <p className="text-white font-black">Nenhum programa de treino disponível</p>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Volte mais tarde ou crie um no Admin Portal</p>
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
        />
      )}
    </div>
  );
};

export default TrainingPrograms;