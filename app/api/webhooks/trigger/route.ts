import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client — can write webhook_events
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  const { content_id } = await request.json()

  if (!content_id) {
    return NextResponse.json({ error: 'content_id required' }, { status: 400 })
  }

  // Fetch the record
  const { data: record, error } = await supabase
    .from('intel_records')
    .select('*')
    .eq('content_id', content_id)
    .single()

  if (error || !record) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  }

  const webhookUrl = process.env.WEBHOOK_URL
  if (!webhookUrl) {
    return NextResponse.json({ error: 'WEBHOOK_URL not configured' }, { status: 500 })
  }

  // Idempotency key: one webhook per record per day
  const today = new Date().toISOString().slice(0, 10)
  const idempotencyKey = `whk_${content_id}_${today}`

  // Check if already sent today
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .single()

  if (existing) {
    return NextResponse.json({ message: 'Already sent today', idempotency_key: idempotencyKey })
  }

  const meta = record.source_metadata as Record<string, unknown>
  const payload = {
    content_id: record.content_id,
    source_platform: record.source_platform,
    source_url: record.source_url,
    title: record.title,
    body: record.body,
    author: record.author,
    subreddit: meta?.subreddit,
    lead_score: record.lead_score,
    primary_pain_point: record.primary_pain_point,
    buying_signal: record.buying_signal,
    emotional_intensity: record.emotional_intensity,
    competitor_mentioned: record.competitor_mentioned,
    insight_summary: record.insight_summary,
    alert_type: 'outreach_candidate',
    idempotency_key: idempotencyKey,
    sent_at: new Date().toISOString(),
  }

  // Fire webhook
  let responseCode = 0
  let status = 'sent'
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    responseCode = res.status
    if (!res.ok) status = 'failed'
  } catch {
    status = 'failed'
    responseCode = 0
  }

  // Log the event
  await supabase.from('webhook_events').insert({
    content_id,
    idempotency_key: idempotencyKey,
    payload,
    status,
    response_code: responseCode,
  })

  // Update record status
  if (status === 'sent') {
    await supabase.from('intel_records')
      .update({ status: 'webhook_sent', webhook_pending: false })
      .eq('content_id', content_id)
  }

  return NextResponse.json({ status, response_code: responseCode, idempotency_key: idempotencyKey })
}
