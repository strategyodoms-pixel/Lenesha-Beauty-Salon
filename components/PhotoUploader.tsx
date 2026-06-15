'use client'

import { useCallback, useState } from 'react'
import { useUploadThing } from '@/lib/uploadthing-client'
import Image from 'next/image'

type Props = {
  onUploadComplete: (urls: string[]) => void
  maxFiles?: number
  routeName?: 'imageUploader' | 'bioPhotoUploader'
  label?: string
}

export default function PhotoUploader({
  onUploadComplete,
  maxFiles = 5,
  routeName = 'imageUploader',
  label = 'Upload Inspiration Photos',
}: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const { startUpload } = useUploadThing(routeName, {
    onClientUploadComplete: (res) => {
      const urls = res.map((r) => r.url)
      setUploadedUrls(urls)
      onUploadComplete(urls)
      setUploading(false)
    },
    onUploadError: (err) => {
      setError(err.message)
      setUploading(false)
    },
  })

  const handleFiles = useCallback(
    (selected: FileList | null) => {
      if (!selected) return
      const arr = Array.from(selected).slice(0, maxFiles)
      setFiles(arr)
      setError('')

      const newPreviews = arr.map((f) => URL.createObjectURL(f))
      setPreviews(newPreviews)
    },
    [maxFiles]
  )

  async function handleUpload() {
    if (!files.length) return
    setUploading(true)
    setError('')
    await startUpload(files)
  }

  function removeFile(idx: number) {
    const newFiles = files.filter((_, i) => i !== idx)
    const newPreviews = previews.filter((_, i) => i !== idx)
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  return (
    <div className="space-y-4">
      <label className="label">{label}</label>

      <div
        className="border-2 border-dashed border-secondary rounded-2xl p-8 text-center cursor-pointer hover:border-accent transition-colors duration-200"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-4xl mb-3">📸</div>
        <p className="font-body text-text-dark/60 text-sm">
          Drag & drop photos here, or <span className="text-cta underline">click to browse</span>
        </p>
        <p className="font-body text-text-dark/40 text-xs mt-2">
          JPG, PNG — up to 4MB each, max {maxFiles} {maxFiles === 1 ? 'photo' : 'photos'}
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {previews.map((src, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
              <Image src={src} alt={`Preview ${idx + 1}`} fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadedUrls.length > 0 && (
        <p className="font-body text-sm text-green-600">
          ✓ {uploadedUrls.length} photo{uploadedUrls.length > 1 ? 's' : ''} uploaded successfully
        </p>
      )}

      {error && <p className="font-body text-sm text-red-500">{error}</p>}

      {files.length > 0 && uploadedUrls.length === 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary text-sm disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : `Upload ${files.length} Photo${files.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  )
}
