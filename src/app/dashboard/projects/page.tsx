'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type CreatorProfile = {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
};

export default function ProjectsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projects, setProjects] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [creatorProfiles, setCreatorProfiles] = useState<Record<string, CreatorProfile>>({});

  const formatProfileName = (profile: CreatorProfile | undefined) => {
    if (!profile) return 'N/A';
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return fullName || 'N/A';
  };

  useEffect(() => {
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Récupère le profil pour connaître le rôle
        const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const userRole = profileData?.role ?? 'user_startup';
        setRole(userRole);

        // Si l'utilisateur est accompagnateur, on récupère les projets dont il est référent/accompagnateur
        if (userRole === 'user_accompagnateur') {
          // Essayer une requête côté serveur si la colonne existe, sinon fallback sur récupération complète puis filtrage
          const { data: accompagnateurProjects, error: accompError } = await supabase
            .from('projects')
            .select('*')
            .eq('accompagnateur_id', user.id);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let projectsToDisplay: any[] = [];
          if (!accompError && accompagnateurProjects) {
            projectsToDisplay = accompagnateurProjects;
          } else {
            // Fallback: récupérer tous les projets et filtrer côté client si la colonne n'existe pas
            const { data: allProjects } = await supabase.from('projects').select('*');
            if (allProjects) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              projectsToDisplay = allProjects.filter((p: any) => p.accompagnateur_id === user.id);
            }
          }
          setProjects(projectsToDisplay);

          // Récupérer les profils des créateurs
          if (projectsToDisplay.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const userIds = [...new Set(projectsToDisplay.map((p: any) => p.user_id).filter(Boolean))];
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name')
              .in('id', userIds);

            let profileMap: Record<string, CreatorProfile> = {};
            if (profiles) {
              profileMap = profiles.reduce((acc: Record<string, CreatorProfile>, prof) => {
                if (prof?.id) acc[prof.id] = prof;
                return acc;
              }, {});
            }

            if (profilesError) {
              console.error('Erreur récupération des profils créateurs :', profilesError.message);
            }

            // Si la requête de groupe n'a rien retourné, on tente un fallback individuel
            if (Object.keys(profileMap).length === 0 && userIds.length > 0) {
              for (const userId of userIds) {
                const { data: profileData, error: singleError } = await supabase
                  .from('profiles')
                  .select('id, first_name, last_name, full_name, username, email')
                  .eq('id', userId)
                  .single();
                if (singleError) {
                  console.warn(`Profil introuvable pour user_id=${userId} :`, singleError.message);
                  continue;
                }
                if (profileData) {
                  profileMap[userId] = profileData;
                }
              }
            }

            setCreatorProfiles(profileMap);
          }
          return;
        }

        // Utilisateur startup : projets dont il est propriétaire
        const { data } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id);
        if (data) setProjects(data);
      }
    }
    loadProjects();
  }, []);

  const handleDelete = async (id: string, name: string) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${name}" ? Cela supprimera aussi tous les diagnostics associés.`)) {

    const { error: respError } = await supabase
      .from('responses')
      .delete()
      .eq('project_id', id); // vérifie bien que la colonne s'appelle project_id

    if (respError) {
      alert("Erreur lors de la suppression des réponses : " + respError.message);
      return;
    }

    const { error: projError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (!projError) {
      setProjects(projects.filter(p => p.id !== id));
    } else {
      alert("Erreur lors de la suppression du projet : " + projError.message);
    }
  }
};

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">
            {role === 'user_accompagnateur' ? 'Projets accompagnés' : 'Mes Projets'}
          </h1>
          <p className="text-slate-500 text-sm">
            {role === 'user_accompagnateur'
              ? 'Accédez aux fiches récapitulatives des projets dont vous êtes responsable.'
              : 'Gérez vos diagnostics et fiches récapitulatives'}
          </p>
        </div>
        {role !== 'user_accompagnateur' && (
          <Link
            href="/dashboard/projects/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
          >
            + Nouveau Projet
          </Link>
        )}
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {p.domaine || 'Général'}
                  </span>
                  {role !== 'user_accompagnateur' && (
                    <button 
                      onClick={() => handleDelete(p.id, p.nom_projet)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                      title="Supprimer le projet"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <h2 className="text-2xl font-black mb-2 text-slate-800 leading-tight">{p.nom_projet}</h2>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6">{p.description || "Aucune description fournie."}</p>

                {role === 'user_accompagnateur' && p.user_id && (
                  <p className="text-xs text-slate-400 mb-4">
                    <span className="font-semibold">Créateur :</span> {formatProfileName(creatorProfiles[p.user_id])}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {role !== 'user_accompagnateur' && (
                  <Link 
                    href={`/dashboard/etape-1?projectId=${p.id}`}
                    className="block w-full text-center bg-slate-900 text-white p-4 rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all"
                  >
                    Continuer le diagnostic
                  </Link>
                )}
                
                <Link 
                  href={`/dashboard/projects/${p.id}`} 
                  className={`block w-full text-center border-2 border-slate-100 text-slate-600 p-4 rounded-2xl font-bold text-sm hover:border-blue-600 hover:text-blue-600 transition-all ${role === 'user_accompagnateur' ? 'bg-blue-50' : ''}`}
                >
                  Voir la fiche récapitulative
                </Link>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}

