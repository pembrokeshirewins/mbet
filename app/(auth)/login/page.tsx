'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Intelligence Engine</h1>
        <p className="text-slate-400 text-sm">Private access only</p>
      </div>
      <form onSubmit={handleLogin} className="bg-[#1a1f2e] border border-[#2a2d3a] rounded-xl p-6 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#7c86ff] transition-colors"
          />
        </div>
        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#7c86ff] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7c86ff] hover:bg-[#6b75ee] disabled:opacity-50 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
