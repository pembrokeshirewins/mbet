'use client'

import { useState } from 'react'

export default function RepliesPage() {
  const [contentId, setContentId] = useState('')
  const [variants, setVariants] = useState<{ short: string; medium: string; direct: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    setVariants(null)
    const res = await fetch('/api/replies/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_id: contentId }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error || 'Generation failed')
    else setVariants(data.variants)
    setLoading(false)
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-white font-semibold text-lg">Reply Generator</h1>
        <p className="text-slate-500 text-sm mt-0.5">Generate 3 reply variants for a Reddit record. Open from a Lead card or paste a content_id.</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="content_id (24 chars)"
          value={contentId}
          onChange={e => setContentId(e.target.value)}
          className="flex-1 bg-[#1a1f2e] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#7c86ff]"
        />
        <button
          onClick={generate}
          disabled={loading || !contentId}
          className="bg-[#7c86ff] hover:bg-[#6b75ee] disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">{error}</div>
      )}

      {variants && (
        <div className="space-y-4">
          {Object.entries(variants).map(([tone, text]) => (
            <div key={tone} className="bg-[#1a1f2e] border border-[#2a2d3a] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#7c86ff] text-xs font-bold uppercase tracking-wide">{tone}</span>
                <button
                  onClick={() => copy(text, tone)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {copied === tone ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
