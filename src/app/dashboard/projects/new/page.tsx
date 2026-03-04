'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [isEntreprise, setIsEntreprise] = useState(false);
  const [formData, setFormData] = useState({
    nom_projet: '',
    region: '',
    description: '',
    nom_entreprise: '',
    siren: '',
    activite: '',
    adresse_siege: '',
    effectif: '',
    dirigeant: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('projects').insert([{
      ...formData,
      user_id: user?.id,
      is_entreprise: isEntreprise,
      effectif: formData.effectif ? parseInt(formData.effectif) : null
    }]);

    if (!error) {
      alert("Service créé !");
      router.push('/dashboard/projects');
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">Nouveau Service</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border">
        {/* Infos de base */}
        <div>
          <label className="block text-sm font-bold mb-2 text-black">Nom du service</label>
          <input required type="text" className="w-full p-3 border rounded-xl text-black"
            onChange={(e) => setFormData({...formData, nom_projet: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-black">Description courte</label>
          <input maxLength={150} type="text" className="w-full p-3 border rounded-xl text-black"
            onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </div>

        {/* Toggle Entreprise */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
          <input type="checkbox" id="ent" onChange={(e) => setIsEntreprise(e.target.checked)} />
          <label htmlFor="ent" className="font-semibold cursor-pointer text-black">Ce service est lié à une entreprise déjà créée</label>
        </div>

        {/* Champs conditionnels Entreprise */}
        {isEntreprise && (
          <div className="grid grid-cols-2 gap-4 p-4 border-l-4 border-blue-500 bg-blue-50">
            <input placeholder="Nom entreprise" className="p-2 border rounded text-black"
              onChange={(e) => setFormData({...formData, nom_entreprise: e.target.value})} />
            <input placeholder="SIRET" className="p-2 border rounded text-black"
              onChange={(e) => setFormData({...formData, siren: e.target.value})} />
            <input placeholder="Activité" className="p-2 border rounded text-black"
              onChange={(e) => setFormData({...formData, activite: e.target.value})} />
            <input placeholder="Effectif" type="number" className="p-2 border rounded text-black"
              onChange={(e) => setFormData({...formData, effectif: e.target.value})} />
            <input placeholder="Dirigeant" className="p-2 border rounded col-span-2 text-black"
              onChange={(e) => setFormData({...formData, dirigeant: e.target.value})} />
          </div>
        )}

        <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold hover:bg-black transition-all">
          Enregistrer le service
        </button>
      </form>
    </div>
  );
}