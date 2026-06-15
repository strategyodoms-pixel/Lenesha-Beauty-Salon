import Link from 'next/link'

export default function ExpressBookingBanner({ upcharge = 20 }: { upcharge?: number }) {
  return (
    <section className="py-16 px-6" style={{ background: 'linear-gradient(135deg, #B07D6C, #C9A99A)' }}>
      <div className="max-w-4xl mx-auto text-center text-white">
        <div className="text-5xl mb-4">⚡</div>
        <h2 className="font-heading text-4xl md:text-5xl font-light mb-4">
          Express — Skip the Line
        </h2>
        <p className="font-body text-white/80 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Need your appointment sooner? Express clients receive priority scheduling —
          first access to the best available slots. Just ${upcharge} more.
        </p>
        <Link
          href="/express"
          className="inline-flex items-center justify-center px-10 py-4 bg-white text-cta font-body font-semibold rounded-full text-sm tracking-wide hover:bg-opacity-90 transition-all duration-200 shadow-md"
        >
          Book Express Now →
        </Link>
      </div>
    </section>
  )
}
