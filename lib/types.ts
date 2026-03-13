export interface IntelRecord {
  content_id: string
  source_platform: string
  source_type: string
  source_url: string | null
  title: string | null
  body: string | null
  raw_text: string
  author: string | null
  engagement_score: number
  engagement_raw: Record<string, unknown>
  created_at: string | null
  source_metadata: Record<string, unknown>
  enrichment_status: string
  primary_pain_point: string | null
  secondary_pain_point: string | null
  pain_point_description: string | null
  desired_outcome: string | null
  churn_trigger_flag: boolean
  competitor_mentioned: string[]
  competitor_sentiment: string
  buying_signal: string
  emotional_intensity: string
  user_sophistication: string
  user_journey_stage: string
  copywriting_value: string | null
  quote_candidate: boolean
  copy_snippet_candidate: string | null
  insight_summary: string | null
  confidence_score: number
  lead_score: number
  status: string
  is_dismissed: boolean
  notes: string | null
  tags: string[]
  synced_at: string
}

export interface FilterState {
  search: string
  pain_point: string
  buying_signal: string
  emotional_intensity: string
  status: string
  min_lead_score: number
  subreddit: string
}
