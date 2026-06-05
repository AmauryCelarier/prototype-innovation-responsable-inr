// src/app/dashboard/layout.tsx
// Layout avec sidebar pour toutes les pages /dashboard/*
// La sidebar s'affiche pour user_startup et user_accompagnateur
// L'admin a juste un bouton déconnexion discret en haut à droite

'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type UserRole = 'admin' | 'user_accompagnateur' | 'user_startup' | null;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      setEmail(user.email ?? null);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, first_name')
        .eq('id', user.id)
        .single();

      setRole((profile?.role ?? 'user_startup') as UserRole);
      setFirstName(profile?.first_name ?? null);
      setLoading(false);
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Chargement...</p>
        </div>
      </div>
    );
  }

  // ── ADMIN : layout minimal avec bouton déconnexion ─────────────────────────
  if (role === 'admin') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Barre admin minimaliste */}
        <div className="fixed top-0 left-0 right-0 z-50 h-12 bg-white border-b border-slate-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin</span>
            {email && (
              <span className="text-[10px] text-slate-400 font-medium ml-2">{email}</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
        <div className="pt-12">
          {children}
        </div>
      </div>
    );
  }

  // ── USER_STARTUP / USER_ACCOMPAGNATEUR : layout avec sidebar ──────────────
  const isAccompagnateur = role === 'user_accompagnateur';

  const navLinks = [
    {
      href: '/dashboard/projects',
      label: isAccompagnateur ? 'Projets accompagnés' : 'Mes Projets',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
        </svg>
      ),
    },
  ];

  // Pour les startups uniquement : accès rapide aux étapes (sans projectId, redirige vers choix projet)
  if (!isAccompagnateur) {
    navLinks.push(
      {
        href: '/dashboard/projects/new',
        label: 'Nouveau projet',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        ),
      }
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">

      {/* ── SIDEBAR ───────────────────────────────────────────────────────── */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 flex flex-col z-40 shadow-2xl">

        {/* Logo / Titre */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-tight leading-none">
                Prototype
              </p>
              <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest">
                Innovation
              </p>
            </div>
          </div>
        </div>

        {/* Badge rôle */}
        <div className="px-6 py-3 border-b border-slate-800">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            isAccompagnateur
              ? 'bg-violet-900/60 text-violet-300 border border-violet-700/50'
              : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAccompagnateur ? 'bg-violet-400' : 'bg-blue-400'}`} />
            {isAccompagnateur ? 'Accompagnateur' : 'Startup'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Pied de sidebar : email + déconnexion */}
        <div className="p-4 border-t border-slate-800">
          {/* Info utilisateur */}
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-slate-800/60">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-slate-300 text-xs font-black uppercase">
                {(firstName?.[0] ?? email?.[0] ?? '?').toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              {firstName && (
                <p className="text-white text-xs font-bold truncate">{firstName}</p>
              )}
              <p className="text-slate-400 text-[10px] truncate">{email ?? '—'}</p>
            </div>
          </div>

          {/* Bouton déconnexion */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-all text-sm font-bold group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── CONTENU PRINCIPAL ─────────────────────────────────────────────── */}
      <main className="ml-64 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}