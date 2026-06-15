'use client'

import { useEffect, useState } from 'react'

type Testimonial = {
  id: string
  clientFirstName: string
  serviceReceived: string
  rating: number
  quote: string
  isVisible: boolean
  createdAt: string
}

const EMPTY = { clientFirstName: '', serviceReceived: '', rating: 5, quote: '', isVisible: true }

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/testimonials')
    setTestimonials(await res.json())
  }

  useEffect(() => { load() }, [])

  async function create() {
    setSaving(true)
    await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowForm(false)
    setForm(EMPTY)
    load()
  }

  async function toggleVisible(t: Testimonial) {
    await fetch(`/api/testimonials/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !t.isVisible }),
    })
    load()
  }

  async function deleteTestimonial(id: string) {
    if (!confirm('Delete this testimonial?')) return
    await fetch(`/api/testimonials/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-4xl font-light text-text-dark">Testimonials</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm">+ Add Testimonial</button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="font-heading text-2xl font-light mb-6">New Testimonial</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Client First Name</label>
              <input className="input-field" value={form.clientFirstName} onChange={(e) => setForm(f => ({ ...f, clientFirstName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Service Received</label>
              <input className="input-field" value={form.serviceReceived} onChange={(e) => setForm(f => ({ ...f, serviceReceived: e.target.value }))} />
            </div>
            <div>
              <label className="label">Star Rating (1–5)</label>
              <input type="number" min="1" max="5" className="input-field" value={form.rating} onChange={(e) => setForm(f => ({ ...f, rating: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="label">Visible on site?</label>
              <select className="input-field" value={form.isVisible ? 'true' : 'false'} onChange={(e) => setForm(f => ({ ...f, isVisible: e.target.value === 'true' }))}>
                <option value="true">Yes — show publicly</option>
                <option value="false">No — hidden</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Quote</label>
              <textarea className="input-field resize-none" rows={4} value={form.quote} onChange={(e) => setForm(f => ({ ...f, quote: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={create} disabled={saving || !form.clientFirstName || !form.quote} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving…' : 'Add Testimonial'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-body font-semibold text-text-dark">{t.clientFirstName}</h3>
                  <span className="font-body text-xs text-text-dark/50">{t.serviceReceived}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={s <= t.rating ? 'text-cta' : 'text-secondary'}>★</span>
                    ))}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-body ${t.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="font-body text-sm text-text-dark/70 italic">"{t.quote}"</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleVisible(t)} className={`text-xs px-3 py-1.5 rounded-full border-2 font-body transition-colors ${t.isVisible ? 'border-gray-200 text-gray-500 hover:bg-gray-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                  {t.isVisible ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => deleteTestimonial(t.id)} className="font-body text-xs px-3 py-1.5 rounded-full border-2 border-red-200 text-red-400 hover:bg-red-50 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
