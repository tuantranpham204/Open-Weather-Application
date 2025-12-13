import React, { useContext, useState } from 'react';
import { WeatherContext } from '../context/WeatherContext';
import { PreferencesContext } from '../context/PreferencesContext';
import { formatDate, getWeatherIcon, getWeatherStatus, getDayName } from '../utils/helpers';
import WeatherChart from '../components/WeatherChart'; 
import { Calendar, Clock, ArrowUp, ArrowDown, Droplets, Sunrise, Sunset, Sun, ArrowLeft, Cloud, Eye, ThermometerSun, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForecastPage = () => {
    const { weatherData, selectedDate, setSelectedDate } = useContext(WeatherContext);
    const { formatTemperature, t, preferences } = useContext(PreferencesContext);
    const [activeMetric, setActiveMetric] = useState('temp');

    if (!weatherData) {
        return (
            <div className="full-page-background">
                <div className="full-page-overlay"></div>
                <div className="content-container" style={{textAlign:'center', color: '#fff', paddingTop: 150}}>
                    <h2>Loading forecast...</h2>
                    <Link to="/" className="btn-back-home" style={{color: '#63b3ed', textDecoration: 'none'}}>
                        <ArrowLeft size={16}/> Back to home
                    </Link>
                </div>
            </div>
        );
    }

    const { forecast, city_name, hourly } = weatherData;

    const getHourlyDataForSelectedDate = () => {
        if (!hourly || !selectedDate) return [];
        const startIndex = hourly.findIndex(h => h.full_time && h.full_time.startsWith(selectedDate));
        if (startIndex === -1) return [];
        return hourly.slice(startIndex, startIndex + 24);
    };

    const chartData = getHourlyDataForSelectedDate().map(h => ({
        time: h.time || "",
        weathercode: h.weathercode,
        temp: Number(h.temp),
        rain: Number(h.rain),
        uv: h.uv_index,
        visibility: h.visibility ? Number((h.visibility / 1000).toFixed(1)) : 0,
        dewpoint: Number(h.dewpoint_2m || h.dewpoint),
        pressure: Number(h.pressure_msl || h.pressure)
    }));

    const metricsOptions = [
        { id: 'temp', label: 'Temperature', icon: <ThermometerSun size={14}/> },
        { id: 'rain', label: 'Precipitation', icon: <Cloud size={14}/> },
        { id: 'uv', label: 'UV index', icon: <Sun size={14}/> },
        { id: 'visibility', label: 'Visibility', icon: <Eye size={14}/> },
        { id: 'dewpoint', label: 'Dew point', icon: <Droplets size={14}/> },
        { id: 'pressure', label: 'Pressure', icon: <Gauge size={14}/> },
    ];

    const formatSunTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) : '--:--';
    
    return (
        <div className="full-page-background">
            <div className="full-page-overlay"></div>
            <div className="content-container" style={{paddingTop: 40, paddingBottom: 40}}>
                <div style={{marginBottom: 30}}>
                    <Link to="/" style={{textDecoration:'none', color:'rgba(255,255,255,0.8)', display:'inline-flex', alignItems:'center', gap:5, marginBottom:10, fontSize:14, fontWeight: 500}}>
                        <ArrowLeft size={16}/> Back to home
                    </Link>
                    <h2 style={{color:'#fff', fontSize: 28, margin:0, display:'flex', alignItems:'center', gap:10, textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
                        <Calendar size={28}/> 14-day forecast: {city_name}
                    </h2>
                </div>

                <div className="forecast-grid-row">
                    {forecast.map((day, index) => {
                        const isSelected = selectedDate === day.date;
                        return (
                            <div key={index} className={`forecast-item-card ${isSelected ? 'active' : ''}`} onClick={() => setSelectedDate(day.date)}>
                                <div className="f-card-header">
                                    <span className="f-day-name">{getDayName(day.date, 'en')}</span>
                                    <span className="f-date-sub">{formatDate(day.date)}</span>
                                </div>

                                <div className="f-card-body">
                                    <img src={getWeatherIcon(day.weathercode || 3)} width="50" alt="icon" className="f-icon-img"/>
                                    <span className="f-status-text">{getWeatherStatus(day.weathercode, 'en')}</span>
                                </div>

                                <div className="f-temp-range">
                                    <span className="max" title="High"><ArrowUp size={14}/> {formatTemperature(day.max_temp)}°</span>
                                    <span className="min" title="Low"><ArrowDown size={14}/> {formatTemperature(day.min_temp)}°</span>
                                </div>
                                
                                <div className="f-details-mini-grid">
                                    <div className="mini-item" title="Precipitation"><Droplets size={14} color="#3182ce"/><span>{day.precipitation > 0 ? day.precipitation + 'mm' : '0%'}</span></div>
                                    <div className="mini-item" title="Max UV"><Sun size={14} color="#ed8936"/><span>UV {day.uv_index_max ? day.uv_index_max.toFixed(1) : '-'}</span></div>
                                    <div className="mini-item" title="Sunrise"><Sunrise size={14} color="#d69e2e"/><span>{formatSunTime(day.sunrise)}</span></div>
                                    <div className="mini-item" title="Sunset"><Sunset size={14} color="#dd6b20"/><span>{formatSunTime(day.sunset)}</span></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {chartData.length > 0 ? (
                    <div className="weather-main-card" style={{marginTop: 30}}>
                        <div className="chart-header-row" style={{marginBottom: 20, borderBottom:'1px solid rgba(0,0,0,0.05)', paddingBottom:15}}>
                            <h3 style={{color: '#2d3748', display:'flex', alignItems:'center', gap: 10, fontSize: 18, margin:0}}>
                                <Clock size={20} color="#3182ce"/> Hourly details: {getDayName(selectedDate, 'en')} ({formatDate(selectedDate)})
                            </h3>
                        </div>
                        <div className="segmented-control" style={{marginBottom: 20}}>
                            {metricsOptions.map(opt => (
                                <button key={opt.id} className={activeMetric === opt.id ? 'active' : ''} onClick={() => setActiveMetric(opt.id)}>
                                    {opt.icon} <span>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="chart-wrapper">
                            <WeatherChart data={chartData} dataKey={activeMetric} />
                        </div>
                    </div>
                ) : (
                    <div className="weather-main-card" style={{marginTop: 30, textAlign:'center', padding: 40, color:'#718096'}}>
                        No data available for the selected date.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForecastPage;