"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface HourlyForecastProps {
  data: {
    time: string[]
    temperature: number[]
    weathercode: number[]
  }
  selectedHour: number
  onSelectHour: (hour: number) => void
}

const getWeatherIcon = (code: number) => {
  if (code < 3) return "☀️"
  if (code < 45) return "🌤️"
  if (code < 82) return "☁️"
  if (code < 86) return "🌧️"
  return "⛈️"
}

export default function HourlyForecast({ data, selectedHour, onSelectHour }: HourlyForecastProps) {
  const chartData = data.time.map((time, index) => ({
    time: new Date(time).getHours() + ":00",
    temperature: data.temperature[index],
    index,
  }))

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-slate-100 mb-6">Hourly Forecast</h3>

      {/* Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAreaTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
            <XAxis dataKey="time" stroke="rgb(148, 163, 184)" style={{ fontSize: "11px" }} />
            <YAxis stroke="rgb(148, 163, 184)" style={{ fontSize: "11px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(100, 116, 139, 0.5)",
                borderRadius: "8px",
                color: "rgb(226, 232, 240)",
              }}
            />
            <Area type="monotone" dataKey="temperature" stroke="#fbbf24" strokeWidth={2} fill="url(#colorAreaTemp)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly cards */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 pb-2">
          {data.time.map((time, index) => {
            const hour = new Date(time).getHours()
            const isSelected = index === selectedHour

            return (
              <button
                key={index}
                onClick={() => onSelectHour(index)}
                className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg transition-all min-w-fit ${
                  isSelected
                    ? "bg-orange-500 text-slate-900 shadow-lg shadow-orange-500/30"
                    : "bg-slate-700/30 text-slate-300 hover:bg-slate-700/50"
                } border ${isSelected ? "border-orange-400" : "border-slate-600/30"}`}
              >
                <span className="text-xs font-semibold">{hour}:00</span>
                <span className="text-xl">{getWeatherIcon(data.weathercode[index])}</span>
                <span className="text-sm font-medium">{data.temperature[index]}°</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
