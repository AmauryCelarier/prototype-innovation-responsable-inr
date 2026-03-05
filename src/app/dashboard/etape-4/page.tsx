'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// On définit les critères de souveraineté directement basés sur le Guide Digital League
const SOUVERAINETE_REF = [
  {
    id: 'SOUV-1',
    titre: 'Conformité Réglementaire',
    question: 'Quel est votre degré de conformité aux réglementations (NIS2, DORA, RGPD) ?',
    description: 'Anticipation des exigences de sécurité et de résilience imposées par l\'UE.',
    recommandations: {
      0: 'Non-conforme ou non-évalué.',
      1: 'Mise en conformité RGPD de base effectuée.',
      3: 'Analyse d\'impact effectuée pour NIS2 / DORA.',
      5: 'Conformité totale et auditée régulièrement.'
    }
  },
  {
    id: 'SOUV-2',
    titre: 'Juridiction de l\'hébergement',
    question: 'L\'hébergement de vos données critiques est-il opéré sous juridiction européenne ?',
    description: 'Conformité aux lois de protection des données (RGPD) et protection contre les lois extra-européennes (Cloud Act).',
    recommandations: {
      0: 'Hébergement hors UE sans garantie de protection.',
      1: 'Hébergement mixte ou en cours de migration vers l\'UE.',
      3: 'Hébergement 100% UE (France ou Europe).',
      5: 'Hébergement certifié SecNumCloud ou équivalent souverain.'
    }
  },
  {
    id: 'SOUV-3',
    titre: 'Proportion de fournisseurs européens',
    question: 'Quelle est la part de vos fournisseurs techniques basés en Europe ?',
    description: 'L\'objectif est de diversifier les dépendances pour éviter un monopole de solutions extra-européennes.',
    recommandations: {
      0: 'Dépendance totale à des solutions extra-européennes.',
      1: 'Quelques solutions locales pour des services non-critiques.',
      3: 'Majorité de fournisseurs européens pour les services clés.',
      5: 'Indépendance stratégique : alternatives locales identifiées et prêtes.'
    }
  },
  {
    id: 'SOUV-4',
    titre: 'Clauses de réversibilité',
    question: 'Vos contrats incluent-ils des clauses de réversibilité claires ?',
    description: 'Capacité à récupérer vos données et à changer de fournisseur rapidement sans perte d\'activité.',
    recommandations: {
      0: 'Aucune clause de sortie prévue.',
      1: 'Clauses existantes mais complexes ou coûteuses.',
      3: 'Réversibilité contractuelle claire et documentée.',
      5: 'Tests de réversibilité effectués et validés avec succès.'
    }
  },
  {
    id: 'SOUV-5',
    titre: 'Interopérabilité & Standards Ouverts',
    question: 'Vos solutions évitent-elles l\'enfermement propriétaire (Vendor Lock-in) ?',
    description: 'Usage de standards ouverts, d\'APIs documentées ou de logiciels libres (Open Source).',
    recommandations: {
      0: 'Format propriétaire fermé (impossible de migrer).',
      1: 'Usage minoritaire de standards ouverts.',
      3: 'Architecture basée sur des APIs ouvertes et formats standards.',
      5: 'Logiciels Libres / Open Source favorisés systématiquement.'
    }
  },
  {
    id: 'SOUV-6',
    titre: 'Maîtrise des données sensibles',
    question: 'Avez-vous cartographié et protégé vos données sensibles/critiques ?',
    description: 'Identification précise de ce qui doit être protégé en priorité absolue.',
    recommandations: {
      0: 'Aucune cartographie des données.',
      1: 'Inventaire partiel des données stockées.',
      3: 'Cartographie complète et mesures de protection adaptées.',
      5: 'Gouvernance des données active (Chiffrement, cloisonnement).'
    }
  }
];

export default function Etape4Souverainete() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [reponses, setReponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchSavedScores() {
      if (!projectId) return;
      setLoading(true);
      try {
        const { data: savedScores } = await supabase
          .from('resilience_responses') // On garde la même table pour la compatibilité
          .select('critere_id, score')
          .eq('project_id', projectId);

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
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    setMessage('');

    const dataToSave = Object.entries(reponses).map(([critereId, scoreValue]) => ({
      project_id: projectId,
      critere_id: critereId,
      score: scoreValue
    }));

    try {
      const { error } = await supabase
        .from('resilience_responses')
        .upsert(dataToSave, { onConflict: 'project_id,critere_id' });

      if (error) throw error;
      setMessage('Scoring souveraineté enregistré');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest">Analyse de la souveraineté...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-30 p-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <Link
                href={`/dashboard/etape-3?projectId=${projectId}`}
                className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-100 group"
            >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Revenir à l&apos;</span>
                <span className="text-sm">Étape 3</span>
                </div>
            </Link>
            </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">Étape 4 : Souveraineté & Robustesse</h1>
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
                href={`/dashboard/etape-5?projectId=${projectId}`}
                className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-100 group"
            >
                <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Passer à l&apos;</span>
                <span className="text-sm">Étape 5</span>
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
            <h2 className="text-2xl font-black uppercase italic mb-2 tracking-tight">Scoring de Souveraineté Numérique</h2>
            <p className="text-blue-200 text-sm font-medium leading-relaxed max-w-xl">
              Évaluez votre dépendance technologique. L&apos;indépendance stratégique est le premier pilier de la robustesse organisationnelle.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-800 rounded-full opacity-50 blur-3xl"></div>
        </div>

        {SOUVERAINETE_REF.map((item) => (
          <div key={item.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative group transition-all hover:shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{item.titre}</h3>
                <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">{item.question}</p>
              </div>
            </div>

            <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
              {item.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[0, 1, 3, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => setReponses({ ...reponses, [item.id]: val })}
                  className={`p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${
                    reponses[item.id] === val
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg scale-105'
                      : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <span className="text-3xl font-black">{val}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-center leading-none opacity-70">
                    {val === 0 ? 'Critique' : val === 1 ? 'Fragile' : val === 3 ? 'Robuste' : 'Souverain'}
                  </span>
                </button>
              ))}
            </div>

            {reponses[item.id] !== undefined && (
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] border-l-8 border-blue-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">!</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Impact & Recommandation</p>
                </div>
                <p className="text-sm font-bold leading-relaxed">
                  {item.recommandations[reponses[item.id] as keyof typeof item.recommandations]}
                </p>
              </div>
            )}
          </div>
        ))}

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