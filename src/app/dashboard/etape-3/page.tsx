'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// On adapte les critères pour correspondre aux résultats de monACVnumérique.fr
const ACV_INDICATORS = [
  { id: 'acv_score_global', label: 'Score Global de Performance', desc: 'Note globale obtenue sur MonACV (sur 100).', unit: '/100' },
  { id: 'acv_terminaux', label: 'Impact Terminaux (Utilisateurs)', desc: 'Part de l\'impact liée à la fabrication et l\'usage des appareils.', unit: '%' },
  { id: 'acv_reseau', label: 'Impact Réseau (Transport)', desc: 'Part de l\'impact liée aux infrastructures réseau et télécoms.', unit: '%' },
  { id: 'acv_datacenter', label: 'Impact Centre de Données', desc: 'Part de l\'impact liée à l\'hébergement et au stockage.', unit: '%' }
];

export default function Etape3Page() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [carbonImpact, setCarbonImpact] = useState<number | string>('');
  const [collaborators, setCollaborators] = useState<number | string>('');
  const [acvValues, setAcvValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchProjectData() {
      if (!projectId) return;

      // 1. On récupère WeNR
      const { data: projectData } = await supabase
        .from('projects')
        .select('wenr_carbon_impact, collaborator_count')
        .eq('id', projectId)
        .single();

      if (projectData) {
        setCarbonImpact(projectData.wenr_carbon_impact || '');
        setCollaborators(projectData.collaborator_count || '');
      }

      // 2. On récupère les scores ACV ADEME
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
  }, [projectId]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Sauvegarde Quantitative (WeNR)
      await supabase.from('projects').update({
          wenr_carbon_impact: parseFloat(carbonImpact.toString()) || 0,
          collaborator_count: parseInt(collaborators.toString()) || 0,
      }).eq('id', projectId);

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id || null;

      // Sauvegarde Qualitative (ACV ADEME)
      const acvEntries = Object.entries(acvValues).map(([qId, val]) => ({
        project_id: projectId,
        step_id: 3,
        question_id: qId,
        category: 'ACV_ADEME',
        score: val,
        user_id: userId
      }));

      if (acvEntries.length > 0) {
        const { error: rError } = await supabase
          .from('responses')
          .upsert(acvEntries, { onConflict: 'project_id,step_id,question_id' });
        if (rError) throw rError;
      }

      setMessage('✅ Données d\'impact enregistrées !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage('❌ Erreur lors de la sauvegarde');
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
            <Link href={`/dashboard/etape-2?projectId=${projectId}`} className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg">
              <span className="text-sm">Étape 2</span>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-lg font-black uppercase tracking-tight">Étape 3 : Mesure d&apos;Impact (ACV & WeNR)</h1>
          </div>
          <div className="flex justify-end">
            <Link href={`/dashboard/etape-4?projectId=${projectId}`} className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg">
              <span className="text-sm">Étape 4</span>
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
              <h2 className="text-xl font-black uppercase tracking-tight">Empreinte SI (WeNR Light)</h2>
              <p className="text-sm text-slate-500">Mesure physique globale (Carbone).</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Utilisez le calculateur WeNR Light pour obtenir l&apos;impact de votre structure.
              </p>
              <button onClick={() => window.open('https://www.wenrlight.org/', '_blank')} className="text-xs font-black uppercase text-blue-600 hover:underline flex items-center gap-2">
                Ouvrir WeNR Light →
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 bg-slate-50 p-6 rounded-3xl">
               <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* SECTION 2 : ACV (REPORT MON ACV NUMÉRIQUE) */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold">2</div>
                <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Impact Service (MonACV)</h2>
                <p className="text-sm text-slate-500">Report des résultats de l&apos;Analyse de Cycle de Vie.</p>
                </div>
            </div>
            <button onClick={() => window.open('https://monacvnumerique.fr/', '_blank')} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-bold uppercase transition-colors">
                Lancer MonACVnumérique.fr ↗
            </button>
          </div>

          <div className="space-y-4">
            {ACV_INDICATORS.map((ind) => (
              <div key={ind.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-3xl gap-4">
                <div className="max-w-md">
                  <h4 className="font-black text-slate-800 uppercase text-sm">{ind.label}</h4>
                  <p className="text-xs text-slate-500">{ind.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={acvValues[ind.id] || ''}
                      onChange={(e) => setAcvValues({ ...acvValues, [ind.id]: e.target.value })}
                      className="w-24 p-3 rounded-xl border-none shadow-inner font-black text-center text-blue-600"
                      placeholder="0"
                    />
                    <span className="absolute -right-8 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">{ind.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOUTON SAUVEGARDE */}
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