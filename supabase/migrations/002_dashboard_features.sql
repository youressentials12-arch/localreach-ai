-- Obiective lunare per utilizator
CREATE TABLE user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,  -- first day of month, e.g. 2025-05-01
  goal_prospects INTEGER DEFAULT 50,
  goal_contacted INTEGER DEFAULT 30,
  goal_replies INTEGER DEFAULT 10,
  goal_clients INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Notificări in-app
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('follow_up', 'goal_reached', 'campaign_done', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT FALSE,
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own goals" ON user_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_goals_user_month ON user_goals(user_id, month);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_activities_user_created ON outreach_activities(user_id, created_at DESC);

-- updated_at trigger for user_goals
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON user_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
