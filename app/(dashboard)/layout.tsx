import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch badge counts
  const [{ count: newLeads }, { count: newRecords }] = await Promise.all([
    supabase.from('intel_records').select('*', { count: 'exact', head: true })
      .eq('status', 'new').gte('lead_score', 65),
    supabase.from('intel_records').select('*', { count: 'exact', head: true })
      .eq('status', 'new'),
  ])

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar newLeadsCount={newLeads ?? 0} newRecordsCount={newRecords ?? 0} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
