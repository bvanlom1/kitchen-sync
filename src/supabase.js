import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

// Expected table schema:
// create table shopping_list (
//   id uuid primary key default gen_random_uuid(),
//   user_group text not null, -- e.g., 'household-vanlom'
//   name text not null,
//   qty int default 1,
//   reasons text[] default '{}',
//   checked boolean default false,
//   inserted_at timestamp with time zone default now()
// );
//
// enable realtime: alter publication supabase_realtime add table shopping_list;
