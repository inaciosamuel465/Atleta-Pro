import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Corrigido: GoogleGenerativeAI
import { AppScreen, UserProfile, Activity } from '../types';
import { showError } from '../src/utils/toast';

interface TrainingPlanProps {
  navigate: (screen: AppScreen) => void;
  user: UserProfile;
  activities: Activity[];
  apiKey: string;
}

const TrainingPlan: React.FC<TrainingPlanProps> = ({ navigate, user, activities, apiKey }) => {
  const [trainingPlan, setTrainingPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastActivity = useMemo(() => activities.length > 0 ? activities[0] : null, [activities]);
  const totalDistance = useMemo(() => activities.reduce((acc, curr) => acc + (curr.distance || 0), 0), [activities]);

  useEffect(() => {
    const generatePlan = async () => {
      if (!apiKey) {
        setError("Chave API do Gemini não configurada. Verifique seu arquivo .env.");
        return;
      }
      setIsLoading(true);
      setError(null);
      setTrainingPlan(null);

      try {
        const ai = new GoogleGenerativeAI({ apiKey }); // Corrigido: GoogleGenerativeAI
        const model = ai.getGenerativeModel({ model: 'gemini-pro' }); // Usando gemini-pro para tarefas mais complexas

        const prompt = `Você é um coach de performance de elite com personalidade ${user.coachPersonality || 'Motivador'}.
        Gere um plano de treino semanal personalizado para ${user.name}, que tem ${user.age} anos, ${user.height}cm de altura, ${user.weight}kg de peso, e seu objetivo principal é ${user.goal}.
        Ele(a) tem uma meta semanal de ${user.weeklyGoal}km e uma meta mensal de ${user.monthlyGoal}km.
        Seu histórico de atividades inclui um total de ${totalDistance.toFixed(1)}km.
        A última atividade registrada foi: ${lastActivity ? `${lastActivity.type} de ${lastActivity.distance}km em ${lastActivity.date} com ritmo de ${lastActivity.pace}.` : 'Nenhuma atividade recente.'}
        
        O plano deve ser realista, progressivo e motivador, considerando o nível atual do atleta.
        Inclua 3-4 sessões de treino por semana, com sugestões de tipo de treino (ex: corrida leve, intervalado, longo, força), duração/distância e um breve objetivo para cada sessão.
        Formate o plano de forma clara, com um título para a semana e subtítulos para cada dia/sessão.
        Mantenha o plano conciso, com no máximo 200 palavras.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        setTrainingPlan(text);

      } catch (e) {
        console.error("Erro ao gerar plano de treino IA:", e);
        showError("Erro ao gerar plano de treino. Verifique sua chave API ou tente novamente.");
        setError("Não foi possível gerar o plano de treino. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };

    generatePlan();
  }, [user, activities, apiKey, lastActivity, totalDistance]);

  return (
    <div className="bg-[#101922] min-h-screen pb-40 no-scrollbar overflow-y-auto">
      <header className="flex items-center px-6 pt-10 pb-6 justify-between border-b border-white/5 sticky top-0 bg-[#101922]/90 backdrop-blur-xl z-20">
        <button onClick={() => navigate(AppScreen.DASHBOARD)} className="size-11 flex items-center justify-center rounded-2xl bg-surface-dark border border-white/5 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h2 className="text-white text-3xl font-black tracking-tight italic uppercase">Plano IA</h2>
        <div className="size-11"></div> {/* Placeholder for alignment */}
      </header>

      <main className="px-6 pt-8 space-y-8">
        <section className="bg-surface-dark rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
          <h3 className="text-white text-xl font-black tracking-tight italic uppercase mb-4">Seu Plano Semanal</h3>
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
              <p className="text-white font-black uppercase tracking-[0.3em] text-xs mt-4">Gerando plano de elite...</p>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center text-sm py-4">{error}</div>
          )}
          {trainingPlan && (
            <div className="prose prose-invert max-w-none text-white">
              {trainingPlan.split('\n').map((line, index) => {
                if (line.startsWith('## ')) {
                  return <h4 key={index} className="text-primary text-lg font-black italic mt-6 mb-2">{line.substring(3)}</h4>;
                }
                if (line.startsWith('* ')) {
                  return <li key={index} className="text-slate-300 text-sm ml-4">{line.substring(2)}</li>;
                }
                if (line.startsWith('**')) {
                  return <p key={index} className="text-white font-bold mt-4">{line.replace(/\*\*/g, '')}</p>;
                }
                return <p key={index} className="text-slate-300 text-sm mb-1">{line}</p>;
              })}
            </div>
          )}
          {!isLoading && !trainingPlan && !error && (
            <div className="text-slate-500 text-center text-sm py-10">Nenhum plano gerado ainda.</div>
          )}
        </section>
      </main>
    </div>
  );
};

export default TrainingPlan;