// src/app/dashboard/page.tsx
// Redirige vers /dashboard/projects
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/projects'); }, [router]);
  return null;
}