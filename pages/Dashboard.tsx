import React, { useState } from 'react';
import { AppScreen, UserProfile, Activity, Challenge } from '../types'; // AIInsight removido
import ChallengeDetailModal from '../components/ChallengeDetailModal';

interface DashboardProps {
  navigate: (screen: AppScreen) => void;
  user: UserProfile;
  stats: { distance: string; calories: string | number; time: string; pace: string; rawDistance: number; rawWeeklyDistance: number };
  lastActivity: Activity | undefined;
  isAdmin: boolean;
  aiInsight: string | null; // Nova prop para o insight da IA
  aiLoading: boolean; // Nova prop para o estado de carregamento da IA
}

const Dashboard: React.FC<DashboardProps> = ({ navigate, user, stats, lastActivity, isAdmin, aiInsight, aiLoading }) => {
  const MONTHLY_GOAL = user.monthlyGoal || 80;
  const WEEKLY_GOAL = user.weeklyGoal || 20;
  
  const monthlyProgressPercent = Math.min(Math.round((stats.rawDistance / MONTHLY_GOAL) * 100), 100);
  const weeklyProgressPercent = Math.min(Math.round((stats.rawWeeklyDistance / WEEKLY_GOAL) * 100), 100);

  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Desafio semanal fictício para demonstração
  const weeklyChallenge: Challenge = {
    id: 'weekly-run-5k',
    title: 'Desafio da Semana',
    description: 'Complete 3 treinos de corrida acima de 5km para ganhar a medalha "Maratonista Júnior" e 50 pontos de XP!',
    progress: '33%', // Exemplo de progresso
    icon: 'military_tech',
    color: 'orange',
  };

  return (
    <div className="pb-40 bg-background-dark min-h-screen relative no-scrollbar overflow-y-auto animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <header className="flex items-center px-6 pt-14 pb-8 justify-between sticky top-0 bg-background-dark/80 backdrop-blur-2xl z-40 border-b border-white/[0.03]">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => navigate(AppScreen.PROFILE)}>
            <div className="absolute -inset-2 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
            <img src={user.avatar} className="size-16 rounded-2xl border-2 border-primary/20 object-cover relative z-10 transition-transform active:scale-95 shadow-2xl" alt="User" />
            <div className="absolute -bottom-1 -right-1 size-5 bg-accent-green rounded-full border-4 border-background-dark z-20"></div>
          </div>
          <div>
            <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] italic mb-0.5 block animate-pulse">Status: Elite Lvl {Math.floor(stats.rawDistance/5) + 1}</span>
            <h2 className="text-white text-3xl font-black tracking-tighter italic uppercase font-lexend leading-none">{user.name.split(' ')[0]}</h2>
          </div>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={() => navigate(AppScreen.ADMIN_DASHBOARD)}
              className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary active:scale-90 transition-all hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-2xl font-bold">admin_panel_settings</span>
            </button>
          )}
          <button className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all hover:bg-white/10">
            <span className="material-symbols-outlined text-2xl font-bold">notifications</span>
          </button>
        </div>
      </header>

      <main className="px-6 space-y-8 pt-6">
        {/* Progress Card - "Ultra High" Aesthetic (Monthly Goal) */}
        <section className="bg-gradient-to-br from-surface-dark via-surface-accent to-background-dark rounded-[3rem] p-10 border border-white/[0.05] shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-accent-green/5 blur-[80px] rounded-full"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-white text-xl font-black italic uppercase tracking-tight font-lexend">Meta Mensal</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 italic">Road to Performance</p>
            </div>
            <div className="text-right">
              <span className="text-white text-5xl font-black italic font-lexend tracking-tighter elite-gradient-text">{stats.distance}</span>
              <span className="text-slate-600 text-xs font-black italic ml-2">/ {MONTHLY_GOAL} KM</span>
            </div>
          </div>

          <div className="relative h-4 bg-white/[0.03] rounded-full overflow-hidden p-1 border border-white/[0.05] mb-6">
            <div 
              className="h-full bg-gradient-to-r from-primary via-blue-400 to-accent-green rounded-full transition-all duration-1000 shadow-[0_0_25px_rgba(37,140,244,0.4)]" 
              style={{ width: `${monthlyProgressPercent}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 relative z-10">
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary"></span> {monthlyProgressPercent}% atingido</span>
            <span className="text-primary italic animate-bounce-slow">Keep Moving Elite &gt;</span>
          </div>
        </section>

        {/* Weekly Goal Card */}
        <section className="bg-surface-dark/60 rounded-[3rem] p-8 border border-white/[0.05] shadow-lg relative overflow-hidden group">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent-green/10 blur-[50px] rounded-full group-hover:bg-accent-green/20 transition-all duration-700"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-white text-xl font-black italic uppercase tracking-tight font-lexend">Meta Semanal</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 italic">Foco na Consistência</p>
                </div>
                <div className="text-right">
                    <span className="text-white text-4xl font-black italic font-lexend tracking-tighter text-accent-green">{stats.rawWeeklyDistance.toFixed(1)}</span>
                    <span className="text-slate-600 text-xs font-black italic ml-2">/ {WEEKLY_GOAL} KM</span>
                </div>
            </div>
            <div className="relative h-3 bg-white/[0.03] rounded-full overflow-hidden p-0.5 border border-white/[0.05] mb-4">
                <div 
                    className="h-full bg-gradient-to-r from-accent-green via-emerald-400 to-green-600 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(0,230,118,0.4)]" 
                    style={{ width: `${weeklyProgressPercent}%` }}
                />
            </div>
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 relative z-10">
                <span>{weeklyProgressPercent}% atingido</span>
                <span className="text-accent-green italic">Mais um passo &gt;</span>
            </div>
        </section>

        {/* Weekly Challenge Card */}
        <section className="bg-surface-dark/40 rounded-[3rem] p-8 border border-white/[0.05] shadow-lg relative overflow-hidden group">
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full group-hover:bg-orange-500/20 transition-all duration-700"></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="size-14 rounded-2xl bg-accent-orange/20 flex items-center justify-center text-accent-orange shadow-inner border border-accent-orange/10">
                    <span className="material-symbols-outlined text-3xl">military_tech</span>
                </div>
                <div>
                    <h3 className="text-white text-xl font-black italic uppercase tracking-tight font-lexend">Desafio da Semana</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1 italic">Conquiste a Glória</p>
                </div>
            </div>
            <p className="text-white text-lg font-bold italic leading-snug font-lexend relative z-10">
                {weeklyChallenge.description}
            </p>
            <div className="flex justify-between items-center mt-6 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progresso: {weeklyChallenge.progress}</span>
                <button onClick={() => setShowChallengeModal(true)} className="text-primary text-[10px] font-black uppercase tracking-widest border-b border-primary/20 pb-0.5">Ver Detalhes</button>
            </div>
        </section>

        {/* Performance Tip Widget (AI Insight) */}
        <section className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/50 to-accent-green/50 rounded-[3rem] blur opacity-15 group-hover:opacity-25 transition-all"></div>
          <div className="relative glass-card rounded-[3rem] p-10 overflow-hidden border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                  <span className="material-symbols-outlined text-3xl">bolt</span>
                </div>
                <div>
                  <h4 className="text-white text-[11px] font-black uppercase tracking-[0.3em] font-display">Dica de Performance</h4>
                  <div className="flex gap-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-white text-xl font-bold italic leading-snug font-lexend">
              {aiLoading ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
                  Gerando insight...
                </span>
              ) : (
                aiInsight || "Comece a treinar para receber insights personalizados!"
              )}
            </p>
          </div>
        </section>

        {/* Stats Grid - "Glassmorphism" Style */}
        <div className="grid grid-cols-2 gap-5">
          {[
            { label: 'Energia', val: stats.calories, unit: 'kcal', icon: 'local_fire_department', color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
            { label: 'Ritmo Médio', val: stats.pace, unit: '', icon: 'speed', color: 'text-primary', bg: 'bg-primary/10' }
          ].map((item, i) => (
            <div key={i} className="bg-surface-dark/40 rounded-[2.5rem] p-8 border border-white/[0.05] space-y-5 transition-all hover:bg-surface-dark/60">
              <div className={`size-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-lg`}>
                <span className="material-symbols-outlined text-3xl font-black">{item.icon}</span>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 italic">{item.label}</p>
                <p className="text-white text-4xl font-black italic tracking-tighter font-lexend">
                  {item.val}<span className="text-[11px] text-slate-600 not-italic ml-1 uppercase">{item.unit}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <section className="pb-12">
          <div className="flex justify-between items-center mb-8 px-2">
            <h3 className="text-white text-2xl font-black tracking-tight italic uppercase font-lexend">Última Missão</h3>
            <button onClick={() => navigate(AppScreen.HISTORY)} className="text-primary text-[11px] font-black uppercase tracking-widest border-b border-primary/20 pb-0.5">Ver Histórico</button>
          </div>
          
          {lastActivity ? (
            <div 
              onClick={() => navigate(AppScreen.HISTORY)} 
              className="group bg-surface-dark rounded-[3.5rem] overflow-hidden border border-white/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.4)] cursor-pointer active:scale-[0.98] transition-all relative"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={lastActivity.mapImage} className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000 scale-105 group-hover:scale-100" alt="Map" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{lastActivity.type}</span>
                </div>
              </div>
              <div className="p-10 pt-0 flex justify-between items-end relative z-10 -mt-12">
                <div>
                  <h4 className="text-white text-2xl font-black tracking-tighter italic uppercase font-lexend leading-none">{lastActivity.title}</h4>
                  <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-2">{lastActivity.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-4xl font-black italic tracking-tighter font-lexend elite-gradient-text">{lastActivity.distance}km</p>
                </div>
              </div>
            </div>
          ) : (
             <div className="bg-surface-dark/20 rounded-[3rem] py-20 flex flex-col items-center justify-center border border-dashed border-white/10 opacity-50 group hover:opacity-100 transition-opacity">
               <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:animate-bounce">
                <span className="material-symbols-outlined text-4xl text-slate-500">sprint</span>
               </div>
               <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Pronto para a primeira missão?</p>
             </div>
          )}
        </section>
      </main>

      {showChallengeModal && (
        <ChallengeDetailModal 
          challenge={weeklyChallenge} 
          onClose={() => setShowChallengeModal(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;