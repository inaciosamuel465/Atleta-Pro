
import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import html2canvas from 'html2canvas';
import { Activity } from '../types';
import { WORKOUT_GALLERY } from '../constants';

interface PostWorkoutProps {
  onSave: (data: Partial<Activity>) => Promise<void>;
  onDiscard: () => void;
  onClose?: () => void;
  workout: Partial<Activity> | null;
  isHistorical?: boolean;
}

const PostWorkout: React.FC<PostWorkoutProps> = ({ onSave, onDiscard, onClose, workout, isHistorical }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [customPhoto, setCustomPhoto] = useState<string | null>(workout?.activityImage || null);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [template, setTemplate] = useState<'Vortex' | 'Minimal' | 'Datastream'>('Vortex');
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Map Initialization Logic
  useEffect(() => {
    // Apenas inicializa mapa se não houver foto customizada E se houver coordenadas
    if (!customPhoto && workout?.routeCoords && workout.routeCoords.length > 0 && mapContainerRef.current) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        touchZoom: false,
        zoomSnap: 0.1
      });
      
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      
      const polyline = L.polyline(workout.routeCoords, { 
        color: '#258cf4', 
        weight: 6,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'drop-shadow-[0_0_10px_rgba(37,140,244,0.6)]'
      }).addTo(map);

      const startPoint = workout.routeCoords[0];
      const endPoint = workout.routeCoords[workout.routeCoords.length - 1];

      L.circleMarker(startPoint, { radius: 6, fillColor: '#00e676', color: '#ffffff', weight: 2, fillOpacity: 1 }).addTo(map);
      L.circleMarker(endPoint, { radius: 6, fillColor: '#ff1744', color: '#ffffff', weight: 2, fillOpacity: 1 }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [80, 80] });
    }
  }, [workout, customPhoto, template, aspectRatio]); 

  const handleInitialSave = () => {
      setShowShareModal(true);
  };

  const handleFinish = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      let finalImage = customPhoto;

      // Se não tem foto customizada, gera um snapshot do mapa automaticamente para o histórico
      if (!finalImage && cardRef.current) {
         try {
            const blob = await captureImage(true); // true = low quality for DB storage
            if (blob) {
                finalImage = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                });
            }
         } catch (e) {
            console.warn("Could not auto-generate map image", e);
         }
      }

      await onSave({
        ...workout,
        activityImage: finalImage || undefined,
        aspectRatio,
        template: template as any
      });
    } catch (e) {
      console.error("Save failed", e);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
      setShowShareModal(false);
    }
  };

  // Optimized capture for both High Res (Sharing) and Low Res (DB Storage)
  const captureImage = async (forDatabase: boolean = false): Promise<Blob | null> => {
      if (!cardRef.current) return null;
      setIsCapturing(true);
      try {
          // Pequeno delay para garantir renderização do mapa
          await new Promise(r => setTimeout(r, 200));
          
          const canvas = await html2canvas(cardRef.current, {
              useCORS: true,
              scale: forDatabase ? 1.5 : 3, // Menor escala para DB para não estourar limite de 1MB
              backgroundColor: '#0a0f14',
              logging: false,
              allowTaint: true
          });
          
          return new Promise((resolve) => {
              // JPEG com qualidade reduzida se for para banco de dados
              canvas.toBlob((blob) => resolve(blob), 'image/jpeg', forDatabase ? 0.6 : 0.95);
          });
      } catch (err) {
          console.error("Erro ao gerar imagem", err);
          return null;
      } finally {
          setIsCapturing(false);
      }
  };

  const handleShareNative = async () => {
      const blob = await captureImage(false);
      if (blob && navigator.share) {
          const file = new File([blob], 'atleta-pro-activity.png', { type: 'image/png' });
          try {
              await navigator.share({
                  files: [file],
                  title: 'Atleta Pro Run',
                  text: `Treino finalizado: ${workout?.distance}km 🚀`
              });
          } catch (e) {
              console.log("Compartilhamento cancelado");
          }
      } else {
          handleDownload();
      }
  };

  const handleDownload = async () => {
      const blob = await captureImage(false);
      if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `atleta-pro-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  };

  const handleInstagram = async () => {
      await handleDownload();
      alert("Imagem salva na galeria! Abra o Instagram e compartilhe.");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPhoto(reader.result as string);
        setShowPhotoPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!workout) return null;

  // --- TEMPLATE RENDERERS ---
  const renderVortex = () => (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-20">
       <div className="pt-8 px-8 flex justify-between items-start">
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
             <span className="material-symbols-outlined text-primary text-sm">sprint</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-white">Atleta Pro</span>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{workout.date}</p>
          </div>
       </div>
       <div className="p-6 w-full">
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden w-full">
             <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary/40 blur-[50px] rounded-full"></div>
             <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-baseline justify-between border-b border-white/10 pb-4 mb-2">
                   <div>
                       <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mb-1 italic">Distância</p>
                       <h1 className="text-6xl font-black italic tracking-tighter text-white leading-none drop-shadow-lg font-lexend">
                          {workout.distance?.toFixed(2)}
                          <span className="text-2xl text-slate-400 ml-2 align-baseline not-italic font-bold">KM</span>
                       </h1>
                   </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                   <div>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Tempo</p>
                      <p className="text-2xl font-black italic text-white font-lexend">{workout.time}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Ritmo</p>
                      <p className="text-2xl font-black italic text-white font-lexend">{workout.pace}</p>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderMinimal = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8 z-20">
       <div className="absolute top-0 w-full h-40 bg-gradient-to-b from-black/80 to-transparent"></div>
       <div className="absolute bottom-0 w-full h-60 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
       <div className="relative z-10 text-center space-y-2">
          <div className="inline-block bg-primary/90 px-3 py-1 rounded-md mb-4 transform -rotate-2">
             <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{workout.type?.toUpperCase()}</p>
          </div>
          <h1 className="text-[100px] leading-none font-black italic tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-lexend">
             {workout.distance?.toFixed(1)}
          </h1>
          <p className="text-3xl font-black italic uppercase tracking-[0.5em] text-white/90 font-lexend">Quilômetros</p>
       </div>
       <div className="absolute bottom-12 w-full px-12 flex justify-between items-end border-t border-white/20 pt-6">
          <div className="text-left">
             <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Duração</p>
             <p className="text-3xl font-black italic text-white font-lexend">{workout.time}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Ritmo Médio</p>
             <p className="text-3xl font-black italic text-white font-lexend">{workout.pace}</p>
          </div>
       </div>
    </div>
  );

  const renderDatastream = () => (
    <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none z-20">
       <div className="flex justify-between items-start">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl min-w-[90px]">
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Loc</p>
             <p className="text-xs font-bold text-white truncate max-w-[100px]">{workout.location || 'SP, Brasil'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-right">
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Calorias</p>
             <p className="text-lg font-black text-accent-orange italic">{workout.calories} <span className="text-[10px] text-white">kcal</span></p>
          </div>
       </div>
       <div className="bg-black/80 backdrop-blur-xl border-t-4 border-primary p-6 rounded-3xl flex justify-between items-center shadow-2xl">
          <div>
             <div className="flex items-baseline gap-2">
               <h1 className="text-6xl font-black italic tracking-tighter text-white font-lexend">{workout.distance}</h1>
               <span className="text-lg font-black text-slate-500 uppercase italic">KM</span>
             </div>
             <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em] mt-1">Missão Cumprida</p>
          </div>
          <div className="h-12 w-px bg-white/10 mx-2"></div>
          <div className="space-y-2 text-right">
             <div>
                <span className="text-xl font-black text-white italic font-lexend">{workout.time}</span>
                <span className="text-[8px] text-slate-500 block uppercase tracking-widest">Tempo</span>
             </div>
             <div>
                <span className="text-xl font-black text-white italic font-lexend">{workout.pace}</span>
                <span className="text-[8px] text-slate-500 block uppercase tracking-widest">Pace</span>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="bg-background-dark min-h-screen text-white flex flex-col relative animate-in fade-in duration-500 pb-20 overflow-y-auto no-scrollbar">
      <header className="sticky top-0 left-0 w-full z-50 bg-background-dark/80 backdrop-blur-2xl border-b border-white/[0.03]">
        <div className="flex items-center justify-between px-6 py-5 max-w-md mx-auto">
          <button onClick={isHistorical ? onClose : onDiscard} className="size-11 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 active:scale-90 transition-all hover:bg-white/10">
            <span className="material-symbols-outlined text-white text-2xl">{isHistorical ? 'arrow_back' : 'close'}</span>
          </button>
          <div className="text-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic font-display">Share Card</h2>
            <p className="text-[8px] font-bold text-slate-500 uppercase font-display tracking-widest mt-0.5">Edit Mode</p>
          </div>
          <button 
            onClick={handleInitialSave} 
            className={`size-11 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90 bg-surface-dark border border-white/10 hover:brightness-110`}
          >
            <span className="material-symbols-outlined text-xl text-primary">ios_share</span>
          </button>
        </div>
      </header>

      <main className="flex-1 pt-8 px-6 max-w-md mx-auto w-full">
        {/* Card Viewport */}
        <div className="flex justify-center w-full mb-8">
            <div 
              ref={cardRef}
              className={`relative overflow-hidden rounded-[2.5rem] bg-surface-dark shadow-[0_30px_80px_rgba(0,0,0,0.5)] transition-all duration-500 border border-white/5 ${aspectRatio === '9:16' ? 'w-full aspect-[9/16]' : 'w-full aspect-[16/9]'}`}
            >
                {customPhoto ? (
                    <img src={customPhoto} className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-700 z-0" alt="Workout" crossOrigin="anonymous" />
                ) : (
                    <div ref={mapContainerRef} className="absolute inset-0 w-full h-full bg-[#1a1a1a] z-0"></div>
                )}

                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none mix-blend-multiply z-10"></div>
                
                {template === 'Vortex' && renderVortex()}
                {template === 'Minimal' && renderMinimal()}
                {template === 'Datastream' && renderDatastream()}

                {!isCapturing && (
                    <button 
                    onClick={() => setShowPhotoPicker(true)}
                    className="absolute top-6 left-6 size-12 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 active:scale-90 transition-all pointer-events-auto hover:bg-black/60 z-50 shadow-lg"
                    data-html2canvas-ignore="true"
                    >
                    <span className="material-symbols-outlined text-white text-2xl">image</span>
                    </button>
                )}
            </div>
        </div>

        {/* Customization Controls */}
        <section className="space-y-8 mb-12">
            <div className="space-y-3">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic font-display ml-1">Dimensão</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setAspectRatio('9:16')}
                  className={`h-14 rounded-2xl flex items-center justify-center gap-2 border text-[10px] font-black uppercase tracking-widest transition-all ${aspectRatio === '9:16' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-surface-dark border-white/5 text-slate-500 hover:bg-white/5'}`}
                >
                  <span className="material-symbols-outlined text-lg">crop_portrait</span>
                  Story
                </button>
                <button 
                  onClick={() => setAspectRatio('16:9')}
                  className={`h-14 rounded-2xl flex items-center justify-center gap-2 border text-[10px] font-black uppercase tracking-widest transition-all ${aspectRatio === '16:9' ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-surface-dark border-white/5 text-slate-500 hover:bg-white/5'}`}
                >
                  <span className="material-symbols-outlined text-lg">crop_landscape</span>
                  Feed
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic font-display ml-1">Estilo Visual</p>
              <div className="grid grid-cols-3 gap-3">
                {(['Vortex', 'Minimal', 'Datastream'] as const).map((t) => (
                  <button 
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`h-14 rounded-2xl border flex flex-col items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all ${template === t ? 'bg-white text-black border-white shadow-lg scale-105 z-10' : 'bg-surface-dark border-white/5 text-slate-500 hover:bg-white/5'}`}
                  >
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>
        </section>

        {/* BOTÃO SALVAR PRINCIPAL */}
        {!isHistorical && (
          <button 
            onClick={handleFinish}
            disabled={isSaving}
            className="w-full h-20 bg-primary rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,140,244,0.4)] flex items-center justify-center gap-4 active:scale-95 transition-all hover:brightness-110 mb-8"
          >
             {isSaving ? (
                <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
             ) : (
                <>
                  <span className="text-white text-xl font-black uppercase tracking-[0.2em] italic">Salvar Atividade</span>
                  <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
                </>
             )}
          </button>
        )}
      </main>

      {/* Modal Photo Picker */}
      {showPhotoPicker && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-surface-dark rounded-[3.5rem] p-10 border border-white/10 space-y-8">
                <div className="flex justify-between items-center">
                    <h4 className="text-white text-xl font-black uppercase italic tracking-tighter font-lexend">Background</h4>
                    <button onClick={() => setShowPhotoPicker(false)} className="size-10 rounded-xl bg-white/5 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
                    <button 
                      onClick={() => { setCustomPhoto(null); setShowPhotoPicker(false); }}
                      className="h-28 rounded-3xl bg-surface-accent border-2 border-primary/50 flex flex-col items-center justify-center gap-2 text-white relative overflow-hidden"
                    >
                       <div className="absolute inset-0 bg-[#1a1a1a]"></div>
                       <span className="material-symbols-outlined relative z-10 text-3xl">map</span>
                       <span className="text-[8px] font-black uppercase relative z-10">Mapa GPS</span>
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-28 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-400 gap-2 hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                        <span className="text-[8px] font-black uppercase">Galeria</span>
                    </button>
                    {WORKOUT_GALLERY.map((url, i) => (
                        <button key={i} onClick={() => { setCustomPhoto(url); setShowPhotoPicker(false); }} className="h-28 rounded-3xl overflow-hidden hover:scale-95 transition-transform">
                            <img src={url} className="size-full object-cover" crossOrigin="anonymous" />
                        </button>
                    ))}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
          </div>
      )}

      {/* SHARE MODAL - Fix Layout */}
      {showShareModal && (
            <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-end animate-in slide-in-from-bottom duration-300">
                <div className="w-full max-w-md bg-surface-dark border-t border-white/10 rounded-t-[3.5rem] p-8 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
                    <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
                    
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter font-lexend">Compartilhar</h2>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Mostre sua conquista ao mundo.</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <button 
                            onClick={handleInstagram}
                            disabled={isCapturing}
                            className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all"
                        >
                            <span className="material-symbols-outlined text-white text-2xl">camera_alt</span>
                            <span className="text-white text-xs font-black uppercase tracking-widest">Instagram Story</span>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleDownload}
                                disabled={isCapturing}
                                className="h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-white/10"
                            >
                                <span className="material-symbols-outlined text-white text-xl">download</span>
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Baixar</span>
                            </button>

                            <button 
                                onClick={handleShareNative}
                                disabled={isCapturing}
                                className="h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-white/10"
                            >
                                <span className="material-symbols-outlined text-white text-xl">share</span>
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Outros</span>
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowShareModal(false)}
                        className="w-full py-4 rounded-2xl text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
      )}
    </div>
  );
};

export default PostWorkout;
