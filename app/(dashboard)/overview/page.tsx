import { createClient } from '@/lib/supabase/server'
import { StatsGrid } from '@/components/overview/stats-grid'
import { PainPointChart } from '@/components/overview/pain-point-chart'

export const dynamic = 'force-dynamic'

export default async function OverviewPage() {
  const supabase = createClient()

  const [
    { count: totalRecords },
    { count: enrichedRecords },
    { count: newLeads },
    { count: quoteCount },
    { data: painPointData },
    { data: avgScoreData },
  ] = await Promise.all([
    supabase.from('intel_records').select('*', { count: 'exact', head: true }),
    supabase.from('intel_records').select('*', { count: 'exact', head: true }).eq('enrichment_status', 'success'),
    supabase.from('intel_records').select('*', { count: 'exact', head: true }).gte('lead_score', 65).eq('status', 'new'),
    supabase.from('intel_records').select('*', { count: 'exact', head: true }).eq('quote_candidate', true),
    supabase.rpc('get_pain_point_counts'),
    supabase.from('intel_records').select('lead_score').gte('lead_score', 1),
  ])

  const avgLeadScore = avgScoreData && avgScoreData.length > 0
    ? Math.round(avgScoreData.reduce((sum, r) => sum + (r.lead_score || 0), 0) / avgScoreData.length)
    : 0

  const topPainPoint = painPointData?.[0]?.pain_point || 'none yet'

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-white font-semibold text-lg">Overview</h1>
        <p className="text-slate-500 text-sm mt-0.5">Market intelligence summary</p>
      </div>

      <StatsGrid
        totalRecords={totalRecords ?? 0}
        enrichedRecords={enrichedRecords ?? 0}
        newLeads={newLeads ?? 0}
        topPainPoint={topPainPoint}
        avgLeadScore={avgLeadScore}
        quoteCount={quoteCount ?? 0}
      />

      {painPointData && painPointData.length > 0 && (
        <div className="bg-[#1a1f2e] border border-[#2a2d3a] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4">Pain Points by Frequency</h2>
          <PainPointChart data={painPointData} />
        </div>
      )}
    </div>
  )
}
