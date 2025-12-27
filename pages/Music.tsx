
import React, { useState } from 'react';

interface MusicProps {
  onBack: () => void;
}

const Music: React.FC<MusicProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSpotifySearch = () => {
    if (!searchQuery.trim()) return;
    
    // Tenta abrir o app nativo primeiro, fallback para web
    const query = encodeURIComponent(searchQuery);
    // Deep Link para busca
    const appUrl = `spotify:search:${query}`;
    const webUrl = `https://open.spotify.com/search/${query}`;

    // Tentar abrir app (comportamento varia por browser/OS)
    window.location.href = appUrl;
    
    // Fallback manual se o usuário não tiver o app
    setTimeout(() => {
       if (confirm("Não detectamos o app do Spotify. Deseja abrir no navegador?")) {
         window.open(webUrl, '_blank');
       }
    }, 1000);
  };

  const openSpotifyApp = () => {
      window.location.href = "spotify:app";
      setTimeout(() => {
          window.open("https://open.spotify.com", "_blank");
      }, 500);
  };

  const openPlaylist = (type: string) => {
      // Links genéricos para busca de playlists temáticas
      const query = encodeURIComponent(`${type} workout music`);
      window.location.href = `spotify:search:${query}`;
  };

  return (
    <div className="bg-[#101922] min-h-screen pb-32 flex flex-col overflow-y-auto no-scrollbar">
      <header className="flex items-center px-6 pt-10 pb-6 border-b border-white/5 sticky top-0 bg-[#101922]/95 backdrop-blur-xl z-50">
        <button onClick={onBack} className="size-11 flex items-center justify-center rounded-2xl bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h2 className="flex-1 text-center text-white text-2xl font-black tracking-tight italic uppercase">Audio Command</h2>
        <div className="size-11"></div>
      </header>

      <main className="px-6 pt-8 space-y-10 flex-1">
        
        {/* STATUS CARD */}
        <div className="bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-[2.5rem] p-8 flex items-center justify-between shadow-[0_0_40px_rgba(29,185,84,0.1)]">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-2xl bg-[#1DB954] flex items-center justify-center text-black shadow-lg shadow-[#1DB954]/20 animate-pulse-slow">
              <span className="material-symbols-outlined text-3xl font-black">graphic_eq</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                 <div className="size-2 bg-[#1DB954] rounded-full animate-pulse"></div>
                 <p className="text-[#1DB954] text-[10px] font-black uppercase tracking-widest">Integração Ativa</p>
              </div>
              <h4 className="text-white font-black text-xl tracking-tighter italic">Spotify Connect</h4>
            </div>
          </div>
          <button 
            onClick={openSpotifyApp}
            className="size-12 rounded-full bg-white/5 flex items-center justify-center text-white active:scale-90 transition-all border border-white/10 hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-2xl">open_in_new</span>
          </button>
        </div>

        {/* SEARCH SECTION */}
        <section className="space-y-4">
           <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest px-2">Buscar Faixas ou Podcasts</h3>
           <div className="relative">
              <input 
                 type="text" 
                 placeholder="O que você quer ouvir hoje?"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSpotifySearch()}
                 className="w-full h-16 bg-surface-dark border border-white/10 rounded-[2rem] pl-14 pr-16 text-white font-bold placeholder:text-slate-600 focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] outline-none transition-all"
              />
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <button 
                onClick={handleSpotifySearch}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-[#1DB954] rounded-[1.5rem] flex items-center justify-center text-black shadow-lg active:scale-95 transition-all"
              >
                 <span className="material-symbols-outlined font-black">arrow_forward</span>
              </button>
           </div>
        </section>

        {/* QUICK PLAYLISTS */}
        <section className="space-y-6">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-white text-xl font-black tracking-tight italic uppercase">Playlists de Ritmo</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
             {[
                { label: 'Warm Up', query: 'Warm up cardio', color: 'from-orange-500', icon: 'local_fire_department' },
                { label: 'High Power', query: 'High intensity workout', color: 'from-red-600', icon: 'bolt' },
                { label: 'Long Run', query: 'Long run endurance', color: 'from-blue-600', icon: 'directions_run' },
                { label: 'Recovery', query: 'Cool down chill', color: 'from-emerald-500', icon: 'spa' }
             ].map((item, i) => (
                <button 
                   key={i}
                   onClick={() => openPlaylist(item.query)}
                   className="h-32 rounded-[2rem] bg-surface-dark border border-white/5 relative overflow-hidden group active:scale-95 transition-all"
                >
                   <div className={`absolute inset-0 bg-gradient-to-br ${item.color} to-transparent opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                   <div className="absolute bottom-4 left-5">
                      <div className="bg-white/10 backdrop-blur-md size-10 rounded-xl flex items-center justify-center mb-2">
                         <span className="material-symbols-outlined text-white text-xl">{item.icon}</span>
                      </div>
                      <span className="text-white text-sm font-black uppercase tracking-tight italic">{item.label}</span>
                   </div>
                   <span className="material-symbols-outlined absolute top-4 right-4 text-white/20 -rotate-45">open_in_new</span>
                </button>
             ))}
          </div>
        </section>

        {/* PLAYER CONTROL MOCKUP (Visual only, controls app) */}
        <section className="pt-4">
             <div className="flex flex-col items-center space-y-6 opacity-60">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest text-center max-w-[200px]">
                   Use os controles do seu fone ou o app do Spotify para gerenciar a reprodução.
                </p>
                <button onClick={openSpotifyApp} className="text-[#1DB954] text-xs font-black uppercase tracking-widest border-b border-[#1DB954]/30 pb-1">
                   Ir para o App
                </button>
             </div>
        </section>

      </main>
    </div>
  );
};

export default Music;
