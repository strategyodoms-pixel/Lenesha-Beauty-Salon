'use client'

import { useState } from 'react'

type Props = {
  initialValue: boolean
  depositAmount: number
  depositType: string
  onToggle?: (value: boolean) => void
}

export default function DepositToggle({ initialValue, depositAmount, depositType, onToggle }: Props) {
  const [enabled, setEnabled] = useState(initialValue)
  const [saving, setSaving] = useState(false)

  async function toggle() {
    const newValue = !enabled
    setSaving(true)

    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requireDeposit: newValue }),
      })
      setEnabled(newValue)
      onToggle?.(newValue)
    } catch {
      // revert on error
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-secondary/30">
      <div>
        <h3 className="font-body font-semibold text-text-dark">Require Deposit</h3>
        <p className="font-body text-sm text-text-dark/60 mt-1">
          {enabled
            ? `Clients must pay a ${depositType === 'PERCENT' ? `${depositAmount}%` : `$${depositAmount}`} deposit when booking`
            : 'Clients book for free and pay in full at appointment'}
        </p>
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
          enabled ? 'bg-cta' : 'bg-secondary'
        }`}
        aria-label={enabled ? 'Disable deposit requirement' : 'Enable deposit requirement'}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
