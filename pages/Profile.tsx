import React, { useState, useRef, useEffect } from 'react';
import { AppScreen, UserProfile, Activity } from '../types';
import { AVATAR_GALLERY } from '../constants';
import { showSuccess, showError } from '../src/utils/toast'; // Importar funções de toast

interface ProfileProps {
  navigate: (screen: AppScreen) => void;
  user: UserProfile;
  activities: Activity[];
  onUpdateUser: (updatedData: Partial<UserProfile>) => void;
  onSeedData?: () => void;
  onLogout?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ navigate, user, activities, onUpdateUser, onSeedData, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editData, setEditData] = useState({
    name: user.name,
    status: user.status,
    avatar: user.avatar, // This will hold the URL or base64 string for pending upload
    height: user.height,
    weight: user.weight,
    weeklyGoal: user.weeklyGoal || 20,
    monthlyGoal: user.monthlyGoal || 80
  });

  // Separate state for the avatar URL input field in the edit modal
  const [avatarUrlInput, setAvatarUrlInput] = useState(user.avatar);

  // Sync avatarUrlInput with editData.avatar when editData.avatar is a URL
  useEffect(() => {
    if (editData.avatar && !editData.avatar.startsWith('data:image/')) {
      setAvatarUrlInput(editData.avatar);
    } else if (editData.avatar && editData.avatar.startsWith('data:image/')) {
      setAvatarUrlInput(''); // Clear input if a base64 image is pending upload
    }
  }, [editData.avatar]);

  const handleSave = () => {
    // If avatarUrlInput has a value, it takes precedence
    const finalAvatar = avatarUrlInput || editData.avatar;
    onUpdateUser({ ...editData, avatar: finalAvatar });
    setIsEditing(false);
    showSuccess("Perfil atualizado com sucesso!"); // Toast de sucesso
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditData({ ...editData, avatar: base64String });
        setShowImagePicker(false);
        showSuccess("Imagem de perfil selecionada!"); // Toast de sucesso
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    // Substituindo o confirm() por um toast de confirmação
    if (onLogout) {
      // Poderíamos usar um toast com botões de ação aqui, mas para simplicidade, vamos direto
      // com a ação de logout e um toast de sucesso/erro.
      // Para uma confirmação mais robusta, seria necessário um modal customizado.
      onLogout();
    }
  };

  return (
    <div className="bg-[#101922] min-h-screen pb-40 no-scrollbar overflow-y-auto">
      <header className="flex items-center px-6 pt-10 pb-6 justify-between border-b border-white/5 sticky top-0 bg-[#101922]/90 backdrop-blur-xl z-20">
        <h2 className="text-white text-3xl font-black tracking-tight italic uppercase">Atleta</h2>
        <div className="flex gap-3">
          <button onClick={handleLogout} className="size-11 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
            <span className="material-symbols-outlined">logout</span>
          </button>
          <button onClick={() => setIsEditing(true)} className="size-11 flex items-center justify-center rounded-2xl bg-surface-dark border border-white/5">
            <span className="material-symbols-outlined text-white">settings</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col items-center pt-10 px-6">
        <div className="relative mb-8 group cursor-pointer" onClick={() => setShowImagePicker(true)}>
          <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <img src={user.avatar} className="size-40 rounded-[3.5rem] border-4 border-surface-dark shadow-2xl object-cover relative z-10" alt="User" />
          <div className="absolute bottom-1 right-1 size-12 bg-primary rounded-2xl border-4 border-[#101922] flex items-center justify-center text-white shadow-lg shadow-primary/30 z-20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[24px]">photo_camera</span>
          </div>
        </div>

        <div className="text-center space-y-2 mb-10">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">{user.name}</h1>
            <span className="bg-primary/20 text-primary text-[10px] font-black px-4 py-2 rounded-xl border border-primary/20 uppercase tracking-widest italic">Elite Lvl {Math.floor(activities.reduce((a,b)=>a+b.distance, 0)/5) + 1}</span>
          </div>
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] italic opacity-70">"{user.status}"</p>
        </div>

        {/* METAS */}
        <section className="w-full space-y-6 mb-12">
           <div className="flex justify-between items-center px-2">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">Objetivos de Performance</h3>
              <button onClick={() => setIsEditing(true)} className="text-primary text-[10px] font-black uppercase tracking-widest">Ajustar</button>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-dark/60 rounded-[2.5rem] p-7 border border-white/5 space-y-3">
                 <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest italic">Meta Semanal</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-white text-4xl font-black italic tracking-tighter">{user.weeklyGoal || 20}</span>
                    <span className="text-slate-600 text-xs font-bold">KM</span>
                 </div>
              </div>
              <div className="bg-surface-dark/60 rounded-[2.5rem] p-7 border border-white/5 space-y-3">
                 <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest italic">Meta Mensal</p>
                 <div className="flex items-baseline gap-2">
                    <span className="text-white text-4xl font-black italic tracking-tighter">{user.monthlyGoal || 80}</span>
                    <span className="text-slate-600 text-xs font-bold">KM</span>
                 </div>
              </div>
           </div>
        </section>
      </div>

      {/* MODAL IMAGE PICKER */}
      {showImagePicker && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-surface-dark rounded-[3.5rem] p-8 border border-white/10 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h4 className="text-white text-xl font-black uppercase italic tracking-tighter">Escolher Avatar</h4>
              <button onClick={() => setShowImagePicker(false)} className="text-slate-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {AVATAR_GALLERY.map((url, i) => (
                <button 
                  key={i} 
                  onClick={() => { setEditData({ ...editData, avatar: url }); setShowImagePicker(false); }}
                  className="size-16 rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary transition-all"
                >
                  <img src={url} className="size-full object-cover" />
                </button>
              ))}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="size-16 rounded-2xl bg-white/5 flex flex-col items-center justify-center text-primary border-2 border-dashed border-primary/20"
              >
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <span className="text-[7px] font-black uppercase">Subir</span>
              </button>
            </div>
            
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            
            <div className="pt-4 border-t border-white/5">
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest text-center">Ou use uma URL personalizada no menu de edição</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIÇÃO */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-surface-dark rounded-[3.5rem] p-10 border border-white/10 shadow-2xl overflow-y-auto no-scrollbar max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-white text-2xl font-black italic tracking-tighter uppercase">Perfil do Atleta</h4>
              <button onClick={() => setIsEditing(false)} className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6 pb-4">
              <div className="space-y-2">
                <p className="text-slate-500 text-[9px] font-black uppercase ml-2 italic">Link da Foto de Perfil</p>
                <input 
                  className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white text-xs outline-none focus:border-primary" 
                  value={avatarUrlInput} 
                  onChange={e => setAvatarUrlInput(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <p className="text-slate-500 text-[9px] font-black uppercase ml-2 italic">Nome</p>
                <input className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white font-black italic outline-none" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-slate-500 text-[9px] font-black uppercase ml-2 italic">Km Semana</p>
                  <input type="number" className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white font-black italic text-center" value={editData.weeklyGoal} onChange={e => setEditData({...editData, weeklyGoal: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-500 text-[9px] font-black uppercase ml-2 italic">Km Mês</p>
                  <input type="number" className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white font-black italic text-center" value={editData.monthlyGoal} onChange={e => setEditData({...editData, monthlyGoal: Number(e.target.value)})} />
                </div>
              </div>
              <button onClick={handleSave} className="w-full h-16 bg-primary text-white rounded-[2rem] font-black uppercase italic shadow-lg active:scale-95 transition-all mt-4">
                Salvar Atleta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;