'use client'

import { FilterState } from '@/lib/types'

const PAIN_POINTS = [
  'all', 'workflow_friction', 'time_drain', 'competitor_dissatisfaction',
  'poor_mobile_ux', 'pricing_resistance', 'churn_trigger', 'poor_roi_visibility',
  'manual_effort_fatigue', 'poor_automation',
]

const BUYING_SIGNALS = ['all', 'ready_to_buy', 'comparing', 'churned', 'researching', 'passive', 'none']
const INTENSITIES = ['all', 'extreme', 'high', 'medium', 'low']
const STATUSES = ['all', 'new', 'reviewed', 'saved', 'dismissed', 'replied']

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  totalCount: number
}

export function FilterBar({ filters, onFilterChange, totalCount }: FilterBarProps) {
  function update(key: keyof FilterState, value: string | number) {
    onFilterChange({ ...filters, [key]: value })
  }

  function reset() {
    onFilterChange({ search: '', pain_point: 'all', buying_signal: 'all', emotional_intensity: 'all', status: 'all', min_lead_score: 0, subreddit: '' })
  }

  const hasActiveFilters = filters.pain_point !== 'all' || filters.buying_signal !== 'all' ||
    filters.emotional_intensity !== 'all' || filters.status !== 'all' || filters.search || filters.min_lead_score > 0

  return (
    <div className="bg-[#1a1f2e] border-b border-[#2a2d3a] px-4 py-2.5 flex items-center gap-2 flex-wrap">
      <span className="text-slate-500 text-xs uppercase tracking-wide mr-1">Filters:</span>

      {/* Search */}
      <input
        type="text"
        placeholder="Search text..."
        value={filters.search}
        onChange={e => update('search', e.target.value)}
        className="bg-[#0f1117] border border-[#2a2d3a] rounded-full px-3 py-1 text-xs text-slate-300 focus:outline-none focus:border-[#7c86ff] w-40 transition-colors"
      />

      {/* Pain point filter */}
      <select
        value={filters.pain_point}
        onChange={e => update('pain_point', e.target.value)}
        className="bg-[#0f1117] border border-[#2a2d3a] rounded-full px-3 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
      >
        {PAIN_POINTS.map(p => (
          <option key={p} value={p}>{p === 'all' ? 'Pain point: all' : p.replace(/_/g, ' ')}</option>
        ))}
      </select>

      {/* Buying signal */}
      <select
        value={filters.buying_signal}
        onChange={e => update('buying_signal', e.target.value)}
        className="bg-[#0f1117] border border-[#2a2d3a] rounded-full px-3 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
      >
        {BUYING_SIGNALS.map(s => (
          <option key={s} value={s}>{s === 'all' ? 'Intent: all' : s.replace(/_/g, ' ')}</option>
        ))}
      </select>

      {/* Intensity */}
      <select
        value={filters.emotional_intensity}
        onChange={e => update('emotional_intensity', e.target.value)}
        className="bg-[#0f1117] border border-[#2a2d3a] rounded-full px-3 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
      >
        {INTENSITIES.map(i => (
          <option key={i} value={i}>{i === 'all' ? 'Intensity: all' : i}</option>
        ))}
      </select>

      {/* Status */}
      <select
        value={filters.status}
        onChange={e => update('status', e.target.value)}
        className="bg-[#0f1117] border border-[#2a2d3a] rounded-full px-3 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{s === 'all' ? 'Status: all' : s}</option>
        ))}
      </select>

      {/* Min lead score */}
      <label className="flex items-center gap-1.5 text-xs text-slate-400">
        <span>Lead ≥</span>
        <input
          type="number"
          min={0}
          max={100}
          value={filters.min_lead_score}
          onChange={e => update('min_lead_score', parseInt(e.target.value) || 0)}
          className="bg-[#0f1117] border border-[#2a2d3a] rounded px-2 py-1 text-xs text-slate-300 w-14 focus:outline-none"
        />
      </label>

      {hasActiveFilters && (
        <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300 ml-1">
          Clear all
        </button>
      )}

      <span className="ml-auto text-slate-500 text-xs">{totalCount.toLocaleString()} records</span>
    </div>
  )
}
