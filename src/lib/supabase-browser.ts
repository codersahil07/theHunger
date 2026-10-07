import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  url = url.replace(/['"]/g, '').trim();
  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }

  let key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  key = key.replace(/['"]/g, '').trim();

  return createBrowserClient(url, key);
};
