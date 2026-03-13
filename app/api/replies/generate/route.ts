import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const SYSTEM_PROMPT = `You are a genuine, helpful community member in UK matched betting / sports betting subreddits. You are NOT selling anything. You are not mentioning any specific product by name. You are responding helpfully to someone who has expressed pain, frustration, or a question about their betting workflow.

Rules (HARD):
- British English throughout
- Informal, genuine, community tone — not corporate
- NO product names, NO links, NO "check out X"
- Max 3 sentences per reply
- Acknowledge their specific pain before offering any perspective
- Do not claim to have solved their exact problem
- End with a genuine question or observation, not a sales line

You will generate 3 variants: short (1-2 sentences), medium (2-3 sentences), direct (gets to the point fast, slightly more confident tone).`

export async function POST(request: NextRequest) {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const { content_id } = await request.json()
  if (!content_id) return NextResponse.json({ error: 'content_id required' }, { status: 400 })

  const { data: record } = await supabase
    .from('intel_records')
    .select('*')
    .eq('content_id', content_id)
    .single()

  if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  if (record.source_platform !== 'reddit') {
    return NextResponse.json({ error: 'Replies only for Reddit records' }, { status: 400 })
  }

  // Hard skip rules
  const meta = record.source_metadata as Record<string, unknown>
  const author = record.author?.toLowerCase() || ''
  if (author.includes('bot') || author === 'automoderator') {
    return NextResponse.json({ error: 'Skipped: bot author' }, { status: 400 })
  }
  if (record.created_at) {
    const daysOld = (Date.now() - new Date(record.created_at).getTime()) / (1000 * 60 * 60 * 24)
    if (daysOld > 30) {
      return NextResponse.json({ error: 'Skipped: post older than 30 days' }, { status: 400 })
    }
  }
  if ((record.engagement_score ?? 0) < 5 && record.source_type === 'post') {
    return NextResponse.json({ error: 'Skipped: low engagement' }, { status: 400 })
  }

  const userPrompt = `Reply to this Reddit ${record.source_type} from r/${meta?.subreddit}:

"${record.title ? record.title + '\n\n' : ''}${record.body || record.raw_text}"

Context: Pain point = ${record.primary_pain_point || 'unknown'}. Emotional intensity = ${record.emotional_intensity}. Buying signal = ${record.buying_signal}.

Generate 3 variants as JSON: { "short": "...", "medium": "...", "direct": "..." }`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  let variants: { short: string; medium: string; direct: string }

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    variants = JSON.parse(jsonMatch?.[0] || '{}')
  } catch {
    return NextResponse.json({ error: 'Failed to parse LLM response' }, { status: 500 })
  }

  // Validate all required variant keys are present
  if (!variants.short || !variants.medium || !variants.direct) {
    return NextResponse.json({ error: 'Failed to parse LLM response' }, { status: 500 })
  }

  // Save to DB
  const suggestions = [
    { content_id, variant: 1, reply_text: variants.short, tone: 'short' },
    { content_id, variant: 2, reply_text: variants.medium, tone: 'medium' },
    { content_id, variant: 3, reply_text: variants.direct, tone: 'direct' },
  ]
  await supabase.from('reply_suggestions').upsert(suggestions, { onConflict: 'content_id,variant' })

  return NextResponse.json({ variants, content_id })
}
