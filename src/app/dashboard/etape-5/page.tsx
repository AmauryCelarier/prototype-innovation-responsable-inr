'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Etape3Page() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER FIXE - DESIGN ÉTAPE 2 RÉUTILISÉ */}
      <div className="bg-white border-b sticky top-0 z-30 p-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">

          {/* GAUCHE : REVENIR À L'ÉTAPE 2 (OU 1) */}
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

          {/* DROITE : PROCHAINE ÉTAPE */}
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
    </div>
  );
}