-- 001_intel_records.sql
-- Run in Supabase SQL Editor

CREATE TABLE intel_records (
  content_id TEXT PRIMARY KEY,
  source_platform TEXT NOT NULL DEFAULT 'reddit',
  source_type TEXT NOT NULL DEFAULT 'post',
  source_identifier TEXT,
  source_url TEXT,
  scrape_job_id TEXT,
  scrape_batch_id TEXT,
  query_used TEXT,
  matched_keyword TEXT,
  ingest_timestamp TIMESTAMPTZ,
  title TEXT,
  body TEXT,
  raw_text TEXT NOT NULL,
  author TEXT,
  engagement_score INT DEFAULT 0,
  engagement_raw JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  source_metadata JSONB DEFAULT '{}',
  enrichment_status TEXT DEFAULT 'pending',
  primary_pain_point TEXT,
  secondary_pain_point TEXT,
  pain_point_description TEXT,
  desired_outcome TEXT,
  objection_type TEXT,
  trust_issue_flag BOOL DEFAULT FALSE,
  workflow_friction_flag BOOL DEFAULT FALSE,
  time_drain_flag BOOL DEFAULT FALSE,
  money_fear_flag BOOL DEFAULT FALSE,
  churn_trigger_flag BOOL DEFAULT FALSE,
  competitor_mentioned JSONB DEFAULT '[]',
  competitor_sentiment TEXT,
  buying_signal TEXT DEFAULT 'none',
  urgency_level TEXT,
  emotional_intensity TEXT DEFAULT 'low',
  user_sophistication TEXT DEFAULT 'unknown',
  user_journey_stage TEXT DEFAULT 'unknown',
  monetisation_relevance TEXT,
  copywriting_value TEXT,
  quote_candidate BOOL DEFAULT FALSE,
  copy_snippet_candidate TEXT,
  insight_summary TEXT,
  confidence_score FLOAT DEFAULT 0,
  enriched_at TIMESTAMPTZ,
  llm_model_used TEXT,
  lead_score INT DEFAULT 0,
  webhook_pending BOOL DEFAULT FALSE,
  status TEXT DEFAULT 'new',
  is_dismissed BOOL DEFAULT FALSE,
  notes TEXT,
  tags JSONB DEFAULT '[]',
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intel_records_source_platform ON intel_records(source_platform);
CREATE INDEX idx_intel_records_created_at ON intel_records(created_at DESC);
CREATE INDEX idx_intel_records_lead_score ON intel_records(lead_score DESC);
CREATE INDEX idx_intel_records_buying_signal ON intel_records(buying_signal);
CREATE INDEX idx_intel_records_status ON intel_records(status);
CREATE INDEX idx_intel_records_primary_pain_point ON intel_records(primary_pain_point);
CREATE INDEX idx_intel_records_webhook_pending ON intel_records(webhook_pending) WHERE webhook_pending = TRUE;
CREATE INDEX idx_intel_records_fts ON intel_records USING gin(to_tsvector('english', coalesce(raw_text,'') || ' ' || coalesce(title,'')));

ALTER TABLE intel_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read" ON intel_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Service role can write" ON intel_records FOR ALL USING (auth.role() = 'service_role');
