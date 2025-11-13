"use client"

import { ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TemperatureChartProps {
  data: {
    time: string[]
    temperature: number[]
    precipitation: number[]
    humidity: number[]
  }
  selectedHour: number
}

export default function TemperatureChart({ data, selectedHour }: TemperatureChartProps) {
  const chartData = data.time.map((time, index) => ({
    time: new Date(time).toLocaleTimeString("en-US", { hour: "2-digit" }),
    temperature: data.temperature[index],
    precipitation: data.precipitation[index] * 10,
    humidity: data.humidity[index],
  }))

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur border border-slate-700/30 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-6">Temperature Trends</h3>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="feelsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 116, 139, 0.2)" />
          <XAxis dataKey="time" stroke="rgb(148, 163, 184)" style={{ fontSize: "11px" }} />
          <YAxis yAxisId="left" stroke="rgb(148, 163, 184)" style={{ fontSize: "11px" }} />
          <YAxis yAxisId="right" orientation="right" stroke="rgb(148, 163, 184)" style={{ fontSize: "11px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(100, 116, 139, 0.5)",
              borderRadius: "8px",
              color: "rgb(226, 232, 240)",
            }}
          />
          <Legend />
          <Bar yAxisId="right" dataKey="precipitation" fill="rgba(59, 130, 246, 0.5)" name="Precipitation (mm)" />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            fill="url(#tempGradient)"
            stroke="#ef4444"
            strokeWidth={2}
            name="Temperature (°C)"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Data Summary Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-2 px-3 text-slate-400">Metric</th>
              <th className="text-right py-2 px-3 text-slate-400">Max</th>
              <th className="text-right py-2 px-3 text-slate-400">Min</th>
              <th className="text-right py-2 px-3 text-slate-400">Avg</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700/30">
              <td className="py-2 px-3">Temperature</td>
              <td className="text-right">{Math.max(...data.temperature).toFixed(1)}°C</td>
              <td className="text-right">{Math.min(...data.temperature).toFixed(1)}°C</td>
              <td className="text-right">
                {(data.temperature.reduce((a, b) => a + b) / data.temperature.length).toFixed(1)}°C
              </td>
            </tr>
            <tr className="border-b border-slate-700/30">
              <td className="py-2 px-3">Humidity</td>
              <td className="text-right">{Math.max(...data.humidity).toFixed(0)}%</td>
              <td className="text-right">{Math.min(...data.humidity).toFixed(0)}%</td>
              <td className="text-right">
                {(data.humidity.reduce((a, b) => a + b) / data.humidity.length).toFixed(0)}%
              </td>
            </tr>
            <tr>
              <td className="py-2 px-3">Precipitation</td>
              <td className="text-right">{Math.max(...data.precipitation).toFixed(1)} mm</td>
              <td className="text-right">{Math.min(...data.precipitation).toFixed(1)} mm</td>
              <td className="text-right">
                {(data.precipitation.reduce((a, b) => a + b) / data.precipitation.length).toFixed(1)} mm
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
