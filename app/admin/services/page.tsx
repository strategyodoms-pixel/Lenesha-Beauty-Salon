'use client'

import { useEffect, useState } from 'react'

type Service = {
  id: string
  name: string
  description: string
  price: number
  durationMinutes: number
  isActive: boolean
}

const EMPTY: Omit<Service, 'id' | 'isActive'> = { name: '', description: '', price: 0, durationMinutes: 60 }

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/services')
    // Admin needs all services including inactive
    const allRes = await fetch('/api/bookings?status=CONFIRMED', { method: 'GET' }).catch(() => null)
    setServices(await res.json())
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    if (editId) {
      await fetch(`/api/services/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY)
    load()
  }

  async function toggleActive(svc: Service) {
    await fetch(`/api/services/${svc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !svc.isActive }),
    })
    load()
  }

  async function deleteService(id: string) {
    if (!confirm('Delete this service? This cannot be undone.')) return
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(svc: Service) {
    setForm({ name: svc.name, description: svc.description, price: svc.price, durationMinutes: svc.durationMinutes })
    setEditId(svc.id)
    setShowForm(true)
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-4xl font-light text-text-dark">Services</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY) }} className="btn-primary text-sm">
          + Add Service
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-8">
          <h2 className="font-heading text-2xl font-light text-text-dark mb-6">{editId ? 'Edit Service' : 'New Service'}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Service Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Signature Blowout" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price ($)</label>
                <input type="number" className="input-field" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="label">Duration (min)</label>
                <input type="number" className="input-field" value={form.durationMinutes} onChange={(e) => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input-field resize-none" rows={3} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={save} disabled={saving || !form.name} className="btn-primary disabled:opacity-50">
              {saving ? 'Saving…' : editId ? 'Update Service' : 'Create Service'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {services.map((svc) => (
          <div key={svc.id} className="card p-6 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-body font-semibold text-text-dark">{svc.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-body ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {svc.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="font-body text-sm text-text-dark/60">{svc.description}</p>
              <p className="font-body text-sm text-cta font-semibold mt-1">${svc.price} · {svc.durationMinutes}min</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(svc)} className={`text-xs px-4 py-2 rounded-full border-2 font-body transition-colors ${svc.isActive ? 'border-gray-200 text-gray-500 hover:bg-gray-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                {svc.isActive ? 'Hide' : 'Show'}
              </button>
              <button onClick={() => startEdit(svc)} className="btn-outline text-xs px-4 py-2">Edit</button>
              <button onClick={() => deleteService(svc.id)} className="font-body text-xs px-4 py-2 rounded-full border-2 border-red-200 text-red-400 hover:bg-red-50 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
