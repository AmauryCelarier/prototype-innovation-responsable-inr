import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  // 1. Vérifier que l'utilisateur est connecté
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // 2. Vérifier que l'utilisateur est admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // 3. Utiliser le client admin pour lister les utilisateurs Supabase Auth
  const adminClient = createSupabaseAdminClient()
  const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers()

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

  // 4. Récupérer les profils
  const { data: profiles } = await adminClient
    .from('profiles')
    .select('id, first_name, last_name, role')

  // 5. Fusionner email (Auth) + profil (DB)
  const merged = users.map((u) => {
    const p = profiles?.find((p) => p.id === u.id)
    return {
      id: u.id,
      email: u.email,
      first_name: p?.first_name ?? null,
      last_name: p?.last_name ?? null,
      role: p?.role ?? 'user_startup',
    }
  })

  return NextResponse.json(merged)
}