/*
# AgriNova AI — Core Schema

1. New Tables
- `profiles` — extended user profile data (name, phone, state, district, farm size, language, photo). One row per auth user.
- `contact_messages` — messages submitted via the contact form (name, email, subject, message).
- `crop_recommendations` — saved crop recommendations per user (inputs + result snapshot).
- `disease_scans` — saved plant disease detection scans per user (image url + result snapshot).
- `chat_history` — AI farming assistant conversation history per user (role + content).
- `saved_crops` — crops a user has bookmarked (crop id/name + metadata).
- `search_history` — global search history per user (query + category).
- `admin_notes` — admin-managed notes/content (for admin panel).

2. Security
- Enable RLS on every table.
- `profiles`: owner-scoped CRUD (auth.uid() = id).
- `contact_messages`: anyone (anon+authenticated) can INSERT; only authenticated can SELECT their own; delete for owner.
- `crop_recommendations`, `disease_scans`, `chat_history`, `saved_crops`, `search_history`: owner-scoped CRUD via user_id.
- `admin_notes`: owner-scoped CRUD via user_id (admin content).

3. Notes
- All owner columns default to auth.uid() so inserts that omit user_id succeed.
- ON DELETE CASCADE on user_id FKs so deleting a user removes their data.
- Auto-create profile on signup via trigger.
*/

-- Profiles table (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  state text DEFAULT '',
  district text DEFAULT '',
  farm_size text DEFAULT '',
  preferred_language text DEFAULT 'English',
  photo_url text DEFAULT '',
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT '',
  message text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact" ON contact_messages;
CREATE POLICY "anon_insert_contact" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "select_own_contact" ON contact_messages;
CREATE POLICY "select_own_contact" ON contact_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_contact" ON contact_messages;
CREATE POLICY "delete_own_contact" ON contact_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Crop recommendations (saved)
CREATE TABLE IF NOT EXISTS crop_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  inputs jsonb NOT NULL DEFAULT '{}',
  result jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE crop_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_crop_recs" ON crop_recommendations;
CREATE POLICY "select_own_crop_recs" ON crop_recommendations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_crop_recs" ON crop_recommendations;
CREATE POLICY "insert_own_crop_recs" ON crop_recommendations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_crop_recs" ON crop_recommendations;
CREATE POLICY "delete_own_crop_recs" ON crop_recommendations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Disease scans (saved)
CREATE TABLE IF NOT EXISTS disease_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text DEFAULT '',
  result jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE disease_scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_scans" ON disease_scans;
CREATE POLICY "select_own_scans" ON disease_scans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_scans" ON disease_scans;
CREATE POLICY "insert_own_scans" ON disease_scans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_scans" ON disease_scans;
CREATE POLICY "delete_own_scans" ON disease_scans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Chat history
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chat" ON chat_history;
CREATE POLICY "select_own_chat" ON chat_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_chat" ON chat_history;
CREATE POLICY "insert_own_chat" ON chat_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_chat" ON chat_history;
CREATE POLICY "delete_own_chat" ON chat_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Saved crops (bookmarks)
CREATE TABLE IF NOT EXISTS saved_crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE saved_crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_crops" ON saved_crops;
CREATE POLICY "select_own_saved_crops" ON saved_crops FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_saved_crops" ON saved_crops;
CREATE POLICY "insert_own_saved_crops" ON saved_crops FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_saved_crops" ON saved_crops;
CREATE POLICY "delete_own_saved_crops" ON saved_crops FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Search history
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  query text NOT NULL,
  category text DEFAULT 'all',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_search" ON search_history;
CREATE POLICY "select_own_search" ON search_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_search" ON search_history;
CREATE POLICY "insert_own_search" ON search_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_search" ON search_history;
CREATE POLICY "delete_own_search" ON search_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Admin notes (admin-managed content)
CREATE TABLE IF NOT EXISTS admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text DEFAULT '',
  category text DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_admin_notes" ON admin_notes;
CREATE POLICY "select_own_admin_notes" ON admin_notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_admin_notes" ON admin_notes;
CREATE POLICY "insert_own_admin_notes" ON admin_notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_admin_notes" ON admin_notes;
CREATE POLICY "update_own_admin_notes" ON admin_notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_admin_notes" ON admin_notes;
CREATE POLICY "delete_own_admin_notes" ON admin_notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crop_rec_user ON crop_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_user ON disease_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_saved_crops_user ON saved_crops(user_id);
CREATE INDEX IF NOT EXISTS idx_search_user ON search_history(user_id, created_at);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
