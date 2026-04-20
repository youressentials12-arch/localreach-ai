-- Campanii de prospecting
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  service_offered TEXT NOT NULL,
  target_industry TEXT NOT NULL,
  target_location TEXT NOT NULL,
  qualification_criteria JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Afaceri găsite și analizate
CREATE TABLE prospects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,

  business_name TEXT NOT NULL,
  business_address TEXT,
  business_phone TEXT,
  business_website TEXT,
  business_category TEXT,
  google_place_id TEXT UNIQUE,
  google_rating DECIMAL(2,1),
  google_reviews_count INTEGER,
  google_maps_url TEXT,

  opportunity_score INTEGER CHECK (opportunity_score BETWEEN 0 AND 100),
  analysis_summary TEXT,
  pain_points JSONB,
  analysis_data JSONB,

  outreach_status TEXT DEFAULT 'discovered' CHECK (
    outreach_status IN ('discovered', 'contacted', 'replied', 'negotiating', 'won', 'lost', 'not_qualified')
  ),
  contact_channel TEXT,
  contacted_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hook-uri generate per prospect
CREATE TABLE hooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  channel TEXT NOT NULL CHECK (channel IN ('email', 'phone', 'instagram', 'facebook', 'linkedin')),
  hook_subject TEXT,
  hook_content TEXT NOT NULL,
  tone TEXT DEFAULT 'direct' CHECK (tone IN ('direct', 'empathetic', 'curious', 'provocative', 'professional')),

  was_used BOOLEAN DEFAULT FALSE,
  got_response BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activitate / log outreach
CREATE TABLE outreach_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  activity_type TEXT NOT NULL,
  channel TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funcție pentru updated_at automat
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own campaigns" ON campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own prospects" ON prospects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own hooks" ON hooks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own activities" ON outreach_activities FOR ALL USING (auth.uid() = user_id);

-- Indexes pentru performanță
CREATE INDEX idx_prospects_user_id ON prospects(user_id);
CREATE INDEX idx_prospects_campaign_id ON prospects(campaign_id);
CREATE INDEX idx_prospects_outreach_status ON prospects(outreach_status);
CREATE INDEX idx_hooks_prospect_id ON hooks(prospect_id);
CREATE INDEX idx_activities_prospect_id ON outreach_activities(prospect_id);