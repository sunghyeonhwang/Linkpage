-- Page views tracking
CREATE TABLE IF NOT EXISTS lp_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES lp_profiles(id) ON DELETE CASCADE,
  referrer TEXT,
  user_agent TEXT,
  ip_hash VARCHAR(16),
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_profile_date
  ON lp_page_views (profile_id, viewed_at);

-- Link clicks tracking
CREATE TABLE IF NOT EXISTS lp_link_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID NOT NULL REFERENCES lp_profile_links(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES lp_profiles(id) ON DELETE CASCADE,
  referrer TEXT,
  user_agent TEXT,
  ip_hash VARCHAR(16),
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_link_clicks_profile_date
  ON lp_link_clicks (profile_id, clicked_at);
