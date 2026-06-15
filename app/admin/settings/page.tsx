'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import DepositToggle from '@/components/DepositToggle'

type Settings = {
  id: string
  requireDeposit: boolean
  depositAmount: number
  depositType: string
  expressUpcharge: number
  expressUpchargeType: string
  googleRefreshToken: string | null
  googleSheetsId: string | null
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const calendarStatus = searchParams.get('calendar')

  const [settings, setSettings] = useState<Settings | null>(null)
  const [depositAmount, setDepositAmount] = useState(25)
  const [depositType, setDepositType] = useState('FLAT')
  const [expressUpcharge, setExpressUpcharge] = useState(20)
  const [expressUpchargeType, setExpressUpchargeType] = useState('FLAT')
  const [sheetsId, setSheetsId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then((s: Settings) => {
      setSettings(s)
      setDepositAmount(s?.depositAmount ?? 25)
      setDepositType(s?.depositType ?? 'FLAT')
      setExpressUpcharge(s?.expressUpcharge ?? 20)
      setExpressUpchargeType(s?.expressUpchargeType ?? 'FLAT')
      setSheetsId(s?.googleSheetsId ?? '')
    })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositAmount, depositType, expressUpcharge, expressUpchargeType, googleSheetsId: sheetsId || null }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!settings) return <div className="text-center py-20 font-body text-text-dark/40">Loading…</div>

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-heading text-4xl font-light text-text-dark mb-2">Settings</h1>
        <p className="font-body text-text-dark/50 text-sm">Manage deposit requirements, express upcharge, and integrations.</p>
      </div>

      {/* Deposit toggle */}
      <div>
        <h2 className="font-heading text-2xl font-light text-text-dark mb-4">Deposit Settings</h2>
        <DepositToggle
          initialValue={settings.requireDeposit}
          depositAmount={depositAmount}
          depositType={depositType}
        />
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="label">Deposit Amount</label>
            <input type="number" className="input-field" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Deposit Type</label>
            <select className="input-field" value={depositType} onChange={(e) => setDepositType(e.target.value)}>
              <option value="FLAT">Flat ($)</option>
              <option value="PERCENT">Percentage (%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Express upcharge */}
      <div>
        <h2 className="font-heading text-2xl font-light text-text-dark mb-4">Express Booking Upcharge</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Upcharge Amount</label>
            <input type="number" className="input-field" value={expressUpcharge} onChange={(e) => setExpressUpcharge(Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Upcharge Type</label>
            <select className="input-field" value={expressUpchargeType} onChange={(e) => setExpressUpchargeType(e.target.value)}>
              <option value="FLAT">Flat ($)</option>
              <option value="PERCENT">Percentage (%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Google Calendar */}
      <div>
        <h2 className="font-heading text-2xl font-light text-text-dark mb-4">Google Calendar</h2>
        {calendarStatus === 'connected' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl font-body text-sm text-green-700">
            ✓ Google Calendar connected successfully
          </div>
        )}
        {calendarStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl font-body text-sm text-red-600">
            Connection failed. Please try again.
          </div>
        )}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body font-semibold text-text-dark">Calendar Sync</p>
              <p className="font-body text-sm text-text-dark/60 mt-1">
                {settings.googleRefreshToken ? '✓ Connected — bookings sync automatically' : 'Not connected'}
              </p>
            </div>
            <a
              href="/api/calendar/connect"
              className="btn-primary text-sm"
            >
              {settings.googleRefreshToken ? 'Reconnect' : 'Connect Google Calendar'}
            </a>
          </div>
        </div>
      </div>

      {/* Google Sheets */}
      <div>
        <h2 className="font-heading text-2xl font-light text-text-dark mb-4">Google Sheets Sync</h2>
        <div className="card p-6 space-y-4">
          <p className="font-body text-sm text-text-dark/60">
            Paste your Google Sheet ID below. Every confirmed booking will automatically be appended as a row.
            The Sheet ID is the long string in your Google Sheet URL between <code>/d/</code> and <code>/edit</code>.
          </p>
          <div>
            <label className="label">Google Sheet ID</label>
            <input
              type="text"
              className="input-field font-mono"
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              value={sheetsId}
              onChange={(e) => setSheetsId(e.target.value)}
            />
          </div>
          <p className="font-body text-xs text-text-dark/40">
            Columns appended: Date Booked, Client Name, Email, Phone, Service, Appointment Date, Appointment Time, Express, Deposit Paid, Discount Code, Notes
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <p className="font-body text-sm text-green-600">✓ Settings saved</p>}
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="font-body text-text-dark/40 py-20 text-center">Loading…</div>}>
      <SettingsContent />
    </Suspense>
  )
}
