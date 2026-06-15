'use client'

import { useReducer, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import PhotoUploader from '@/components/PhotoUploader'
import DiscountInput from '@/components/DiscountInput'

type Service = {
  id: string
  name: string
  description: string
  price: number
  durationMinutes: number
  isAddon: boolean
}

type BookingState = {
  step: number
  serviceId: string
  serviceName: string
  servicePrice: number
  addonIds: string[]
  addonNames: string[]
  addonTotal: number
  date: string
  timeSlot: string
  inspirationUrls: string[]
  clientName: string
  clientEmail: string
  clientPhone: string
  notes: string
  discountCode: string
  discountAmount: number
  isExpress: boolean
}

type Action =
  | { type: 'SET_SERVICE'; id: string; name: string; price: number }
  | { type: 'TOGGLE_ADDON'; id: string; name: string; price: number }
  | { type: 'SET_DATETIME'; date: string; timeSlot: string }
  | { type: 'SET_PHOTOS'; urls: string[] }
  | { type: 'SET_CONTACT'; name: string; email: string; phone: string; notes: string }
  | { type: 'SET_DISCOUNT'; code: string; amount: number }
  | { type: 'REMOVE_DISCOUNT' }
  | { type: 'NEXT' }
  | { type: 'BACK' }

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case 'SET_SERVICE':
      return { ...state, serviceId: action.id, serviceName: action.name, servicePrice: action.price, addonIds: [], addonNames: [], addonTotal: 0 }
    case 'TOGGLE_ADDON': {
      const selected = state.addonIds.includes(action.id)
      if (selected) {
        return {
          ...state,
          addonIds: state.addonIds.filter(id => id !== action.id),
          addonNames: state.addonNames.filter(n => n !== action.name),
          addonTotal: state.addonTotal - action.price,
        }
      }
      return {
        ...state,
        addonIds: [...state.addonIds, action.id],
        addonNames: [...state.addonNames, action.name],
        addonTotal: state.addonTotal + action.price,
      }
    }
    case 'SET_DATETIME':
      return { ...state, date: action.date, timeSlot: action.timeSlot }
    case 'SET_PHOTOS':
      return { ...state, inspirationUrls: action.urls }
    case 'SET_CONTACT':
      return { ...state, clientName: action.name, clientEmail: action.email, clientPhone: action.phone, notes: action.notes }
    case 'SET_DISCOUNT':
      return { ...state, discountCode: action.code, discountAmount: action.amount }
    case 'REMOVE_DISCOUNT':
      return { ...state, discountCode: '', discountAmount: 0 }
    case 'NEXT':
      return { ...state, step: Math.min(state.step + 1, 6) }
    case 'BACK':
      return { ...state, step: Math.max(state.step - 1, 1) }
    default:
      return state
  }
}

const STEP_LABELS = ['Service', 'Date & Time', 'Photos', 'Contact', 'Review', 'Payment']

