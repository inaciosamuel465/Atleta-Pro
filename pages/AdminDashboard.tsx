import React, { useState, useEffect } from 'react';
import { AppScreen, UserProfile, Challenge } from '../types';
import { doc, setDoc, collection, getDocs, query, orderBy, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { showSuccess, showError } from '../src/utils/toast';
import AdminEditUser from '../components/AdminEditUser';
import AdminEditChallenge from '../components/AdminEditChallenge'; // Importar o novo componente

interface AdminDashboardProps {
  navigate: (screen: AppScreen) => void;
  avatarGallery: string[];
  workoutGallery: string[];
  onUpdateAnyUser: (uid: string, updatedData: Partial<UserProfile>) => void;
  challenges: Challenge[]; // Receber a lista de desafios
  onUpdateChallenge: (challengeId: string, updatedData: Partial<Challenge>) => void; // Função para atualizar desafio
  onDeleteChallenge: (challengeId: string) => void; // Função para deletar desafio
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate, avatarGallery, workoutGallery, onUpdateAnyUser, challenges, onUpdateChallenge, onDeleteChallenge }) => {
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [newWorkoutUrl, setNewWorkoutUrl] = useState('');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);

  // Estados para o novo desafio
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeDescription, setNewChallengeDescription] = useState('');
  const [newChallengeIcon, setNewChallengeIcon] = useState('');
  const [newChallengeColor, setNewChallengeColor] = useState('');
  const [newChallengeProgress, setNewChallengeProgress] = useState('0% Concluído');
  const [selectedChallengeForEdit, setSelectedChallengeForEdit] = useState<Challenge | null>(null);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollectionRef = collection(db, "users");
        const q = query(usersCollectionRef, orderBy('name', 'asc'));
        const querySnapshot = await getDocs(q);
        const usersData: UserProfile[] = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserProfile[];
        setAllUsers(usersData);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        showError("Erro ao carregar lista de usuários.");
      }
    };

    fetchUsers();
  }, [selectedUserForEdit]); // Recarrega usuários após salvar edição

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

  const handleAddChallenge = async () => {
    if (!newChallengeTitle || !newChallengeDescription || !newChallengeIcon || !newChallengeColor) {
      showError("Preencha todos os campos do desafio.");
      return;
    }

    try {
      const challengesRef = collection(db, "challenges");
      await addDoc(challengesRef, {
        title: newChallengeTitle,
        description: newChallengeDescription,
        icon: newChallengeIcon,
        color: newChallengeColor,
        progress: newChallengeProgress,
      });
      showSuccess("Desafio adicionado com sucesso!");
      // Limpar formulário
      setNewChallengeTitle('');
      setNewChallengeDescription('');
      setNewChallengeIcon('');
      setNewChallengeColor('');
      setNewChallengeProgress('0% Concluído');
    } catch (error) {
      console.error("Erro ao adicionar desafio:", error);
      showError("Erro ao adicionar desafio.");
    }
  };

  const handleConfirmDeleteChallenge = (challengeId: string) => {
    if (window.confirm("Tem certeza que deseja deletar este desafio? Esta ação não pode ser desfeita.")) {
      onDeleteChallenge(challengeId);
    }
  };

  return (
    <div className="bg-background-light min-h-screen pb-40 no-scrollbar overflow-y-auto">
      <header className="flex items-center px-6 pt-10 pb-6 justify-between border-b border-surface-medium sticky top-0 bg-background-light/90 backdrop-blur-xl z-20">
        <button onClick={() => navigate(AppScreen.DASHBOARD)} className="size-11 flex items-center justify-center rounded-2xl bg-surface-light border border-surface-medium hover:bg-surface-medium transition-colors">
          <span className="material-symbols-outlined text-text-dark">arrow_back</span>
        </button>
        <h2 className="text-text-dark text-3xl font-black tracking-tight italic uppercase">Admin Portal</h2>
        <div className="size-11"></div> {/* Placeholder for alignment */}
      </header>

      <main className="px-6 pt-8 space-y-10">
        {/* Gerenciamento de Usuários */}
        <section className="space-y-6 bg-surface-light rounded-[2.5rem] p-8 border border-surface-medium">
          <h3 className="text-text-dark text-xl font-black tracking-tight italic uppercase">Gerenciar Usuários</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto no-scrollbar pr-1">
            {allUsers.length > 0 ? allUsers.map((user) => (
              <div 
                key={user.uid} 
                className="flex items-center justify-between bg-surface-medium/40 p-4 rounded-2xl border border-surface-medium hover:bg-surface-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={user.avatar} className="size-10 rounded-full object-cover" alt="User Avatar" />
                  <div>
                    <p className="text-text-dark font-bold text-sm">{user.name}</p>
                    <p className="text-text-light text-xs">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUserForEdit(user)}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Editar
                </button>
              </div>
            )) : (
              <p className="text-text-light text-center text-sm">Nenhum usuário encontrado.</p>
            )}
          </div>
        </section>

        {/* Gerenciamento de Desafios */}
        <section className="space-y-6 bg-surface-light rounded-[2.5rem] p-8 border border-surface-medium">
          <h3 className="text-text-dark text-xl font-black tracking-tight italic uppercase">Gerenciar Desafios</h3>
          
          {/* Formulário para Adicionar Novo Desafio */}
          <div className="space-y-4 mb-6 p-6 bg-surface-medium/40 rounded-2xl border border-surface-medium">
            <h4 className="text-text-dark text-lg font-black italic tracking-tighter uppercase mb-4">Novo Desafio</h4>
            <input 
              type="text"
              placeholder="Título do Desafio"
              className="w-full h-12 bg-surface-medium/40 border border-surface-medium rounded-xl px-4 text-text-dark text-sm outline-none focus:border-primary transition-all placeholder:text-text-light font-bold"
              value={newChallengeTitle}
              onChange={(e) => setNewChallengeTitle(e.target.value)}
            />
            <textarea 
              placeholder="Descrição do Desafio"
              className="w-full h-24 bg-surface-medium/40 border border-surface-medium rounded-xl px-4 py-3 text-text-dark text-sm outline-none focus:border-primary transition-all placeholder:text-text-light font-bold resize-none"
              value={newChallengeDescription}
              onChange={(e) => setNewChallengeDescription(e.target.value)}
            />
            <input 
              type="text"
              placeholder="Ícone (Material Symbols, ex: directions_run)"
              className="w-full h-12 bg-surface-medium/40 border border-surface-medium rounded-xl px-4 text-text-dark text-sm outline-none focus:border-primary transition-all placeholder:text-text-light font-bold"
              value={newChallengeIcon}
              onChange={(e) => setNewChallengeIcon(e.target.value)}
            />
            <input 
              type="text"
              placeholder="Cor (Tailwind, ex: blue-500)"
              className="w-full h-12 bg-surface-medium/40 border border-surface-medium rounded-xl px-4 text-text-dark text-sm outline-none focus:border-primary transition-all placeholder:text-text-light font-bold"
              value={newChallengeColor}
              onChange={(e) => setNewChallengeColor(e.target.value)}
            />
            <input 
              type="text"
              placeholder="Progresso Inicial (Ex: 0% Concluído)"
              className="w-full h-12 bg-surface-medium/40 border border-surface-medium rounded-xl px-4 text-text-dark text-sm outline-none focus:border-primary transition-all placeholder:text-text-light font-bold"
              value={newChallengeProgress}
              onChange={(e) => setNewChallengeProgress(e.target.value)}
            />
            <button 
              onClick={handleAddChallenge}
              className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg mt-4"
            >
              Adicionar Desafio
            </button>
          </div>

          {/* Lista de Desafios Existentes */}
          <div className="space-y-4 max-h-80 overflow-y-auto no-scrollbar pr-1">
            {challenges.length > 0 ? challenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className="flex items-center justify-between bg-surface-medium/40 p-4 rounded-2xl border border-surface-medium hover:bg-surface-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-xl flex items-center justify-center bg-${challenge.color}/20 text-${challenge.color.split('-')[0]}-${challenge.color.split('-')[1]}`}>
                    <span className="material-symbols-outlined text-xl">{challenge.icon}</span>
                  </div>
                  <div>
                    <p className="text-text-dark font-bold text-sm">{challenge.title}</p>
                    <p className="text-text-light text-xs">{challenge.progress}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedChallengeForEdit(challenge)}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleConfirmDeleteChallenge(challenge.id)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-text-light text-center text-sm">Nenhum desafio encontrado.</p>
            )}
          </div>
        </section>

        {/* Gerenciamento de Galeria de Avatares */}
        <section className="space-y-6 bg-surface-light rounded-[2.5rem] p-8 border border-surface-medium">
          <h3 className="text-text-dark text-xl font-black tracking-tight italic uppercase">Avatares</h3>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Nova URL de Avatar"
              value={newAvatarUrl}
              onChange={(e) => setNewAvatarUrl(e.target.value)}
              className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl pl-5 pr-16 text-text-dark text-sm outline-none focus:border-primary transition-all placeholder:text-text-light font-bold"
            />
            <button
              onClick={handleAddAvatarUrl}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-primary rounded-xl flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-xl">add</span>
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
            {avatarGallery.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} className="size-16 rounded-2xl object-cover border border-surface-medium" alt={`Avatar ${i}`} />
                <button
                  onClick={() => handleRemoveAvatarUrl(url)}
                  className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
          </div>
          <p className="text-text-light text-[9px] font-black uppercase tracking-widest text-center mt-4">
            As alterações nas galerias são salvas automaticamente.
          </p>
        </section>

        {/* Gerenciamento de Galeria de Atividades */}
        <section className="space-y-6 bg-surface-light rounded-[2.5rem] p-8 border border-surface-medium">
          <h3 className="text-text-dark text-xl font-black tracking-tight italic uppercase">Imagens de Atividade</h3>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Nova URL de Imagem de Atividade"
              value={newWorkoutUrl}
              onChange={(e) => setNewWorkoutUrl(e.target.value)}
              className="w-full h-14 bg-surface-medium/40 border border-surface-medium rounded-2xl pl-5 pr-16 text-text-dark text-sm outline-none focus:border-primary transition-all placeholder:text-text-light font-bold"
            />
            <button
              onClick={handleAddWorkoutUrl}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-primary rounded-xl flex items-center justify-center text-white active:scale-95 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-xl">add</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
            {workoutGallery.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} className="h-28 w-full rounded-2xl object-cover border border-surface-medium" alt={`Workout ${i}`} />
                <button
                  onClick={() => handleRemoveWorkoutUrl(url)}
                  className="absolute -top-2 -right-2 size-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            ))}
          </div>
          <p className="text-text-light text-[9px] font-black uppercase tracking-widest text-center mt-4">
            As alterações nas galerias são salvas automaticamente.
          </p>
        </section>
      </main>

      {selectedUserForEdit && (
        <AdminEditUser 
          user={selectedUserForEdit}
          avatarGallery={avatarGallery}
          onSave={onUpdateAnyUser}
          onCancel={() => setSelectedUserForEdit(null)}
        />
      )}

      {selectedChallengeForEdit && (
        <AdminEditChallenge
          challenge={selectedChallengeForEdit}
          onSave={onUpdateChallenge}
          onCancel={() => setSelectedChallengeForEdit(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;