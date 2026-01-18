import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, query, orderBy, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { showSuccess, showError } from './src/utils/toast';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Importar GoogleGenerativeAI do pacote correto

import { AppScreen, UserProfile, Activity } from './types'; // AIInsight removido
import { INITIAL_USER } from './constants';

// Pages
import InitializeProfile from './pages/InitializeProfile';
import Dashboard from './pages/Dashboard';
import StartActivity from './pages/StartActivity';
import LiveActivity from './pages/LiveActivity';
import PostWorkout from './pages/PostWorkout';
import History from './pages/History';
import Profile from './pages/Profile';
import Music from './pages/Music';
import Stats from './pages/Stats';
import AdminDashboard from './pages/AdminDashboard';

// Components
import BottomNav from './components/BottomNav';

// Inicializar a API Gemini
const API_KEY = process.env.GEMINI_API_KEY; // Usar process.env diretamente
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY as string) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-pro" }) : null;

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.INITIALIZE);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Partial<Activity> | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [avatarGallery, setAvatarGallery] = useState<string[]>([]);
  const [workoutGallery, setWorkoutGallery] = useState<string[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null); // Estado para o insight da IA
  const [aiLoading, setAiLoading] = useState(false); // Estado de carregamento da IA

  const isAdmin = user?.email === 'admin@atleta.com';

  // --- FIREBASE AUTH & DATA LISTENER ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // 1. Ouvir mudanças no Perfil do Usuário em Tempo Real
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
            if (currentScreen === AppScreen.INITIALIZE) {
               setCurrentScreen(AppScreen.DASHBOARD);
            }
          } else {
            // Usuário criado no Auth mas sem doc no Firestore (raro, mas tratado)
            setCurrentScreen(AppScreen.INITIALIZE);
          }
          setAuthLoading(false);
        });

        // 2. Ouvir Atividades em Tempo Real (Ordenadas por data de criação)
        const activitiesRef = collection(db, "users", firebaseUser.uid, "activities");
        // Adicionando ordenação por 'createdAt' em ordem decrescente
        const q = query(activitiesRef, orderBy('createdAt', 'desc')); 
        
        const unsubActivities = onSnapshot(q, (snapshot) => {
          const loadedActivities: Activity[] = [];
          snapshot.forEach((doc) => {
             loadedActivities.push({ id: doc.id, ...doc.data() } as Activity);
          });
          setActivities(loadedActivities);
        });

        // 3. Ouvir configurações globais (galerias, etc.)
        const appSettingsRef = doc(db, "config", "appSettings");
        const unsubAppSettings = onSnapshot(appSettingsRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAvatarGallery(data.avatarGalleryUrls || []);
            setWorkoutGallery(data.workoutGalleryUrls || []);
          } else {
            // Se o documento de configurações não existe, cria um com valores padrão
            setDoc(appSettingsRef, {
              avatarGalleryUrls: [
                "https://api.dicebear.com/8.x/bottts/svg?seed=Buddy",
                "https://api.dicebear.com/8.x/bottts/svg?seed=Misty",
                "https://api.dicebear.com/8.x/bottts/svg?seed=Shadow",
                "https://api.dicebear.com/8.x/bottts/svg?seed=Pixel",
                "https://images.unsplash.com/photo-1535713875002-d1d0cfce72b9?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
              ],
              workoutGalleryUrls: [
                "https://images.unsplash.com/photo-1574680096145-d05b4747414c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1505751172876-fa1923c58541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1541534741688-60dc2bda874b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1550345000-88b17579946b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1594882645123-cc0866b879b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1574680096145-d05b4747414c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1505751172876-fa1923c58541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1541534741688-60dc2bda874b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1550345000-88b17579946b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
                "https://images.unsplash.com/photo-1594882645123-cc0866b879b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80",
              ],
            }, { merge: true }).catch(e => console.error("Erro ao criar appSettings padrão:", e));
          }
        });


        return () => {
          unsubUser();
          unsubActivities();
          unsubAppSettings();
        };
      } else {
        setUser(null);
        setActivities([]);
        setAuthLoading(false);
        setCurrentScreen(AppScreen.INITIALIZE);
        setAvatarGallery([]);
        setWorkoutGallery([]);
      }
    });

    return () => unsubscribeAuth();
  }, [currentScreen]);

  const navigate = useCallback((screen: AppScreen) => {
    setCurrentScreen(screen);
  }, []);

  // Helper para upload de imagem para o Firebase Storage
  const uploadImageAndGetUrl = async (uid: string, base64String: string): Promise<string> => {
    const storageRef = ref(storage, `avatars/${uid}/${Date.now()}.png`);
    await uploadString(storageRef, base64String, 'data_url');
    return getDownloadURL(storageRef);
  };

  const handleUpdateUser = async (updatedData: Partial<UserProfile>) => {
    if (user && auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        
        // Se o avatar for uma string base64, faça o upload para o Storage
        if (updatedData.avatar && updatedData.avatar.startsWith('data:image/')) {
          const imageUrl = await uploadImageAndGetUrl(auth.currentUser.uid, updatedData.avatar);
          updatedData.avatar = imageUrl; // Atualiza o avatar para a URL do Storage
        }

        await setDoc(userDocRef, { ...updatedData }, { merge: true });
        showSuccess("Perfil atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar perfil no Firestore:", error);
        showError("Erro ao sincronizar perfil com a nuvem.");
      }
    }
  };

  // Nova função para admin editar qualquer usuário
  const handleUpdateAnyUser = async (uid: string, updatedData: Partial<UserProfile>) => {
    if (isAdmin) {
      try {
        const userDocRef = doc(db, "users", uid);
        
        // Se o avatar for uma string base64, faça o upload para o Storage
        if (updatedData.avatar && updatedData.avatar.startsWith('data:image/')) {
          const imageUrl = await uploadImageAndGetUrl(uid, updatedData.avatar);
          updatedData.avatar = imageUrl; // Atualiza o avatar para a URL do Storage
        }

        await setDoc(userDocRef, { ...updatedData }, { merge: true });
        showSuccess(`Perfil de ${updatedData.name || uid} atualizado com sucesso!`);
      } catch (error) {
        console.error("Erro ao atualizar perfil de outro usuário no Firestore:", error);
        showError("Erro ao atualizar perfil do usuário.");
      }
    } else {
      showError("Você não tem permissão para editar outros usuários.");
    }
  };


  const handleLogout = async () => {
      try {
        await signOut(auth);
        showSuccess("Você saiu da sua conta.");
      } catch (error) {
        console.error("Erro ao sair:", error);
        showError("Erro ao sair da conta.");
      }
  };

  const seedDatabase = async (uid: string, profileData: UserProfile) => {
      try {
          await setDoc(doc(db, "users", uid), profileData);
          showSuccess("Dados iniciais carregados com sucesso!");
          return true;
      } catch (e) {
          console.error("Erro ao semear banco:", e);
          showError("Erro ao carregar dados iniciais.");
          throw e;
      }
  };

  const stats = useMemo(() => {
    const totalDist = activities.reduce((acc, curr) => acc + (curr.distance || 0), 0);
    const totalCals = activities.reduce((acc, curr) => acc + (curr.calories || 0), 0);
    const totalSeconds = activities.reduce((acc, curr) => {
      if (!curr.time) return acc;
      const parts = curr.time.split(':').map(Number);
      if (parts.length === 3) return acc + (parts[0] * 3600 + parts[1] * 60 + parts[2]);
      if (parts.length === 2) return acc + (parts[0] * 60 + parts[1]);
      return acc;
    }, 0);
    
    let avgPace = "0'00\"";
    if (totalDist > 0) {
      const paceDecimal = (totalSeconds / 60) / totalDist;
      const mins = Math.floor(paceDecimal);
      const secs = Math.round((paceDecimal - mins) * 60);
      avgPace = `${mins}'${secs < 10 ? '0' + secs : secs}"`;
    }

    // Calculate weekly distance
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day

    // Calculate start of the current week (Monday)
    const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), diff is 6 days back. Otherwise, diff is dayOfWeek - 1.
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diffToMonday);

    const rawWeeklyDistance = activities.reduce((acc, curr) => {
      const activityDate = new Date(curr.date);
      activityDate.setHours(0, 0, 0, 0);
      if (activityDate >= startOfWeek && activityDate <= now) {
        return acc + (curr.distance || 0);
      }
      return acc;
    }, 0);

    return {
      distance: totalDist.toFixed(1),
      calories: totalCals,
      time: Math.floor(totalSeconds / 3600) + "h " + Math.round(((totalSeconds / 3600) % 1) * 60) + "m",
      pace: avgPace,
      rawDistance: totalDist,
      rawWeeklyDistance: rawWeeklyDistance
    };
  }, [activities]);

  // Função para gerar insights da IA
  const generateAIInsight = useCallback(async () => {
    if (!model || !user || !activities.length) {
      setAiInsight("Comece a treinar para receber insights personalizados!");
      return;
    }
    setAiLoading(true);
    try {
      const lastActivity = activities[0]; // A atividade mais recente
      const prompt = `Você é um treinador atlético de elite chamado Atleta Pro. Forneça um insight de desempenho conciso, encorajador e personalizado para o usuário com base em seu perfil e dados de atividade recentes.
      Nome do Usuário: ${user.name}
      Status do Usuário: ${user.status}
      Objetivo do Usuário: ${user.goal}
      Personalidade do Treinador: ${user.coachPersonality || 'Motivador'}
      Distância Total: ${stats.rawDistance} km
      Distância Semanal: ${stats.rawWeeklyDistance} km
      Última Atividade: ${lastActivity?.title || 'Nenhuma'} (${lastActivity?.distance || 0} km em ${lastActivity?.date ? new Date(lastActivity.date).toLocaleDateString('pt-BR') : 'N/A'})
      Foque em motivação, consistência ou alcance de metas. Mantenha o insight com menos de 100 palavras. Comece diretamente com o insight, sem saudações.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setAiInsight(text);
    } catch (error) {
      console.error("Erro ao gerar insight da IA:", error);
      setAiInsight("Não foi possível gerar um insight no momento. Tente novamente mais tarde.");
    } finally {
      setAiLoading(false);
    }
  }, [user, activities, stats]);

  // Chamar a função de IA quando o usuário ou as atividades mudarem
  useEffect(() => {
    if (user && activities.length > 0) {
      generateAIInsight();
    } else if (user && activities.length === 0) {
      setAiInsight("Comece a treinar para receber insights personalizados!");
    }
  }, [user, activities, generateAIInsight]);


  const handleStartWorkout = (config: any) => {
    setActiveWorkout({
      uid: user?.uid,
      type: config.type,
      title: `${config.type} Elite`,
      date: new Date().toISOString(),
      location: 'GPS Ativado',
      targetDistance: config.targetDistance,
      targetTime: config.targetTime,
      terrain: config.terrain,
      voiceCues: config.voiceCues
    });
    navigate(AppScreen.LIVE_ACTIVITY);
  };

  const handleSaveWorkout = async (postWorkoutData: Partial<Activity>) => {
    if (postWorkoutData && user && auth.currentUser) {
      try {
        const finalActivity: any = {
          ...postWorkoutData,
          uid: auth.currentUser.uid,
          mapImage: postWorkoutData.activityImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuCRsdjqI5337F-1_1RzFDvJfX-LCu3jc9gtqXcC1oxi-2nWene8ffUrJeExV5MVzFt17owpCRtgA5IVHald8BHSj9kC7z77Y3jezCH60efr9JyQY3KzXVQzNnI8A7b5910o7fcnwbw8YltTc87nRC0U7U30il8E",
          type: activeWorkout?.type || 'Corrida',
          title: activeWorkout?.title || 'Treino',
          date: new Date().toISOString(),
          location: 'São Paulo, BR',
          distance: postWorkoutData.distance || 0,
          time: postWorkoutData.time || "00:00",
          pace: postWorkoutData.pace || "0'00\"",
          calories: Math.floor((postWorkoutData.distance || 0) * 70),
          heartRate: postWorkoutData.heartRate || 0, // Inclui a frequência cardíaca
          createdAt: serverTimestamp()
        };
        
        // Remove activityImage duplicado se for a mesma coisa que mapImage para economizar espaço
        if (finalActivity.activityImage === finalActivity.mapImage) {
            delete finalActivity.activityImage;
        }

        const activitiesRef = collection(db, "users", auth.currentUser.uid, "activities");
        
        if (postWorkoutData.id) { // Se a atividade já tem um ID, é uma atualização
          await setDoc(doc(activitiesRef, postWorkoutData.id), finalActivity, { merge: true });
          showSuccess("Atividade atualizada com sucesso!");
        } else { // Caso contrário, é uma nova atividade
          await addDoc(activitiesRef, finalActivity);
          showSuccess("Atividade salva com sucesso!");
        }
        
        setActiveWorkout(null);
        navigate(AppScreen.DASHBOARD);
      } catch (error) {
        console.error("Erro ao salvar/atualizar atividade:", error);
        showError("Erro ao salvar/atualizar no banco de dados. Verifique a conexão.");
      }
    }
  };

  if (authLoading) {
      return <div className="h-screen w-full bg-background-dark flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
              <p className="text-white font-black uppercase tracking-[0.3em] text-xs">Sincronizando Nuvem...</p>
          </div>
      </div>;
  }

  if (currentScreen === AppScreen.INITIALIZE) {
    return <InitializeProfile 
      onComplete={() => {}} 
      onSeedData={seedDatabase}
    />;
  }

  const renderScreen = () => {
    if (!user) return null;

    switch (currentScreen) {
      case AppScreen.DASHBOARD:
        return <Dashboard navigate={navigate} user={user} stats={stats} lastActivity={activities[0]} isAdmin={isAdmin} aiInsight={aiInsight} aiLoading={aiLoading} />;
      case AppScreen.START_ACTIVITY:
        return <StartActivity onBack={() => navigate(AppScreen.DASHBOARD)} onStart={handleStartWorkout} />;
      case AppScreen.LIVE_ACTIVITY:
        return <LiveActivity onFinish={(data) => { setActiveWorkout(prev => ({ ...prev, ...data })); navigate(AppScreen.POST_WORKOUT); }} workoutConfig={activeWorkout!} user={user} />;
      case AppScreen.POST_WORKOUT:
        return <PostWorkout onSave={handleSaveWorkout} onDiscard={() => { setActiveWorkout(null); navigate(AppScreen.DASHBOARD); }} workout={activeWorkout} workoutGallery={workoutGallery} />;
      case AppScreen.HISTORY:
        return <History navigate={navigate} activities={activities} onViewActivity={(a) => { setActiveWorkout(a); navigate(AppScreen.POST_WORKOUT); }} />;
      case AppScreen.STATS:
        return <Stats navigate={navigate} activities={activities} user={user} />;
      case AppScreen.PROFILE:
        return <Profile navigate={navigate} user={user} activities={activities} onUpdateUser={handleUpdateUser} onLogout={handleLogout} avatarGallery={avatarGallery} />;
      case AppScreen.MUSIC:
        return <Music onBack={() => navigate(AppScreen.DASHBOARD)} />;
      case AppScreen.ADMIN_DASHBOARD:
        return isAdmin ? <AdminDashboard navigate={navigate} avatarGallery={avatarGallery} workoutGallery={workoutGallery} onUpdateAnyUser={handleUpdateAnyUser} /> : <Dashboard navigate={navigate} user={user} stats={stats} lastActivity={activities[0]} isAdmin={isAdmin} aiInsight={aiInsight} aiLoading={aiLoading} />;
      default:
        return <Dashboard navigate={navigate} user={user} stats={stats} lastActivity={activities[0]} isAdmin={isAdmin} aiInsight={aiInsight} aiLoading={aiLoading} />;
    }
  };

  const showBottomNav = [AppScreen.DASHBOARD, AppScreen.HISTORY, AppScreen.PROFILE, AppScreen.STATS].includes(currentScreen);

  return (
    <div className="relative h-[100dvh] w-full max-w-md mx-auto bg-background-dark shadow-2xl flex flex-col overflow-hidden selection:bg-primary/30">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {renderScreen()}
      </div>
      {showBottomNav && <BottomNav currentScreen={currentScreen} onNavigate={navigate} />}
    </div>
  );
};

export default App;