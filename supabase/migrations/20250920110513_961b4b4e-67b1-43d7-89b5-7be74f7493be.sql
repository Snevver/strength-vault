-- Drop the custom users table since we'll use Supabase's built-in auth.users table
DROP TABLE IF EXISTS public.users;