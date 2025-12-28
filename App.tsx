import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, query, orderBy, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage'; // Import storage functions
import { auth, db, storage } from './firebase'; // Import storage
import { showSuccess, showError } from './src/utils/toast'; // Importar funções de toast

import { AppScreen, UserProfile, Activity, AIInsight } from './types';
import { DUMMY_ACTIVITIES, INITIAL_USER } from './constants';

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
import AdminDashboard from './pages/AdminDashboard'; // Importar o novo componente AdminDashboard

// Components
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.INITIALIZE);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Partial<Activity> | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [avatarGallery, setAvatarGallery] = useState<string[]>([]);
  const [workoutGallery, setWorkoutGallery] = useState<string[]>([]);

  const hasShownAiErrorToast = useRef(false); // Ref para controlar o toast de erro da IA

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
        hasShownAiErrorToast.current = false; // Resetar ao deslogar
      }
    });

    return () => unsubscribeAuth();
  }, [currentScreen]);

  // Gerador de Insights Inteligentes com Gemini
  useEffect(() => {
    if (activities.length > 0 && !aiInsight && !isGeneratingInsight && user && process.env.API_KEY) {
      const getInsight = async () => {
        setIsGeneratingInsight(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const lastActivity = activities[0];
          const today = new Date().toLocaleDateString('pt-BR');
          
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Você é um coach de performance de elite com personalidade ${user.coachPersonality || 'Motivador'}. 
            Analise o último treino de ${user.name} em ${lastActivity.date} com Distância: ${lastActivity.distance}km, Ritmo: ${lastActivity.pace}. 
            Considerando que hoje é ${today}, forneça um insight técnico motivador extremamente curto (max 15 palavras) para o dashboard do app, 
            que seja relevante para o dia atual ou para o próximo objetivo do atleta.`,
          });
          
          const text = response.text;
          if (text) {
            setAiInsight({
              title: "Coach Elite IA",
              message: text.replace(/[#*]/g, '').trim(),
              action: "Ver Análise"
            });
          }
        } catch (e) {
          console.error("Erro ao gerar insight IA:", e);
          // Mostrar erro apenas para admin e uma vez por sessão
          if (isAdmin && !hasShownAiErrorToast.current) {
            showError("Erro ao gerar insight de IA. Verifique sua chave API."); 
            hasShownAiErrorToast.current = true;
          }
        } finally {
          setIsGeneratingInsight(false);
        }
      };
      
      const timer = setTimeout(getInsight, 3000);
      return () => clearTimeout(timer);
    }
  }, [activities, aiInsight, isGeneratingInsight, user, isAdmin]); // Adicionado isAdmin às dependências

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
        showSuccess("Perfil atualizado com sucesso!"); // Toast de sucesso
      } catch (error) {
        console.error("Erro ao atualizar perfil no Firestore:", error);
        showError("Erro ao sincronizar perfil com a nuvem."); // Toast de erro
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
        setAiInsight(null);
        showSuccess("Você saiu da sua conta."); // Toast de sucesso
      } catch (error) {
        console.error("Erro ao sair:", error);
        showError("Erro ao sair da conta."); // Toast de erro
      }
  };

  const seedDatabase = async (uid: string, profileData: UserProfile) => {
      try {
          await setDoc(doc(db, "users", uid), profileData);
          // Removido: addDoc(actRef, dummyAct);
          showSuccess("Dados iniciais carregados com sucesso!"); // Toast de sucesso
          return true;
      } catch (e) {
          console.error("Erro ao semear banco:", e);
          showError("Erro ao carregar dados iniciais."); // Toast de erro
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
      rawWeeklyDistance: rawWeeklyDistance // Adicionado
    };
  }, [activities]);

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
          // Prioriza a imagem gerada (snapshot) em vez do fallback estático
          mapImage: postWorkoutData.activityImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuCRsdjqI5337F-1_1RzFDvJfX-LCu3jc9gtqXcC1oxi-2nWene8ffUrJeExV5MVzFt17owpCRtgA5IVHald8BHSj9kC7z77Y3jezCH60efr9JyQY3KzXVQzNnI8A7b5910o7fcnwbw8YltTc87nRC0U7U30il8E",
          type: activeWorkout?.type || 'Corrida',
          title: activeWorkout?.title || 'Treino',
          date: new Date().toISOString(),
          location: 'São Paulo, BR',
          distance: postWorkoutData.distance || 0,
          time: postWorkoutData.time || "00:00",
          pace: postWorkoutData.pace || "0'00\"",
          calories: Math.floor((postWorkoutData.distance || 0) * 70),
          createdAt: serverTimestamp()
        };
        
        // Remove activityImage duplicado se for a mesma coisa que mapImage para economizar espaço
        if (finalActivity.activityImage === finalActivity.mapImage) {
            delete finalActivity.activityImage;
        }

        const activitiesRef = collection(db, "users", auth.currentUser.uid, "activities");
        await addDoc(activitiesRef, finalActivity);
        
        setActiveWorkout(null);
        setAiInsight(null);
        navigate(AppScreen.DASHBOARD);
        showSuccess("Atividade salva com sucesso!"); // Toast de sucesso
      } catch (error) {
        console.error("Erro ao salvar atividade:", error);
        showError("Erro ao salvar no banco de dados. Verifique a conexão."); // Toast de erro
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
        return <Dashboard navigate={navigate} user={user} stats={stats} lastActivity={activities[0]} aiInsight={aiInsight} isGeneratingInsight={isGeneratingInsight} isAdmin={isAdmin} />;
      case AppScreen.START_ACTIVITY:
        return <StartActivity onBack={() => navigate(AppScreen.DASHBOARD)} onStart={handleStartWorkout} />;
      case AppScreen.LIVE_ACTIVITY:
        return <LiveActivity onFinish={(data) => { setActiveWorkout(prev => ({ ...prev, ...data })); navigate(AppScreen.POST_WORKOUT); }} workoutConfig={activeWorkout!} user={user} />;
      case AppScreen.POST_WORKOUT:
        return <PostWorkout onSave={handleSaveWorkout} onDiscard={() => { setActiveWorkout(null); navigate(AppScreen.DASHBOARD); }} workout={activeWorkout} workoutGallery={workoutGallery} />;
      case AppScreen.HISTORY:
        return <History navigate={navigate} activities={activities} onViewActivity={(a) => { setActiveWorkout(a); navigate(AppScreen.POST_WORKOUT); }} />;
      case AppScreen.STATS:
        return <Stats navigate={navigate} activities={activities} />;
      case AppScreen.PROFILE:
        return <Profile navigate={navigate} user={user} activities={activities} onUpdateUser={handleUpdateUser} onLogout={handleLogout} avatarGallery={avatarGallery} />;
      case AppScreen.MUSIC:
        return <Music onBack={() => navigate(AppScreen.DASHBOARD)} />;
      case AppScreen.ADMIN_DASHBOARD:
        return isAdmin ? <AdminDashboard navigate={navigate} avatarGallery={avatarGallery} workoutGallery={workoutGallery} onUpdateAnyUser={handleUpdateAnyUser} /> : <Dashboard navigate={navigate} user={user} stats={stats} lastActivity={activities[0]} aiInsight={aiInsight} isGeneratingInsight={isGeneratingInsight} isAdmin={isAdmin} />;
      default:
        return <Dashboard navigate={navigate} user={user} stats={stats} lastActivity={activities[0]} aiInsight={aiInsight} isGeneratingInsight={isGeneratingInsight} isAdmin={isAdmin} />;
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