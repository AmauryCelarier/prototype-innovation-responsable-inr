'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { SOUVERAINETE_REF } from '@/lib/souverainete';


export default function Etape5Souverainete() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');

  const [reponses, setReponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function checkAccess() {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user || !projectId) {
            router.push('/dashboard/projects');
            return;
          }
    
          // Vérifier si le projet appartient bien à l'utilisateur
          const { data: project, error } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .single();
    
          if (error || !project || project.user_id !== user.id) {
            console.error("Accès non autorisé");
            router.push('/dashboard/projects');
          }
        }
        checkAccess();

    async function fetchSavedScores() {
      if (!projectId) return;
      setLoading(true);
      try {
        const { data: savedScores, error } = await supabase
          .from('resilience_responses')
          .select('critere_id, score')
          .eq('project_id', projectId);

        if (error) throw error;

        if (savedScores) {
          const formattedAnswers = savedScores.reduce((acc, curr) => ({
            ...acc,
            [curr.critere_id]: curr.score
          }), {});
          setReponses(formattedAnswers);
        }
      } catch (error) {
        console.error("Erreur chargement scores:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSavedScores();
  }, [projectId, router]);

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    setMessage('');

    // On prépare les données en s'assurant que l'ID projet est bien un nombre
    // et en ajoutant un timestamp de mise à jour
    const dataToSave = Object.entries(reponses).map(([critereId, scoreValue]) => ({
      project_id: Number(projectId),
      critere_id: critereId,
      score: scoreValue,
      updated_at: new Date().toISOString()
    }));

    try {
      // Upsert gère la mise à jour si la paire (project_id, critere_id) existe déjà
      const { error } = await supabase
        .from('resilience_responses')
        .upsert(dataToSave, { 
          onConflict: 'project_id,critere_id' 
        });

      if (error) throw error;
      
      setMessage('Scoring souveraineté enregistré avec succès');
      setTimeout(() => setMessage(''), 3000);
    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (err: any) {
      console.error("Erreur sauvegarde:", err);
      setMessage(`Erreur : ${err.message || 'Impossible de sauvegarder'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-800">Analyse de la souveraineté...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-slate-900">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-30 p-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <Link
                href={`/dashboard/etape-4?projectId=${projectId}`}
                className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-100 group"
            >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Revenir à l&apos;</span>
                <span className="text-sm">Étape 4</span>
                </div>
            </Link>
            </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">Étape 5 : Souveraineté & Robustesse</h1>
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
            <Link
                href={`/dashboard/etape-6?projectId=${projectId}`}
                className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-100 group"
            >
                <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Passer à l&apos;</span>
                <span className="text-sm">Étape 6</span>
                </div>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </Link>
            </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-10">
        <div className="bg-blue-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase italic mb-4 tracking-tight text-white">Scoring de Souveraineté Numérique</h2>
            <p className="text-blue-200 text-sm font-medium leading-relaxed max-w-xl mb-4">
              L'Indice de Résilience Numérique (IRN), développé par l'aDRI - Association for Digital Resilience Initiative), vous permet de :
            </p>
            <ul className="text-blue-200 text-sm font-medium leading-relaxed max-w-xl space-y-2">
              <li className="flex gap-3">
                <span className="text-blue-300 font-bold min-w-fit">•</span>
                <span>Piloter le système d'information critique comme un actif stratégique</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-300 font-bold min-w-fit">•</span>
                <span>Structurer le dialogue entre directions (IT, risques, achats, conformité, stratégie)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-300 font-bold min-w-fit">•</span>
                <span>Communiquer de manière objective sur la robustesse numérique auprès des partenaires, investisseurs et parties prenantes</span>
              </li>
            </ul>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-800 rounded-full opacity-50 blur-3xl"></div>
        </div>

        

        {/* GRILLE D'EVALUATION */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">Grille d'Évaluation IRN</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-4">
              La grille d'évaluation vous permettant d'obtenir votre score IRN est disponible ici :
            </p>
            <a
              href="https://gitlab.com/digitalresilienceinitiative/adri-irn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[1.5rem] transition-all shadow-lg shadow-blue-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Consulter la grille
            </a>
          </div>

          <div className="border-t pt-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-6">Votre Score</h3>
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-[2rem] border border-slate-100">
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest">
                Score IRN (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Entrez votre score..."
                value={reponses['irn_score'] || ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                  setReponses({ ...reponses, 'irn_score': val });
                }}
                className="w-full px-6 py-4 border-2 border-slate-200 rounded-[1.5rem] focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-lg font-bold text-slate-800 placeholder-slate-400"
              />
              <p className="text-[10px] font-medium text-slate-500 mt-3 uppercase tracking-widest">
                Valeur comprise entre 0 et 100
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS FIXES */}
        <div className="sticky bottom-8 z-40 px-4">
          <div className="max-w-md mx-auto bg-white/90 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl border border-white flex flex-col items-center gap-4">
            {message && <p className="font-black text-blue-600 text-[10px] uppercase tracking-widest animate-pulse">{message}</p>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Analyse en cours...' : 'Valider mon Scoring'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}