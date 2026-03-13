'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeadCard } from '@/components/leads/lead-card'
import type { IntelRecord } from '@/lib/types'

const THRESHOLD = 65

export default function LeadsPage() {
  const [leads, setLeads] = useState<IntelRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('intel_records')
      .select('*')
      .gte('lead_score', THRESHOLD)
      .eq('status', 'new')
      .eq('is_dismissed', false)
      .order('lead_score', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setLeads((data ?? []) as IntelRecord[])
        setLoading(false)
      })
  }, [])

  function handleDismiss(id: string) {
    setLeads(prev => prev.filter(r => r.content_id !== id))
  }

  async function handleWebhook(record: IntelRecord) {
    const res = await fetch('/api/webhooks/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_id: record.content_id }),
    })
    if (res.ok) {
      setLeads(prev => prev.map(r =>
        r.content_id === record.content_id ? { ...r, status: 'webhook_sent' } : r
      ))
    }
  }

  if (loading) return <div className="p-8 text-slate-400">Loading leads...</div>

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-white font-semibold text-lg">Lead Queue</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {leads.length} records with lead score ≥ {THRESHOLD}, status = new
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🎯</div>
          <div>No new leads above threshold. Run the pipeline to collect more records.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {leads.map(lead => (
            <LeadCard
              key={lead.content_id}
              record={lead}
              onDismiss={handleDismiss}
              onWebhook={handleWebhook}
            />
          ))}
        </div>
      )}
    </div>
  )
}
