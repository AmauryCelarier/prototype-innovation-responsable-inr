'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { calculateScores } from '@/hooks/useScoring';

export default function DiagnosticPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const { stats, progressPercent } = calculateScores(questions, responses);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // 1. Charger les questions
    const { data: qData } = await supabase.from('questions').select('*').order('numero');
    if (qData) setQuestions(qData);

    // 2. Charger les réponses existantes de l'utilisateur
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: rData } = await supabase
        .from('responses')
        .select('question_id, score')
        .eq('user_id', user.id);
      
      if (rData) {
        const map: Record<number, string> = {};
        rData.forEach(r => map[r.question_id] = r.score);
        setResponses(map);
      }
    }
  }

  const handleVote = async (questionId: number, score: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Connectez-vous !");

    setResponses(prev => ({ ...prev, [questionId]: score }));

    await supabase.from('responses').upsert({ 
      user_id: user.id, 
      question_id: questionId, 
      score: score,
      project_id: projectId 
    }, { onConflict: 'user_id,question_id' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER FIXE */}
      <div className="bg-white border-b sticky top-0 z-30 p-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Étape 1 : Diagnostic de Maturité</h1>
          <div className="flex items-center gap-6">
            <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Projet : {projectId ? "En cours" : "Non défini"}
            </div>
          </div>
        </div>
      </div>

      {/* BARRE DE PROGRESSION FIXE SOUS LE HEADER */}
      <div className="sticky top-[69px] z-20 bg-white/80 backdrop-blur-md border-b p-3">
        <div className="max-w-[1600px] mx-auto flex items-center gap-4">
          <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-700 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-black text-blue-600 w-12">{progressPercent}%</span>
        </div>
      </div>

      {/* CONTENU PRINCIPAL : GRILLE DEUX COLONNES */}
      <div className="max-w-[1600px] mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* COLONNE GAUCHE : QUESTIONS (Scrollable) */}
          <div className="flex-1 space-y-6 w-full lg:max-w-4xl">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                      {q.dimension}
                    </span>
                    <span className="text-slate-300 text-xs font-medium">Question {q.numero}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 leading-tight">{q.intitule}</h3>

                  <div className="mt-4">
                    {q.reponse_0 ? (
                      <div className="grid grid-cols-1 gap-2">
                        {[0, 1, 2, 3, 4].map((num) => {
                          const isSelected = responses[q.id] === num.toString();
                          return (
                            <button 
                              key={num}
                              onClick={() => handleVote(q.id, num.toString())}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${
                                isSelected ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-100 hover:border-slate-300 bg-slate-50'
                              }`}
                            >
                              <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black ${
                                isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-400'
                              }`}>
                                {num}
                              </span>
                              <span className={`text-sm ${isSelected ? 'text-blue-900 font-semibold' : 'text-slate-600'}`}>
                                {q[`reponse_${num}`]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea 
                          className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all h-32 text-sm"
                          placeholder="Saisissez votre réponse détaillée ici..."
                          defaultValue={responses[q.id] || ""}
                          onBlur={(e) => handleVote(q.id, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleVote(q.id, 'N/A')}
                    className={`mt-4 text-[10px] font-bold tracking-widest px-4 py-2 rounded-lg border-2 transition-all uppercase ${
                      responses[q.id] === 'N/A' 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'border-transparent text-slate-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    Non applicable
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* COLONNE DROITE : TABLEAU DE SCORES (STICKY) */}
          <aside className="w-full lg:w-[400px] sticky top-[140px]">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="p-2 bg-blue-600 rounded-lg text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </div>
                <h2 className="font-black text-slate-800 text-lg uppercase tracking-tight">Analyse des scores</h2>
              </div>

              <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-300px)] pr-2 custom-scrollbar">
                {Object.entries(stats).map(([name, data]: any) => {
                  const hasData = data.answered > 0;
                  const scoreFinal = hasData 
                    ? (data.totalWeightedNote / data.totalWeight).toFixed(1) 
                    : "N/A";
                    
                  return (
                    <div key={name} className="group">
                      <div className="flex justify-between items-end text-xs mb-2">
                        <span className="text-slate-500 font-bold truncate pr-4">{name}</span>
                        <span className={`font-black whitespace-nowrap px-2 py-0.5 rounded ${hasData ? 'text-blue-700 bg-blue-50' : 'text-slate-300 bg-slate-50'}`}>
                          {scoreFinal}{hasData ? <span className="text-[10px] ml-0.5 opacity-50">/4</span> : ''}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        {hasData ? (
                          <div 
                            className="bg-blue-600 h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
                            style={{ width: `${(parseFloat(scoreFinal) / 4) * 100}%` }}
                          />
                        ) : (
                          <div className="bg-slate-200 h-full w-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    Note : Les moyennes sont pondérées par le niveau de criticité des questions.
                  </p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}