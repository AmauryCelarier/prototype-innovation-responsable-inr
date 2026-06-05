// src/app/(auth)/signup/page.tsx
// Redirige vers /login où l'inscription est intégrée
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, [router]);
  return null;
}