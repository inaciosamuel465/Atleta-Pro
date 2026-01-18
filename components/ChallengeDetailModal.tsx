import React from 'react';
import { Challenge } from '../types';

interface ChallengeDetailModalProps {
  challenge: Challenge;
  onClose: () => void;
}

const ChallengeDetailModal: React.FC<ChallengeDetailModalProps> = ({ challenge, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center px-4 pb-10 bg-background-light/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-surface-light rounded-[3.5rem] p-10 border border-surface-medium shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-text-dark text-2xl font-black italic tracking-tighter uppercase">Detalhes do Desafio</h4>
          <button onClick={onClose} className="size-10 rounded-xl bg-surface-medium/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-text-dark">close</span>
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-6">
          <div className={`size-24 rounded-3xl flex items-center justify-center ${challenge.color}/20 text-${challenge.color.split('-')[1]}-400 shadow-inner border border-${challenge.color.split('-')[1]}-400/20`}>
            <span className="material-symbols-outlined text-5xl">{challenge.icon}</span>
          </div>
          <h3 className="text-text-dark text-3xl font-black italic uppercase tracking-tight font-lexend">{challenge.title}</h3>
          <p className="text-text-light text-sm font-bold leading-relaxed">{challenge.description}</p>
          
          <div className="w-full space-y-2 pt-4 border-t border-surface-medium">
            <p className="text-text-light text-[10px] font-black uppercase tracking-widest">Progresso Atual</p>
            <div className="w-full h-3 bg-surface-medium rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-${challenge.color.split('-')[1]}-400 to-${challenge.color.split('-')[1]}-600`} 
                style={{ width: challenge.progress }}
              ></div>
            </div>
            <p className="text-text-dark text-lg font-black italic">{challenge.progress} Concluído</p>
          </div>

          <button onClick={onClose} className="w-full h-16 bg-primary text-white rounded-[2rem] font-black uppercase italic shadow-lg active:scale-95 transition-all mt-8">
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailModal;