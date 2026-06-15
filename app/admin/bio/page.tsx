'use client'

import { useEffect, useState } from 'react'
import PhotoUploader from '@/components/PhotoUploader'
import Image from 'next/image'

type Profile = {
  id: string
  bio: string
  photoUrl: string | null
}

export default function AdminBioPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bio, setBio] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then((p: Profile) => {
      setProfile(p)
      setBio(p?.bio ?? '')
      setPhotoUrl(p?.photoUrl ?? '')
    })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, photoUrl: photoUrl || null }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <h1 className="font-heading text-4xl font-light text-text-dark mb-8">Bio & Photo</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Photo */}
        <div className="card p-6">
          <h2 className="font-heading text-2xl font-light mb-6">Profile Photo</h2>

          {photoUrl && (
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6">
              <Image src={photoUrl} alt="Profile" fill className="object-cover" />
            </div>
          )}

          <PhotoUploader
            routeName="bioPhotoUploader"
            maxFiles={1}
            label="Upload Profile Photo"
            onUploadComplete={(urls) => {
              if (urls[0]) setPhotoUrl(urls[0])
            }}
          />

          {photoUrl && (
            <button
              onClick={() => setPhotoUrl('')}
              className="mt-3 font-body text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              Remove photo
            </button>
          )}
        </div>

        {/* Bio */}
        <div className="card p-6">
          <h2 className="font-heading text-2xl font-light mb-6">Bio Text</h2>
          <p className="font-body text-sm text-text-dark/60 mb-4">
            Write in paragraphs — separate paragraphs with a blank line. This appears on the About page.
          </p>
          <textarea
            className="input-field resize-none w-full"
            rows={16}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Your story, training, philosophy…"
          />
          <div className="mt-6 flex items-center gap-4">
            <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            {saved && <p className="font-body text-sm text-green-600">✓ Changes saved</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
