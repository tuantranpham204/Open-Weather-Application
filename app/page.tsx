"use client"

import { useState, useEffect, useMemo } from "react"
import Sidebar from "@/components/sidebar"
import WeatherHeader from "@/components/weather-header"
import CurrentWeatherInfo from "@/components/current-weather-info"
import HourlyForecast from "@/components/hourly-forecast"
import WeatherMetricsGrid from "@/components/weather-metrics-grid"
import TenDayForecast from "@/components/ten-day-forecast"
import AirQualityGauge from "@/components/air-quality-gauge"
import TemperatureChart from "@/components/temperature-chart"
import SearchBanner from "@/components/search-banner"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [selectedHour, setSelectedHour] = useState(0)
  const [activeMetricTab, setActiveMetricTab] = useState("current")
  const [weatherData, setWeatherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState({ lat: 10.7769, lng: 106.7009, name: "Da Nang, Vietnam" })

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/weather?latitude=${location.lat}&longitude=${location.lng}`)

        if (!response.ok) {
          throw new Error("Failed to fetch weather data")
        }

        const data = await response.json()
        console.log("[v0] Weather data received:", data)

        // Transform API response to match component structure
        setWeatherData({
          time: data.hourly.time,
          temperature: data.hourly.temperature_2m,
          humidity: data.hourly.relative_humidity_2m,
          precipitation: data.hourly.precipitation,
          weathercode: data.hourly.weathercode,
          cloud_cover: data.hourly.cloud_cover,
          windspeed: data.hourly.windspeed_10m,
          winddirection: data.hourly.winddirection_10m,
          pressure_msl: data.hourly.pressure_msl,
          radiation: data.hourly.shortwave_radiation,
          visibility: data.hourly.visibility,
        })
      } catch (err) {
        console.error("[v0] Error fetching weather:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [location])

  const handleLocationChange = async (newLocation: { lat: number; lng: number }) => {
    try {
      setLocation((prev) => ({ ...prev, lat: newLocation.lat, lng: newLocation.lng }))

      // Get location name for display
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?latitude=${newLocation.lat}&longitude=${newLocation.lng}&format=json`,
      )

      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          const { name, admin1, country } = data.results[0]
          setLocation((prev) => ({
            ...prev,
            name: `${name}${admin1 ? ", " + admin1 : ""}${country ? ", " + country : ""}`,
          }))
        }
      }
    } catch (error) {
      console.error("[v0] Error getting location name:", error)
    }
  }

  const currentData = useMemo(() => {
    if (!weatherData) return null

    return {
      temperature: weatherData.temperature[selectedHour],
      humidity: weatherData.humidity[selectedHour],
      windspeed: weatherData.windspeed[selectedHour],
      winddirection: weatherData.winddirection[selectedHour],
      pressure: weatherData.pressure_msl[selectedHour],
      radiation: weatherData.radiation[selectedHour],
      cloudCover: weatherData.cloud_cover[selectedHour],
      visibility: weatherData.visibility[selectedHour],
      precipitation: weatherData.precipitation[selectedHour],
      feelsLike: weatherData.temperature[selectedHour] - 3,
      tempMax: Math.max(...weatherData.temperature),
      tempMin: Math.min(...weatherData.temperature),
    }
  }, [weatherData, selectedHour])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-slate-100">
        <div className="flex min-h-screen">
          <Sidebar activeTab={activeMetricTab} setActiveTab={setActiveMetricTab} />
          <div className="flex-1 p-6">
            <div className="space-y-6">
              <Skeleton className="h-64 bg-slate-800" />
              <Skeleton className="h-32 bg-slate-800" />
              <Skeleton className="h-48 bg-slate-800" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-slate-100 flex items-center justify-center">
        <Card className="bg-slate-800 border-red-500/20 p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Weather</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white transition"
          >
            Retry
          </button>
        </Card>
      </div>
    )
  }

  if (!weatherData || !currentData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar activeTab={activeMetricTab} setActiveTab={setActiveMetricTab} />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="relative">
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-6">
              {/* Search always visible at top */}
              <SearchBanner onLocationChange={handleLocationChange} />

              {/* Render views depending on sidebar active tab */}
              {activeMetricTab === "current" && (
                <>
                  <WeatherHeader currentData={currentData} location={location} onLocationSelect={handleLocationChange} />
                  <CurrentWeatherInfo data={currentData} />
                  <HourlyForecast data={weatherData} selectedHour={selectedHour} onSelectHour={setSelectedHour} />
                  <WeatherMetricsGrid data={currentData} weatherData={weatherData} selectedHour={selectedHour} />
                  <TenDayForecast />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AirQualityGauge />
                    <TemperatureChart data={weatherData} selectedHour={selectedHour} />
                  </div>
                </>
              )}

              {activeMetricTab === "map" && (
                <>
                  <WeatherHeader currentData={currentData} location={location} onLocationSelect={handleLocationChange} />
                  {/* larger map view or additional map controls could go here */}
                  <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-2xl p-6 backdrop-blur border border-slate-700/30">
                    <h3 className="text-lg font-semibold mb-4">Interactive Weather Map</h3>
                    <div className="w-full h-[60vh] rounded-xl overflow-hidden">
                      <iframe
                        title="full-weather-map"
                        src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=11&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeMetricTab === "forecast" && (
                <>
                  <h2 className="text-2xl font-semibold">Forecast Data</h2>
                  <TenDayForecast />
                  <HourlyForecast data={weatherData} selectedHour={selectedHour} onSelectHour={setSelectedHour} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
