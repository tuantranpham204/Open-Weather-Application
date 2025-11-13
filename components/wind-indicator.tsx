"use client"

interface WindIndicatorProps {
  direction: number
  speed: number
}

export default function WindIndicator({ direction, speed }: WindIndicatorProps) {
  const getWindDirection = (deg: number) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]
    return directions[Math.round(deg / 22.5) % 16]
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center">
      <p className="text-slate-400 text-sm mb-4">Wind Direction</p>

      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Compass circle */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(100, 116, 139, 0.3)" strokeWidth="1" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(100, 116, 139, 0.2)" strokeWidth="1" />

          {/* Cardinal directions */}
          <text x="50" y="15" textAnchor="middle" className="fill-orange-400 font-bold text-xs">
            N
          </text>
          <text x="85" y="52" textAnchor="middle" className="fill-slate-400 text-xs">
            E
          </text>
          <text x="50" y="88" textAnchor="middle" className="fill-slate-400 text-xs">
            S
          </text>
          <text x="15" y="52" textAnchor="middle" className="fill-slate-400 text-xs">
            W
          </text>

          {/* Wind arrow */}
          <g transform={`rotate(${direction} 50 50)`}>
            <polygon points="50,20 48,45 50,40 52,45" fill="#fb923c" />
            <line x1="50" y1="50" x2="50" y2="30" stroke="#fb923c" strokeWidth="2" />
          </g>
        </svg>
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold text-orange-400">{getWindDirection(direction)}</p>
        <p className="text-slate-400 text-sm mt-2">{speed.toFixed(1)} km/h</p>
      </div>
    </div>
  )
}
