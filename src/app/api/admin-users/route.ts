import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );

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
  } catch (err: any) {
    console.error('API /admin-users error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
