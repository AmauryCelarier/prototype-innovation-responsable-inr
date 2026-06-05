// src/app/api/admin-update-role/route.ts
// Route API sécurisée pour modifier le rôle d'un utilisateur
// Utilise la service_role_key qui bypass le RLS

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  // 1. Vérifier que l'appelant est bien un admin connecté
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // 2. Récupérer les paramètres
  const { userId, newRole } = await request.json()

  if (!userId || !newRole) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const allowedRoles = ['user_startup', 'user_accompagnateur', 'admin']
  if (!allowedRoles.includes(newRole)) {
    return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
  }

  // 3. Modifier le rôle avec le client admin (bypass RLS)
  const adminClient = createSupabaseAdminClient()
  const { error: updateError } = await adminClient
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}