import React, { useState, useEffect } from 'react';
import { Challenge } from '../types';

interface AdminEditChallengeProps {
  challenge: Challenge;
  onSave: (challengeId: string, updatedData: Partial<Challenge>) => void;
  onCancel: () => void;
}

const AdminEditChallenge: React.FC<AdminEditChallengeProps> = ({ challenge, onSave, onCancel }) => {
  const [editData, setEditData] = useState<Challenge>(challenge);

  useEffect(() => {
    setEditData(challenge);
  }, [challenge]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    onSave(challenge.id, editData);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-end justify-center px-4 pb-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-surface-dark rounded-[3.5rem] p-10 border border-white/10 shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-white text-2xl font-black italic tracking-tighter uppercase">Editar Desafio</h4>
          <button onClick={onCancel} className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-6 pb-4">
          {/* Título */}
          <div className="space-y-2">
            <p className="text-slate-500 text-[9px] font-black uppercase ml-2 italic">Título</p>
            <input 
              name="title"
              className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white font-black italic outline-none focus:border-primary transition-all placeholder:text-slate-600 font-bold" 
              value={editData.title} 
              onChange={handleChange} 
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <p className="text-slate-500 text-[9px] font-black uppercase ml-2 italic">Descrição</p>
            <textarea 
              name="description"
              className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-primary transition-all placeholder:text-slate-600 font-bold resize-none" 
              value={editData.description} 
              onChange={handleChange} 
            />
          </div>

          {/* Ícone */}
          <div className="space-y-2">
            <p className="text-slate-500 text-[9px] font-black uppercase ml-2 italic">Ícone (Material Symbols)</p>
            <input 
              name="icon"
              className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white font-black italic outline-none focus:border-primary transition-all placeholder:text-slate-600 font-bold" 
              placeholder="Ex: directions_run"
              value={editData.icon} 
              onChange={handleChange} 
            />
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <p className="text-slate-500 text-[9px] font-black uppercase ml-2 italic">Cor (Tailwind, ex: blue-500)</p>
            <input 
              name="color"
              className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white font-black italic outline-none focus:border-primary transition-all placeholder:text-slate-600 font-bold" 
              placeholder="Ex: blue-500"
              value={editData.color} 
              onChange={handleChange} 
            />
          </div>

          {/* Progresso */}
          <div className="space-y-2">
            <p className="text-slate-500 text-[9px] font-black uppercase ml-2 italic">Progresso (Ex: 50% Concluído)</p>
            <input 
              name="progress"
              className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-5 text-white font-black italic outline-none focus:border-primary transition-all placeholder:text-slate-600 font-bold" 
              value={editData.progress} 
              onChange={handleChange} 
            />
          </div>

          <button onClick={handleSave} className="w-full h-16 bg-primary text-white rounded-[2rem] font-black uppercase italic shadow-lg active:scale-95 transition-all mt-4">
            Salvar Desafio
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditChallenge;