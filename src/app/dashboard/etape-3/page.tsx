'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const ACV_INDICATORS = [
  {
    id: 'acv_changement_climatique',
    label: 'Changement Climatique',
    desc: 'Émissions de gaz à effet de serre liées au service numérique.',
    unit: 'kg CO₂ eq'
  },
  {
    id: 'acv_acidification',
    label: 'Acidification',
    desc: 'Émissions contribuant à l\'acidification des sols et des eaux.',
    unit: 'mol H⁺ eq'
  },
  {
    id: 'acv_particules_fines',
    label: 'Émissions de Particules Fines',
    desc: 'Particules fines émises, impactant la qualité de l\'air.',
    unit: 'kg PM2.5 eq'
  },
  {
    id: 'acv_radiations_ionisantes',
    label: 'Radiations Ionisantes',
    desc: 'Exposition aux radiations liée à la production d\'énergie nucléaire.',
    unit: 'kBq U-235 eq'
  },
  {
    id: 'acv_ressources_naturelles',
    label: 'Épuisement des Ressources Naturelles',
    desc: 'Consommation de ressources abiotiques (métaux, minéraux, énergie fossile).',
    unit: 'kg Sb eq'
  },
];

export default function Etape3Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');

  const [carbonImpact, setCarbonImpact] = useState<number | string>('');
  const [collaborators, setCollaborators] = useState<number | string>('');
  const [acvValues, setAcvValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
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
    async function fetchProjectData() {
      if (!projectId) return;

      // 1. Récupération WeNR
      const { data: projectData } = await supabase
        .from('projects')
        .select('wenr_carbon_impact, collaborator_count')
        .eq('id', projectId)
        .single();

      if (projectData) {
        setCarbonImpact(projectData.wenr_carbon_impact || '');
        setCollaborators(projectData.collaborator_count || '');
      }

      // 2. Récupération scores ACV
      const { data: respData } = await supabase
        .from('responses')
        .select('question_id, score')
        .eq('project_id', projectId)
        .eq('step_id', 3);

      if (respData) {
        const formatted = respData.reduce((acc, curr) => ({
          ...acc,
          [curr.question_id]: curr.score || ''
        }), {});
        setAcvValues(formatted);
      }
    }

    fetchProjectData();
  }, [projectId, router]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      if (!projectId) throw new Error("ID du projet manquant");

      // A. Sauvegarde WeNR
      const { error: pError } = await supabase.from('projects').update({
          wenr_carbon_impact: parseFloat(carbonImpact.toString()) || 0,
          collaborator_count: parseInt(collaborators.toString()) || 0,
      }).eq('id', projectId);

      if (pError) throw pError;

      // B. Récupération User
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) throw new Error("Utilisateur non authentifié");

      // C. Sauvegarde ACV
      const acvEntries = Object.entries(acvValues)
        .filter(([, val]) => val !== undefined && val !== '')
        .map(([qId, val]) => ({
          project_id: parseInt(projectId),
          step_id: 3,
          question_id: qId,
          category: 'ACV_ADEME',
          score: val.toString(),
          user_id: userId
        }));

      if (acvEntries.length > 0) {
        const { error: rError } = await supabase
          .from('responses')
          .upsert(acvEntries, {
            onConflict: 'project_id,step_id,question_id'
          });
        if (rError) throw rError;
      }

      setMessage('Données d\'impact enregistrées !');
      setTimeout(() => setMessage(''), 3000);
        
    } catch (error: any) {
      console.error("Détails complets de l'erreur:", error);
      setMessage(error.details || error.message || 'Erreur de base de données');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-slate-900">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-30 p-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <Link href={`/dashboard/etape-2?projectId=${projectId}`} className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-100 group">
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Revenir à l&apos;</span>
                <span className="text-sm">Étape 2</span>
              </div>
            </Link>
          </div>

          <div className="flex flex-col items-center gap-1">
            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">Étape 3 : Mesure d&apos;Impact</h1>
            <Link href="/dashboard/projects" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Retour au dashboard</Link>
          </div>

          <div className="flex justify-end">
            <Link href={`/dashboard/etape-4?projectId=${projectId}`} className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-100 group">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Passer à l&apos;</span>
                <span className="text-sm">Étape 4</span>
              </div>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12 space-y-8">
        {/* SECTION 1 : WENR */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold">1</div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Empreinte SI</h2>
              <p className="text-sm text-slate-500">Mesure physique globale.</p>
            </div>
            <div className="flex items-center gap-2 font-['Inter',_sans-serif]">
              <img src="/logo_nr.png" alt="WeNR logo" className="w-16 h-auto" />
              <div className="text-[24px] font-extrabold text-[#2F2E83] leading-none uppercase tracking-[-0.05em] scale-y-[1.0]">
                WeNR<br/>Light
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Utilisez le calculateur WeNR Light pour évaluer l&apos;empreinte carbone du numérique de votre organisation.</p>
              <button onClick={() => window.open('https://www.wenrlight.org/', '_blank')} className="text-xs font-black uppercase text-blue-600 hover:underline">Ouvrir WeNR Light →</button>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">kg CO2 eq / an</label>
                <input type="number" value={carbonImpact} onChange={(e) => setCarbonImpact(e.target.value)} className="w-full p-3 rounded-xl border-none shadow-inner font-bold" placeholder="0" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Collaborateurs</label>
                <input type="number" value={collaborators} onChange={(e) => setCollaborators(e.target.value)} className="w-full p-3 rounded-xl border-none shadow-inner font-bold" placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 : ACV */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold">2</div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Impact Service (MonACV)</h2>
                <p className="text-sm text-slate-500">Renseignez les 5 indicateurs environnementaux issus de votre rapport MonACV Numérique.</p>
              </div>

            </div>
            <button onClick={() => window.open('https://monacvnumerique.fr/', '_blank')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-bold uppercase">Lancer MonACV ↗</button>
          </div>

          <div className="space-y-4">
            {ACV_INDICATORS.map((ind) => (
              <div key={ind.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-3xl gap-4">
                <div className="max-w-md">
                  <h4 className="font-black text-slate-800 uppercase text-sm">{ind.label}</h4>
                  <p className="text-xs text-slate-500">{ind.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={acvValues[ind.id] || ''}
                    onChange={(e) => setAcvValues({ ...acvValues, [ind.id]: e.target.value })}
                    className="w-28 p-3 rounded-xl border-none shadow-inner font-black text-center text-blue-600"
                    placeholder="0"
                  />
                  <span className="font-bold text-slate-400 text-xs whitespace-nowrap">{ind.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex flex-col items-center gap-4">
           {message && <p className="font-black text-sm uppercase animate-pulse text-blue-600">{message}</p>}
           <button
            onClick={handleSave}
            disabled={loading}
            className="bg-slate-900 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all disabled:opacity-50"
           >
             {loading ? 'Enregistrement...' : 'Valider l\'analyse d\'impact'}
           </button>
        </div>
      </div>
    </div>
  );
}