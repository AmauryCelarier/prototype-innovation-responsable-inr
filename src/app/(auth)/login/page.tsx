'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Basculer entre Connexion et Inscription
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');

  // FONCTION CONNEXION
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push('/dashboard/projects'); // Redirige vers tes projets
  };

  // FONCTION INSCRIPTION
  const handleSignUp = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Création de l'utilisateur dans le système d'authentification
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) return alert(authError.message);

  // 2. Si l'utilisateur est bien créé, on remplit son profil
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id, // On utilise l'ID que Supabase vient de générer
          first_name: firstName,
          last_name: lastName,
          address: address,
          email: authData.user.email,
          role: 'user_startup',
        },
      ]);

    if (profileError) {
      console.error("Erreur profil:", profileError.message);
      alert("Compte créé, mais erreur lors de l'enregistrement du profil.");
    } else {
      alert("Inscription réussie et profil créé !");
      setIsLogin(true); // On bascule vers l'écran de connexion
    }
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-slate-100">
        
        {/* Sélecteur Mode Connexion / Inscription */}
        <div className="flex mb-8 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isLogin ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
          >
            Connexion
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isLogin ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
          >
            Inscription
          </button>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {isLogin ? 'Bon retour !' : 'Créer un compte'}
        </h2>

        <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Prénom" required className="p-3 border rounded-xl w-full text-black" onChange={(e) => setFirstName(e.target.value)} />
                <input type="text" placeholder="Nom" required className="p-3 border rounded-xl w-full text-black" onChange={(e) => setLastName(e.target.value)} />
              </div>
              <input type="text" placeholder="Adresse" required className="p-3 border rounded-xl w-full text-black" onChange={(e) => setAddress(e.target.value)} />
            </>
          )}
          
          <input type="email" placeholder="Email" required className="p-3 border rounded-xl w-full text-black" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" required className="p-3 border rounded-xl w-full text-black" onChange={(e) => setPassword(e.target.value)} />

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200">
            {isLogin ? 'Se connecter' : 'Créer mon profil'}
          </button>
        </form>
      </div>
    </div>
  );
}