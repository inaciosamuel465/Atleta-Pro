import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { AppScreen, Activity, UserProfile } from '../types';

interface StatsProps {
  navigate: (screen: AppScreen) => void;
  activities: Activity[];
  user: UserProfile; // Adicionado prop user
}

type TimeRange = 'weekly' | 'monthly';

interface AchievementDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  bg: string;
  requirement: (acts: Activity[]) => boolean;
}

const ALL_ACHIEVEMENTS: AchievementDef[] = [
  { id: '1', title: 'King of 5k', desc: 'Correu pelo menos 5km em uma sessão', icon: 'military_tech', color: 'text-amber-400', bg: 'bg-amber-400/10', requirement: (acts) => acts.some(a => a.distance >= 5) },
  { id: '2', title: 'Early Bird', desc: '2+ treinos realizados antes das 08:00', icon: 'wb_twilight', color: 'text-blue-400', bg: 'bg-blue-400/10', requirement: (acts) => acts.filter(a => new Date(a.date).getHours() < 8).length >= 2 },
  { id: '3', title: 'Marathoner Mind', desc: 'Acumulou mais de 20km no total', icon: 'auto_awesome', color: 'text-purple-400', bg: 'bg-purple-400/10', requirement: (acts) => acts.reduce((acc, a) => acc + a.distance, 0) >= 20 },
  { id: '4', title: 'Consistent', desc: 'Realizou pelo menos 5 atividades', icon: 'verified', color: 'text-emerald-400', bg: 'bg-emerald-400/10', requirement: (acts) => acts.length >= 5 },
  { id: '5', title: 'Night Owl', desc: 'Treino realizado após as 20:00', icon: 'nights_stay', color: 'text-indigo-400', bg: 'bg-indigo-400/10', requirement: (acts) => acts.some(a => new Date(a.date).getHours() >= 20) },
  { id: '6', title: 'Speed Demon', desc: 'Ritmo abaixo de 5\'00"/km', icon: 'bolt', color: 'text-yellow-400', bg: 'bg-yellow-400/10', requirement: (acts) => acts.some(a => {
    const m = a.pace.match(/(\d+)'/);
    return m ? parseInt(m[1]) < 5 : false;
  })},
  { id: '7', title: 'Explorer', desc: 'Correu em 3 localizações diferentes', icon: 'explore', color: 'text-rose-400', bg: 'bg-rose-400/10', requirement: (acts) => new Set(acts.map(a => a.location)).size >= 3 },
  { id: '8', title: 'Centurion', desc: 'Acumulou 100km (Meta de Elite)', icon: 'workspace_premium', color: 'text-cyan-400', bg: 'bg-cyan-400/10', requirement: (acts) => acts.reduce((acc, a) => acc + a.distance, 0) >= 100 },
];

const Stats: React.FC<StatsProps> = ({ navigate, activities, user }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const paceToSeconds = (paceStr: string) => {
    const matches = paceStr.match(/(\d+)'\s*(\d+)"/);
    if (!matches) return 999999;
    return parseInt(matches[1]) * 60 + parseInt(matches[2]);
  };

  // Lógica de dados do gráfico baseada no range
  const chartData = useMemo(() => {
    const now = new Date();
    
    if (timeRange === 'weekly') {
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      return days.map((day, index) => {
        const dailyDist = activities.reduce((acc, act) => {
          const actDate = new Date(act.date); // Usar diretamente o ISOString
          const diff = Math.floor((now.getTime() - actDate.getTime()) / (1000 * 3600 * 24));
          if (actDate.getDay() === index && diff < 7) { // Últimos 7 dias
            return acc + act.distance;
          }
          return acc;
        }, 0);
        return { name: day, value: parseFloat(dailyDist.toFixed(1)) };
      });
    } else {
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      return weeks.map((week, idx) => {
        const actDate = new Date(); // Usar diretamente o ISOString
        const weekDist = activities.reduce((acc, act) => {
          const activityDate = new Date(act.date);
          const diffDays = Math.floor((actDate.getTime() - activityDate.getTime()) / (1000 * 3600 * 24));
          const actWeek = Math.floor(diffDays / 7);
          
          if (actWeek === (3 - idx) && diffDays < 28) return acc + act.distance; // Últimas 4 semanas
          return acc;
        }, 0);
        return { name: week, value: parseFloat(weekDist.toFixed(1)) };
      });
    }
  }, [activities, timeRange]);

  const bestPace = useMemo(() => {
    if (activities.length === 0) return "--'--\"";
    const sorted = [...activities].sort((a, b) => paceToSeconds(a.pace) - paceToSeconds(b.pace));
    return sorted[0].pace;
  }, [activities]);

  const totalActivities = useMemo(() => activities.length, [activities]);

  const totalTimeSeconds = useMemo(() => {
    return activities.reduce((acc, curr) => {
      if (!curr.time) return acc;
      const parts = curr.time.split(':').map(Number);
      if (parts.length === 3) return acc + (parts[0] * 3600 + parts[1] * 60 + parts[2]);
      if (parts.length === 2) return acc + (parts[0] * 60 + parts[1]);
      return acc;
    }, 0);
  }, [activities]);

  const totalTimeString = useMemo(() => {
    const h = Math.floor(totalTimeSeconds / 3600);
    const m = Math.floor((totalTimeSeconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [totalTimeSeconds]);

  const typeDistribution = useMemo(() => [
    { name: 'Corrida', value: activities.filter(a => a.type === 'Corrida').length, color: '#258cf4' },
    { name: 'Ciclismo', value: activities.filter(a => a.type === 'Ciclismo').length, color: '#a855f7' },
    { name: 'Caminhada', value: activities.filter(a => a.type === 'Caminhada').length, color: '#10b981' },
    { name: 'Intervalo', value: activities.filter(a => a.type === 'Intervalado').length, color: '#f59e0b' },
  ], [activities]);

  const unlockedAchievements = useMemo(() => 
    ALL_ACHIEVEMENTS.filter(ach => ach.requirement(activities)),
  [activities]);

  const totalElevation = useMemo(() => 
    Math.round(activities.reduce((acc, a) => acc + (a.distance * 12.5), 0)),
  [activities]);

  // --- CÁLCULO DE RECORDES PESSOAIS (PRs) ---
  const personalRecords = useMemo(() => {
    let fastest1kPace = "99'99\"";
    let fastest5kPace = "99'99\"";
    let fastest10kPace = "99'99\"";
    let longestDistance = 0;
    let highestCalories = 0;

    activities.forEach(activity => {
      // Fastest Pace (overall, assuming pace is for 1km)
      if (paceToSeconds(activity.pace) < paceToSeconds(fastest1kPace)) {
        fastest1kPace = activity.pace;
      }

      // Fastest 5k Pace (simplified: if activity is around 5k, check its pace)
      if (activity.distance >= 4.8 && activity.distance <= 5.2) { // +/- 0.2km tolerance
        if (paceToSeconds(activity.pace) < paceToSeconds(fastest5kPace)) {
          fastest5kPace = activity.pace;
        }
      }

      // Fastest 10k Pace (simplified: if activity is around 10k, check its pace)
      if (activity.distance >= 9.8 && activity.distance <= 10.2) { // +/- 0.2km tolerance
        if (paceToSeconds(activity.pace) < paceToSeconds(fastest10kPace)) {
          fastest10kPace = activity.pace;
        }
      }

      // Longest Distance
      if (activity.distance > longestDistance) {
        longestDistance = activity.distance;
      }

      // Highest Calories
      if (activity.calories > highestCalories) {
        highestCalories = activity.calories;
      }
    });

    return {
      fastest1kPace: fastest1kPace === "99'99\"" ? "--'--\"" : fastest1kPace,
      fastest5kPace: fastest5kPace === "99'99\"" ? "--'--\"" : fastest5kPace,
      fastest10kPace: fastest10kPace === "99'99\"" ? "--'--\"" : fastest10kPace,
      longestDistance: longestDistance.toFixed(1),
      highestCalories: highestCalories,
    };
  }, [activities]);

  // --- CÁLCULO E DISTRIBUIÇÃO DE ZONAS DE FREQUÊNCIA CARDÍACA ---
  const hrZoneDistribution = useMemo(() => {
    if (!user || !user.age) return [];

    const maxHR = 220 - user.age; // Fórmula simplificada para FC Máxima

    // Definição das zonas de FC (percentual da FC Máxima)
    const zones = [
      { name: 'Zona 1 (50-60%)', min: 0.50, max: 0.60, color: '#10b981' }, // Verde (Recuperação)
      { name: 'Zona 2 (60-70%)', min: 0.60, max: 0.70, color: '#258cf4' }, // Azul (Aeróbica Leve)
      { name: 'Zona 3 (70-80%)', min: 0.70, max: 0.80, color: '#f59e0b' }, // Laranja (Aeróbica Moderada)
      { name: 'Zona 4 (80-90%)', min: 0.80, max: 0.90, color: '#ef4444' }, // Vermelho (Limiar)
      { name: 'Zona 5 (90-100%)', min: 0.90, max: 1.00, color: '#dc2626' }, // Vermelho Escuro (Máxima)
    ];

    const zoneCounts: { [key: string]: number } = {};
    zones.forEach(zone => zoneCounts[zone.name] = 0);

    activities.forEach(activity => {
      if (activity.heartRate && activity.heartRate > 0) {
        const hrPercentage = activity.heartRate / maxHR;
        for (const zone of zones) {
          if (hrPercentage >= zone.min && hrPercentage < zone.max) {
            zoneCounts[zone.name]++;
            break;
          }
        }
      }
    });

    return zones.map(zone => ({
      name: zone.name.split(' ')[0], // Apenas o nome da zona (ex: "Zona 1")
      value: zoneCounts[zone.name],
      color: zone.color
    })).filter(data => data.value > 0); // Filtra zonas sem atividades
  }, [activities, user]);


  return (
    <div className="bg-[#101922] min-h-screen pb-40 no-scrollbar overflow-y-auto relative">
      <header className="flex flex-col px-6 pt-10 pb-6 sticky top-0 bg-[#101922]/90 backdrop-blur-xl z-20 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-3xl font-black tracking-tight italic">Performance</h2>
          <div className="flex bg-surface-dark/50 p-1 rounded-2xl border border-white/5">
             <button 
               onClick={() => setTimeRange('weekly')}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === 'weekly' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
             >
               Semanal
             </button>
             <button 
               onClick={() => setTimeRange('monthly')}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === 'monthly' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-white'}`}
             >
               Mensal
             </button>
          </div>
        </div>
      </header>

      <main className="px-6 pt-8 space-y-10">
        {/* Gráfico de Evolução */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-white text-xl font-black tracking-tight">Evolução de Distância</h3>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="material-symbols-outlined text-[16px] font-black">trending_up</span>
              <span className="text-[10px] font-black">{timeRange === 'weekly' ? '+18.5% esta semana' : '+42% este mês'}</span>
            </div>
          </div>
          <div className="bg-surface-dark p-8 rounded-[3rem] border border-white/5 shadow-2xl relative h-72 group">
            <div className="absolute top-8 right-8 flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
               <div className="size-2 rounded-full bg-primary animate-pulse"></div>
               <span className="text-[8px] font-black uppercase tracking-[0.3em]">Dados em tempo real</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="distGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#258cf4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#258cf4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} 
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#182634', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#258cf4', fontWeight: 900 }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 800, marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#258cf4" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#distGradient)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-4 shadow-lg group active:scale-95 transition-all">
             <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">speed</span>
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Melhor Ritmo</p>
             </div>
             <p className="text-4xl font-black text-white italic tracking-tighter">{bestPace} <span className="text-xs text-slate-600 not-italic">/km</span></p>
          </div>
          <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-4 shadow-lg group active:scale-95 transition-all">
             <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">mountain_flag</span>
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ganho Elev.</p>
             </div>
             <p className="text-4xl font-black text-white italic tracking-tighter">{totalElevation} <span className="text-xs text-slate-600 not-italic">m</span></p>
          </div>
          {/* New Quick Stat: Total Activities */}
          <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-4 shadow-lg group active:scale-95 transition-all">
             <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">directions_run</span>
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Ativs</p>
             </div>
             <p className="text-4xl font-black text-white italic tracking-tighter">{totalActivities}</p>
          </div>
          {/* New Quick Stat: Total Time */}
          <div className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 space-y-4 shadow-lg group active:scale-95 transition-all">
             <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Tempo Total</p>
             </div>
             <p className="text-4xl font-black text-white italic tracking-tighter">{totalTimeString}</p>
          </div>
        </section>

        {/* Seção de Recordes Pessoais (PRs) */}
        <section className="space-y-6">
          <h3 className="text-white text-xl font-black tracking-tight px-1">Recordes Pessoais</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-dark rounded-[2.5rem] p-6 border border-white/5 space-y-2 relative overflow-hidden group">
              <span className="material-symbols-outlined absolute top-4 right-4 text-primary/10 text-5xl group-hover:scale-110 transition-transform">star</span>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Ritmo 1KM</p>
              <p className="text-white text-3xl font-black italic">{personalRecords.fastest1kPace}</p>
            </div>
            <div className="bg-surface-dark rounded-[2.5rem] p-6 border border-white/5 space-y-2 relative overflow-hidden group">
              <span className="material-symbols-outlined absolute top-4 right-4 text-primary/10 text-5xl group-hover:scale-110 transition-transform">star</span>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Ritmo 5KM</p>
              <p className="text-white text-3xl font-black italic">{personalRecords.fastest5kPace}</p>
            </div>
            <div className="bg-surface-dark rounded-[2.5rem] p-6 border border-white/5 space-y-2 relative overflow-hidden group">
              <span className="material-symbols-outlined absolute top-4 right-4 text-primary/10 text-5xl group-hover:scale-110 transition-transform">star</span>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Ritmo 10KM</p>
              <p className="text-white text-3xl font-black italic">{personalRecords.fastest10kPace}</p>
            </div>
            <div className="bg-surface-dark rounded-[2.5rem] p-6 border border-white/5 space-y-2 relative overflow-hidden group">
              <span className="material-symbols-outlined absolute top-4 right-4 text-primary/10 text-5xl group-hover:scale-110 transition-transform">star</span>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Maior Distância</p>
              <p className="text-white text-3xl font-black italic">{personalRecords.longestDistance} <span className="text-sm font-normal text-slate-500 not-italic ml-1">km</span></p>
            </div>
            <div className="bg-surface-dark rounded-[2.5rem] p-6 border border-white/5 space-y-2 relative overflow-hidden group">
              <span className="material-symbols-outlined absolute top-4 right-4 text-primary/10 text-5xl group-hover:scale-110 transition-transform">star</span>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Mais Calorias</p>
              <p className="text-white text-3xl font-black italic">{personalRecords.highestCalories} <span className="text-sm font-normal text-slate-500 not-italic ml-1">kcal</span></p>
            </div>
          </div>
        </section>

        {/* Distribuição de Zonas de Frequência Cardíaca */}
        {hrZoneDistribution.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-white text-xl font-black tracking-tight px-1">Zonas de Frequência Cardíaca</h3>
            <div className="bg-surface-dark p-8 rounded-[3rem] border border-white/5 shadow-2xl relative h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hrZoneDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff05" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} 
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#182634', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontWeight: 900 }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 800, marginBottom: '4px' }}
                    formatter={(value: number, name: string) => [`${value} Atividades`, name]}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} animationDuration={1000}>
                    {hrZoneDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Activity Distribution */}
        <section className="space-y-6">
           <h3 className="text-white text-xl font-black tracking-tight px-1">Distribuição de Atividades</h3>
           <div className="bg-surface-dark p-8 rounded-[3rem] border border-white/5 flex items-center justify-between shadow-2xl overflow-hidden relative">
              <div className="h-40 w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeDistribution}>
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} animationDuration={1000}>
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 w-1/2 pl-6">
                {typeDistribution.map((t, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="size-3 rounded-full" style={{ backgroundColor: t.color }}></div>
                    <span className="text-[10px] font-black uppercase text-slate-400">{t.name}</span>
                  </div>
                ))}
              </div>
           </div>
        </section>

        {/* Conquistas (Horizontal Scroll) */}
        <section className="space-y-6">
           <div className="flex justify-between items-end px-1">
              <h3 className="text-white text-xl font-black tracking-tight">Conquistas Desbloqueadas</h3>
              <button 
                onClick={() => setShowAllAchievements(true)}
                className="text-primary text-[10px] font-black uppercase tracking-widest border-b border-primary/20 pb-0.5"
              >
                Ver Todas
              </button>
           </div>
           <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
              {unlockedAchievements.map((badge) => (
                <div key={badge.id} className="shrink-0 w-32 h-40 bg-surface-dark border border-white/5 rounded-[2.2rem] flex flex-col items-center justify-center gap-3 p-4 shadow-xl active:scale-95 transition-transform">
                   <div className={`size-14 rounded-2xl flex items-center justify-center ${badge.bg} ${badge.color} shadow-lg shadow-black/20`}>
                      <span className="material-symbols-outlined text-[32px]">{badge.icon}</span>
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-tight h-8 flex items-center">{badge.title}</span>
                </div>
              ))}
              {unlockedAchievements.length === 0 && (
                <div className="w-full py-10 flex flex-col items-center justify-center opacity-30 text-center">
                  <span className="material-symbols-outlined text-6xl">lock</span>
                  <p className="text-[10px] font-black uppercase tracking-widest px-10">Realize seu primeiro treino para desbloquear medalhas</p>
                </div>
              )}
           </div>
        </section>
      </main>

      {/* Modal de Todas as Conquistas */}
      {showAllAchievements && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500">
          <header className="p-8 flex justify-between items-center shrink-0 border-b border-white/5">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Hall da Fama</h3>
            <button 
              onClick={() => setShowAllAchievements(false)} 
              className="size-12 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          <main className="flex-1 overflow-y-auto no-scrollbar px-6 pt-10 pb-20">
             <div className="grid grid-cols-2 gap-4">
                {ALL_ACHIEVEMENTS.map((ach) => {
                  const isUnlocked = ach.requirement(activities);
                  return (
                    <div 
                      key={ach.id} 
                      className={`relative rounded-[2.5rem] border p-6 space-y-4 flex flex-col items-center text-center transition-all ${isUnlocked ? 'bg-surface-dark border-primary/20 shadow-2xl shadow-primary/5' : 'bg-surface-dark/40 border-white/5 grayscale opacity-40'}`}
                    >
                       {!isUnlocked && (
                         <div className="absolute top-4 right-4 text-slate-500">
                           <span className="material-symbols-outlined text-sm">lock</span>
                         </div>
                       )}
                       <div className={`size-20 rounded-3xl flex items-center justify-center ${isUnlocked ? ach.bg + ' ' + ach.color : 'bg-white/5 text-slate-600'} shadow-inner`}>
                          <span className="material-symbols-outlined text-[42px]">{ach.icon}</span>
                       </div>
                       <div>
                          <h4 className={`text-sm font-black uppercase tracking-tight mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{ach.title}</h4>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{ach.desc}</p>
                       </div>
                    </div>
                  );
                })}
             </div>
             
             <div className="mt-12 p-8 bg-primary/5 rounded-[3rem] border border-primary/10 flex flex-col items-center text-center gap-4">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">emoji_events</span>
                </div>
                <div>
                   <h5 className="text-white text-lg font-black italic uppercase tracking-tight">Mestre da Performance</h5>
                   <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                     Desbloqueou {unlockedAchievements.length} de {ALL_ACHIEVEMENTS.length} conquistas totais
                   </p>
                </div>
                <div className="w-full h-2 bg-background-dark rounded-full overflow-hidden mt-2">
                   <div 
                     className="h-full bg-primary transition-all duration-1000" 
                     style={{ width: `${(unlockedAchievements.length / ALL_ACHIEVEMENTS.length) * 100}%` }}
                   ></div>
                </div>
             </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Stats;