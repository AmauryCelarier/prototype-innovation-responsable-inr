'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id);
        if (data) setProjects(data);
      }
    }
    loadProjects();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Mes Projets</h1>
        <Link 
          href="/dashboard/projects/new" 
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
        >
          + Nouveau Projet
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center p-20 bg-white rounded-3xl border-2 border-dashed border-blue-200">
          <p className="text-slate-500">Vous n'avez pas encore de projet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <Link key={p.id} href={`/dashboard/etape-1?projectId=${p.id}`} className="block group">
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-600 shadow-sm group-hover:shadow-md group-hover:bg-blue-50 transition-all">
                <h2 className="text-xl font-bold mb-2 text-slate-800">{p.nom_projet}</h2>
                <p className="text-slate-500 text-sm line-clamp-1">{p.description}</p>
                <div className="mt-4 text-blue-600 font-bold text-sm">
                  Accéder au diagnostic →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}