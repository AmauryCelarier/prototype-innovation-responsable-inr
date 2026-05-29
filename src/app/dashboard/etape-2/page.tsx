/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';
import { calculateScores } from '@/hooks/useScoring';
import Link from 'next/link';

export default function Etape2Page() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // État pour stocker les IDs des formations terminées : { "mooc_nr": true, "mooc_ia": false }
  const [completedTrainings, setCompletedTrainings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchData() {
      if (!projectId) return;

      // 1. Charger Stats (pour le score Dim 6)
      const { data: qData } = await supabase.from('questions').select('*');
      const { data: rData } = await supabase
        .from('responses')
        .select('question_id, score')
        .eq('project_id', projectId);

      if (qData && rData) {
        const resMap: any = {};
        rData.forEach(r => resMap[r.question_id] = r.score);
        const { stats: calculatedStats } = calculateScores(qData, resMap);
        setStats(calculatedStats);
      }

      // 2. Charger les formations déjà validées pour ce projet
      const { data: tData } = await supabase
        .from('project_trainings')
        .select('training_id, completed')
        .eq('project_id', projectId);

      if (tData) {
        const trainingMap: Record<string, boolean> = {};
        tData.forEach(t => {
          trainingMap[t.training_id] = t.completed;
        });
        setCompletedTrainings(trainingMap);
      }

      setLoading(false);
    }
    fetchData();
  }, [projectId]);

  const handleToggleTraining = async (trainingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !projectId) return;

    const isCurrentlyCompleted = !!completedTrainings[trainingId];
    const newState = !isCurrentlyCompleted;

    // Mise à jour locale immédiate (Optimistic UI)
    setCompletedTrainings(prev => ({ ...prev, [trainingId]: newState }));

    // Sauvegarde en base
    const { error } = await supabase.from('project_trainings').upsert({
      project_id: projectId,
      user_id: user.id,
      training_id: trainingId,
      completed: newState
    }, { onConflict: 'project_id,training_id' });

    if (error) {
      console.error("Erreur sauvegarde formation:", error);
      // Revenir en arrière en cas d'erreur
      setCompletedTrainings(prev => ({ ...prev, [trainingId]: isCurrentlyCompleted }));
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Chargement du plan de formation...</div>;

  const dim6Score = stats?.["6. Sensibilisation et acculturation NR"]
    ? (stats["6. Sensibilisation et acculturation NR"].totalWeightedNote / stats["6. Sensibilisation et acculturation NR"].totalWeight) 
    : 0;

  const isCritical = dim6Score < 3;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER FIXE */}
        <div className="bg-white border-b sticky top-0 z-30 p-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">

            {/* GAUCHE : BOUTON REVENIR */}
            <div className="flex justify-start">
            <Link
                href={`/dashboard/etape-1?projectId=${projectId}`}
                className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-100 group"
            >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Revenir à l&apos;</span>
                <span className="text-sm">Étape 1</span>
                </div>
            </Link>
            </div>

            {/* MILIEU : TITRE + RETOUR DASHBOARD */}
            <div className="flex flex-col items-center gap-1">
            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                Étape 2 : Acculturation NR
            </h1>
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

            {/* DROITE : BOUTON SUIVANT */}
            <div className="flex justify-end">
            <Link
                href={`/dashboard/etape-3?projectId=${projectId}`}
                className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-100 group"
            >
                <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Passer à l&apos;</span>
                <span className="text-sm">Étape 3</span>
                </div>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </Link>
            </div>

        </div>
        </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        {/* ALERT STATUS */}
        {isCritical ? (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl mb-10 shadow-sm animate-in fade-in slide-in-from-top-4">
            <h2 className="text-amber-800 font-black uppercase text-sm tracking-widest">Sensibilisation et acculturation insuffisante ({dim6Score.toFixed(1)}/4)</h2>
            <p className="text-amber-700 text-sm mt-1">Nous vous recommandons de suivre les formations ci-dessous.</p>
          </div>
        ) : (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-2xl mb-10 shadow-sm">
            <h2 className="text-emerald-800 font-black uppercase text-sm tracking-widest">Équipe sensibilisée</h2>
            <p className="text-emerald-700 text-sm mt-1">Votre score est suffisant, mais ces ressources restent recommandées.</p>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Plan de formation</h3>
            <p className="text-slate-500 text-sm">Cochez les actions réalisées ou planifiées.</p>
          </div>

          <div className="p-8 space-y-6">
            <FormationCard
              id="mooc_nr_fondamentaux"
              title="MOOC Numérique Responsable — Formation complète"
              description="11 modules pour maîtriser les fondamentaux du numérique responsable : impacts environnementaux, sociaux, économiques, géopolitiques et solutions concrètes."
              link="https://www.academie-nr.org/"
              time="4h30"
              isCompleted={!!completedTrainings["mooc_nr_fondamentaux"]}
              onToggle={() => handleToggleTraining("mooc_nr_fondamentaux")}
            />
            <FormationCard
              id="mooc_conception"
              title="MOOC Conception responsable d'un service numérique"
              description="10 modules vidéo pour acquérir les premières clés de la conception responsable : démarche, outils, références et mise en pratique professionnelle."
              link="https://www.academie-nr.org/conception-responsable/"
              time="~1h30"
              isCompleted={!!completedTrainings["mooc_conception"]}
              onToggle={() => handleToggleTraining("mooc_conception")}
            />
            <FormationCard
              id="mooc_ia"
              title="MOOC IA Responsable"
              description="Comprendre les enjeux éthiques, environnementaux et de gouvernance de l'intelligence artificielle. Une formation d'une heure pour agir face aux défis de l'IA."
              badge="Spécial IA"
              time="~1h"
              isCompleted={!!completedTrainings["mooc_ia"]}
              onToggle={() => handleToggleTraining("mooc_ia")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FormationCard({ title, description, link, badge, time, isCompleted, onToggle }: any) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-start gap-6 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
        isCompleted ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 hover:border-slate-200 bg-white'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
           <h4 className={`font-bold ${isCompleted ? 'text-blue-900' : 'text-slate-800'}`}>{title}</h4>
           {badge && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">{badge}</span>}
        </div>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{description}</p>
        <div className="flex items-center gap-4">
          <a
            href={link}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-bold text-blue-600 underline"
          >
            Accéder au cours
          </a>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Durée : {time}</span>
        </div>
      </div>
      <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
        isCompleted ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'border-slate-200 bg-white'
      }`}>
        {isCompleted && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  );
}