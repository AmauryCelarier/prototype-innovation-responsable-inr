'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface IRNCritere {
  id: string;
  dimension: string;
  dimension_id: string;
  critere: string;
  description: string;
  intention: string;
  moyen: string;
  resultat: string;
}

export default function Etape4Page() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [criteres, setCriteres] = useState<IRNCritere[]>([]);
  const [reponses, setReponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!projectId) return;
      setLoading(true);

      try {
        // 1. Récupérer le référentiel depuis 'resilience' (ou 'irn_reference')
        const { data: refData } = await supabase
          .from('resilience')
          .select('*')
          .order('id', { ascending: true });

        if (refData) setCriteres(refData);

        // 2. Récupérer les réponses déjà enregistrées dans la table de liaison
        const { data: savedScores } = await supabase
          .from('resilience_responses')
          .select('critere_id, score')
          .eq('project_id', projectId);

        if (savedScores) {
          // On transforme la liste [ {critere_id: 'RES-1.1', score: 3} ]
          // en objet { 'RES-1.1': 3 } pour l'état local
          const formattedAnswers = savedScores.reduce((acc, curr) => ({
            ...acc,
            [curr.critere_id]: curr.score
          }), {});
          setReponses(formattedAnswers);
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [projectId]);

  const getRecommendation = (item: IRNCritere, score: number) => {
    if (score === 0) return "Aucune mesure identifiée (Risque élevé).";
    if (score === 1) return item.intention;
    if (score === 3) return item.moyen;
    if (score === 5) return item.resultat;
    return "";
  };

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    setMessage('');

    // On prépare les données au format de la table de liaison
    const dataToSave = Object.entries(reponses).map(([critereId, scoreValue]) => ({
      project_id: projectId,
      critere_id: critereId,
      score: scoreValue
    }));

    try {
      // Upsert gère la mise à jour si la paire (project_id, critere_id) existe déjà
      const { error } = await supabase
        .from('resilience_responses')
        .upsert(dataToSave, { onConflict: 'project_id,critere_id' });

      if (error) throw error;
      setMessage('✅ Diagnostic enregistré avec succès');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">CHARGEMENT DU RÉFÉRENTIEL...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER FIXE */}
      <div className="bg-white border-b sticky top-0 z-30 p-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <Link href={`/dashboard/etape-3?projectId=${projectId}`} className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg group">
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
              <div className="flex flex-col items-start leading-none text-left font-black">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter">Revenir à l&apos;</span>
                <span className="text-sm uppercase tracking-tighter">Étape 3</span>
              </div>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">Étape 4 : Résilience</h1>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Retour au dashboard
            </Link>
          </div>
          <div className="flex justify-end">
            <Link href={`/dashboard/etape-5?projectId=${projectId}`} className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg group">
              <div className="flex flex-col items-end leading-none text-right font-black">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter">Finaliser l&apos;</span>
                <span className="text-sm uppercase tracking-tighter">Étape 5</span>
              </div>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-12">
        {criteres.map((item) => (
          <div key={item.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 font-black text-6xl select-none">{item.id}</div>

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-100">
                      {item.dimension_id}
                  </span>
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight italic leading-tight">{item.critere}</h3>
                </div>

                <p className="text-slate-500 text-sm mb-10 font-medium leading-relaxed max-w-2xl">
                  {item.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[0, 1, 3, 5].map((val) => (
                    <button
                    key={val}
                    onClick={() => setReponses({ ...reponses, [item.id]: val })}
                    className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group ${
                        reponses[item.id] === val
                        ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xl'
                        : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                    >
                    <span className="text-3xl font-black">{val}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-center opacity-70 leading-none">
                        {val === 0 ? 'Non-Résilient' : val === 1 ? 'Documenté' : val === 3 ? 'Déployé' : 'Contrôlé'}
                    </span>
                    </button>
                ))}
                </div>

                {reponses[item.id] !== undefined && (
                <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">💡</div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Recommandation personnalisée</p>
                    </div>
                    <p className="text-emerald-900 font-bold leading-relaxed text-sm">
                    {getRecommendation(item, reponses[item.id])}
                    </p>
                </div>
                )}
            </div>
          </div>
        ))}

        <div className="sticky bottom-8 z-40 px-4">
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl border border-white flex flex-col items-center gap-4">
            {message && <p className="font-black text-blue-600 text-[10px] uppercase tracking-widest animate-bounce">{message}</p>}
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-slate-900 text-white py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-purple-600 transition-all active:scale-95 disabled:opacity-50"
            >
                {saving ? 'Sauvegarde...' : 'Enregistrer le diagnostic'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}