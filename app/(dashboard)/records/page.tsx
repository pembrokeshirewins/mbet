import { createClient } from '@/lib/supabase/server'
import { RecordsTable } from '@/components/records/records-table'
import type { IntelRecord } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RecordsPage() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('intel_records')
    .select('*')
    .order('lead_score', { ascending: false })
    .limit(2000)

  if (error) {
    return <div className="p-8 text-red-400">Error loading records: {error.message}</div>
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-[#2a2d3a]">
        <h1 className="text-white font-semibold text-lg">Record Explorer</h1>
        <p className="text-slate-500 text-sm mt-0.5">{data?.length ?? 0} records loaded</p>
      </div>
      <RecordsTable initialRecords={(data ?? []) as IntelRecord[]} />
    </div>
  )
}
