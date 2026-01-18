import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, query, orderBy, setDoc, addDoc, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore'; // Importar getDocs para verificar coleção
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { showSuccess, showError } from './src/utils/toast';
import { GoogleGenerativeAI } from '@google/generative-ai';

import { AppScreen, UserProfile, Activity, Challenge, TrainingProgram, ProgramActivity } from './types';
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
import TrainingPrograms from './pages/TrainingPrograms'; // Importar a nova tela

// Components
import BottomNav from './components/BottomNav';

// Inicializar a API Gemini
const API_KEY = process.env.GEMINI_API_KEY;
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
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]); // Novo estado para programas de treino
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [programActivityToStart, setProgramActivityToStart] = useState<{ programId: string; activity: ProgramActivity } | null>(null); // Novo estado

  const isAdmin = user?.email === 'admin@atleta.com';

  // --- FIREBASE AUTH & DATA LISTENER ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
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

        // 4. Ouvir Desafios em Tempo Real
        const challengesRef = collection(db, "challenges");
        const unsubChallenges = onSnapshot(challengesRef, async (snapshot) => {
          const loadedChallenges: Challenge[] = [];
          snapshot.forEach((doc) => {
            loadedChallenges.push({ id: doc.id, ...doc.data() } as Challenge);
          });
          setChallenges(loadedChallenges);

          // Se a coleção de desafios estiver vazia, adicione alguns desafios padrão
          if (loadedChallenges.length === 0) {
            const defaultChallenges: Omit<Challenge, 'id'>[] = [
              {
                title: 'Maratona de Iniciante',
                description: 'Complete 10km em uma semana para desbloquear esta medalha.',
                progress: '0% Concluído',
                icon: 'directions_run',
                color: 'blue-500'
              },
              {
                title: 'Desafio de Velocidade',
                description: 'Mantenha um ritmo médio abaixo de 5\'30"/km por 3km.',
                progress: '0% Concluído',
                icon: 'speed',
                color: 'emerald-500'
              },
              {
                title: 'Caminhada da Natureza',
                description: 'Faça uma caminhada de 5km em terreno de trilha.',
                progress: '0% Concluído',
                icon: 'hiking',
                color: 'orange-500'
              },
            ];

            for (const challenge of defaultChallenges) {
              await addDoc(challengesRef, challenge);
            }
            console.log("Desafios padrão adicionados ao Firestore.");
          }
        });

        // 5. Ouvir Programas de Treino em Tempo Real
        const trainingProgramsRef = collection(db, "trainingPrograms");
        const unsubTrainingPrograms = onSnapshot(trainingProgramsRef, async (snapshot) => {
          const loadedPrograms: TrainingProgram[] = [];
          snapshot.forEach((doc) => {
            loadedPrograms.push({ id: doc.id, ...doc.data() } as TrainingProgram);
          });
          setTrainingPrograms(loadedPrograms);

          // Se a coleção de programas de treino estiver vazia, adicione alguns programas padrão
          if (loadedPrograms.length === 0) {
            const defaultPrograms: Omit<TrainingProgram, 'id'>[] = [
              {
                name: 'Programa 5K para Iniciantes',
                description: 'Um programa de 8 semanas para te levar do sofá aos 5km, com foco em consistência e progressão gradual.',
                durationWeeks: 8,
                level: 'Iniciante',
                focus: 'Resistência',
                image: 'https://images.unsplash.com/photo-1574680096145-d05b4747414c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80',
                activities: [
                  { id: 'act1', day: 1, title: 'Caminhada Leve', description: '30 minutos de caminhada.', type: 'Caminhada', targetTime: 30, isCompleted: false },
                  { id: 'act2', day: 3, title: 'Corrida/Caminhada', description: 'Alternar 1 min de corrida, 2 min de caminhada (total 20 min).', type: 'Corrida', targetTime: 20, isCompleted: false },
                  { id: 'act3', day: 5, title: 'Caminhada Longa', description: '45 minutos de caminhada.', type: 'Caminhada', targetTime: 45, isCompleted: false },
                ]
              },
              {
                name: 'Desafio de Velocidade 10K',
                description: 'Programa de 12 semanas para melhorar seu tempo nos 10km, com treinos intervalados e de ritmo.',
                durationWeeks: 12,
                level: 'Intermediário',
                focus: 'Velocidade',
                image: 'https://images.unsplash.com/photo-1505751172876-fa1923c58541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80',
                activities: [
                  { id: 'act4', day: 1, title: 'Corrida de Base', description: '45 minutos de corrida leve.', type: 'Corrida', targetTime: 45, isCompleted: false },
                  { id: 'act5', day: 3, title: 'Intervalado Curto', description: 'Aquecimento, 6x (1 min rápido, 2 min lento), desaquecimento.', type: 'Intervalado', targetTime: 30, isCompleted: false },
                  { id: 'act6', day: 5, title: 'Tempo Run', description: '10 min aquecimento, 20 min ritmo moderado, 10 min desaquecimento.', type: 'Corrida', targetTime: 40, isCompleted: false },
                ]
              },
            ];

            for (const program of defaultPrograms) {
              await addDoc(trainingProgramsRef, program);
            }
            console.log("Programas de treino padrão adicionados ao Firestore.");
          }
        });


        return () => {
          unsubUser();
          unsubActivities();
          unsubAppSettings();
          unsubChallenges();
          unsubTrainingPrograms(); // Limpar o listener de programas de treino
        };
      } else {
        setUser(null);
        setActivities([]);
        setAuthLoading(false);
        setCurrentScreen(AppScreen.INITIALIZE);
        setAvatarGallery([]);
        setWorkoutGallery([]);
        setChallenges([]);
        setTrainingPrograms([]); // Limpar programas de treino ao deslogar
      }
    });

    return () => unsubscribeAuth();
  }, [currentScreen]);

  const navigate = useCallback((screen: AppScreen) => {
    setCurrentScreen(screen);
  }, []);

  // Helper para upload de imagem para o Firebase Storage
  const uploadImageAndGetUrl = async (uid: string, base64String: string, path: string = 'images'): Promise<string> => {
    const storageRef = ref(storage, `${path}/${uid}/${Date.now()}.png`);
    await uploadString(storageRef, base64String, 'data_url');
    return getDownloadURL(storageRef);
  };

  const handleUpdateUser = async (updatedData: Partial<UserProfile>) => {
    if (user && auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        
        // Se o avatar for uma string base64, faça o upload para o Storage
        if (updatedData.avatar && updatedData.avatar.startsWith('data:image/')) {
          const imageUrl = await uploadImageAndGetUrl(auth.currentUser.uid, updatedData.avatar, 'avatars');
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
          const imageUrl = await uploadImageAndGetUrl(uid, updatedData.avatar, 'avatars');
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

    // Calculate weekly distance (current week: Monday to today)
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

    // Calculate monthly distance (current month: 1st to today)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const rawMonthlyDistance = activities.reduce((acc, curr) => {
      const activityDate = new Date(curr.date);
      activityDate.setHours(0, 0, 0, 0);
      if (activityDate >= startOfMonth && activityDate <= now) {
        return acc + (curr.distance || 0);
      }
      return acc;
    }, 0);

    return {
      totalDistance: totalDist.toFixed(1), // Renamed for clarity
      calories: totalCals,
      time: Math.floor(totalSeconds / 3600) + "h " + Math.round(((totalSeconds / 3600) % 1) * 60) + "m",
      pace: avgPace,
      rawTotalDistance: totalDist, // Raw total distance
      rawWeeklyDistance: rawWeeklyDistance,
      rawMonthlyDistance: rawMonthlyDistance // New monthly distance
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
      Distância Total: ${stats.rawTotalDistance} km
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
      voiceCues: config.voiceCues,
      programId: config.programId, // Adicionar programId
      programActivityId: config.programActivityId // Adicionar programActivityId
    });
    navigate(AppScreen.LIVE_ACTIVITY);
  };

  // Nova função para iniciar uma atividade de programa diretamente do modal
  const handleStartProgramActivityFromModal = useCallback((programId: string, activity: ProgramActivity) => {
    setProgramActivityToStart({ programId, activity });
    navigate(AppScreen.START_ACTIVITY);
  }, [navigate]);

  // Efeito para limpar programActivityToStart após iniciar o treino
  useEffect(() => {
    if (currentScreen !== AppScreen.START_ACTIVITY && programActivityToStart) {
      setProgramActivityToStart(null);
    }
  }, [currentScreen, programActivityToStart]);


  const handleSaveWorkout = async (postWorkoutData: Partial<Activity>) => {
    if (postWorkoutData && user && auth.currentUser) {
      try {
        let finalActivityImage = postWorkoutData.activityImage;
        // Se a activityImage for uma string base64, faça o upload para o Storage
        if (finalActivityImage && finalActivityImage.startsWith('data:image/')) {
          finalActivityImage = await uploadImageAndGetUrl(auth.currentUser.uid, finalActivityImage, 'activity_images');
        }

        const finalActivity: any = {
          ...postWorkoutData,
          uid: auth.currentUser.uid,
          mapImage: postWorkoutData.mapImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuCRsdjqI5337F-1_1RzFDvJfX-LCu3jc9gtrXcC1oxi-2nWene8ffUrJeExV5MVzFt17owpCRtgA5IVHald8BHSj9kC7z77Y3jezCH60efr9JyQY3KzXVQzNnI8A7b5910o7fcnwbw8YltTc87nRC0U7U30il8E",
          activityImage: finalActivityImage, // Usar a URL do Storage ou a original
          type: activeWorkout?.type || 'Corrida',
          title: activeWorkout?.title || 'Treino',
          date: new Date().toISOString(),
          location: 'São Paulo, BR',
          distance: postWorkoutData.distance || 0,
          time: postWorkoutData.time || "00:00",
          pace: postWorkoutData.pace || "0'00\"",
          calories: Math.floor((postWorkoutData.distance || 0) * 70),
          heartRate: postWorkoutData.heartRate || 0,
          createdAt: serverTimestamp(),
          programId: activeWorkout?.programId, // Salvar programId
          programActivityId: activeWorkout?.programActivityId // Salvar programActivityId
        };
        
        // Remove activityImage duplicado se for a mesma coisa que mapImage para economizar espaço
        if (finalActivity.activityImage === finalActivity.mapImage) {
            delete finalActivity.activityImage;
        }

        const activitiesRef = collection(db, "users", auth.currentUser.uid, "activities");
        
        if (postWorkoutData.id) {
          await setDoc(doc(activitiesRef, postWorkoutData.id), finalActivity, { merge: true });
          showSuccess("Atividade atualizada com sucesso!");
        } else {
          const newActivityRef = await addDoc(activitiesRef, finalActivity);
          showSuccess("Atividade salva com sucesso!");

          // Se a atividade pertencer a um programa, marcar como concluída no perfil do usuário
          if (finalActivity.programId && finalActivity.programActivityId && user) {
            const userDocRef = doc(db, "users", auth.currentUser.uid);
            const completedActivities = user.completedProgramActivities || {};
            const programCompletedActivities = completedActivities[finalActivity.programId] || [];

            if (!programCompletedActivities.includes(finalActivity.programActivityId)) {
              programCompletedActivities.push(finalActivity.programActivityId);
              completedActivities[finalActivity.programId] = programCompletedActivities;
              await setDoc(userDocRef, { completedProgramActivities: completedActivities }, { merge: true });
              showSuccess("Atividade do programa marcada como concluída!");
            }
          }
        }
        
        setActiveWorkout(null);
        navigate(AppScreen.DASHBOARD);
      } catch (error) {
        console.error("Erro ao salvar/atualizar atividade:", error);
        showError("Erro ao salvar/atualizar no banco de dados. Verifique a conexão.");
      }
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (user && auth.currentUser) {
      try {
        const activityDocRef = doc(db, "users", auth.currentUser.uid, "activities", activityId);
        await deleteDoc(activityDocRef);
        showSuccess("Atividade deletada com sucesso!");
        setActiveWorkout(null); // Limpa a atividade ativa se for a que foi deletada
        navigate(AppScreen.HISTORY); // Volta para o histórico
      } catch (error) {
        console.error("Erro ao deletar atividade:", error);
        showError("Erro ao deletar atividade. Tente novamente.");
      }
    }
  };

  // Função para atualizar um desafio (usada pelo AdminEditChallenge)
  const handleUpdateChallenge = async (challengeId: string, updatedData: Partial<Challenge>) => {
    if (isAdmin) {
      try {
        const challengeDocRef = doc(db, "challenges", challengeId);
        await setDoc(challengeDocRef, updatedData, { merge: true });
        showSuccess("Desafio atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar desafio:", error);
        showError("Erro ao atualizar desafio.");
      }
    } else {
      showError("Você não tem permissão para editar desafios.");
    }
  };

  // Função para deletar um desafio (usada pelo AdminDashboard)
  const handleDeleteChallenge = async (challengeId: string) => {
    if (isAdmin) {
      try {
        const challengeDocRef = doc(db, "challenges", challengeId);
        await deleteDoc(challengeDocRef);
        showSuccess("Desafio deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar desafio:", error);
        showError("Erro ao deletar desafio.");
      }
    } else {
      showError("Você não tem permissão para deletar desafios.");
    }
  };

  // Função para o usuário se inscrever em um programa de treino
  const handleEnrollInProgram = async (programId: string) => {
    if (user && auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userDocRef, { 
          activeTrainingProgramId: programId,
          completedProgramActivities: {} // Resetar atividades concluídas para o novo programa
        }, { merge: true });
        showSuccess("Você se inscreveu no programa de treino!");
        navigate(AppScreen.DASHBOARD); // Voltar para o dashboard
      } catch (error) {
        console.error("Erro ao se inscrever no programa:", error);
        showError("Erro ao se inscrever no programa de treino.");
      }
    }
  };

  // Calcula a próxima atividade do programa de treino ativo
  const nextProgramActivity = useMemo(() => {
    if (!user || !user.activeTrainingProgramId || !trainingPrograms.length) return null;

    const activeProgram = trainingPrograms.find(p => p.id === user.activeTrainingProgramId);
    if (!activeProgram) return null;

    const completedActivities = user.completedProgramActivities?.[activeProgram.id] || [];
    
    // Encontra a primeira atividade não concluída
    const nextActivity = activeProgram.activities.find(activity => 
      !completedActivities.includes(activity.id)
    );

    if (nextActivity) {
      return { program: activeProgram, activity: nextActivity };
    }
    return null;
  }, [user, trainingPrograms]);


  if (authLoading) {
      return <div className="h-screen w-full bg-background-light flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
              <p className="text-text-dark font-black uppercase tracking-[0.3em] text-xs">Sincronizando Nuvem...</p>
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
        return <Dashboard 
          navigate={navigate} 
          user={user} 
          stats={stats} 
          lastActivity={activities[0]} 
          isAdmin={isAdmin} 
          aiInsight={aiInsight} 
          aiLoading={aiLoading} 
          challenges={challenges} 
          nextProgramActivity={nextProgramActivity} // Passar a próxima atividade
        />;
      case AppScreen.START_ACTIVITY:
        return <StartActivity 
          onBack={() => navigate(AppScreen.DASHBOARD)} 
          onStart={handleStartWorkout} 
          programActivityConfig={programActivityToStart} // Passar a config da atividade do programa
        />;
      case AppScreen.LIVE_ACTIVITY:
        return <LiveActivity onFinish={(data) => { setActiveWorkout(prev => ({ ...prev, ...data })); navigate(AppScreen.POST_WORKOUT); }} workoutConfig={activeWorkout!} user={user} />;
      case AppScreen.POST_WORKOUT:
        return <PostWorkout 
          onSave={handleSaveWorkout} 
          onDiscard={() => { setActiveWorkout(null); navigate(AppScreen.DASHBOARD); }} 
          onDelete={handleDeleteActivity} // Passar a função de deletar
          workout={activeWorkout} 
          workoutGallery={workoutGallery} 
          isHistorical={activeWorkout?.id !== undefined} // Determinar se é histórico
        />;
      case AppScreen.HISTORY:
        return <History navigate={navigate} activities={activities} onViewActivity={(a) => { setActiveWorkout(a); navigate(AppScreen.POST_WORKOUT); }} />;
      case AppScreen.STATS:
        return <Stats navigate={navigate} activities={activities} user={user} />;
      case AppScreen.PROFILE:
        return <Profile navigate={navigate} user={user} activities={activities} onUpdateUser={handleUpdateUser} onLogout={handleLogout} avatarGallery={avatarGallery} />;
      case AppScreen.MUSIC:
        return <Music onBack={() => navigate(AppScreen.DASHBOARD)} />;
      case AppScreen.ADMIN_DASHBOARD:
        return isAdmin ? <AdminDashboard 
          navigate={navigate} 
          avatarGallery={avatarGallery} 
          workoutGallery={workoutGallery} 
          onUpdateAnyUser={handleUpdateAnyUser} 
          challenges={challenges} 
          onUpdateChallenge={handleUpdateChallenge} 
          onDeleteChallenge={handleDeleteChallenge} 
        /> : <Dashboard navigate={navigate} user={user} stats={stats} lastActivity={activities[0]} isAdmin={isAdmin} aiInsight={aiInsight} aiLoading={aiLoading} challenges={challenges} />;
      case AppScreen.TRAINING_PROGRAMS: // Nova rota para Programas de Treino
        return <TrainingPrograms 
          navigate={navigate} 
          trainingPrograms={trainingPrograms} 
          onEnrollInProgram={handleEnrollInProgram}
          userActiveProgramId={user.activeTrainingProgramId}
          userCompletedProgramActivities={user.completedProgramActivities}
          onStartProgramActivity={handleStartProgramActivityFromModal} // Passar a nova função
        />;
      default:
        return <Dashboard navigate={navigate} user={user} stats={stats} lastActivity={activities[0]} isAdmin={isAdmin} aiInsight={aiInsight} aiLoading={aiLoading} challenges={challenges} />;
    }
  };

  const showBottomNav = [AppScreen.DASHBOARD, AppScreen.HISTORY, AppScreen.PROFILE, AppScreen.STATS, AppScreen.TRAINING_PROGRAMS].includes(currentScreen);

  return (
    <div className="relative h-[100dvh] w-full max-w-md mx-auto bg-background-light shadow-2xl flex flex-col overflow-hidden selection:bg-primary/30">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {renderScreen()}
      </div>
      {showBottomNav && <BottomNav currentScreen={currentScreen} onNavigate={navigate} />}
    </div>
  );
};

export default App;