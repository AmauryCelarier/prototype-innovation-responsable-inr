"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Array<{ id: string; first_name?: string | null; last_name?: string | null; role?: string | null; email?: string | null }>>([]);
  const [projects, setProjects] = useState<Array<{ id: string; nom_projet?: string; domaine?: string; accompagnateur_id?: string | null; [key: string]: unknown }>>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchService, setSearchService] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [usersRes, projectsRes] = await Promise.all([
        fetch('/api/admin-users'),
        supabase.from('projects').select('*'),
      ]);

      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setProfiles(usersData);
      } else {
        console.error('Erreur admin-users:', usersData.error);
      }

      if (projectsRes.data) {
        setProjects(projectsRes.data);
      } else if (projectsRes.error) {
        console.error('Erreur projets:', projectsRes.error.message);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const changeRole = async (id: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id, role: newRole }, { onConflict: 'id' });
    if (error) {
      alert('Erreur lors de la mise à jour : ' + error.message);
      return;
    }
    setProfiles((prev) => prev.map(p => p.id === id ? { ...p, role: newRole } : p));
  };

  const assignAccompagnateur = async (projectId: string, accompagnateurId: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ accompagnateur_id: accompagnateurId || null })
      .eq('id', projectId);
    if (error) {
      alert('Erreur lors de l\'affectation : ' + error.message);
      return;
    }
    setProjects((prev) => prev.map((project) => project.id === projectId ? { ...project, accompagnateur_id: accompagnateurId || null } : project));
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Supprimer ce Projet ? Cette action est irréversible.')) {
      return;
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      alert('Erreur lors de la suppression : ' + error.message);
      return;
    }

    setProjects((prev) => prev.filter((project) => project.id !== projectId));
  };

  const filteredProfiles = profiles.filter((p) =>
    !searchEmail || (p.email?.toLowerCase().includes(searchEmail.toLowerCase()) ?? false)
  );
  const filteredProjects = projects.filter((project) =>
    !searchService || (project.nom_projet?.toLowerCase().includes(searchService.toLowerCase()) ?? false)
  );

  const accompagnateurs = profiles.filter((p) => p.role === 'user_accompagnateur');
  const getAccompagnateurName = (id: string) => {
    const user = profiles.find((p) => p.id === id);
    return user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Aucun';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <h1 className="text-3xl font-black mb-6 text-black">Administration — Utilisateurs</h1>
      {loading && <p>Chargement...</p>}
      {!loading && (
        <>
          <section className="space-y-4 mb-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Rechercher un utilisateur par email</label>
                <input
                  type="text"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Email de l'utilisateur"
                  className="w-full p-3 border rounded-lg text-black"
                />
              </div>
              
            </div>
          </section>

          <section className="space-y-4 mb-12">
            <div className="max-h-[520px] overflow-y-auto space-y-4 p-3 bg-slate-50 rounded-3xl border border-slate-200">
              {filteredProfiles.length === 0 && (
                <p className="text-sm text-black/70">Aucun utilisateur trouvé.</p>
              )}
              {filteredProfiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-white p-4 rounded-xl border">
                  <div>
                    <div className="font-bold text-black">{(p.first_name || '') + ' ' + (p.last_name || '')}</div>
                    <div className="text-sm text-black">Email: {p.email || 'Non défini'}</div>
                    <div className="text-sm text-black">ID: {p.id}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={p.role || 'user_startup'}
                      onChange={(e) => changeRole(p.id, e.target.value)}
                      className="p-2 border rounded text-black"
                    >
                      <option value="user_startup">user_startup</option>
                      <option value="user_accompagnateur">user_accompagnateur</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 text-black">Affecter un projet à un accompagnateur</h2>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Rechercher un projet par nom</label>
                <input
                  type="text"
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                  placeholder="Nom du projet"
                  className="w-full p-3 border rounded-lg text-black"
                />
              </div>
            </div>
            <div className="max-h-[520px] overflow-y-auto space-y-4 p-3 bg-slate-50 rounded-3xl border border-slate-200">
              {filteredProjects.length === 0 && (
                <p className="text-sm text-black/70">Aucun projet trouvé.</p>
              )}
              {filteredProjects.map((project) => (
                <div key={project.id} className="flex flex-col md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border">
                  <div className="mb-3 md:mb-0">
                    <div className="font-bold text-black">{project.nom_projet || 'Projet sans nom'}</div>
                    <div className="text-sm text-black">{project.domaine || 'Domaine non défini'}</div>
                    <div className="text-sm text-black">Assigné à : {project.accompagnateur_id ? getAccompagnateurName(project.accompagnateur_id) : 'Aucun'}</div>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                    <select
                      value={project.accompagnateur_id || ''}
                      onChange={(e) => assignAccompagnateur(project.id, e.target.value)}
                      className="p-2 border rounded text-black"
                    >
                      <option value="">-- Aucun accompagnateur --</option>
                      {accompagnateurs.map((acc) => (
                        <option key={acc.id} value={acc.id}>{`${acc.first_name || 'Accompagnateur'} ${acc.last_name || ''}`.trim() || acc.email}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteProject(project.id)}
                      className="inline-flex items-center justify-center rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
