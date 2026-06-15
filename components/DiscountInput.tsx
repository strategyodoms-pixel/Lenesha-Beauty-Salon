'use client'

import { useState } from 'react'

type Props = {
  serviceId: string
  onApply: (code: string, discountAmount: number) => void
  onRemove: () => void
  appliedCode?: string
}

export default function DiscountInput({ serviceId, onApply, onRemove, appliedCode }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isValid, setIsValid] = useState<boolean | null>(null)

  async function handleApply() {
    if (!code.trim()) return
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch(
        `/api/discounts/validate?code=${encodeURIComponent(code)}&serviceId=${serviceId}`
      )
      const data = await res.json()

      setIsValid(data.valid)
      setMessage(data.message)

      if (data.valid) {
        onApply(code.toUpperCase(), data.discountAmount)
      }
    } catch {
      setIsValid(false)
      setMessage('Unable to validate code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <span className="font-body text-sm text-green-700">
          ✓ Code <strong>{appliedCode}</strong> applied
        </span>
        <button
          type="button"
          onClick={() => { onRemove(); setCode(''); setIsValid(null); setMessage('') }}
          className="font-body text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="label">Discount Code (optional)</label>
      <div className="flex gap-2">
        <input
          type="text"
          className="input-field flex-1"
          placeholder="WELCOME10"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setIsValid(null); setMessage('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="btn-primary text-sm px-6 disabled:opacity-50"
        >
          {loading ? '…' : 'Apply'}
        </button>
      </div>
      {message && (
        <p className={`font-body text-xs ${isValid ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
