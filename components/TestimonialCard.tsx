type Testimonial = {
  id: string
  clientFirstName: string
  serviceReceived: string
  rating: number
  quote: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-cta' : 'text-secondary'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="card p-8 flex flex-col">
      <div className="font-heading text-5xl text-accent/30 leading-none mb-4">"</div>

      <p className="font-body text-text-dark/80 leading-relaxed italic flex-1 mb-6">
        {testimonial.quote}
      </p>

      <div className="border-t border-secondary pt-4">
        <StarRating rating={testimonial.rating} />
        <p className="font-body font-semibold text-text-dark mt-2 text-sm">
          {testimonial.clientFirstName}
        </p>
        <p className="font-body text-text-dark/50 text-xs mt-0.5">
          {testimonial.serviceReceived}
        </p>
      </div>
    </div>
  )
}
