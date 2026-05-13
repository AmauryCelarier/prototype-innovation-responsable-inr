'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { calculateScores } from '@/hooks/useScoring';
import { SOUVERAINETE_REF } from '@/lib/souverainete';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

export default function ProjectSummaryPage() {
  const { id } = useParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [project, setProject] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [responses, setResponses] = useState<any[]>([]);
  const [resilienceResponses, setResilienceResponses] = useState<Record<string, number>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [questions, setQuestions] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [projRes, respRes, qRes, trainingsRes, resilienceRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('responses').select('*').eq('project_id', id),
        supabase.from('questions').select('*'),
        supabase.from('project_trainings').select('*').eq('project_id', id),
        supabase.from('resilience_responses').select('critere_id, score').eq('project_id', id),
      ]);

      if (projRes.data) setProject(projRes.data);
      if (respRes.data) setResponses(respRes.data);
      if (qRes.data) setQuestions(qRes.data);
      if (trainingsRes.data) setTrainings(trainingsRes.data);
      if (resilienceRes.data) {
        setResilienceResponses(resilienceRes.data.reduce((acc: Record<string, number>, curr: any) => ({
          ...acc,
          [curr.critere_id]: typeof curr.score === 'string' ? Number(curr.score) : curr.score,
        }), {}));
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-black uppercase italic animate-pulse">Chargement...</div>;
  if (!project) return <div className="p-20 text-center">Projet introuvable.</div>;

  // --- LOGIQUE DE DONNÉES ---
  
  // Étape 1 : Préparation des données pour le Radar Chart
  const responseMap: Record<number, string> = responses.reduce((acc, r) => {
    if (r.question_id !== undefined) {
      acc[r.question_id] = r.score;
    }
    return acc;
  }, {} as Record<number, string>);

  const { stats: step1Stats } = calculateScores(questions, responseMap);
  const step1Data = Object.entries(step1Stats)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB, undefined, {numeric: true}))
    .map(([subject, data]) => {
      const rawScore = data.totalWeight > 0 ? data.totalWeightedNote / data.totalWeight : 0;
      return {
        subject,
        A: Number(rawScore.toFixed(1)),
        fullMark: 4,
      };
    });

  const step1Score = step1Data.length > 0
    ? `${(step1Data.reduce((sum, item) => sum + item.A, 0) / step1Data.length).toFixed(1)}/4`
    : 'N/A';

  // Étape 2 : Actions réalisées
  const TRAINING_DEFINITIONS: Record<string, { title: string; description: string }> = {
    mooc_nr_fondamentaux: {
      title: 'MOOC Numérique Responsable (INR)',
      description: 'Maîtriser les fondamentaux : enjeux environnementaux, éthiques et sociaux.',
    },
    mooc_conception: {
      title: 'MOOC Conception Responsable (INR)',
      description: 'Apprendre à éco-concevoir vos services numériques dès la phase de design.',
    },
    mooc_ia: {
      title: 'MOOC IA Responsable',
      description: 'Optimiser les modèles d’IA pour réduire leur impact énergétique.',
    },
  };

  const step2Actions = trainings
    .filter(t => t.completed)
    .map(t => ({
      id: t.training_id,
      title: TRAINING_DEFINITIONS[t.training_id]?.title || t.training_id,
      description: TRAINING_DEFINITIONS[t.training_id]?.description || '',
    }));

  const step2Score = trainings.length > 0 ? `${step2Actions.length}/${trainings.length}` : 'N/A';

  const step4Items = SOUVERAINETE_REF.map((item) => {
    const score = resilienceResponses[item.id];
    return {
      ...item,
      score,
      label:
        score === 0 ? 'Critique' :
        score === 1 ? 'Fragile' :
        score === 3 ? 'Robuste' :
        score === 5 ? 'Souverain' :
        'Non évalué',
    };
  });

  const step4Filled = step4Items.filter((item) => item.score !== undefined);
  const step4Score = step4Filled.length > 0
    ? `${(step4Filled.reduce((sum, item) => sum + (item.score ?? 0), 0) / step4Filled.length).toFixed(1)}/5`
    : 'N/A';

  // Étape 3 : Impact Carbone & Collab
  const carbonImpact = project.wenr_carbon_impact;
  const collaborators = project.collaborator_count;

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto min-h-screen bg-[#F8FAFC] text-slate-900">
      
      {/* HEADER DYNAMIQUE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <button onClick={() => router.back()} className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">
            <span className="text-lg">←</span> Retour aux services
          </button>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
            {project.nom_projet}
          </h1>
          <p className="mt-2 text-lg font-medium text-slate-500">{project.domaine} • {project.type_approche}</p>
        </div>
        
        <div className="flex gap-3">
          <Link href={`/dashboard/etape-1?projectId=${id}`} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:scale-105 transition-all shadow-xl">
            Reprendre le diagnostic
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNE INFOS PROJET (Gauches) */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8">Fiche d&apos;identité</h2>
            <div className="space-y-6">
              <InfoBlock label="Description" value={project.description} />
              <div className="grid grid-cols-2 gap-4">
                <InfoBlock label="Référent" value={project.referent_projet} subValue={project.referent_profil} />
                <InfoBlock label="Budget" value={project.couts ? `${project.couts}€` : 'N/A'} />
              </div>
              {project.is_entreprise && (
                <div className="pt-6 border-t border-slate-50">
                  <InfoBlock label="Structure" value={project.nom_entreprise} subValue={`SIREN: ${project.siren}`} />
                </div>
              )}
            </div>
          </section>

          {/* ÉTAPE 3 : IMPACT CARBONE RAPIDE */}
          <section className="bg-emerald-900 text-emerald-50 p-8 rounded-[2.5rem] shadow-xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-6">Impact IT (Étape 3)</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase opacity-60">Impact Carbone</span>
                <span className="text-2xl font-black italic">{carbonImpact ?? 'N/A'} <small className="text-[10px] uppercase">kgCo2</small></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase opacity-60">Collaborateurs</span>
                <span className="text-2xl font-black italic">{collaborators ?? 'N/A'}</span>
              </div>
            </div>
          </section>

          {/* ÉTAPE 4 : SOUVERAINETÉ & ROBUSTESSE */}
          <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300 mb-2">Étape 04</h2>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Souveraineté & Robustesse</h3>
              </div>
              <div className="bg-slate-800 px-5 py-3 rounded-2xl">
                <p className="text-[10px] uppercase opacity-70">Score moyen</p>
                <p className="text-2xl font-black">{step4Score}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-6">État de votre indépendance technologique et de votre capacité à résister aux ruptures.</p>
            <div className="grid grid-cols-1 gap-3">
              {step4Items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 rounded-3xl bg-slate-800/90 border border-slate-700">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.titre}</p>
                    <p className="text-sm text-slate-100">{item.score !== undefined ? item.label : 'Non évalué'}</p>
                  </div>
                  <span className={`text-lg font-black ${item.score === undefined ? 'text-slate-500' : 'text-cyan-300'}`}>
                    {item.score !== undefined ? item.score : '-'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* COLONNE DIAGNOSTIC (Droite) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* ÉTAPE 1 : VISION STRATÉGIQUE + RADAR */}
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Étape 01</h2>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Vision Stratégique</h3>
              </div>
              <div className="bg-slate-50 px-6 py-3 rounded-2xl border-2 border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 text-center">Score Global</p>
                <p className="text-2xl font-black text-slate-900">{step1Score}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Le Graphique */}
              <div className="h-[300px] w-full">
                {step1Data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={step1Data}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                      <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed text-slate-400 font-bold text-sm">
                    Pas de données pour le graphique
                  </div>
                )}
              </div>

              {/* Détail par thème */}
              <div className="space-y-4">
                {step1Data.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-black uppercase text-slate-600">{item.subject}</span>
                    <span className="font-black text-blue-600">{item.A}/4</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ÉTAPE 2 : RESSOURCES HUMAINES */}
          <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Étape 02</h2>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Ressources Humaines</h3>
              </div>
              <div className="bg-slate-50 px-6 py-3 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-slate-400 text-center">Formations validées</p>
                <p className="text-2xl font-black text-slate-900">{step2Score}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase text-slate-400 mb-4">Actions & Formations réalisées :</p>
              {step2Actions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {step2Actions.map((action, idx) => (
                    <div key={idx} className="flex flex-col gap-3 p-4 border-2 border-blue-50 rounded-2xl bg-blue-50/30">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px]">✓</div>
                        <span className="text-sm font-bold text-slate-700">{action.title}</span>
                      </div>
                      {action.description && <p className="text-xs text-slate-500 leading-snug">{action.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl text-slate-400 font-bold text-sm italic">
                  Aucune action enregistrée pour le moment.
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// Composants utilitaires locaux
function InfoBlock({ label, value, subValue }: { label: string, value: string, subValue?: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-slate-800 leading-tight">{value || 'N/A'}</p>
      {subValue && <p className="text-xs text-slate-500 font-medium">{subValue}</p>}
    </div>
  );
}