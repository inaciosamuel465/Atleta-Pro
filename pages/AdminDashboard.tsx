import React, { useState } from 'react';
import { AppScreen } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { showSuccess, showError } from '../src/utils/toast';

interface AdminDashboardProps {
  navigate: (screen: AppScreen) => void;
  avatarGallery: string[];
  workoutGallery: string[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate, avatarGallery, workoutGallery }) => {
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [newWorkoutUrl, setNewWorkoutUrl] = useState('');

  const handleAddAvatarUrl = async () => {
    if (newAvatarUrl.trim() === '') return;
    const updatedGallery = [...avatarGallery, newAvatarUrl.trim()];
    try {
      await setDoc(doc(db, "config", "appSettings"), { avatarGalleryUrls: updatedGallery }, { merge: true });
      setNewAvatarUrl('');
      showSuccess("URL de avatar adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar URL de avatar:", error);
      showError("Erro ao adicionar URL de avatar.");
    }
  };

  const handleRemoveAvatarUrl = async (urlToRemove: string) => {
    const updatedGallery = avatarGallery.filter(url => url !== urlToRemove);
    try {
      await setDoc(doc(db, "config", "appSettings"), { avatarGalleryUrls: updatedGallery }, { merge: true });
      showSuccess("URL de avatar removida!");
    } catch (error) {
      console.error("Erro ao remover URL de avatar:", error);
      showError("Erro ao remover URL de avatar.");
    }
  };

  const handleAddWorkoutUrl = async () => {
    if (newWorkoutUrl.trim() === '') return;
    const updatedGallery = [...workoutGallery, newWorkoutUrl.trim()];
    try {
      await setDoc(doc(db, "config", "appSettings"), { workoutGalleryUrls: updatedGallery }, { merge: true });
      setNewWorkoutUrl('');
      showSuccess("URL de atividade adicionada!");
    } catch (error) {
      console.error("Erro ao adicionar URL de atividade:", error);
      showError("Erro ao adicionar URL de atividade.");
    }
  };

  const handleRemoveWorkoutUrl = async (urlToRemove: string) => {
    const updatedGallery = workoutGallery.filter(url => url !== urlToRemove);
    try {
      await setDoc(doc(db, "config", "appSettings"), { workoutGalleryUrls: updatedGallery }, { merge: true });
      showSuccess("URL de atividade removida!");
    } catch (error) {
      console.error("Erro ao remover URL de atividade:", error);
      showError("Erro ao remover URL de atividade.");
    }
  };

  return (
    <div className="bg-[#101922] min-h-screen pb-40 no-scrollbar overflow-y-auto">
      <header className="flex items-center px-6 pt-10 pb-6 justify-between border-b border-white/5 sticky top-0 bg-[#101922]/90 backdrop-blur-xl z-20">
        <button onClick={() => navigate(AppScreen.DASHBOARD)} className="size-11 flex items-center justify-center rounded-2xl bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h2 className="text-white text-3xl font-black tracking-tight italic uppercase">Admin Portal</h2>
        <div className="size-11"></div> {/* Placeholder for alignment */}
      </header>

      <main className="px-6 pt-8 space-y-10">
        {/* Gerenciamento de Galeria de Avatares */}
        <section className="space-y-6 bg-surface-dark rounded-[2.5rem] p-8 border border-white/5">
          <h3 className="text-white text-xl font-black tracking-tight italic uppercase">Avatares</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Nova URL de Avatar"
              value={newAvatarUrl}
              onChange={(e) => setNewAvatarUrl(e.target.value)}
              className="flex-1 h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white text-xs outline-none focus:border-primary"
            />
            <button
              onClick={handleAddAvatarUrl}
              className="size-12 rounded-xl bg-primary flex items-center justify-center text-white active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
            {avatarGallery.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} className="size-16 rounded-2xl object-cover border border-white/10" alt={`Avatar ${i}`} />
                <button
                  onClick={() => handleRemoveAvatarUrl(url)}
                  className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Gerenciamento de Galeria de Atividades */}
        <section className="space-y-6 bg-surface-dark rounded-[2.5rem] p-8 border border-white/5">
          <h3 className="text-white text-xl font-black tracking-tight italic uppercase">Imagens de Atividade</h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Nova URL de Imagem de Atividade"
              value={newWorkoutUrl}
              onChange={(e) => setNewWorkoutUrl(e.target.value)}
              className="flex-1 h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white text-xs outline-none focus:border-primary"
            />
            <button
              onClick={handleAddWorkoutUrl}
              className="size-12 rounded-xl bg-primary flex items-center justify-center text-white active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
            {workoutGallery.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} className="h-28 w-full rounded-2xl object-cover border border-white/10" alt={`Workout ${i}`} />
                <button
                  onClick={() => handleRemoveWorkoutUrl(url)}
                  className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;