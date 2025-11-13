interface CurrentWeatherCardProps {
  data: {
    temperature: number
    humidity: number
    windspeed: number
    winddirection: number
    pressure: number
    radiation: number
    cloudCover: number
    visibility: number
    precipitation: number
  }
}

export default function CurrentWeatherCard({ data }: CurrentWeatherCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 space-y-6">
      {/* Temperature Display */}
      <div className="space-y-2">
        <p className="text-slate-400 text-sm">Current Temperature</p>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-bold text-orange-400">{data.temperature}°</span>
          <span className="text-2xl text-slate-400">C</span>
        </div>
      </div>

      {/* Weather Conditions Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
            <p className="text-slate-400 text-xs mb-2">Humidity</p>
            <p className="text-2xl font-semibold text-slate-100">{data.humidity}%</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
            <p className="text-slate-400 text-xs mb-2">Wind Speed</p>
            <p className="text-2xl font-semibold text-slate-100">{data.windspeed} km/h</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
            <p className="text-slate-400 text-xs mb-2">Cloud Cover</p>
            <p className="text-2xl font-semibold text-slate-100">{data.cloudCover}%</p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
            <p className="text-slate-400 text-xs mb-2">Rain</p>
            <p className="text-2xl font-semibold text-slate-100">{data.precipitation.toFixed(1)}mm</p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-3 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Visibility</span>
          <span className="text-slate-100 font-semibold">{(data.visibility / 1000).toFixed(1)} km</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Radiation</span>
          <span className="text-slate-100 font-semibold">{data.radiation} W/m²</span>
        </div>
      </div>
    </div>
  )
}
