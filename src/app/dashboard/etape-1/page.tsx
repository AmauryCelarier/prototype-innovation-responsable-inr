/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { calculateScores } from '@/hooks/useScoring';
import DiagnosticRadar from '@/components/RadarChart';
import Link from 'next/link';

export default function DiagnosticPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const { stats, progressPercent } = calculateScores(questions, responses);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    const { data: qData } = await supabase.from('questions').select('*').order('numero');
    if (qData) setQuestions(qData);

    const { data: { user } } = await supabase.auth.getUser();
    if (user && projectId) {
      const { data: rData } = await supabase
        .from('responses')
        .select('question_id, score')
        .eq('user_id', user.id)
        .eq('project_id', projectId);

      if (rData) {
        const map: Record<number, string> = {};
        rData.forEach(r => map[r.question_id] = r.score);
        setResponses(map);
      }
    }
  }

  const handleVote = async (questionId: number, score: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !projectId) return alert("Connectez-vous !");

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
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">

          {/* GAUCHE : VIDE (Pour centrer le milieu) */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">Étape 1</h1>
          </div>

          {/* MILIEU : TITRE + RETOUR DASHBOARD */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">
              Diagnostic de Maturité
            </h1>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Retour aux services
            </Link>
          </div>

          {/* DROITE : BOUTON SUIVANT DYNAMIQUE */}
          <div className="flex justify-end">
                      <Link
                        href={`/dashboard/etape-2?projectId=${projectId}`}
                        className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-100 group"
                      >
                        <div className="flex flex-col items-end leading-none">
                          <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Passer à l&apos;</span>
                          <span className="text-sm">Étape 2</span>
                        </div>
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
        </div>
      </div>

      {/* BARRE DE PROGRESSION */}
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

      <div className="max-w-[1600px] mx-auto px-6 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* COLONNE GAUCHE : QUESTIONS */}
          <div className="flex-1 space-y-6 w-full lg:max-w-4xl">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 text-slate-900">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                      {q.dimension}
                    </span>
                    <span className="text-slate-300 text-xs font-medium">Question {q.numero}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-6 leading-tight">{q.intitule}</h3>

                  <div className="mt-4 text-slate-900">
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
                      <textarea
                        className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none h-32 text-sm text-slate-900"
                        placeholder="Saisissez votre réponse ici..."
                        defaultValue={responses[q.id] || ""}
                        onBlur={(e) => handleVote(q.id, e.target.value)}
                      />
                    )}
                  </div>

                  <button
                    onClick={() => handleVote(q.id, 'N/A')}
                    className={`mt-4 text-[10px] font-bold tracking-widest px-4 py-2 rounded-lg border-2 transition-all uppercase ${
                      responses[q.id] === 'N/A' ? 'bg-red-50 border-red-200 text-red-600' : 'border-transparent text-slate-400 hover:text-red-500'
                    }`}
                  >
                    Non applicable
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* COLONNE DROITE : ANALYSE */}
          <aside className="w-full lg:w-[400px] sticky top-[140px]">
            <div className="overflow-y-auto bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col max-h-[calc(100vh-160px)]">

              {/* 1. NOTES GLOBALES */}
              <div className="p-6 border-b">
                <h2 className="font-black text-slate-800 text-lg uppercase mb-4 flex items-center gap-2 text-slate-900">
                  <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                  Analyses
                </h2>
              </div>

              {/* 2. DIMENSIONS */}
              <div className="flex-1 p-6 space-y-4 bg-slate-50/50">
                {Object.entries(stats)
                  .sort(([nameA], [nameB]) => nameA.localeCompare(nameB, undefined, {numeric: true}))
                  .map(([name, data]: any) => {
                    const hasData = data.answered > 0;
                    const scoreFinal = hasData ? (data.totalWeightedNote / data.totalWeight).toFixed(1) : "N/A";

                    return (
                      <div key={name} className="group">
                        <div className="flex justify-between items-end text-[11px] mb-1.5">
                          <span className="text-slate-600 font-bold truncate pr-2 text-slate-900">{name}</span>
                          <span className={`font-black px-1.5 py-0.5 rounded ${hasData ? 'text-blue-700 bg-blue-50' : 'text-slate-300'}`}>
                            {scoreFinal}{hasData ? '/4' : ''}
                          </span>
                        </div>
                        <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-slate-100">
                          {hasData && (
                            <div
                              className="bg-blue-600 h-full transition-all duration-1000"
                              style={{ width: `${(parseFloat(scoreFinal) / 4) * 100}%` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                })}
              </div>

              {/* 3. RADAR */}
              <div className="p-4 border-t border-slate-100 bg-white rounded-b-3xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2">Visualisation Radar</p>
                <div className="h-[220px] w-full">
                  <DiagnosticRadar stats={stats} />
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}