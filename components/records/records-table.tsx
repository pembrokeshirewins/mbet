'use client'

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import { IntelRecord, FilterState } from '@/lib/types'
import { RecordDrawer } from './record-drawer'
import { FilterBar } from './filter-bar'

const columnHelper = createColumnHelper<IntelRecord>()

const INTENSITY_DOT: Record<string, string> = {
  extreme: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-amber-400/60',
  low: 'bg-slate-600',
}

const STATUS_CHIP: Record<string, string> = {
  new: 'bg-emerald-900 text-emerald-400',
  reviewed: 'bg-[#1a1f2e] text-slate-400',
  saved: 'bg-amber-900/50 text-amber-400',
  dismissed: 'bg-[#1a1f2e] text-slate-600',
  replied: 'bg-blue-900/50 text-blue-400',
}

const SIGNAL_COLORS: Record<string, string> = {
  ready_to_buy: 'text-green-400',
  comparing: 'text-amber-400',
  churned: 'text-purple-400',
  researching: 'text-blue-400',
  passive: 'text-slate-400',
  none: 'text-slate-600',
}

interface RecordsTableProps {
  initialRecords: IntelRecord[]
}

export function RecordsTable({ initialRecords }: RecordsTableProps) {
  const [records, setRecords] = useState<IntelRecord[]>(initialRecords)
  const [selectedRecord, setSelectedRecord] = useState<IntelRecord | null>(null)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'lead_score', desc: true }])
  const [filters, setFilters] = useState<FilterState>({
    search: '', pain_point: 'all', buying_signal: 'all',
    emotional_intensity: 'all', status: 'all', min_lead_score: 0, subreddit: '',
  })

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (filters.search && !r.raw_text?.toLowerCase().includes(filters.search.toLowerCase()) &&
          !r.title?.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.pain_point !== 'all' && r.primary_pain_point !== filters.pain_point) return false
      if (filters.buying_signal !== 'all' && r.buying_signal !== filters.buying_signal) return false
      if (filters.emotional_intensity !== 'all' && r.emotional_intensity !== filters.emotional_intensity) return false
      if (filters.status !== 'all' && r.status !== filters.status) return false
      if (r.lead_score < filters.min_lead_score) return false
      if (r.is_dismissed && filters.status !== 'dismissed') return false
      return true
    })
  }, [records, filters])

  const columns = useMemo(() => [
    columnHelper.accessor('emotional_intensity', {
      id: 'dot',
      header: '',
      size: 28,
      cell: info => (
        <div className={`w-2 h-2 rounded-full ${INTENSITY_DOT[info.getValue()] ?? 'bg-slate-600'}`} />
      ),
    }),
    columnHelper.accessor(row => row.title || row.raw_text, {
      id: 'content',
      header: 'Post / Comment',
      cell: info => {
        const row = info.row.original
        const subreddit = (row.source_metadata as Record<string, unknown>)?.subreddit as string | undefined
        return (
          <div>
            <div className="text-slate-200 text-xs truncate max-w-[280px]">{info.getValue()}</div>
            <div className="text-slate-500 text-[10px] mt-0.5">
              {subreddit && `r/${subreddit} · `}
              {row.created_at && new Date(row.created_at).toLocaleDateString('en-GB')}
              {row.engagement_score > 0 && ` · ↑ ${row.engagement_score}`}
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('primary_pain_point', {
      header: 'Pain Point',
      size: 120,
      cell: info => info.getValue() ? (
        <span className="bg-[#7c86ff22] text-[#7c86ff] rounded px-1.5 py-0.5 text-[9px] whitespace-nowrap">
          {info.getValue()?.replace(/_/g, ' ')}
        </span>
      ) : <span className="text-slate-600 text-[10px]">—</span>,
    }),
    columnHelper.accessor('buying_signal', {
      header: 'Intent',
      size: 100,
      cell: info => (
        <span className={`text-[10px] ${SIGNAL_COLORS[info.getValue()] ?? 'text-slate-500'}`}>
          {info.getValue()?.replace(/_/g, ' ')}
        </span>
      ),
    }),
    columnHelper.accessor('emotional_intensity', {
      id: 'intensity_col',
      header: 'Intensity',
      size: 80,
      cell: info => (
        <span className="text-[10px] text-slate-400 uppercase">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('lead_score', {
      header: 'Lead',
      size: 60,
      cell: info => (
        <span className={`font-bold text-xs ${info.getValue() >= 65 ? 'text-amber-400' : 'text-slate-400'}`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      size: 70,
      cell: info => (
        <span className={`rounded px-1.5 py-0.5 text-[9px] ${STATUS_CHIP[info.getValue()] ?? 'bg-slate-800 text-slate-400'}`}>
          {info.getValue()}
        </span>
      ),
    }),
  ], [])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  })

  function handleStatusChange(contentId: string, status: string) {
    setRecords(prev => prev.map(r => r.content_id === contentId ? { ...r, status } : r))
    if (selectedRecord?.content_id === contentId) {
      setSelectedRecord(prev => prev ? { ...prev, status } : null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar filters={filters} onFilterChange={setFilters} totalCount={filtered.length} />

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[#0f1117] z-10">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b border-[#2a2d3a]">
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="px-3 py-2 text-left text-slate-500 text-[10px] font-semibold uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                onClick={() => setSelectedRecord(row.original)}
                className={`border-b border-[#1a1f2e] cursor-pointer transition-colors hover:bg-[#1a1f2e] ${
                  row.original.is_dismissed ? 'opacity-40' : ''
                } ${selectedRecord?.content_id === row.original.content_id ? 'bg-[#1a1f2e88]' : ''}`}
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-2.5 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-sm">
            No records match your filters
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="border-t border-[#2a2d3a] px-4 py-2.5 flex items-center justify-between bg-[#0f1117]">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 px-2 py-1"
        >
          ← prev
        </button>
        <span className="text-xs text-slate-500">
          page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 px-2 py-1"
        >
          next →
        </button>
      </div>

      {selectedRecord && (
        <RecordDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
