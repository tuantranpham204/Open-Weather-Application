interface WeatherMetricsProps {
  data: {
    cloudCover: number
    visibility: number
    precipitation: number
  }
}

export default function WeatherMetrics({ data }: WeatherMetricsProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
      <p className="text-slate-400 text-sm mb-4">Additional Metrics</p>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Cloud Cover</span>
          <span className="text-slate-100 font-semibold">{data.cloudCover}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Visibility</span>
          <span className="text-slate-100 font-semibold">{(data.visibility / 1000).toFixed(1)} km</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">Precipitation</span>
          <span className="text-slate-100 font-semibold">{data.precipitation.toFixed(2)} mm</span>
        </div>
      </div>
    </div>
  )
}
