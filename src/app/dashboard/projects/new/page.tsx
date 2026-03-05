'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [isEntreprise, setIsEntreprise] = useState(false);
  
  // État étendu avec les nouveaux champs demandés
  const [formData, setFormData] = useState({
    nom_projet: '',
    description: '',
    objectifs: '',
    domaine_applicatif: '', // Industrie, Médical, Tourisme...
    livrables_attendus: '',
    couts_estimes: '',
    referent_nom: '',
    referent_profil: '', // Dev, Info, RSE...
    // Infos entreprise
    nom_entreprise: '',
    siren: '',
    activite: '',
    effectif: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    // On prépare l'objet pour l'insertion
    const projectPayload = {
      ...formData,
      user_id: user?.id,
      is_entreprise: isEntreprise,
      effectif: formData.effectif ? parseInt(formData.effectif) : null,
      // On peut stocker les référents sous forme de JSON si ta colonne est de type JSONB
      referents: { nom: formData.referent_nom, profil: formData.referent_profil }
    };

    const { error } = await supabase.from('projects').insert([projectPayload]);

    if (!error) {
      alert("Projet créé avec succès !");
      router.push('/dashboard/projects');
    } else {
      alert("Erreur : " + error.message);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-800 uppercase tracking-tighter italic">
        Nouveau service
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        
        {/* SECTION 1 : IDENTITÉ DU PROJET */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-600">1. Présentation</h2>
          <div className="grid grid-cols-1 gap-4">
            <input required placeholder="Nom du service / produit" type="text" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black font-bold focus:border-blue-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, nom_projet: e.target.value})} />
            
            <select required className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black font-bold focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, domaine_applicatif: e.target.value})}>
              <option value="">Sélectionner le domaine applicatif</option>
              <option value="Industrie">Industrie</option>
              <option value="Médical">Médical</option>
              <option value="Tourisme">Tourisme</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Autre">Autre</option>
            </select>

            <textarea placeholder="Description détaillée du produit" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black min-h-[100px]"
              onChange={(e) => setFormData({...formData, description: e.target.value})} />
            
            <textarea placeholder="Objectifs principaux (ex: Réduire l'empreinte carbone de...)" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black border-l-4 border-l-emerald-400"
              onChange={(e) => setFormData({...formData, objectifs: e.target.value})} />
          </div>
        </div>

        {/* SECTION 2 : RÉFÉRENT & ÉQUIPE */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-600 ">2. Personne Référente</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Nom du référent" type="text" className="p-4 border-2 border-slate-100 rounded-2xl text-black"
              onChange={(e) => setFormData({...formData, referent_nom: e.target.value})} />
            <select className="p-4 border-2 border-slate-100 rounded-2xl text-black"
              onChange={(e) => setFormData({...formData, referent_profil: e.target.value})}>
              <option value="">Profil du référent</option>
              <option value="Dev">Développeur / Tech</option>
              <option value="Info">Informatique / Ops</option>
              <option value="RSE">Responsable RSE</option>
              <option value="Produit">Product Owner</option>
            </select>
          </div>
        </div>

        {/* SECTION 3 : ÉCONOMIE DU PROJET */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-600">3. Livrables & Coûts</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Livrables attendus" type="text" className="p-4 border-2 border-slate-100 rounded-2xl text-black"
              onChange={(e) => setFormData({...formData, livrables_attendus: e.target.value})} />
            <input placeholder="Coûts estimés (€)" type="text" className="p-4 border-2 border-slate-100 rounded-2xl text-black"
              onChange={(e) => setFormData({...formData, couts_estimes: e.target.value})} />
          </div>
        </div>

        {/* SECTION 4 : INFOS ENTREPRISE (Optionnel) */}
        <div className="pt-4 border-t">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 accent-blue-600" onChange={(e) => setIsEntreprise(e.target.checked)} />
            <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Ce service appartient à une structure juridique existante</span>
          </label>
          
          {isEntreprise && (
            <div className="grid grid-cols-2 gap-4 mt-6 p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100 animate-in fade-in slide-in-from-top-2">
              <input placeholder="Nom entreprise" className="p-3 rounded-xl border-none text-black font-bold"
                onChange={(e) => setFormData({...formData, nom_entreprise: e.target.value})} />
              <input placeholder="SIREN / SIRET" className="p-3 rounded-xl border-none text-black font-bold"
                onChange={(e) => setFormData({...formData, siren: e.target.value})} />
              <input placeholder="Effectif" type="number" className="p-3 rounded-xl border-none text-black font-bold"
                onChange={(e) => setFormData({...formData, effectif: e.target.value})} />
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-slate-900 text-white p-6 rounded-[1.8rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl active:scale-95">
          Créer le service et passer au diagnostic
        </button>
      </form>
    </div>
  );
}