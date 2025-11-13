"use client"

export default function SunriseSunset() {
  const sunrise = new Date(Date.now()).setHours(6, 30, 0)
  const sunset = new Date(Date.now()).setHours(18, 45, 0)

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 200 120" className="w-full h-24">
        {/* Sun arc path */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="2" />

        {/* Sun position */}
        <circle cx="100" cy="50" r="12" fill="#fbbf24" opacity="0.8" />

        {/* Sun rays */}
        <line x1="100" y1="20" x2="100" y2="5" stroke="#fbbf24" strokeWidth="2" />
        <line x1="140" y1="30" x2="150" y2="18" stroke="#fbbf24" strokeWidth="2" />
        <line x1="60" y1="30" x2="50" y2="18" stroke="#fbbf24" strokeWidth="2" />

        {/* Horizon line */}
        <line x1="20" y1="100" x2="180" y2="100" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="1" />
      </svg>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">Sunrise</p>
          <p className="text-sm font-semibold">6:30 AM</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Sunset</p>
          <p className="text-sm font-semibold">6:45 PM</p>
        </div>
      </div>
    </div>
  )
}
