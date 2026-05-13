'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [isEntreprise, setIsEntreprise] = useState(false);
  
  // 1. État pour les questions
  const [qAnswers, setQAnswers] = useState({
    reduit_empreinte_it: null as boolean | null,
    aide_transition_metier: null as boolean | null,
  });

  const [formData, setFormData] = useState({
    nom_projet: '',
    description: '',
    main_objectifs: '',
    environmental_objectifs: '',
    cible_service: '',
    problematique: '',
    domaine_applicatif: '',
    livrables_attendus: '',
    couts: '',
    referent_nom: '',
    referent_profil: '',
    nom_entreprise: '',
    siren: '',
    activite: '',
    effectif: ''
  });

  const calculateTypeApproche = () => {
    if (qAnswers.reduit_empreinte_it && qAnswers.aide_transition_metier) return "Green IT & IT for Green";
    if (qAnswers.reduit_empreinte_it) return "Green IT";
    if (qAnswers.aide_transition_metier) return "IT for Green";
    if (qAnswers.reduit_empreinte_it === false && qAnswers.aide_transition_metier === false) return "Aucune approche spécifique";
    return "";
  };

  const currentTypeApproche = calculateTypeApproche();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (qAnswers.reduit_empreinte_it === null || qAnswers.aide_transition_metier === null) {
      alert("Veuillez répondre aux questions de qualification.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    // MAPPING STRICT AVEC TES COLONNES BDD (Version texte pour le référent)
    const projectPayload = {
      user_id: user?.id,
      type_approche: currentTypeApproche,
      nom_projet: formData.nom_projet,
      description: formData.description,
      domaine: formData.domaine_applicatif, 
      main_objectifs: formData.main_objectifs,
      environmental_objectifs: formData.environmental_objectifs,
      cible_service: formData.cible_service,
      problematique: formData.problematique,
      livrable: formData.livrables_attendus, 
      couts: formData.couts,
      
      // Référent envoyé comme texte simple
      referent_projet: formData.referent_nom,
      // Optionnel : si tu as créé ces colonnes spécifiques en format texte
      // referent_profil: formData.referent_profil,

      // Partie Entreprise
      is_entreprise: isEntreprise,
      nom_entreprise: isEntreprise ? formData.nom_entreprise : null,
      siren: isEntreprise ? formData.siren : null,
      activite: isEntreprise ? formData.activite : null,
      effectif: isEntreprise && formData.effectif ? parseInt(formData.effectif) : null,
    };

    const { error } = await supabase.from('projects').insert([projectPayload]);

    if (!error) {
      alert("Projet créé avec succès !");
      router.push('/dashboard/projects');
    } else {
      console.error(error);
      alert("Erreur : " + error.message);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-800 uppercase tracking-tighter italic">
        Nouveau service
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        
        {/* QUALIFICATION */}
        <div className="space-y-6 p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <h2 className="text-sm font-black uppercase tracking-widest text-emerald-600">Qualification de l&apos;approche</h2>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-bold text-slate-700">Réduire l&apos;impact environnemental du service lui-même ?</p>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button key={`q1-${val}`} type="button" onClick={() => setQAnswers({...qAnswers, reduit_empreinte_it: val})}
                    className={`px-6 py-2 rounded-xl font-bold transition-all ${qAnswers.reduit_empreinte_it === val ? 'bg-emerald-500 text-white' : 'bg-white border-2 text-slate-400'}`}>
                    {val ? 'Oui' : 'Non'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-bold text-slate-700">Aider un autre secteur à réduire son impact ?</p>
              <div className="flex gap-2">
                {[true, false].map((val) => (
                  <button key={`q2-${val}`} type="button" onClick={() => setQAnswers({...qAnswers, aide_transition_metier: val})}
                    className={`px-6 py-2 rounded-xl font-bold transition-all ${qAnswers.aide_transition_metier === val ? 'bg-blue-500 text-white' : 'bg-white border-2 text-slate-400'}`}>
                    {val ? 'Oui' : 'Non'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {currentTypeApproche && (
            <div className="mt-4 p-4 bg-white rounded-2xl border-2 border-slate-100">
              <p className="text-xs font-black uppercase text-slate-400">Approche :</p>
              <p className="text-lg font-black text-slate-900 italic">{currentTypeApproche}</p>
            </div>
          )}
        </div>

        {/* 1. PRÉSENTATION */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-blue-600">1. Présentation</h2>
          <div className="grid grid-cols-1 gap-4">
            <input required placeholder="Nom du service / produit" type="text" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black font-bold focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, nom_projet: e.target.value})} />
            
            <select required className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black font-bold focus:border-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, domaine_applicatif: e.target.value})}>
              <option value="">Sélectionner le domaine</option>
              <option value="Industrie">Industrie</option>
              <option value="Médical">Médical</option>
              <option value="Tourisme">Tourisme</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Autre">Autre</option>
            </select>

            <textarea placeholder="Description détaillée" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black min-h-[100px]"
              onChange={(e) => setFormData({...formData, description: e.target.value})} />
  
            <textarea placeholder="Objectifs principaux" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black border-l-4"
              onChange={(e) => setFormData({...formData, main_objectifs: e.target.value})} />
            <textarea placeholder="Objectif environnemental" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black border-l-4 border-l-emerald-400"
            onChange={(e) => setFormData({...formData, environmental_objectifs: e.target.value})} />

            <textarea placeholder="Cible du service" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black border-l-4"
              onChange={(e) => setFormData({...formData, cible_service: e.target.value})} />
            <textarea placeholder="Problématique à résoudre" className="w-full p-4 border-2 border-slate-100 rounded-2xl text-black border-l-4"
              onChange={(e) => setFormData({...formData, problematique: e.target.value})} />
          </div>
        </div>

        {/* 2. RÉFÉRENT */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase text-blue-600">2. Personne Référente</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Nom du référent" type="text" className="p-4 border-2 border-slate-100 rounded-2xl text-black"
              onChange={(e) => setFormData({...formData, referent_nom: e.target.value})} />
            <select className="p-4 border-2 border-slate-100 rounded-2xl text-black"
              onChange={(e) => setFormData({...formData, referent_profil: e.target.value})}>
              <option value="">Profil du référent</option>
              <option value="Dev">Développeur</option>
              <option value="RSE">Responsable RSE</option>
              <option value="Produit">Product Owner</option>
            </select>
          </div>
        </div>

        {/* 3. LIVRABLES & COÛTS */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase text-blue-600">3. Livrables & Coûts</h2>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Livrables attendus" type="text" className="p-4 border-2 border-slate-100 rounded-2xl text-black"
              onChange={(e) => setFormData({...formData, livrables_attendus: e.target.value})} />
            <input placeholder="Coûts estimés (€)" type="text" className="p-4 border-2 border-slate-100 rounded-2xl text-black"
              onChange={(e) => setFormData({...formData, couts: e.target.value})} />
          </div>
        </div>

        {/* 4. ENTREPRISE */}
        <div className="pt-4 border-t">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 accent-blue-600" onChange={(e) => setIsEntreprise(e.target.checked)} />
            <span className="font-bold text-slate-700">Structure juridique existante</span>
          </label>
          
          {isEntreprise && (
            <div className="grid grid-cols-2 gap-4 mt-6 p-6 bg-blue-50 rounded-[2rem] border-2 border-blue-100">
              <input placeholder="Nom entreprise" className="p-3 rounded-xl font-bold text-black border-2 border-gray-300"
                onChange={(e) => setFormData({...formData, nom_entreprise: e.target.value})} />
              <input placeholder="SIREN / SIRET" className="p-3 rounded-xl font-bold text-black border-2 border-gray-300"
                onChange={(e) => setFormData({...formData, siren: e.target.value})} />
              <input placeholder="Activité" className="p-3 rounded-xl font-bold text-black border-2 border-gray-300"
                onChange={(e) => setFormData({...formData, activite: e.target.value})} />
              <input placeholder="Effectif" type="number" className="p-3 rounded-xl font-bold text-black border-2 border-gray-300"
                onChange={(e) => setFormData({...formData, effectif: e.target.value})} />
            </div>
          )}
        </div>

        <button type="submit" disabled={!currentTypeApproche}
          className="w-full bg-slate-900 text-white p-6 rounded-[1.8rem] font-black uppercase hover:bg-blue-600 transition-all disabled:opacity-50">
          Créer le service et passer au diagnostic
        </button>
      </form>
    </div>
  );
}