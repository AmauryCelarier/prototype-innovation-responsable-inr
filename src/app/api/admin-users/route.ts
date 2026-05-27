import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
  }

  const { data, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError || !data) {
    return NextResponse.json({ error: usersError?.message || 'Unable to list users' }, { status: 500 });
  }

  const authUsers = data.users ?? [];
  type ProfileRow = { id: string; first_name: string | null; last_name: string | null; role: string | null };
  const { data: profilesData, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, first_name, last_name, role');

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const profiles = (profilesData ?? []) as ProfileRow[];
  const merged = authUsers.map((user) => {
    const profile = profiles.find((p) => p.id === user.id) ?? null;
    return {
      id: user.id,
      email: user.email,
      role: profile?.role ?? 'user_startup',
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      profileExists: Boolean(profile),
    };
  });

  return NextResponse.json(merged);
}
