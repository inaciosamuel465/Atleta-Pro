import React, { useState, useMemo } from 'react';
import { AppScreen, UserProfile, Activity, Challenge, TrainingProgram, ProgramActivity } from '../types';
import ChallengeDetailModal from '../components/ChallengeDetailModal';

interface DashboardProps {
  navigate: (screen: AppScreen) => void;
  user: UserProfile;
  stats: { 
    totalDistance: string; 
    calories: string | number; 
    time: string; 
    pace: string; 
    rawTotalDistance: number; 
    rawWeeklyDistance: number; 
    rawMonthlyDistance: number;
    totalActivities: number; // Adicionado
    totalTimeString: string; // Adicionado
  }; 
  lastActivity: Activity | undefined;
  isAdmin: boolean;
  aiInsight: string | null;
  aiLoading: boolean;
  challenges: Challenge[]; // Nova prop para a lista de desafios
  nextProgramActivity?: { program: TrainingProgram; activity: ProgramActivity } | null; // Nova prop
  activities: Activity[]; // Nova prop: lista completa de atividades
}

const Dashboard: React.FC<DashboardProps> = ({ navigate, user, stats, lastActivity, isAdmin, aiInsight, aiLoading, challenges, nextProgramActivity, activities }) => {
  const MONTHLY_GOAL = user.monthlyGoal || 80;
  const WEEKLY_GOAL = user.weeklyGoal || 20;
  
  // Usar rawMonthlyDistance para o cálculo do progresso mensal
  const monthlyProgressPercent = Math.min(Math.round((stats.rawMonthlyDistance / MONTHLY_GOAL) * 100), 100);
  const weeklyProgressPercent = Math.min(Math.round((stats.rawWeeklyDistance / WEEKLY_GOAL) * 100), 100);

  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // Seleciona o primeiro desafio da lista para ser o "Desafio da Semana"
  const weeklyChallenge = challenges.length > 0 ? challenges[0] : null;

  const handleShowChallengeDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowChallengeModal(true);
  };

  // Helper para converter pace string para segundos
  const paceToSeconds = (paceStr: string) => {
    const matches = paceStr.match(/(\d+)'\s*(\d+)"/);
    if (!matches) return 999999; // Um valor alto para indicar um ritmo muito lento ou inválido
    return parseInt(matches[1]) * 60 + parseInt(matches[2]);
  };

  // Cálculo dos Recordes Pessoais (PRs)
  const personalRecords = useMemo(() => {
    let fastest1kPace = "99'99\"";
    let longestDistance = 0;

    activities.forEach(activity => {
      // Fastest Pace (overall, assuming pace is for 1km)
      if (paceToSeconds(activity.pace) < paceToSeconds(fastest1kPace)) {
        fastest1kPace = activity.pace;
      }

      // Longest Distance
      if (activity.distance > longestDistance) {
        longestDistance = activity.distance;
      }
    });

    return {
      fastest1kPace: fastest1kPace === "99'99\"" ? "--'--\"" : fastest1kPace,
      longestDistance: longestDistance.toFixed(1),
    };
  }, [activities]);


  return (
    <div className="pb-40 bg-background-light min-h-screen relative no-scrollbar overflow-y-auto animate-in fade-in duration-700">
      {/* Dynamic Header */}
      <header className="flex items-center px-6 pt-14 pb-8 justify-between sticky top-0 bg-background-light/80 backdrop-blur-2xl z-40 border-b border-surface-medium">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => navigate(AppScreen.PROFILE)}>
            <div className="absolute -inset-2 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>
            <img src={user.avatar} className="size-16 rounded-2xl border-2 border-primary/20 object-cover relative z-10 transition-transform active:scale-95 shadow-2xl" alt="User" />
            <div className="absolute -bottom-1 -right-1 size-5 bg-accent-green rounded-full border-4 border-background-light z-20"></div>
          </div>
          <div>
            <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] italic mb-0.5 block animate-pulse">Status: Elite Lvl {Math.floor(stats.rawTotalDistance/5) + 1}</span>
            <h2 className="text-text-dark text-3xl font-black tracking-tighter italic uppercase font-lexend leading-none">{user.name.split(' ')[0]}</h2>
          </div>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button 
              onClick={() => navigate(AppScreen.ADMIN_DASHBOARD)}
              className="size-14 rounded-2xl bg-surface-light border border-surface-medium flex items-center justify-center text-primary active:scale-90 transition-all hover:bg-surface-medium"
            >
              <span className="material-symbols-outlined text-2xl font-bold">admin_panel_settings</span>
            </button>
          )}
          <button className="size-14 rounded-2xl bg-surface-light border border-surface-medium flex items-center justify-center text-text-dark active:scale-90 transition-all hover:bg-surface-medium">
            <span className="material-symbols-outlined text-2xl font-bold">notifications</span>
          </button>
        </div>
      </header>

      <main className="px-6 space-y-8 pt-6">
        {/* Próxima Atividade do Programa de Treino */}
        {nextProgramActivity && (
          <section className="bg-surface-light rounded-[3rem] p-8 border border-surface-medium shadow-lg relative overflow-hidden group">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 blur-[50px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                    <span className="material-symbols-outlined text-3xl">event_note</span>
                </div>
                <div>
                    <h3 className="text-text-dark text-xl font-black italic uppercase tracking-tight font-lexend">Próximo Treino</h3>
                    <p className="text-[10px] text-text-light font-black uppercase tracking-[0.3em] mt-1 italic">{nextProgramActivity.program.name}</p>
                </div>
            </div>
            <p className="text-text-dark text-lg font-bold italic leading-snug font-lexend relative z-10">
                Dia {nextProgramActivity.activity.day}: {nextProgramActivity.activity.title}
            </p>
            <p className="text-text-light text-sm mt-2 relative z-10">
                {nextProgramActivity.activity.description}
            </p>
            <div className="flex justify-between items-center mt-6 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-text-light">
                    {nextProgramActivity.activity.targetDistance ? `${nextProgramActivity.activity.targetDistance} KM` : ''}
                    {nextProgramActivity.activity.targetTime ? ` ${nextProgramActivity.activity.targetTime} MIN` : ''}
                </span>
                <button onClick={() => navigate(AppScreen.TRAINING_PROGRAMS)} className="text-primary text-[10px] font-black uppercase tracking-widest border-b border-primary/20 pb-0.5">Ver Programa</button>
            </div>
          </section>
        )}

        {/* Progress Card - "Ultra High" Aesthetic (Monthly Goal) */}
        <section className="bg-gradient-to-br from-surface-light via-surface-medium to-background-light rounded-[3rem] p-10 border border-surface-medium shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-accent-green/5 blur-[80px] rounded-full"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-text-dark text-xl font-black italic uppercase tracking-tight font-lexend">Meta Mensal</h3>
              <p className="text-[10px] text-text-light font-black uppercase tracking-[0.3em] mt-1 italic">Road to Performance</p>
            </div>
            <div className="text-right">
              <span className="text-text-dark text-5xl font-black italic font-lexend tracking-tighter elite-gradient-text">{stats.rawMonthlyDistance.toFixed(1)}</span>
              <span className="text-text-light text-xs font-black italic ml-2">/ {MONTHLY_GOAL} KM</span>
            </div>
          </div>

          <div className="relative h-4 bg-surface-medium rounded-full overflow-hidden p-1 border border-surface-medium mb-6">
            <div 
              className="h-full bg-gradient-to-r from-primary via-orange-400 to-accent-green rounded-full transition-all duration-1000 shadow-[0_0_25px_rgba(233,84,32,0.4)]" 
              style={{ width: `${monthlyProgressPercent}%` }}
            />
          </div>
          
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-light relative z-10">
            <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary"></span> {monthlyProgressPercent}% atingido</span>
            <span className="text-primary italic animate-bounce-slow">Keep Moving Elite &gt;</span>
          </div>
        </section>

        {/* Weekly Goal Card */}
        <section className="bg-surface-light rounded-[3rem] p-8 border border-surface-medium shadow-lg relative overflow-hidden group">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent-green/10 blur-[50px] rounded-full group-hover:bg-accent-green/20 transition-all duration-700"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-text-dark text-xl font-black italic uppercase tracking-tight font-lexend">Meta Semanal</h3>
                    <p className="text-[10px] text-text-light font-black uppercase tracking-[0.3em] mt-1 italic">Foco na Consistência</p>
                </div>
                <div className="text-right">
                    <span className="text-text-dark text-4xl font-black italic font-lexend tracking-tighter text-accent-green">{stats.rawWeeklyDistance.toFixed(1)}</span>
                    <span className="text-text-light text-xs font-black italic ml-2">/ {WEEKLY_GOAL} KM</span>
                </div>
            </div>
            <div className="relative h-3 bg-surface-medium rounded-full overflow-hidden p-0.5 border border-surface-medium mb-4">
                <div 
                    className="h-full bg-gradient-to-r from-accent-green via-emerald-400 to-green-600 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(0,230,118,0.4)]" 
                    style={{ width: `${weeklyProgressPercent}%` }}
                />
            </div>
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-text-light relative z-10">
                <span>{weeklyProgressPercent}% atingido</span>
                <span className="text-accent-green italic">Mais um passo &gt;</span>
            </div>
        </section>

        {/* Weekly Challenge Card (Dynamic) */}
        {weeklyChallenge ? (
          <section className="bg-surface-light rounded-[3rem] p-8 border border-surface-medium shadow-lg relative overflow-hidden group">
              <div className={`absolute -top-8 -left-8 w-32 h-32 bg-${weeklyChallenge.color}-500/10 blur-[50px] rounded-full group-hover:bg-${weeklyChallenge.color}-500/20 transition-all duration-700`}></div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className={`size-14 rounded-2xl bg-${weeklyChallenge.color}/20 flex items-center justify-center text-${weeklyChallenge.color.split('-')[0]}-${weeklyChallenge.color.split('-')[1]} shadow-inner border border-${weeklyChallenge.color}/10`}>
                      <span className="material-symbols-outlined text-3xl">{weeklyChallenge.icon}</span>
                  </div>
                  <div>
                      <h3 className="text-text-dark text-xl font-black italic uppercase tracking-tight font-lexend">Desafio da Semana</h3>
                      <p className="text-[10px] text-text-light font-black uppercase tracking-[0.3em] mt-1 italic">Conquiste a Glória</p>
                  </div>
              </div>
              <p className="text-text-dark text-lg font-bold italic leading-snug font-lexend relative z-10">
                  {weeklyChallenge.description}
              </p>
              <div className="flex justify-between items-center mt-6 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-light">Progresso: {weeklyChallenge.progress}</span>
                  <button onClick={() => handleShowChallengeDetails(weeklyChallenge)} className="text-primary text-[10px] font-black uppercase tracking-widest border-b border-primary/20 pb-0.5">Ver Detalhes</button>
              </div>
          </section>
        ) : (
          <section className="bg-surface-light rounded-[3rem] py-20 flex flex-col items-center justify-center border border-dashed border-surface-medium opacity-50 group hover:opacity-100 transition-opacity">
            <div className="size-20 rounded-full bg-surface-medium flex items-center justify-center mb-4 group-hover:animate-bounce">
              <span className="material-symbols-outlined text-4xl text-text-light">military_tech</span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-text-light">Nenhum desafio ativo no momento</p>
          </section>
        )}

        {/* Performance Tip Widget (AI Insight) */}
        <section className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-primary/50 to-accent-green/50 rounded-[3rem] blur opacity-15 group-hover:opacity-25 transition-all"></div>
          <div className="relative glass-card rounded-[3rem] p-10 overflow-hidden border border-surface-medium">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                  <span className="material-symbols-outlined text-3xl">bolt</span>
                </div>
                <div>
                  <h4 className="text-text-dark text-[11px] font-black uppercase tracking-[0.3em] font-display">Dica de Performance</h4>
                  <div className="flex gap-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-text-dark text-xl font-bold italic leading-snug font-lexend">
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

        {/* Recordes Pessoais (PRs) */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-text-dark text-xl font-black tracking-tight italic uppercase font-lexend">Seus Recordes</h3>
            <button onClick={() => navigate(AppScreen.STATS)} className="text-primary text-[10px] font-black uppercase tracking-widest border-b border-primary/20 pb-0.5">Ver Todos</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-light rounded-[2.5rem] p-6 border border-surface-medium space-y-2 relative overflow-hidden group">
              <span className="material-symbols-outlined absolute top-4 right-4 text-primary/10 text-5xl group-hover:scale-110 transition-transform">star</span>
              <p className="text-text-light text-[9px] font-black uppercase tracking-widest">Melhor Ritmo 1KM</p>
              <p className="text-text-dark text-3xl font-black italic">{personalRecords.fastest1kPace}</p>
            </div>
            <div className="bg-surface-light rounded-[2.5rem] p-6 border border-surface-medium space-y-2 relative overflow-hidden group">
              <span className="material-symbols-outlined absolute top-4 right-4 text-primary/10 text-5xl group-hover:scale-110 transition-transform">star</span>
              <p className="text-text-light text-[9px] font-black uppercase tracking-widest">Maior Distância</p>
              <p className="text-text-dark text-3xl font-black italic">{personalRecords.longestDistance} <span className="text-sm font-normal text-text-light not-italic ml-1">km</span></p>
            </div>
          </div>
        </section>

        {/* Stats Grid - "Glassmorphism" Style */}
        <div className="grid grid-cols-2 gap-5">
          {[
            { label: 'Energia', val: stats.calories, unit: 'kcal', icon: 'local_fire_department', color: 'text-accent-orange', bg: 'bg-accent-orange/10' },
            { label: 'Ritmo Médio', val: stats.pace, unit: '', icon: 'speed', color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Total Ativs', val: stats.totalActivities, unit: '', icon: 'directions_run', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }, // Novo
            { label: 'Tempo Total', val: stats.totalTimeString, unit: '', icon: 'timer', color: 'text-purple-500', bg: 'bg-purple-500/10' } // Novo
          ].map((item, i) => (
            <div key={i} className="bg-surface-light rounded-[2.5rem] p-8 border border-surface-medium space-y-5 transition-all hover:bg-surface-medium">
              <div className={`size-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-lg`}>
                <span className="material-symbols-outlined text-3xl font-black">{item.icon}</span>
              </div>
              <div>
                <p className="text-text-light text-[10px] font-black uppercase tracking-widest mb-1 italic">{item.label}</p>
                <p className="text-text-dark text-4xl font-black italic tracking-tighter font-lexend">
                  {item.val}<span className="text-[11px] text-text-light not-italic ml-1 uppercase">{item.unit}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <section className="pb-12">
          <div className="flex justify-between items-center mb-8 px-2">
            <h3 className="text-text-dark text-2xl font-black tracking-tight italic uppercase font-lexend">Última Missão</h3>
            <button onClick={() => navigate(AppScreen.HISTORY)} className="text-primary text-[11px] font-black uppercase tracking-widest border-b border-primary/20 pb-0.5">Ver Histórico</button>
          </div>
          
          {lastActivity ? (
            <div 
              onClick={() => navigate(AppScreen.HISTORY)} 
              className="group bg-surface-light rounded-[3.5rem] overflow-hidden border border-surface-medium shadow-[0_30px_60px_rgba(0,0,0,0.2)] cursor-pointer active:scale-[0.98] transition-all relative"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={lastActivity.mapImage} className="w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000 scale-105 group-hover:scale-100" alt="Map" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6 bg-surface-medium/50 backdrop-blur-md px-4 py-2 rounded-xl border border-surface-medium">
                   <span className="text-[10px] font-black uppercase tracking-widest text-text-dark/80">{lastActivity.type}</span>
                </div>
              </div>
              <div className="p-10 pt-0 flex justify-between items-end relative z-10 -mt-12">
                <div>
                  <h4 className="text-text-dark text-2xl font-black tracking-tighter italic uppercase font-lexend leading-none">{lastActivity.title}</h4>
                  <p className="text-text-light text-[11px] font-bold uppercase tracking-widest mt-2">{lastActivity.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-text-dark text-4xl font-black italic tracking-tighter font-lexend elite-gradient-text">{lastActivity.distance}km</p>
                </div>
              </div>
            </div>
          ) : (
             <div className="bg-surface-light rounded-[3rem] py-20 flex flex-col items-center justify-center border border-dashed border-surface-medium opacity-50 group hover:opacity-100 transition-opacity">
               <div className="size-20 rounded-full bg-surface-medium flex items-center justify-center mb-4 group-hover:animate-bounce">
                <span className="material-symbols-outlined text-4xl text-text-light">sprint</span>
               </div>
               <p className="text-[11px] font-black uppercase tracking-widest text-text-light">Pronto para a primeira missão?</p>
             </div>
          )}
        </section>
      </main>

      {showChallengeModal && selectedChallenge && (
        <ChallengeDetailModal 
          challenge={selectedChallenge} 
          onClose={() => setShowChallengeModal(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;