function formatTime(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function BookingForm({ isExpress = false }: { isExpress?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedService = searchParams.get('service')

  const [state, dispatch] = useReducer(reducer, {
    step: 1,
    serviceId: '',
    serviceName: '',
    servicePrice: 0,
    addonIds: [],
    addonNames: [],
    addonTotal: 0,
    date: '',
    timeSlot: '',
    inspirationUrls: [],
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
    discountCode: '',
    discountAmount: 0,
    isExpress,
  })

  const [services, setServices] = useState<Service[]>([])
  const [settings, setSettings] = useState<{ requireDeposit: boolean; depositAmount: number; depositType: string; expressUpcharge: number; expressUpchargeType: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Contact form local state
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', notes: '' })

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices)
    fetch('/api/admin/settings').then(r => r.json()).then(setSettings).catch(() => {})
  }, [])

  useEffect(() => {
    if (preselectedService && services.length > 0) {
      const svc = services.find(s => s.id === preselectedService)
      if (svc) {
        dispatch({ type: 'SET_SERVICE', id: svc.id, name: svc.name, price: svc.price })
        dispatch({ type: 'NEXT' })
      }
    }
  }, [preselectedService, services])

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: state.serviceId,
          addonServiceIds: state.addonIds,
          clientName: state.clientName,
          clientEmail: state.clientEmail,
          clientPhone: state.clientPhone,
          date: state.date,
          timeSlot: state.timeSlot,
          inspirationPhotoUrls: state.inspirationUrls,
          notes: state.notes,
          discountCode: state.discountCode || undefined,
          isExpress: state.isExpress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      if (data.stripeUrl) {
        window.location.href = data.stripeUrl
      } else {
        router.push(`/book/success?bookingId=${data.bookingId}`)
      }
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  const expressUpcharge = settings && isExpress
    ? settings.expressUpchargeType === 'PERCENT'
      ? (state.servicePrice * settings.expressUpcharge) / 100
      : settings.expressUpcharge
    : 0

  const total = state.servicePrice + state.addonTotal + expressUpcharge - state.discountAmount
  const depositAmount = settings
    ? settings.depositType === 'PERCENT'
      ? (total * settings.depositAmount) / 100
      : settings.depositAmount
    : 25

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          {STEP_LABELS.map((label, idx) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold font-body transition-all duration-300 ${
                idx + 1 < state.step ? 'bg-cta text-white' :
                idx + 1 === state.step ? 'bg-cta text-white ring-4 ring-cta/20' :
                'bg-secondary text-text-dark/40'
              }`}>
                {idx + 1 < state.step ? '✓' : idx + 1}
              </div>
              <span className={`font-body text-xs hidden sm:block ${idx + 1 === state.step ? 'text-cta font-semibold' : 'text-text-dark/40'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-secondary rounded-full">
          <div
            className="h-full bg-cta rounded-full transition-all duration-500"
            style={{ width: `${((state.step - 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="card p-8">
        {/* Step 1: Select Service + Add-Ons */}
        {state.step === 1 && (
          <div>
            <h2 className="section-subheading mb-6">Choose Your Service</h2>
            <div className="space-y-3">
              {services.filter(s => !s.isAddon).map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_SERVICE', id: svc.id, name: svc.name, price: svc.price })}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                    state.serviceId === svc.id
                      ? 'border-cta bg-secondary/30'
                      : 'border-secondary hover:border-accent'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-heading text-xl font-light text-text-dark">{svc.name}</h3>
                      <p className="font-body text-sm text-text-dark/60 mt-1 max-w-sm">{svc.description}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="font-heading text-2xl font-light text-cta">${svc.price}+</p>
                      <p className="font-body text-xs text-text-dark/40">
                        {svc.durationMinutes >= 60 && `${Math.floor(svc.durationMinutes / 60)}h `}
                        {svc.durationMinutes % 60 > 0 && `${svc.durationMinutes % 60}m`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Add-Ons (shown after a service is selected) */}
            {state.serviceId && (
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-secondary" />
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-text-dark/50">Add-Ons (Optional)</p>
                  <div className="h-px flex-1 bg-secondary" />
                </div>
                <div className="space-y-2">
                  {services.filter(s => s.isAddon).map((addon) => {
                    const checked = state.addonIds.includes(addon.id)
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => dispatch({ type: 'TOGGLE_ADDON', id: addon.id, name: addon.name, price: addon.price })}
                        className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                          checked ? 'border-cta bg-secondary/30' : 'border-secondary hover:border-accent'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                          checked ? 'bg-cta border-cta' : 'border-text-dark/30'
                        }`}>
                          {checked && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                        <div className="flex-1">
                          <span className="font-body text-sm font-medium text-text-dark">{addon.name}</span>
                          <span className="font-body text-xs text-text-dark/50 ml-2">{addon.description}</span>
                        </div>
                        <span className="font-heading text-lg text-cta flex-shrink-0">+${addon.price}</span>
                      </button>
                    )
                  })}
                </div>
                {state.addonTotal > 0 && (
                  <p className="font-body text-xs text-text-dark/50 mt-3 text-right">
                    Add-ons subtotal: <span className="text-cta font-semibold">+${state.addonTotal}</span>
                  </p>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => dispatch({ type: 'NEXT' })}
                disabled={!state.serviceId}
                className="btn-primary disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {state.step === 2 && (
          <div>
            <h2 className="section-subheading mb-6">Pick a Date & Time</h2>
            <TimeSlotPicker
              isExpress={isExpress}
              onSelect={(date, slot) => dispatch({ type: 'SET_DATETIME', date, timeSlot: slot })}
              selectedDate={state.date}
              selectedSlot={state.timeSlot}
            />
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={() => dispatch({ type: 'BACK' })} className="btn-outline">← Back</button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'NEXT' })}
                disabled={!state.date || !state.timeSlot}
                className="btn-primary disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Photos (optional) */}
        {state.step === 3 && (
          <div>
            <h2 className="section-subheading mb-2">Inspiration Photos</h2>
            <p className="font-body text-text-dark/60 text-sm mb-6">
              Optional — share photos of styles you love and we'll use them as a guide.
            </p>
            <PhotoUploader
              onUploadComplete={(urls) => dispatch({ type: 'SET_PHOTOS', urls })}
              maxFiles={5}
            />
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={() => dispatch({ type: 'BACK' })} className="btn-outline">← Back</button>
              <button type="button" onClick={() => dispatch({ type: 'NEXT' })} className="btn-primary">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Contact Info */}
        {state.step === 4 && (
          <div>
            <h2 className="section-subheading mb-6">Your Contact Info</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Jane Smith"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="jane@example.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="(555) 000-0000"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Any special requests or things Lanesha should know…"
                  value={contactForm.notes}
                  onChange={(e) => setContactForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button type="button" onClick={() => dispatch({ type: 'BACK' })} className="btn-outline">← Back</button>
              <button
                type="button"
                disabled={!contactForm.name || !contactForm.email || !contactForm.phone}
                onClick={() => {
                  dispatch({ type: 'SET_CONTACT', name: contactForm.name, email: contactForm.email, phone: contactForm.phone, notes: contactForm.notes })
                  dispatch({ type: 'NEXT' })
                }}
                className="btn-primary disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {state.step === 5 && (
          <div>
            <h2 className="section-subheading mb-6">Review Your Booking</h2>

            <div className="space-y-4 bg-background rounded-2xl p-6 mb-6">
              <div className="flex justify-between font-body text-sm">
                <span className="text-text-dark/60">Service</span>
                <span className="font-semibold text-text-dark">{state.serviceName}</span>
              </div>
              {state.addonNames.length > 0 && (
                <div className="flex justify-between font-body text-sm">
                  <span className="text-text-dark/60">Add-Ons</span>
                  <span className="font-semibold text-text-dark text-right max-w-xs">{state.addonNames.join(', ')}</span>
                </div>
              )}
              {state.addonTotal > 0 && (
                <div className="flex justify-between font-body text-sm">
                  <span className="text-text-dark/60">Add-Ons Total</span>
                  <span className="font-semibold text-cta">+${state.addonTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-body text-sm">
                <span className="text-text-dark/60">Date</span>
                <span className="font-semibold text-text-dark">{formatDate(state.date)}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-text-dark/60">Time</span>
                <span className="font-semibold text-text-dark">{formatTime(state.timeSlot)}</span>
              </div>
              {isExpress && (
                <div className="flex justify-between font-body text-sm">
                  <span className="text-text-dark/60">⚡ Express upcharge</span>
                  <span className="font-semibold text-cta">+${expressUpcharge.toFixed(2)}</span>
                </div>
              )}
              {state.discountAmount > 0 && (
                <div className="flex justify-between font-body text-sm">
                  <span className="text-text-dark/60">Discount ({state.discountCode})</span>
                  <span className="font-semibold text-green-600">−${state.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-secondary pt-4 flex justify-between font-body">
                <span className="font-semibold text-text-dark">Total</span>
                <span className="font-heading text-2xl font-light text-cta">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-text-dark/60">Name</span>
                <span className="font-semibold text-text-dark">{state.clientName}</span>
              </div>
              <div className="flex justify-between font-body text-sm">
                <span className="text-text-dark/60">Email</span>
                <span className="font-semibold text-text-dark">{state.clientEmail}</span>
              </div>
            </div>

            <DiscountInput
              serviceId={state.serviceId}
              appliedCode={state.discountCode}
              onApply={(code, amount) => dispatch({ type: 'SET_DISCOUNT', code, amount })}
              onRemove={() => dispatch({ type: 'REMOVE_DISCOUNT' })}
            />

            {settings?.requireDeposit && (
              <div className="mt-4 p-4 bg-secondary/30 rounded-xl">
                <p className="font-body text-sm text-text-dark/70">
                  A <strong>${depositAmount.toFixed(2)} deposit</strong> is required to confirm your booking.
                  The remainder is due at your appointment.
                </p>
              </div>
            )}

            {error && <p className="font-body text-sm text-red-500 mt-4">{error}</p>}

            <div className="mt-8 flex justify-between">
              <button type="button" onClick={() => dispatch({ type: 'BACK' })} className="btn-outline">← Back</button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary disabled:opacity-60"
              >
                {submitting ? 'Booking…' : settings?.requireDeposit ? `Pay Deposit & Confirm` : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
