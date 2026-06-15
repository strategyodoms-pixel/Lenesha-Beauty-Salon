import Link from 'next/link'

type Service = {
  id: string
  name: string
  description: string
  price: number
  durationMinutes: number
}

const SERVICE_ICONS: Record<string, string> = {
  'Signature Blowout': '💨',
  'Precision Cut': '✂️',
  'Color & Highlights': '🎨',
  'Deep Conditioning Treatment': '✨',
  'Bridal Styling': '👰',
  'Natural Hair Care': '🌿',
}

export default function ServiceCard({ service, featured = false }: { service: Service; featured?: boolean }) {
  const icon = SERVICE_ICONS[service.name] ?? '💅'
  const hours = Math.floor(service.durationMinutes / 60)
  const mins = service.durationMinutes % 60
  const duration = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`

  return (
    <div className="card p-8 flex flex-col group">
      <div className="text-4xl mb-4">{icon}</div>

      <h3 className="font-heading text-2xl font-light text-text-dark mb-3 group-hover:text-cta transition-colors duration-200">
        {service.name}
      </h3>

      <p className="font-body text-text-dark/70 text-sm leading-relaxed mb-6 flex-1">
        {service.description}
      </p>

      <div className="flex items-center justify-between mb-6">
        <span className="font-heading text-3xl font-light text-cta">
          ${service.price}
        </span>
        <span className="font-body text-xs text-text-dark/50 bg-secondary/50 px-3 py-1 rounded-full">
          {duration}
        </span>
      </div>

      {featured ? (
        <Link
          href={`/book?service=${service.id}`}
          className="btn-primary text-sm w-full text-center"
        >
          Book Now
        </Link>
      ) : (
        <Link
          href={`/book?service=${service.id}`}
          className="btn-outline text-sm w-full text-center"
        >
          Book Now
        </Link>
      )}
    </div>
  )
}
