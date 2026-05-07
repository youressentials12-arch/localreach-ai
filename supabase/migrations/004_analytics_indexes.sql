-- Performance indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_outreach_messages_user_sent
  ON outreach_messages (user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_outreach_messages_campaign_channel
  ON outreach_messages (user_id, campaign_id, channel, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_outreach_messages_replied
  ON outreach_messages (user_id, replied_at) WHERE replied_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_outreach_messages_opened
  ON outreach_messages (user_id, opened_at) WHERE opened_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_prospects_user_status_category
  ON prospects (user_id, outreach_status, business_category);

CREATE INDEX IF NOT EXISTS idx_prospects_contacted_at
  ON prospects (user_id, contacted_at DESC) WHERE contacted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hooks_user_used
  ON hooks (user_id, was_used, got_response, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_outreach_activities_user_created
  ON outreach_activities (user_id, activity_type, created_at DESC);
