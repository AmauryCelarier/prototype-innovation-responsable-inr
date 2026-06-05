'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); return; }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role ?? 'user_startup';

    if (role === 'admin') {
      router.push('/admin/users');
    } else {
      router.push('/dashboard/projects');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) return alert(authError.message);

    if (authData.user) {
      // Le trigger a déjà créé le profil avec id + role='user_startup'
      // On met juste à jour les infos personnelles
      await supabase.from('profiles').update({
        first_name: firstName,
        last_name: lastName,
        address: address,
      }).eq('id', authData.user.id);

      alert('Inscription réussie !');
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-slate-100">

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
                <input type="text" placeholder="Prénom" required
                  className="p-3 border rounded-xl w-full text-black"
                  onChange={(e) => setFirstName(e.target.value)} />
                <input type="text" placeholder="Nom" required
                  className="p-3 border rounded-xl w-full text-black"
                  onChange={(e) => setLastName(e.target.value)} />
              </div>
              <input type="text" placeholder="Adresse" required
                className="p-3 border rounded-xl w-full text-black"
                onChange={(e) => setAddress(e.target.value)} />
            </>
          )}

          <input type="email" placeholder="Email" required
            className="p-3 border rounded-xl w-full text-black"
            onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Mot de passe" required
            className="p-3 border rounded-xl w-full text-black"
            onChange={(e) => setPassword(e.target.value)} />

          <button type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200">
            {isLogin ? 'Se connecter' : 'Créer mon profil'}
          </button>
        </form>
      </div>
    </div>
  );
}