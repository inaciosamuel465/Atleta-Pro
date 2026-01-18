import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { Activity, UserProfile, Lap } from '../types';

interface LiveActivityProps {
  onFinish: (data: Partial<Activity>) => void;
  workoutConfig: Partial<Activity>;
  user: UserProfile;
}

// Haversine Formula for precise distance
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const LiveActivity: React.FC<LiveActivityProps> = ({ onFinish, workoutConfig, user }) => {
  const [seconds, setSeconds] = useState(0);
  const [gpsDistance, setGpsDistance] = useState(0); // Distância do GPS
  const [manualDistance, setManualDistance] = useState(0); // Distância manual para esteira
  const [isPaused, setIsPaused] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [currentHeartRate, setCurrentHeartRate] = useState(0); // Novo estado para frequência cardíaca
  const heartRateHistoryRef = useRef<number[]>([]); // Histórico para calcular a média

  const [lastKmMarked, setLastKmMarked] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(workoutConfig.voiceCues !== false);
  const [showMusicMenu, setShowMusicMenu] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null); // Adicionado: Referência para o container do mapa
  const mapRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const lastPosRef = useRef<GeolocationPosition | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const isTreadmillMode = workoutConfig.terrain === 'Esteira';

  // Distância total atual, baseada no modo (GPS ou manual)
  const currentTotalDistance = isTreadmillMode ? manualDistance : gpsDistance;

  // Text-to-Speech Helper
  const speakStats = useMemo(() => {
    if (!window.speechSynthesis) return () => {};
    return (km: number, time: string, pace: string) => {
      if (!voiceEnabled) return;

      const paceParts = pace.replace('"', '').split("'");
      const paceSpeak = `${paceParts[0]} minutos e ${paceParts[1]} segundos`;
      const text = `Quilômetro ${km} completado. Tempo total: ${time}. Ritmo médio: ${paceSpeak} por quilômetro.`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    };
  }, [voiceEnabled]);

  // Keep Screen Awake (Crucial for Web GPS Tracking)
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error(`${err} - Wake Lock not supported`);
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, []);

  // Map Init and Cleanup (only if not treadmill mode)
  useEffect(() => {
    if (!isTreadmillMode && mapContainerRef.current) {
      if (!mapRef.current) { // Initialize map only once
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([-23.5505, -46.6333], 16);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { // Usar light_all para mapa claro
          subdomains: 'abcd',
          maxZoom: 19
        }).addTo(mapRef.current);
        
        polylineRef.current = L.polyline([], { 
          color: '#E95420', // Cor da primary
          weight: 6,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
          className: 'drop-shadow-[0_0_10px_rgba(233,84,32,0.6)]'
        }).addTo(mapRef.current);

        markerRef.current = L.circleMarker([-23.5505, -46.6333], {
          radius: 8,
          fillColor: '#1A1A1A', // Cor do texto escuro
          color: '#E95420', // Cor da primary
          weight: 4,
          fillOpacity: 1
        }).addTo(mapRef.current);
      }
    } else {
      // Cleanup map if switching to treadmill mode or unmounting
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        polylineRef.current = null;
        markerRef.current = null;
      }
    }
    // Cleanup function for map
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        polylineRef.current = null;
      }
    };
  }, [isTreadmillMode]); // Only re-run if treadmill mode changes

  const timeStr = useMemo(() => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, [seconds]);

  // Pace Calculation (Smoothed)
  const paceStr = useMemo(() => {
    if (currentTotalDistance < 0.1 || seconds < 10) return "0'00\"";
    
    const avgPaceDecimal = (seconds / 60) / currentTotalDistance;
    
    const mins = Math.floor(avgPaceDecimal);
    const secs = Math.round((avgPaceDecimal - mins) * 60);
    return `${mins}'${secs < 10 ? '0' + secs : secs}"`;
  }, [currentTotalDistance, seconds]);

  // Main Timer Logic
  useEffect(() => {
    if (!isPaused) {
      timerIntervalRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPaused]);

  // GPS Tracking Logic
  useEffect(() => {
    let watchId: number | undefined;

    if (!isPaused && !isTreadmillMode) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy, speed } = pos.coords;
          const newCoord: [number, number] = [latitude, longitude];
          setGpsAccuracy(accuracy);

          // Filtro de Precisão: Ignora pontos com precisão pior que 50 metros
          if (accuracy > 50) return;

          setGpsDistance(prevGpsDistance => {
            if (lastPosRef.current) {
              const d = getDistance(
                lastPosRef.current.coords.latitude, 
                lastPosRef.current.coords.longitude, 
                latitude, 
                longitude
              );
              
              const timeDelta = (pos.timestamp - lastPosRef.current.timestamp) / 1000; // segundos
              let calculatedSpeed = 0;

              if (timeDelta > 0) { // Evita divisão por zero
                calculatedSpeed = (d * 1000) / timeDelta * 3.6; // m/s para km/h
              }

              // Atualiza a velocidade atual de forma mais direta, com alguns filtros
              // Se pos.coords.speed estiver disponível e parecer razoável, usa-o. Caso contrário, usa calculatedSpeed.
              if (speed !== null && speed * 3.6 < 100) { // Verificação básica de sanidade para velocidade do dispositivo
                setCurrentSpeed(speed * 3.6);
              } else if (calculatedSpeed > 0.5 && calculatedSpeed < 100) { // Usa velocidade calculada se a do dispositivo for ruim/nula e for razoável
                setCurrentSpeed(calculatedSpeed);
              } else {
                setCurrentSpeed(0); // Se nenhuma velocidade confiável, assume parado
              }

              // Lógica de acumulação de distância (mantém filtros existentes)
              // Filtra movimentos muito pequenos (jitter) e saltos grandes e irrealistas (teletransporte)
              const impliedSpeedForDistanceFilter = (d * 1000) / timeDelta; // m/s
              if (d > 0.004 && impliedSpeedForDistanceFilter < 10) { 
                setRoute(prev => [...prev, newCoord]);
                return prevGpsDistance + d;
              }
            }
            return prevGpsDistance; // Retorna a distância anterior se os filtros não passarem
          });

          // Map Updates (always update visuals even if distance is filtered for smoothness)
          if (mapRef.current && polylineRef.current && markerRef.current) {
            mapRef.current.panTo(newCoord, { animate: true, duration: 1 });
            polylineRef.current.addLatLng(newCoord);
            markerRef.current.setLatLng(newCoord);
          }
          lastPosRef.current = pos;
        }, 
        (err) => console.warn("GPS Error:", err), 
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 5000 
        }
      );
    }

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [isPaused, isTreadmillMode]); // Dependências: isPaused e isTreadmillMode

  // Heart Rate Simulation
  useEffect(() => {
    if (isPaused || isTreadmillMode) { // HR only active when not paused and not treadmill mode
      setCurrentHeartRate(0);
      return;
    }

    const simulateHeartRate = () => {
      // Base HR, adjust based on activity intensity (simulated by speed)
      let baseHr = 80; // Resting HR
      if (currentSpeed > 0) {
        baseHr = 120 + Math.floor(currentSpeed * 2); // Increase with speed
      }
      
      // Add some random fluctuation
      const fluctuation = Math.floor(Math.random() * 10) - 5; // +/- 5 bpm
      let newHr = baseHr + fluctuation;

      // Keep HR within a reasonable range (e.g., 60-190 bpm)
      newHr = Math.max(60, Math.min(190, newHr));
      
      setCurrentHeartRate(newHr);
      heartRateHistoryRef.current.push(newHr); // Store for average calculation
    };

    const hrInterval = setInterval(simulateHeartRate, 2000); // Update every 2 seconds

    return () => clearInterval(hrInterval);
  }, [isPaused, isTreadmillMode, currentSpeed]);

  // Lap Logic (uses currentTotalDistance)
  useEffect(() => {
    const currentKm = Math.floor(currentTotalDistance);
    if (currentKm > lastKmMarked) {
      setLastKmMarked(currentKm);
      const lapData = { km: currentKm, time: timeStr, pace: paceStr };
      setLaps(prev => [...prev, lapData]);
      speakStats(currentKm, timeStr, paceStr);
    }
  }, [currentTotalDistance, lastKmMarked, timeStr, paceStr, speakStats]);


  const handleOpenSpotify = (query?: string) => {
    if (query) {
      const q = encodeURIComponent(query);
      window.location.href = `spotify:search:${q}`;
      setTimeout(() => window.open(`https://open.spotify.com/search/${q}`, '_blank'), 500);
    } else {
      window.location.href = "spotify:app";
      setTimeout(() => window.open("https://open.spotify.com", "_blank"), 500);
    }
  };

  const handleFinishWorkout = () => {
    const totalHeartRate = heartRateHistoryRef.current.reduce((sum, hr) => sum + hr, 0);
    const averageHeartRate = heartRateHistoryRef.current.length > 0 
      ? Math.round(totalHeartRate / heartRateHistoryRef.current.length) 
      : 0;

    onFinish({ 
      distance: currentTotalDistance, 
      time: timeStr, 
      pace: paceStr, 
      routeCoords: route, 
      laps: laps,
      heartRate: averageHeartRate // Salva a média da FC
    });
  };

  return (
    <div className="h-full w-full bg-background-light text-text-dark flex flex-col overflow-hidden relative">
      {!isTreadmillMode && <div id="live-map" ref={mapContainerRef} className="absolute inset-0 z-0"></div>}
      <div className="absolute inset-0 bg-gradient-to-b from-background-light/80 via-transparent to-background-light/95 z-10 pointer-events-none"></div>

      {/* GPS Signal Indicator (only if not treadmill mode) */}
      {!isTreadmillMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-surface-light/80 backdrop-blur-md px-3 py-1 rounded-full border border-surface-medium">
          <div className={`size-2 rounded-full ${gpsAccuracy && gpsAccuracy < 15 ? 'bg-green-500' : gpsAccuracy && gpsAccuracy < 30 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
          <span className="text-[9px] font-black uppercase tracking-widest text-text-light">GPS {gpsAccuracy ? Math.round(gpsAccuracy) + 'm' : 'Wait...'}</span>
        </div>
      )}

      <header className="px-8 pt-16 pb-4 flex justify-between items-end z-20 relative">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic block animate-pulse">
            {isPaused ? 'PAUSADO' : (isTreadmillMode ? 'ESTEIRA' : 'GRAVANDO')}
          </span>
          <h3 className="text-6xl font-black italic tracking-tighter font-lexend leading-none drop-shadow-lg">
            {currentTotalDistance.toFixed(2)} <span className="text-text-light text-lg not-italic font-bold">KM</span>
          </h3>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={() => setShowMusicMenu(true)}
                className="size-12 rounded-2xl flex items-center justify-center border transition-all active:scale-95 bg-[#1DB954] border-[#1DB954] text-white shadow-[0_0_20px_rgba(29,185,84,0.4)]"
            >
                <span className="material-symbols-outlined font-black">music_note</span>
            </button>

            <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`size-12 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${voiceEnabled ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(233,84,32,0.4)]' : 'bg-surface-light/80 backdrop-blur-md border-surface-medium text-text-light'}`}
            >
            <span className="material-symbols-outlined">{voiceEnabled ? 'volume_up' : 'volume_off'}</span>
            </button>
        </div>
      </header>

      {/* Center Feedback Area / Manual Distance Input */}
      <div className="flex-1 z-20 flex items-center justify-center pointer-events-none">
         {isTreadmillMode ? (
            <div className="bg-surface-light/80 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-surface-medium animate-in zoom-in fade-in duration-500 pointer-events-auto">
               <p className="text-text-dark text-xl font-black italic uppercase tracking-tighter mb-2 text-center">Distância Manual</p>
               <input
                  type="number"
                  step="0.1"
                  value={manualDistance.toFixed(1)}
                  onChange={(e) => setManualDistance(parseFloat(e.target.value))}
                  className="w-32 bg-transparent text-center text-5xl font-black text-text-dark italic outline-none border-b-2 border-primary/20 focus:border-primary pb-3 transition-all"
               />
            </div>
         ) : (
            <div className="flex flex-col items-center gap-4">
                {lastKmMarked > 0 && (currentTotalDistance - lastKmMarked < 0.1) && (
                    <div className="bg-surface-light/80 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-surface-medium animate-in zoom-in fade-in duration-500">
                       <p className="text-text-dark text-2xl font-black italic uppercase tracking-tighter">KM {lastKmMarked}</p>
                    </div>
                )}
                {/* Current Speed Display */}
                {!isPaused && currentSpeed > 0.5 && ( // Only show if not paused and moving
                    <div className="bg-surface-light/80 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-surface-medium animate-in zoom-in fade-in duration-500">
                        <p className="text-text-dark text-xl font-black italic uppercase tracking-tighter mb-2 text-center">Velocidade Atual</p>
                        <p className="text-center text-5xl font-black text-text-dark italic font-lexend">{currentSpeed.toFixed(1)} <span className="text-lg text-text-light not-italic font-bold">KM/H</span></p>
                    </div>
                )}
            </div>
         )}
      </div>

      {/* Control Panel */}
      <section className="bg-surface-light/80 backdrop-blur-[40px] rounded-t-[3.5rem] p-8 pb-16 z-30 shadow-[0_-20px_60px_rgba(0,0,0,0.2)] border-t border-surface-medium">
        <div className="grid grid-cols-3 gap-8 mb-10 px-4"> {/* Alterado para 3 colunas */}
           <div className="text-center">
              <p className="text-text-light text-[10px] font-black uppercase tracking-widest mb-1 italic">Ritmo Médio</p>
              <h4 className="text-4xl font-black italic tracking-tighter font-lexend text-text-dark">{paceStr}</h4>
           </div>
           <div className="text-center relative">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-surface-medium"></div>
              <p className="text-text-light text-[10px] font-black uppercase tracking-widest mb-1 italic">Cronômetro</p>
              <h4 className="text-4xl font-black italic tracking-tighter font-lexend text-text-dark">{timeStr}</h4>
           </div>
           <div className="text-center relative">
              <div className="absolute left-0 top-2 bottom-2 w-px bg-surface-medium"></div>
              <p className="text-text-light text-[10px] font-black uppercase tracking-widest mb-1 italic">F. Cardíaca</p>
              <h4 className="text-4xl font-black italic tracking-tighter font-lexend text-text-dark">
                {currentHeartRate > 0 ? currentHeartRate : '--'} <span className="text-lg text-text-light not-italic font-bold">BPM</span>
              </h4>
           </div>
        </div>

        <div className="flex gap-4">
           <button 
              onClick={() => setIsPaused(!isPaused)}
              className={`h-24 flex-1 rounded-[2.5rem] border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${isPaused ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/30' : 'bg-surface-light border-surface-medium text-text-dark hover:bg-surface-medium'}`}
           >
              <span className="material-symbols-outlined text-4xl font-black">{isPaused ? 'play_arrow' : 'pause'}</span>
              <span className="text-[9px] font-black uppercase tracking-widest italic">{isPaused ? 'Retomar' : 'Pausar'}</span>
           </button>
           
           <button 
              onClick={handleFinishWorkout}
              className="h-24 flex-1 rounded-[2.5rem] bg-primary text-white flex flex-col items-center justify-center gap-1 active:scale-95 shadow-2xl transition-all"
           >
              <span className="material-symbols-outlined text-4xl font-black">stop</span>
              <span className="text-[9px] font-black uppercase tracking-widest italic">Finalizar</span>
           </button>
        </div>
      </section>

      {/* MUSIC MENU OVERLAY */}
      {showMusicMenu && (
          <div className="absolute inset-0 z-50 bg-background-light/90 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
             <div onClick={() => setShowMusicMenu(false)} className="flex-1 w-full" />
             <div className="bg-surface-light rounded-t-[3rem] p-8 border-t border-surface-medium shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#1DB954] text-3xl">graphic_eq</span>
                        <h4 className="text-text-dark text-xl font-black italic uppercase tracking-tighter">DJ Mode</h4>
                    </div>
                    <button onClick={() => setShowMusicMenu(false)} className="size-10 rounded-xl bg-surface-medium/50 flex items-center justify-center"><span className="material-symbols-outlined text-text-dark">close</span></button>
                </div>
                {/* Playlist Buttons */}
                <div className="space-y-3">
                    <button onClick={() => handleOpenSpotify()} className="w-full h-16 rounded-2xl bg-[#1DB954] text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg">
                        <span className="material-symbols-outlined">play_circle</span> Abrir Spotify
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleOpenSpotify('Workout Motivation')} className="h-20 rounded-2xl bg-surface-light border border-surface-medium flex flex-col items-center justify-center gap-1 hover:bg-surface-medium">
                            <span className="material-symbols-outlined text-orange-500">local_fire_department</span> <span className="text-[9px] font-black uppercase text-text-dark">Power Mix</span>
                        </button>
                        <button onClick={() => handleOpenSpotify('Running Hits 160BPM')} className="h-20 rounded-2xl bg-surface-light border border-surface-medium flex flex-col items-center justify-center gap-1 hover:bg-surface-medium">
                             <span className="material-symbols-outlined text-blue-500">bolt</span> <span className="text-[9px] font-black uppercase text-text-dark">160 BPM</span>
                        </button>
                    </div>
                </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default LiveActivity;