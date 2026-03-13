interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  highlight?: boolean
}

function StatCard({ label, value, sub, highlight }: StatCardProps) {
  return (
    <div className="bg-[#1a1f2e] border border-[#2a2d3a] rounded-xl p-4">
      <div className="text-slate-500 text-xs uppercase tracking-wide mb-2">{label}</div>
      <div className={`text-3xl font-bold ${highlight ? 'text-amber-400' : 'text-white'}`}>{value}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

interface StatsGridProps {
  totalRecords: number
  enrichedRecords: number
  newLeads: number
  topPainPoint: string
  avgLeadScore: number
  quoteCount: number
}

export function StatsGrid({ totalRecords, enrichedRecords, newLeads, topPainPoint, avgLeadScore, quoteCount }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard label="Total Records" value={totalRecords.toLocaleString()} sub="Reddit posts + comments" />
      <StatCard label="Enriched" value={enrichedRecords.toLocaleString()} sub={`${totalRecords > 0 ? Math.round(enrichedRecords / totalRecords * 100) : 0}% of total`} />
      <StatCard label="New Leads" value={newLeads} sub="Score ≥ 65, unreviewed" highlight />
      <StatCard label="Top Pain Point" value={topPainPoint.replace(/_/g, ' ')} />
      <StatCard label="Avg Lead Score" value={avgLeadScore} sub="Enriched records only" />
      <StatCard label="Quote Candidates" value={quoteCount} sub="For marketing copy" />
    </div>
  )
}
