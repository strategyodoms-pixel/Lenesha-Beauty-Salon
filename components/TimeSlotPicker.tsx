'use client'

import { useState, useEffect } from 'react'

type SlotData = { slot: string; isPriority: boolean }

type Props = {
  isExpress?: boolean
  onSelect: (date: string, slot: string) => void
  selectedDate?: string
  selectedSlot?: string
}

function formatTimeDisplay(slot: string): string {
  const [h, m] = slot.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

// Min date: today (YYYY-MM-DD)
function getTodayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TimeSlotPicker({ isExpress = false, onSelect, selectedDate, selectedSlot }: Props) {
  const [date, setDate] = useState(selectedDate ?? '')
  const [slots, setSlots] = useState<SlotData[]>([])
  const [loading, setLoading] = useState(false)
  const [pickedSlot, setPickedSlot] = useState(selectedSlot ?? '')

  useEffect(() => {
    if (!date) return
    setLoading(true)
    setSlots([])
    setPickedSlot('')

    fetch(`/api/slots?date=${date}&express=${isExpress}`)
      .then((r) => r.json())
      .then((data: SlotData[]) => setSlots(data))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [date, isExpress])

  function handleSlotClick(slot: string) {
    setPickedSlot(slot)
    onSelect(date, slot)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="label">Select a Date</label>
        <input
          type="date"
          className="input-field"
          value={date}
          min={getTodayString()}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {date && (
        <div>
          <label className="label">
            Choose a Time{isExpress && <span className="text-cta ml-2">⚡ Priority slots highlighted</span>}
          </label>

          {loading && (
            <div className="text-center py-8 text-text-dark/40 font-body text-sm">
              Loading available times…
            </div>
          )}

          {!loading && slots.length === 0 && date && (
            <p className="font-body text-sm text-text-dark/50 py-4">
              No available slots on this date. Please choose another day.
            </p>
          )}

          {!loading && slots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map(({ slot, isPriority }) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  className={`relative px-3 py-3 rounded-xl font-body text-sm font-medium transition-all duration-200 border-2 ${
                    pickedSlot === slot
                      ? 'bg-cta text-white border-cta shadow-md'
                      : isPriority
                      ? 'bg-secondary border-cta/50 text-text-dark hover:border-cta hover:bg-secondary/80'
                      : 'bg-white border-secondary text-text-dark hover:border-accent hover:bg-secondary/30'
                  }`}
                >
                  {isPriority && pickedSlot !== slot && (
                    <span className="absolute -top-1.5 -right-1.5 text-xs">⚡</span>
                  )}
                  {formatTimeDisplay(slot)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
