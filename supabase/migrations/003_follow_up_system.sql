-- Add missing fields to existing tables
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS business_email TEXT,
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- User profiles (plan gating)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'agency')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- Backfill profiles for existing users
INSERT INTO profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Outreach messages (email send records + tracking)
CREATE TABLE IF NOT EXISTS outreach_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT,
  body TEXT NOT NULL DEFAULT '',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own messages" ON outreach_messages FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_messages_prospect_id ON outreach_messages(prospect_id);
CREATE INDEX IF NOT EXISTS idx_messages_replied ON outreach_messages(prospect_id, replied_at) WHERE replied_at IS NOT NULL;

-- Follow-up sequences (one per campaign)
CREATE TABLE IF NOT EXISTS follow_up_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Secvență principală',
  enabled BOOLEAN DEFAULT FALSE,
  send_window_start TEXT DEFAULT '09:00',
  send_window_end TEXT DEFAULT '18:00',
  send_on_weekends BOOLEAN DEFAULT FALSE,
  timezone TEXT DEFAULT 'Europe/Bucharest',
  max_per_day INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE follow_up_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own sequences" ON follow_up_sequences FOR ALL USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_sequences_campaign ON follow_up_sequences(campaign_id);

CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON follow_up_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Follow-up steps
CREATE TABLE IF NOT EXISTS follow_up_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID REFERENCES follow_up_sequences(id) ON DELETE CASCADE NOT NULL,
  step_order INTEGER NOT NULL,
  delay_days INTEGER DEFAULT 3,
  delay_hours INTEGER DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'whatsapp', 'linkedin', 'manual_call')),
  subject_template TEXT,
  body_template TEXT NOT NULL DEFAULT '',
  tone TEXT DEFAULT 'friendly' CHECK (tone IN ('formal', 'casual', 'friendly', 'direct', 'professional')),
  use_ai_generation BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE follow_up_steps ENABLE ROW LEVEL SECURITY;

-- Steps are accessible if user owns the sequence
CREATE POLICY "Users own steps via sequence" ON follow_up_steps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM follow_up_sequences s
      WHERE s.id = follow_up_steps.sequence_id AND s.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_steps_sequence ON follow_up_steps(sequence_id, step_order);

CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON follow_up_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Scheduled follow-ups
CREATE TABLE IF NOT EXISTS scheduled_follow_ups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  sequence_id UUID REFERENCES follow_up_sequences(id) ON DELETE CASCADE NOT NULL,
  step_id UUID REFERENCES follow_up_steps(id) ON DELETE CASCADE NOT NULL,
  step_order INTEGER NOT NULL,
  channel TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed', 'skipped')),
  cancelled_reason TEXT CHECK (cancelled_reason IN ('replied', 'unsubscribed', 'status_changed', 'manual', 'sequence_disabled')),
  sent_at TIMESTAMPTZ,
  outreach_message_id UUID REFERENCES outreach_messages(id) ON DELETE SET NULL,
  failure_reason TEXT,
  custom_subject TEXT,
  custom_body TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scheduled_follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own scheduled follow-ups" ON scheduled_follow_ups FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sfu_status_scheduled ON scheduled_follow_ups(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_sfu_prospect_status ON scheduled_follow_ups(prospect_id, status);
CREATE INDEX IF NOT EXISTS idx_sfu_user_scheduled ON scheduled_follow_ups(user_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_sfu_sequence ON scheduled_follow_ups(sequence_id, status);

-- Auto-stop: cancel follow-ups when prospect status changes to terminal
CREATE OR REPLACE FUNCTION cancel_follow_ups_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.outreach_status IN ('won', 'lost', 'negotiating') AND OLD.outreach_status <> NEW.outreach_status THEN
    UPDATE scheduled_follow_ups
    SET status = 'cancelled', cancelled_reason = 'status_changed'
    WHERE prospect_id = NEW.id AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cancel_follow_ups_on_prospect_status ON prospects;
CREATE TRIGGER cancel_follow_ups_on_prospect_status
  AFTER UPDATE OF outreach_status ON prospects
  FOR EACH ROW EXECUTE FUNCTION cancel_follow_ups_on_status_change();

-- Auto-stop: cancel when prospect unsubscribes
CREATE OR REPLACE FUNCTION cancel_follow_ups_on_unsubscribe()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribed_at IS NOT NULL AND OLD.unsubscribed_at IS NULL THEN
    UPDATE scheduled_follow_ups
    SET status = 'cancelled', cancelled_reason = 'unsubscribed'
    WHERE prospect_id = NEW.id AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cancel_follow_ups_on_unsubscribe ON prospects;
CREATE TRIGGER cancel_follow_ups_on_unsubscribe
  AFTER UPDATE OF unsubscribed_at ON prospects
  FOR EACH ROW EXECUTE FUNCTION cancel_follow_ups_on_unsubscribe();

-- Auto-stop: cancel when sequence is disabled
CREATE OR REPLACE FUNCTION cancel_follow_ups_on_sequence_disable()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.enabled = FALSE AND OLD.enabled = TRUE THEN
    UPDATE scheduled_follow_ups
    SET status = 'cancelled', cancelled_reason = 'sequence_disabled'
    WHERE sequence_id = NEW.id AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cancel_follow_ups_on_sequence_disabled ON follow_up_sequences;
CREATE TRIGGER cancel_follow_ups_on_sequence_disabled
  AFTER UPDATE OF enabled ON follow_up_sequences
  FOR EACH ROW EXECUTE FUNCTION cancel_follow_ups_on_sequence_disable();
