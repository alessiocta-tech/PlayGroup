'use client'

import { useState } from 'react'

interface InboundMessage {
  id: string
  contactName: string
  message: string
  timestamp: string
  handledByAi: boolean
  escalated: boolean
}

interface SuggestedTask {
  priority: 'urgent' | 'high' | 'medium' | 'low'
  title: string
  description: string
  contact: string
  source: string // original message snippet
}

interface AnalysisResult {
  tasks: SuggestedTask[]
  summary: string
}

const PRIORITY_COLORS: Record<SuggestedTask['priority'], string> = {
  urgent: 'bg-red-100 text-red-700',
  high:   'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-gray-100 text-gray-600',
}

const PRIORITY_LABELS: Record<SuggestedTask['priority'], string> = {
  urgent: 'Urgente',
  high:   'Alta',
  medium: 'Media',
  low:    'Bassa',
}

export default function WhatsappTaskAnalysis({ messages }: { messages: InboundMessage[] }) {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/whatsapp/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }

      const data: AnalysisResult = await res.json()
      setResult(data)
      setExpanded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore analisi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#EFEFEA]/50 transition-colors"
        onClick={() => result && setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F0C040] rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#111111]">Analisi AI dei messaggi</div>
            <div className="text-xs text-gray-500">
              {result
                ? `${result.tasks.length} task suggerit${result.tasks.length === 1 ? 'o' : 'i'} da ${messages.length} messaggi`
                : `${messages.length} messaggi recenti disponibili`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); analyse() }}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-[#111111] text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analisi…
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {result ? 'Rianalizza' : 'Analizza'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-5 pb-4">
          <div className="bg-red-50 rounded-xl px-3 py-2 text-xs text-red-600">{error}</div>
        </div>
      )}

      {/* Results */}
      {result && expanded && (
        <div className="border-t border-[#EFEFEA] px-5 py-4 space-y-4">
          {/* Summary */}
          {result.summary && (
            <p className="text-xs text-gray-600 leading-relaxed bg-[#EFEFEA] rounded-xl px-3 py-2">
              {result.summary}
            </p>
          )}

          {/* Task list */}
          {result.tasks.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">
              Nessun task urgente identificato nei messaggi recenti.
            </p>
          ) : (
            <div className="space-y-3">
              {result.tasks.map((task, i) => (
                <div key={i} className="flex items-start gap-3 bg-[#EFEFEA] rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${PRIORITY_COLORS[task.priority]}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                      <span className="text-xs font-semibold text-[#111111]">{task.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-snug">{task.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-400 font-medium">
                        👤 {task.contact}
                      </span>
                      {task.source && (
                        <span className="text-[10px] text-gray-400 italic truncate max-w-[200px]">
                          "{task.source}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
