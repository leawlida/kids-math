'use client'

export function Stars({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className="text-4xl transition-all duration-300"
          style={{
            animation: i < count ? `star-pop 0.6s ${i * 0.15}s ease-out both` : undefined,
            filter: i < count ? 'drop-shadow(0 0 8px gold)' : 'grayscale(1) opacity(0.3)',
          }}
        >
          ⭐
        </span>
      ))}
    </div>
  )
}
