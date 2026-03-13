'use client'

import { IntelRecord } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

const supabase = createClient()

interface LeadCardProps {
  record: IntelRecord
  onDismiss: (id: string) => void
  onWebhook: (record: IntelRecord) => void
}

export function LeadCard({ record, onDismiss, onWebhook }: LeadCardProps) {
  const [loading, setLoading] = useState(false)
  const subreddit = (record.source_metadata as Record<string, unknown>)?.subreddit as string | undefined

  async function dismiss() {
    setLoading(true)
    onDismiss(record.content_id)  // optimistic — remove card immediately
    await supabase.from('intel_records').update({ status: 'dismissed', is_dismissed: true }).eq('content_id', record.content_id)
    setLoading(false)
  }

  return (
    <div className="bg-[#1a1f2e] border border-[#2a2d3a] rounded-xl p-4 hover:border-[#7c86ff44] transition-colors">
      {/* Score badge + meta */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-amber-400">{record.lead_score}</div>
          <div className="text-xs text-slate-500">
            <div>{subreddit && `r/${subreddit}`}</div>
            <div>{record.created_at && new Date(record.created_at).toLocaleDateString('en-GB')}</div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {record.buying_signal !== 'none' && (
            <span className="bg-amber-500/20 text-amber-400 text-[9px] rounded px-1.5 py-0.5 font-medium">
              {record.buying_signal.replace(/_/g, ' ')}
            </span>
          )}
          {(record.emotional_intensity === 'high' || record.emotional_intensity === 'extreme') && (
            <span className="bg-red-500/20 text-red-400 text-[9px] rounded px-1.5 py-0.5 font-medium">
              {record.emotional_intensity.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-slate-300 text-sm leading-relaxed mb-3 line-clamp-3">
        {record.title || record.raw_text}
      </p>

      {/* Pain point + insight */}
      {record.primary_pain_point && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="bg-[#7c86ff22] text-[#7c86ff] border border-[#7c86ff44] rounded px-2 py-0.5 text-[9px]">
            {record.primary_pain_point.replace(/_/g, ' ')}
          </span>
        </div>
      )}

      {record.insight_summary && (
        <p className="text-slate-500 text-xs italic mb-3 line-clamp-2">{record.insight_summary}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-[#2a2d3a]">
        {record.source_url && (
          <a href={record.source_url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-[#7c86ff] hover:underline flex-1">
            View on Reddit →
          </a>
        )}
        <button
          onClick={() => onWebhook(record)}
          className="bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg px-3 py-1.5 transition-colors"
        >
          Send to n8n
        </button>
        <button
          onClick={dismiss}
          disabled={loading}
          className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1.5 transition-colors disabled:opacity-50"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
