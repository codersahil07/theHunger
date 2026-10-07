import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_SETTINGS = {
  reservationsEnabled: true,
  disabledMessage: 'Bookings are paused.'
};

function getSupabaseClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/['"]/g, '').trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''
  ).replace(/['"]/g, '').trim();

  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('[settings GET] No Supabase client - missing env vars');
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'reservations')
      .single();

    console.log('[settings GET] raw data:', JSON.stringify(data), 'error:', error?.message);

    if (error) {
      console.error('[settings GET] Supabase error:', error.message);
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    if (!data?.value) {
      console.error('[settings GET] No value found in row');
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    // data.value is already the JSONB object: { reservationsEnabled, disabledMessage }
    const result = data.value as typeof DEFAULT_SETTINGS;
    console.log('[settings GET] returning:', JSON.stringify(result));
    return NextResponse.json(result);

  } catch (err) {
    console.error('[settings GET] Exception:', err);
    return NextResponse.json(DEFAULT_SETTINGS, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('[settings POST] received body:', JSON.stringify(body));

    const supabase = getSupabaseClient();
    if (!supabase) {
      const msg = 'Supabase not configured - missing env vars';
      console.error('[settings POST]', msg);
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { key: 'reservations', value: body, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('[settings POST] Supabase error:', error.code, error.message);
      // 42501 = RLS violation — service_role key not set
      if (error.code === '42501') {
        return NextResponse.json({
          success: false,
          error: 'RLS_BLOCKED: SUPABASE_SERVICE_ROLE_KEY env var is missing on Vercel. Add it and redeploy.'
        }, { status: 403 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('[settings POST] saved successfully');
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[settings POST] Exception:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
