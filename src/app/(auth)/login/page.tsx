'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName, // à lier à un nouvel input
          last_name: lastName,   // à lier à un nouvel input
          address: address       // à lier à un nouvel input
        }
      }
    });
    if (error) alert(error.message);
    else alert('Vérifie tes emails pour confirmer ton inscription !');
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else alert('Connecté !');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Connexion Startup</h1>
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full p-2 border mb-4 rounded"
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Mot de passe" 
          className="w-full p-2 border mb-6 rounded"
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded mb-2 hover:bg-blue-700">
          Se connecter
        </button>
        <button onClick={handleSignUp} className="w-full text-blue-600 p-2 text-sm">
          Pas encore de compte ? S'inscrire
        </button>
      </div>
    </div>
  );
}