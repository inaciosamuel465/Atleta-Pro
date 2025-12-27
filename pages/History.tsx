
import React, { useState, useMemo } from 'react';
import { AppScreen, Activity } from '../types';

interface HistoryProps {
  navigate: (screen: AppScreen) => void;
  activities: Activity[];
  onViewActivity: (activity: Activity) => void;
}

const History: React.FC<HistoryProps> = ({ navigate, activities, onViewActivity }) => {
  const [filter, setFilter] = useState<'Todos' | 'Corrida' | 'Ciclismo' | 'Caminhada' | 'Intervalado'>('Todos');

  const filteredActivities = useMemo(() => {
    if (filter === 'Todos') return activities;
    return activities.filter(a => a.type === filter);
  }, [activities, filter]);

  const totalDistance = useMemo(() => 
    filteredActivities.reduce((acc, curr) => acc + curr.distance, 0),
  [filteredActivities]);

  return (
    <div className="bg-[#101922] min-h-screen pb-32">
      <header className="flex flex-col px-6 pt-10 pb-6 sticky top-0 bg-[#101922]/95 backdrop-blur-xl z-20 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-3xl font-black tracking-tight italic">Atividades</h2>
          <button className="size-11 flex items-center justify-center rounded-2xl bg-surface-dark border border-white/5 hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined text-white">search</span>
          </button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['Todos', 'Corrida', 'Ciclismo', 'Caminhada', 'Intervalado'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark text-slate-500 border border-white/5'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 space-y-8 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-dark rounded-[2.5rem] p-6 border border-white/5 space-y-2 relative overflow-hidden group">
            <span className="material-symbols-outlined absolute top-4 right-4 text-primary/10 text-5xl group-hover:scale-110 transition-transform">shutter_speed</span>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">KM {filter === 'Todos' ? 'TOTAL' : filter.toUpperCase()}</p>
            <p className="text-white text-3xl font-black italic">{totalDistance.toFixed(1)} <span className="text-sm font-normal text-slate-500 not-italic ml-1">km</span></p>
          </div>
          <div className="bg-surface-dark rounded-[2.5rem] p-6 border border-white/5 space-y-2 relative overflow-hidden group">
            <span className="material-symbols-outlined absolute top-4 right-4 text-primary/10 text-5xl group-hover:scale-110 transition-transform">schedule</span>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">SESSÕES</p>
            <p className="text-white text-3xl font-black italic">{filteredActivities.length}</p>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-white text-xl font-black tracking-tight">Recentes</h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filteredActivities.length} itens</span>
          </div>
          
          <div className="space-y-4">
            {filteredActivities.length > 0 ? filteredActivities.map((activity) => (
              <div 
                key={activity.id} 
                onClick={() => onViewActivity(activity)} 
                className="group bg-surface-dark rounded-[2.5rem] p-6 border border-white/5 space-y-5 cursor-pointer active:scale-[0.98] transition-all hover:border-primary/30"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl flex items-center justify-center transition-colors ${
                      activity.type === 'Corrida' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 
                      activity.type === 'Ciclismo' ? 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white' :
                      'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'
                    }`}>
                      <span className="material-symbols-outlined">
                        {activity.type === 'Corrida' ? 'directions_run' : activity.type === 'Caminhada' ? 'hiking' : activity.type === 'Ciclismo' ? 'pedal_bike' : 'timer'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-white font-black text-base">{activity.title}</h4>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{activity.date}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-700 group-hover:text-primary transition-colors">chevron_right</span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white text-5xl font-black tracking-tighter italic">{activity.distance.toFixed(2)}</span>
                      <span className="text-slate-500 text-sm font-black italic">km</span>
                    </div>
                    <div className="flex gap-8">
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Tempo</p>
                        <p className="text-white text-base font-black italic">{activity.time}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Ritmo</p>
                        <p className="text-white text-base font-black italic">{activity.pace}</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-28 h-20 rounded-[1.5rem] bg-background-dark overflow-hidden border border-white/5 relative shadow-inner">
                    <img src={activity.mapImage} className="w-full h-full object-cover opacity-30 grayscale group-hover:opacity-60 group-hover:grayscale-0 transition-all duration-500" alt="Route" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <span className="material-symbols-outlined text-6xl">history</span>
                <div>
                  <p className="text-white font-black">Nenhuma atividade encontrada</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Mude o filtro ou comece um treino</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default History;
