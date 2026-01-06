'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DiagnosticPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchData();
    const fetchQuestions = async () => {
      const { data, error } = await supabase.from('questions').select('*').order('numero');
      if (error) console.error("Erreur Supabase :", error.message);
      console.log("Données reçues :", data);
      if (data) setQuestions(data);
    };
    fetchQuestions();
  }, []);

  async function fetchData() {
    const { data: qData } = await supabase.from('questions').select('*').order('numero');
    if (qData) setQuestions(qData);

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
      score: score 
    }, { onConflict: 'user_id,question_id' });
    
    alert(`Réponse ${score} enregistrée !`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header style Jyros */}
      <div className="bg-white border-b sticky top-0 z-10 p-4 mb-8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Étape 1 : Diagnostic de Maturité</h1>
          <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Score en cours...
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {questions.map((q) => (
          <div key={q.id} className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                  {q.dimension}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-6">{q.intitule}</h3>

              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map((num) => {
                  const isSelected = responses[q.id] === num.toString();
                  return (
                    <button 
                      key={num}
                      onClick={() => handleVote(q.id, num.toString())}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 ${
                        isSelected 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-slate-100 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-400'
                      }`}>
                        {num}
                      </span>
                      <span className={isSelected ? 'text-blue-900 font-medium' : 'text-slate-600'}>
                        {q[`reponse_${num}`]}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => handleVote(q.id, 'N/A')}
                className={`mt-4 text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  responses[q.id] === 'N/A' ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-red-500'
                }`}
              >
                NON APPLICABLE
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}