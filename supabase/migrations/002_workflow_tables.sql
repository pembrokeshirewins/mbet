-- 002_workflow_tables.sql
-- Run in Supabase SQL Editor after 001

CREATE TABLE operator_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL REFERENCES intel_records(content_id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  operator TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_operator_actions_content_id ON operator_actions(content_id);
CREATE INDEX idx_operator_actions_created_at ON operator_actions(created_at DESC);
ALTER TABLE operator_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read/write" ON operator_actions FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL REFERENCES intel_records(content_id) ON DELETE CASCADE,
  idempotency_key TEXT UNIQUE,
  payload JSONB,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  response_code INT
);
CREATE INDEX idx_webhook_events_content_id ON webhook_events(content_id);
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read/write" ON webhook_events FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE reply_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id TEXT NOT NULL REFERENCES intel_records(content_id) ON DELETE CASCADE,
  variant INT,
  reply_text TEXT,
  tone TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  used BOOL DEFAULT FALSE,
  UNIQUE(content_id, variant)
);
CREATE INDEX idx_reply_suggestions_content_id ON reply_suggestions(content_id);
ALTER TABLE reply_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read/write" ON reply_suggestions FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO settings (key, value) VALUES
  ('webhook_url', '"https://your-n8n-webhook-url"'),
  ('webhook_threshold', '65'),
  ('reply_tone', '"helpful"');
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read/write" ON settings FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read/write" ON saved_filters FOR ALL USING (auth.role() = 'authenticated');
