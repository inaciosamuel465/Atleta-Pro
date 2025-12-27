
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { APP_LOGO } from '../constants';

interface InitializeProfileProps {
  onComplete: (data: any) => void;
  onSeedData: (uid: string, data: UserProfile) => Promise<boolean>;
}

const InitializeProfile: React.FC<InitializeProfileProps> = ({ onComplete, onSeedData }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default values for registration
  const [gender, setGender] = useState<'M' | 'F' | 'O'>('M');
  const [experience, setExperience] = useState('Runner');
  const [goal, setGoal] = useState('Health');
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(70);
  const [age, setAge] = useState<number>(25);
  const [personality, setPersonality] = useState<'Motivador' | 'Técnico' | 'Zen'>('Motivador');

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) {
      setError('Preencha as credenciais.');
      return;
    }

    setIsLoading(true);
    
    try {
        if (mode === 'register') {
            if (!name) throw new Error("Informe seu nome.");
            
            // 1. Criar Usuário no Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // 2. Preparar dados do perfil
            const profileData: UserProfile = {
              uid,
              name,
              email,
              gender,
              status: `${experience} Elite`,
              goal,
              height,
              weight,
              age,
              coachPersonality: personality,
              level: 1,
              avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop",
              weeklyGoal: 20,
              monthlyGoal: 80,
              voiceCues: true
            };
            
            // 3. Criar tabelas/documentos no Firestore automaticamente
            await onSeedData(uid, profileData);
        } else {
            // Login Simples
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (err: any) {
        console.error(err);
        let msg = "Erro na autenticação.";
        if (err.code === 'auth/email-already-in-use') msg = "E-mail já cadastrado.";
        if (err.code === 'auth/wrong-password') msg = "Senha incorreta.";
        if (err.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
        if (err.code === 'auth/weak-password') msg = "Senha muito fraca.";
        setError(msg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#101922] pb-20 overflow-y-auto no-scrollbar animate-in fade-in duration-500">
      <div className="flex flex-col items-center pt-24 px-6">
        
        {/* LOGO AREA */}
        <div className="relative mb-10 group">
           <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full group-hover:bg-primary/30 transition-all duration-700"></div>
           <img 
              src={APP_LOGO} 
              className="w-48 h-48 object-contain relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)] animate-float" 
              alt="Atleta Pro Logo" 
           />
        </div>

        <h1 className="text-white text-5xl font-black tracking-tighter mb-2 italic">Atleta Pro</h1>
        <p className="text-slate-500 text-[10px] font-black tracking-[0.4em] uppercase mb-12">Elite Performance System</p>
        
        <div className="w-full flex bg-surface-dark/50 p-1 rounded-2xl border border-white/5 mb-8">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
          >
            Login Cloud
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'register' ? 'bg-primary text-white shadow-lg' : 'text-slate-500'}`}
          >
            Novo Atleta
          </button>
        </div>

        <div className="w-full space-y-6">
          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20 animate-pulse">{error}</p>}
          
          <div className="space-y-4">
            {mode === 'register' && (
              <input 
                className="w-full h-14 bg-surface-dark/40 border border-slate-800 rounded-2xl px-5 text-white outline-none focus:border-primary transition-all placeholder:text-slate-600 font-bold" 
                placeholder="Nome do Atleta" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            )}
            <input 
              className="w-full h-14 bg-surface-dark/40 border border-slate-800 rounded-2xl px-5 text-white outline-none focus:border-primary transition-all placeholder:text-slate-600 font-bold" 
              placeholder="E-mail" 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
            <input 
              className="w-full h-14 bg-surface-dark/40 border border-slate-800 rounded-2xl px-5 text-white outline-none focus:border-primary transition-all placeholder:text-slate-600 font-bold" 
              type="password" 
              placeholder="Senha" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-20 bg-primary mt-12 rounded-[2.5rem] flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 active:scale-95 hover:brightness-110 transition-all"
        >
          {isLoading ? (
            <div className="size-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="text-white text-xl font-black uppercase tracking-[0.2em] italic">
                {mode === 'login' ? 'Acessar Nuvem' : 'Criar Perfil'}
              </span>
              <span className="material-symbols-outlined text-white text-3xl font-black">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InitializeProfile;
