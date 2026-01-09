'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Etape3Page() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER FIXE - TON DESIGN CONSERVÉ */}
      <div className="bg-white border-b sticky top-0 z-30 p-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">
          
          {/* GAUCHE : REVENIR À L'ÉTAPE 1 */}
          <div className="flex justify-start">
            <Link 
              href={`/dashboard/etape-1?projectId=${projectId}`}
              className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-100 group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Revenir à l'</span>
                <span className="text-sm">Étape 1</span>
              </div>
            </Link>
          </div>

          {/* MILIEU : TITRE + RETOUR DASHBOARD */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase text-center">
              Étape 3 : Alignement IT for Green
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

          {/* DROITE : PROCHAINE ÉTAPE */}
          <div className="flex justify-end">
            <Link 
              href={`/dashboard/etape-4?projectId=${projectId}`}
              className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-100 group"
            >
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Passer à l'</span>
                <span className="text-sm">Étape 4</span>
              </div>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL : INTÉGRATION WENR LIGHT */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 border-b border-slate-50 pb-8">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-100">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Mesure d'impact</h2>
                <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">Outil : WeNR Light</span>
              </div>
              <p className="text-slate-500 font-medium italic">Calculateur d'empreinte environnementale du système d'information.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* EXPLICATION */}
            <div className="lg:col-span-3 space-y-8">
              <div className="prose prose-slate">
                <p className="text-slate-600 leading-relaxed text-lg">
                  L'alignement avec les valeurs de l'<strong>IT for Green</strong> commence par la connaissance de son propre impact. Nous utilisons la méthodologie du WeNR Light (Institut du Numérique Responsable).
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="block text-blue-600 font-bold mb-1 italic text-sm">Étape A</span>
                    <p className="text-xs text-slate-500 font-semibold leading-snug">Ouvrez l'outil officiel WeNR et complétez l'inventaire rapide.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="block text-blue-600 font-bold mb-1 italic text-sm">Étape B</span>
                    <p className="text-xs text-slate-500 font-semibold leading-snug">Reportez vos indicateurs (CO2 et Nombre de collaborateur) dans le formulaire ci-contre.</p>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => window.open('https://www.wenrlight.org/', '_blank')}
                  className="group flex items-center gap-4 bg-slate-900 text-white px-8 py-5 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-2xl shadow-slate-300"
                >
                  <span className="text-lg">Lancer le calculateur WeNR</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
                <p className="mt-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/></svg>
                    Outil recommandé par l'INR (Institut du Numérique Responsable)
                </p>
              </div>
            </div>

            {/* FORMULAIRE DE REPORT DE RÉSULTATS - CORRIGÉ */}
            <div className="lg:col-span-2">
              <div className="bg-blue-50/50 p-8 rounded-[2rem] border-2 border-blue-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
                </div>

                <h3 className="font-black text-blue-900 uppercase tracking-tight mb-8 flex items-center gap-2 text-slate-900">
                    <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                    Résultats WeNR Light
                </h3>
                
                <div className="space-y-6">
                  {/* CHAMP CO2 - L'INDICATEUR PRINCIPAL */}
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase text-blue-400 mb-2 tracking-[0.2em] group-focus-within:text-blue-600 transition-colors">
                        Impact Carbone Global (kg CO2eq / an)
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            placeholder="Ex: 450" 
                            className="w-full p-4 pr-12 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-700" 
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs uppercase">kg</span>
                    </div>
                  </div>

                  {/* CHAMP EFFECTIF - POUR CALCULER LE RATIO PAR PERSONNE */}
                  <div className="group">
                    <label className="block text-[10px] font-black uppercase text-blue-400 mb-2 tracking-[0.2em] group-focus-within:text-blue-600 transition-colors">
                        Nombre de collaborateurs (ETP)
                    </label>
                    <div className="relative">
                        <input 
                            type="number" 
                            placeholder="Ex: 10" 
                            className="w-full p-4 pr-12 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-slate-700" 
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs uppercase italic">Pers.</span>
                    </div>
                  </div>

                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all hover:-translate-y-1 active:scale-95">
                    Enregistrer mon empreinte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}