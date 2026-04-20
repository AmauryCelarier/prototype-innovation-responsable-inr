'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Etape5Page() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER FIXE - DESIGN ÉTAPE 2 RÉUTILISÉ */}
      <div className="bg-white border-b sticky top-0 z-30 p-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">

          {/* GAUCHE : REVENIR À L'ÉTAPE 4 */}
          <div className="flex justify-start">
            <Link
              href={`/dashboard/etape-4?projectId=${projectId}`}
              className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-lg shadow-blue-100 group"
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

          {/* MILIEU : TITRE + RETOUR DASHBOARD */}
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase text-center">
              Étape 5 : Communiquer
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

          {/* DROITE : TERMINER LE PARCOURS */}
          <div className="flex justify-end">
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-100 group"
            >
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Clôturer le</span>
                <span className="text-sm">Parcours</span>
              </div>
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* CONTENU DE L'ÉTAPE 5 */}
      <main className="max-w-5xl mx-auto mt-12 px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            Engagement & Visibilité
          </span>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase">
            Valoriser votre démarche
          </h2>
          <p className="mt-4 text-slate-600 font-medium max-w-2xl mx-auto">
            S’engager publiquement crée une émulation sur le marché et mobilise vos équipes en interne. 
            Officialisez vos ambitions en devenant signataire des chartes de l&apos;INR.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* CARTE : CHARTE NR */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col h-full">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4">Charte Numérique Responsable</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow font-medium">
              Elle résume vos engagements environnementaux et sociétaux. C&apos;est un levier puissant pour 
              instaurer une démarche qualité en continu et rassurer vos clients, fournisseurs et futurs talents.
            </p>
            <a 
              href="https://charter.isit-europe.org/charte-numeriqueresponsable" 
              target="_blank" 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-center hover:bg-blue-600 transition-all uppercase text-xs tracking-widest"
            >
              Signer la charte NR
            </a>
          </div>

          {/* CARTE : CHARTE IA */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col h-full">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-4">Charte IA Responsable</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-grow font-medium">
              Conforme à l&apos;IA Act, elle garantit l&apos;utilisation de systèmes d&apos;IA au service de l&apos;Humain. 
              Un engagement pour une technologie de confiance, inclusive, non-discriminatoire et éco-responsable.
            </p>
            <a 
              href="https://charter.isit-europe.org/charte-ia/" 
              target="_blank" 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-center hover:bg-purple-600 transition-all uppercase text-xs tracking-widest"
            >
              Signer la charte IA
            </a>
          </div>
        </div>

        {/* SECTION FOOTER DE LA PAGE */}
        <div className="mt-16 p-8 bg-slate-800 rounded-[2rem] text-center text-white">
          <h4 className="text-lg font-bold mb-2">Félicitations ! 🎉</h4>
          <p className="text-slate-400 text-sm font-medium">
            Vous avez parcouru l&apos;ensemble des étapes de l&apos;autodiagnostic. 
            Votre projet est désormais aligné avec les principes de l&apos;Innovation Numérique Responsable.
          </p>
        </div>
      </main>
    </div>
  );
}