"use client"

import { Cloud, Map, Settings, BarChart3 } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: "current", icon: Cloud, label: "Weather", tooltip: "Current Weather" },
    { id: "map", icon: Map, label: "Map", tooltip: "Weather Map" },
    { id: "forecast", icon: BarChart3, label: "Forecast", tooltip: "Forecast Data" },
    { id: "settings", icon: Settings, label: "Settings", tooltip: "Settings" },
  ]

  return (
    <div className="w-20 bg-slate-950/80 border-r border-slate-800/50 flex flex-col items-center py-6 gap-8 sticky left-0 top-0 h-screen">
      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
        <Cloud className="w-6 h-6 text-slate-950" />
      </div>

      <nav className="flex flex-col gap-6">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.tooltip}
              className={`p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          )
        })}
      </nav>

      <div className="mt-auto pb-6">
        <button className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-700">
          <span className="text-xs font-bold">U</span>
        </button>
      </div>
    </div>
  )
}
