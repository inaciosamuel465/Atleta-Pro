import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AdminEditUserProps {
  user: UserProfile;
  avatarGallery: string[];
  onSave: (uid: string, updatedData: Partial<UserProfile>) => void;
  onCancel: () => void;
}

const AdminEditUser: React.FC<AdminEditUserProps> = ({ user, avatarGallery, onSave, onCancel }) => {
  const [editData, setEditData] = useState<UserProfile>(user);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    setEditData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = () => {
    onSave(user.uid, editData);
    onCancel(); // Fecha o modal após salvar
  };

  const handleSelectAvatar = (url: string) => {
    setEditData(prev => ({ ...prev, avatar: url }));
    setShowAvatarPicker(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center px-4 pb-10 bg-background-light/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-surface-light rounded-[3.5rem] p-10 border border-surface-medium shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-text-dark text-2xl font-black italic tracking-tighter uppercase">Editar Usuário</h4>
          <button onClick={onCancel} className="size-10 rounded-xl bg-surface-medium/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-text-dark">close</span>
          </button>
        </div>

        <div className="space-y-6 pb-4">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <img src={editData.avatar} className="size-24 rounded-full object-cover border-4 border-primary/20" alt="Avatar" />
            <button 
              onClick={() => setShowAvatarPicker(true)}
              className="text-primary text-[10px] font-black uppercase tracking-widest border-b border-primary/20 pb-0.5"
            >
              Mudar Avatar
            </button>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <p className="text-text-light text-[9px] font-black uppercase ml-2 italic">Nome</p>
            <input 
              name="name"
              className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl px-5 text-text-dark font-black italic outline-none focus:border-primary transition-all placeholder:text-text-light font-bold" 
              value={editData.name} 
              onChange={handleChange} 
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <p className="text-text-light text-[9px] font-black uppercase ml-2 italic">Status</p>
            <input 
              name="status"
              className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl px-5 text-text-dark font-black italic outline-none focus:border-primary transition-all placeholder:text-text-light font-bold" 
              value={editData.status} 
              onChange={handleChange} 
            />
          </div>

          {/* Gênero */}
          <div className="space-y-2">
            <p className="text-text-light text-[9px] font-black uppercase ml-2 italic">Gênero</p>
            <select 
              name="gender"
              className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl px-5 text-text-dark font-black italic outline-none focus:border-primary transition-all" 
              value={editData.gender} 
              onChange={handleChange}
            >
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
          </div>

          {/* Altura e Peso */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-text-light text-[9px] font-black uppercase ml-2 italic">Altura (cm)</p>
              <input 
                name="height"
                type="number" 
                className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl px-5 text-text-dark font-black italic text-center outline-none focus:border-primary transition-all placeholder:text-text-light font-bold" 
                value={editData.height} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <p className="text-text-light text-[9px] font-black uppercase ml-2 italic">Peso (kg)</p>
              <input 
                name="weight"
                type="number" 
                className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl px-5 text-text-dark font-black italic text-center outline-none focus:border-primary transition-all placeholder:text-text-light font-bold" 
                value={editData.weight} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Idade */}
          <div className="space-y-2">
            <p className="text-text-light text-[9px] font-black uppercase ml-2 italic">Idade</p>
            <input 
              name="age"
              type="number" 
              className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl px-5 text-text-dark font-black italic text-center outline-none focus:border-primary transition-all placeholder:text-text-light font-bold" 
              value={editData.age} 
              onChange={handleChange} 
            />
          </div>

          {/* Metas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-text-light text-[9px] font-black uppercase ml-2 italic">Meta Semanal (Km)</p>
              <input 
                name="weeklyGoal"
                type="number" 
                className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl px-5 text-text-dark font-black italic text-center outline-none focus:border-primary transition-all placeholder:text-text-light font-bold" 
                value={editData.weeklyGoal} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <p className="text-text-light text-[9px] font-black uppercase ml-2 italic">Meta Mensal (Km)</p>
              <input 
                name="monthlyGoal"
                type="number" 
                className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl px-5 text-text-dark font-black italic text-center outline-none focus:border-primary transition-all placeholder:text-text-light font-bold" 
                value={editData.monthlyGoal} 
                onChange={handleChange} 
              />
            </div>
          </div>

          {/* Personalidade do Coach */}
          <div className="space-y-2">
            <p className="text-text-light text-[9px] font-black uppercase ml-2 italic">Personalidade do Coach</p>
            <select 
              name="coachPersonality"
              className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl px-5 text-text-dark font-black italic outline-none focus:border-primary transition-all" 
              value={editData.coachPersonality} 
              onChange={handleChange}
            >
              <option value="Motivador">Motivador</option>
              <option value="Técnico">Técnico</option>
              <option value="Zen">Zen</option>
            </select>
          </div>

          <button onClick={handleSave} className="w-full h-16 bg-primary text-white rounded-[2rem] font-black uppercase italic shadow-lg active:scale-95 transition-all mt-4">
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* MODAL AVATAR PICKER */}
      {showAvatarPicker && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-background-light/95 backdrop-blur-3xl p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-surface-light rounded-[3.5rem] p-8 border border-surface-medium space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h4 className="text-text-dark text-xl font-black uppercase italic tracking-tighter">Escolher Avatar</h4>
              <button onClick={() => setShowAvatarPicker(false)} className="text-text-light">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
              {avatarGallery.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSelectAvatar(url)}
                  className="size-16 rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                >
                  <img src={url} className="size-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEditUser;