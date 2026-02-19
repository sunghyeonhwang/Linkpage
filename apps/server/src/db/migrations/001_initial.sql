-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- LinkPage Users table
CREATE TABLE IF NOT EXISTS lp_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verify_token TEXT,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LinkPage Profiles table
CREATE TABLE IF NOT EXISTS lp_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES lp_users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'My Page',
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  theme_preset TEXT NOT NULL DEFAULT 'clean-white',
  theme_overrides JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LinkPage Profile Links table
CREATE TABLE IF NOT EXISTS lp_profile_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES lp_profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lp_profiles_user_id ON lp_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_lp_profiles_slug ON lp_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_lp_profile_links_profile_id ON lp_profile_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_lp_profile_links_sort_order ON lp_profile_links(profile_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lp_users_email ON lp_users(email);
CREATE INDEX IF NOT EXISTS idx_lp_users_email_verify_token ON lp_users(email_verify_token);
CREATE INDEX IF NOT EXISTS idx_lp_users_password_reset_token ON lp_users(password_reset_token);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION lp_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_lp_users_updated_at ON lp_users;
CREATE TRIGGER update_lp_users_updated_at
  BEFORE UPDATE ON lp_users
  FOR EACH ROW
  EXECUTE FUNCTION lp_update_updated_at_column();

DROP TRIGGER IF EXISTS update_lp_profiles_updated_at ON lp_profiles;
CREATE TRIGGER update_lp_profiles_updated_at
  BEFORE UPDATE ON lp_profiles
  FOR EACH ROW
  EXECUTE FUNCTION lp_update_updated_at_column();

DROP TRIGGER IF EXISTS update_lp_profile_links_updated_at ON lp_profile_links;
CREATE TRIGGER update_lp_profile_links_updated_at
  BEFORE UPDATE ON lp_profile_links
  FOR EACH ROW
  EXECUTE FUNCTION lp_update_updated_at_column();
