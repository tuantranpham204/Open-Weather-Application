import { useContext } from "react";
import { WeatherContext } from "../context/WeatherContext";
import "./HealthActivity.css";

export default function HealthActivity() {
  const { weatherData } = useContext(WeatherContext);

  // 1. Safe check
  if (!weatherData || !weatherData.health_activity) return null;

  const { health_activity, air_quality, current } = weatherData;

  // 2. UV STATUS CALCULATION (English)
  const getUVState = (uv) => {
    if (uv === null || uv === undefined) return { status: "N/A", color: "#ccc" };
    if (uv <= 2) return { status: "Low", color: "#22c55e" };        // Green
    if (uv <= 5) return { status: "Moderate", color: "#eab308" };   // Yellow
    if (uv <= 7) return { status: "High", color: "#f97316" };       // Orange
    if (uv <= 10) return { status: "Very high", color: "#ef4444" }; // Red
    return { status: "Extreme", color: "#7c3aed" };                // Purple
  };

  const uvState = getUVState(current?.uv_index);

  // 3. MAP TRANSLATIONS FOR API DATA
  // Hàm này để dịch các trạng thái từ Backend (như "Cao", "Tốt"...) sang tiếng Anh
  const translateStatus = (status) => {
    const dict = {
      "Cao": "High",
      "Trung bình": "Moderate",
      "Thấp": "Low",
      "Tốt": "Good",
      "Khá": "Fair",
      "Kém": "Poor",
      "Xấu": "Bad",
      "Rất xấu": "Very poor",
      "Nguy hại": "Hazardous",
      "Kém cho nhóm nhạy cảm": "Unhealthy for sensitive groups"
    };
    return dict[status] || status;
  };

  // 4. CREATE ENVIRONMENTAL INDICES
  const indices = [
    {
      id: "uv",
      label: "UV index",
      value: current?.uv_index ?? 0,
      status: uvState.status,
      color: uvState.color,
      percent: Math.min(((current?.uv_index || 0) / 12) * 100, 100),
    },
    {
      id: "aqi",
      label: "Air quality (AQI)",
      ...air_quality?.aqi,
      level: translateStatus(air_quality?.aqi?.status), 
    },
    {
      id: "pm25",
      label: "Particulate matter (PM2.5)",
      ...air_quality?.pm25,
      level: translateStatus(air_quality?.pm25?.status),
    },
  ];

  // 5. TRANSLATE LABELS IN DATA
  const translateLabel = (label) => {
    const dict = {
      "Viêm khớp": "Arthritis",
      "Áp lực xoang": "Sinus pressure",
      "Cảm cúm": "Common cold",
      "Đau nửa đầu": "Migraine",
      "Hen suyễn": "Asthma",
      "Câu cá": "Fishing",
      "Chạy bộ": "Running",
      "Đánh gôn": "Golfing",
      "Đạp xe": "Cycling",
      "Bãi biển": "Beach",
      "Lái xe": "Driving"
    };
    return dict[label] || label;
  };

  const translatedHealth = health_activity.health?.map(item => ({
    ...item,
    label: translateLabel(item.label),
    status: translateStatus(item.status)
  }));

  const translatedActivities = health_activity.activities?.map(item => ({
    ...item,
    label: translateLabel(item.label),
    status: translateStatus(item.status)
  }));

  return (
    <div className="health-container">
      
      {/* ===== 1. ENVIRONMENTAL INDICES ===== */}
      <h2 className="health-title" style={{ marginTop: 0 }}>Environmental indices</h2>
      <div className="health-grid">
        {indices.map((item) => (
          <IndexCard key={item.id} item={item} />
        ))}
      </div>

      {/* ===== 2. HEALTH ===== */}
      {translatedHealth && (
        <Section title="Health" data={translatedHealth} />
      )}
      
      {/* ===== 3. ACTIVITIES ===== */}
      {translatedActivities && (
        <Section title="Outdoor activities" data={translatedActivities} />
      )}
    </div>
  );
}

// --- Component Section ---
function Section({ title, data }) {
  if (!data) return null;
  return (
    <>
      <h2 className="health-title">{title}</h2>
      <div className="health-grid">
        {data.map((item) => (
          <div className="health-card" key={item.id}>
            <div className="health-card-header"> 
                <div className="health-label">{item.label}</div>
            </div>
            <div
              className="status-line"
              style={{ background: item.color }}
            />
            <div className="health-status" style={{ color: item.color }}>
              {item.status}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// --- Component IndexCard ---
function IndexCard({ item }) {
  if (!item) return null; 

  return (
    <div className="health-card">
      <div className="health-label">{item.label}</div>

      <div className="index-progress">
        <div className="index-bar">
          <div
            className="index-fill"
            style={{
              width: `${item.percent}%`,
              background: item.color,
            }}
          />
        </div>
        <div className="index-text" style={{ color: item.color }}>
          {item.level || item.status} · {item.value}
        </div>
      </div>
    </div>
  );
}