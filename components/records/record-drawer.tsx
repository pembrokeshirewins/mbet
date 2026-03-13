'use client'

import { IntelRecord } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

const INTENSITY_COLORS: Record<string, string> = {
  extreme: 'bg-red-500/20 text-red-400',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-amber-500/20 text-amber-400',
  low: 'bg-slate-500/20 text-slate-400',
}

const SIGNAL_COLORS: Record<string, string> = {
  ready_to_buy: 'bg-green-500/20 text-green-400',
  comparing: 'bg-amber-500/20 text-amber-400',
  churned: 'bg-purple-500/20 text-purple-400',
  researching: 'bg-blue-500/20 text-blue-400',
  passive: 'bg-slate-500/20 text-slate-400',
  none: 'bg-slate-800 text-slate-500',
}

interface RecordDrawerProps {
  record: IntelRecord | null
  onClose: () => void
  onStatusChange: (contentId: string, status: string) => void
}

export function RecordDrawer({ record, onClose, onStatusChange }: RecordDrawerProps) {
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  if (!record) return null

  const subreddit = (record.source_metadata as Record<string, unknown>)?.subreddit as string | undefined

  async function updateStatus(status: string) {
    if (!record) return
    setUpdating(true)
    onStatusChange(record.content_id, status)  // optimistic — update UI immediately
    await supabase.from('intel_records').update({ status }).eq('content_id', record.content_id)
    await supabase.from('operator_actions').insert({
      content_id: record.content_id,
      action_type: status,
    })
    setUpdating(false)
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div
        className="w-[420px] bg-[#1a1f2e] border-l border-[#2a2d3a] h-full overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2d3a] sticky top-0 bg-[#1a1f2e]">
          <div className="text-[#7c86ff] text-xs font-bold uppercase tracking-wider">Record Detail</div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Content */}
          <div>
            {record.title && (
              <h3 className="text-white font-medium text-sm mb-2 leading-snug">{record.title}</h3>
            )}
            <p className="text-slate-400 text-sm leading-relaxed line-clamp-6">{record.body || record.raw_text}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              {subreddit && <span>r/{subreddit}</span>}
              {record.author && <span>· u/{record.author}</span>}
              {record.created_at && <span>· {new Date(record.created_at).toLocaleDateString('en-GB')}</span>}
              {record.engagement_score > 0 && <span>· ↑ {record.engagement_score}</span>}
            </div>
            {record.source_url && (
              <a href={record.source_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#7c86ff] hover:underline mt-1 inline-block">
                View on Reddit →
              </a>
            )}
          </div>

          {/* Scores */}
          <div className="flex gap-2">
            <div className="flex-1 bg-[#0f1117] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{record.lead_score}</div>
              <div className="text-xs text-slate-500 mt-0.5">Lead Score</div>
            </div>
            <div className="flex-1 bg-[#0f1117] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-slate-300">{Math.round(record.confidence_score * 100)}%</div>
              <div className="text-xs text-slate-500 mt-0.5">Confidence</div>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Classification</div>
            <div className="flex flex-wrap gap-1.5">
              {record.primary_pain_point && (
                <span className="bg-[#7c86ff22] text-[#7c86ff] border border-[#7c86ff44] rounded px-2 py-0.5 text-xs">
                  {record.primary_pain_point.replace(/_/g, ' ')}
                </span>
              )}
              <span className={`rounded px-2 py-0.5 text-xs ${SIGNAL_COLORS[record.buying_signal] || 'bg-slate-800 text-slate-400'}`}>
                {record.buying_signal.replace(/_/g, ' ')}
              </span>
              <span className={`rounded px-2 py-0.5 text-xs ${INTENSITY_COLORS[record.emotional_intensity] || ''}`}>
                {record.emotional_intensity.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Insight */}
          {record.insight_summary && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Insight</div>
              <p className="text-slate-300 text-sm leading-relaxed bg-[#0f1117] rounded-lg p-3">{record.insight_summary}</p>
            </div>
          )}

          {/* Copy snippet */}
          {record.copy_snippet_candidate && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Copy Snippet</div>
              <blockquote className="border-l-2 border-[#f59e0b] pl-3 text-slate-300 text-sm italic">
                &ldquo;{record.copy_snippet_candidate}&rdquo;
              </blockquote>
            </div>
          )}

          {/* Competitors */}
          {record.competitor_mentioned && record.competitor_mentioned.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Competitors Mentioned</div>
              <div className="flex flex-wrap gap-1.5">
                {record.competitor_mentioned.map(c => (
                  <span key={c} className="bg-red-500/10 text-red-400 border border-red-500/30 rounded px-2 py-0.5 text-xs">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2 border-t border-[#2a2d3a]">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateStatus('reviewed')}
                disabled={updating}
                className="bg-[#1a1f2e] hover:bg-[#2a2d3a] border border-[#2a2d3a] text-slate-300 text-xs rounded-lg py-2 transition-colors disabled:opacity-50"
              >
                Mark Reviewed
              </button>
              <button
                onClick={() => updateStatus('saved')}
                disabled={updating}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs rounded-lg py-2 transition-colors disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => updateStatus('dismissed')}
                disabled={updating}
                className="bg-[#1a1f2e] hover:bg-[#2a2d3a] border border-[#2a2d3a] text-slate-500 text-xs rounded-lg py-2 transition-colors disabled:opacity-50"
              >
                Dismiss
              </button>
              {record.source_platform === 'reddit' && (
                <button
                  onClick={() => window.location.href = `/replies?id=${record.content_id}`}
                  className="bg-[#7c86ff22] hover:bg-[#7c86ff33] border border-[#7c86ff44] text-[#7c86ff] text-xs rounded-lg py-2 transition-colors"
                >
                  Generate Reply
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
