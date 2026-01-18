import React, { useState } from 'react';
import { APP_LOGO } from '../constants';

interface StartActivityProps {
  onBack: () => void;
  onStart: (config: any) => void;
}

const StartActivity: React.FC<StartActivityProps> = ({ onBack, onStart }) => {
  const [selectedType, setSelectedType] = useState('Corrida');
  const [targetDist, setTargetDist] = useState(5.0);
  const [targetTime, setTargetTime] = useState(30);
  const [terrain, setTerrain] = useState<'Asfalto' | 'Trilha' | 'Esteira'>('Asfalto');
  const [voiceCues, setVoiceCues] = useState(true);

  return (
    <div className="bg-[#101922] min-h-screen flex flex-col pb-44 overflow-y-auto no-scrollbar">
      <header className="flex items-center px-6 pt-12 pb-6 justify-between border-b border-white/5 sticky top-0 bg-[#101922]/90 backdrop-blur-xl z-50">
        <button onClick={onBack} className="size-12 flex items-center justify-center rounded-2xl bg-surface-dark border border-white/5 hover:bg-white/10 transition-all">
          <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">Setup Final</h1>
          <p className="text-[9px] font-black text-emerald-500 tracking-[0.4em] uppercase">Engines Warm: GPS 100%</p>
        </div>
        <div className="size-12 flex items-center justify-center">
           <img src={APP_LOGO} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(37,140,244,0.6)]" alt="Logo" />
        </div>
      </header>

      <main className="flex-1 px-6 pt-8 space-y-12">
        {/* Modality Selector */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 italic">Modalidade de Impacto</h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {[
              { label: 'Corrida', icon: 'directions_run', desc: 'Performance' },
              { label: 'Ciclismo', icon: 'pedal_bike', desc: 'Velocidade' },
              { label: 'Caminhada', icon: 'hiking', desc: 'Recuperação' },
              { label: 'Intervalado', icon: 'timer', desc: 'HIIT Elite' }
            ].map((type, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedType(type.label)}
                className={`shrink-0 w-36 h-48 rounded-[3rem] flex flex-col items-center justify-center gap-3 transition-all border-2 ${selectedType === type.label ? 'bg-primary border-primary shadow-2xl shadow-primary/40 text-white' : 'bg-surface-dark border-white/5 text-slate-500'}`}
              >
                <div className={`size-16 rounded-2xl flex items-center justify-center ${selectedType === type.label ? 'bg-white/20' : 'bg-white/5 shadow-inner'}`}>
                  <span className={`material-symbols-outlined text-4xl font-black ${selectedType === type.label ? 'text-white' : 'text-slate-300'}`}>{type.icon}</span>
                </div>
                <div className="text-center">
                  <span className="font-black text-sm uppercase tracking-tight block italic">{type.label}</span>
                  <span className={`text-[9px] font-bold ${selectedType === type.label ? 'text-blue-100' : 'text-slate-600'}`}>{type.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* METAS */}
        <div className="grid grid-cols-2 gap-5">
           <div className="bg-surface-dark rounded-[2.5rem] p-7 border border-white/5 relative overflow-hidden">
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-4 italic">Distância (KM)</p>
               <input 
                  type="number" 
                  step="0.1"
                  className="w-full bg-transparent text-5xl font-black text-white italic outline-none border-b-2 border-primary/20 focus:border-primary pb-3 transition-all"
                  value={targetDist}
                  onChange={e => setTargetDist(Number(e.target.value))}
               />
               <div className="flex justify-between mt-4">
                 {[5, 10, 15, 21, 40].map(v => (
                   <button key={v} onClick={() => setTargetDist(v)} className="text-[10px] font-black text-slate-600 hover:text-primary transition-colors">{v}k</button>
                 ))}
               </div>
            </div>
            <div className="bg-surface-dark rounded-[2.5rem] p-7 border border-white/5 relative overflow-hidden">
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-4 italic">Tempo (MIN)</p>
               <input 
                  type="number" 
                  className="w-full bg-transparent text-5xl font-black text-white italic outline-none border-b-2 border-purple-500/20 focus:border-purple-500 pb-3 transition-all"
                  value={targetTime}
                  onChange={e => setTargetTime(Number(e.target.value))}
               />
               <div className="flex justify-between mt-4">
                 {[30, 45, 60, 90].map(v => (
                   <button key={v} onClick={() => setTargetTime(v)} className="text-[10px] font-black text-slate-600 hover:text-purple-400 transition-colors">{v}m</button>
                 ))}
               </div>
            </div>
        </div>

        {/* TERRENO E COACH VOZ */}
        <section className="space-y-6">
           <div className="flex justify-between items-center px-1">
              <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Personalização Técnica</h2>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Feedback de Voz</span>
                 <button 
                  onClick={() => setVoiceCues(!voiceCues)}
                  className={`w-12 h-6 rounded-full transition-all relative ${voiceCues ? 'bg-primary' : 'bg-slate-800'}`}
                 >
                    <div className={`absolute top-1 size-4 rounded-full bg-white transition-all ${voiceCues ? 'left-7' : 'left-1'}`} />
                 </button>
              </div>
           </div>
           
           <div className="flex gap-3">
              {(['Asfalto', 'Trilha', 'Esteira'] as const).map(t => (
                <button 
                  key={t}
                  onClick={() => setTerrain(t)}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${terrain === t ? 'bg-white text-black border-white shadow-xl' : 'bg-surface-dark border-white/5 text-slate-500'}`}
                >
                  {t}
                </button>
              ))}
           </div>
        </section>

        {/* Removido: SPOTIFY QUICK SELECT */}
      </main>

      <div className="fixed bottom-0 left-0 w-full p-8 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent z-40 pointer-events-none">
        <button 
          onClick={() => onStart({ type: selectedType, targetDistance: targetDist, targetTime: targetTime, terrain, voiceCues })}
          className="pointer-events-auto w-full h-24 bg-primary rounded-[3rem] shadow-[0_25px_60px_rgba(37,140,244,0.6)] flex items-center justify-center gap-5 group active:scale-[0.96] transition-all hover:brightness-110"
        >
          <span className="text-white text-2xl font-black uppercase tracking-[0.2em] italic">Lançar Missão</span>
          <span className="material-symbols-outlined text-4xl text-white group-hover:translate-x-2 transition-transform">trending_flat</span>
        </button>
      </div>
    </div>
  );
};

export default StartActivity;