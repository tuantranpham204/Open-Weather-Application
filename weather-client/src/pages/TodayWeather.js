import React, { useContext, useState } from 'react';
import { WeatherContext } from '../context/WeatherContext';
import { PreferencesContext } from '../context/PreferencesContext';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom'; 
import WeatherChart from '../components/WeatherChart'; 
import { getWeatherIcon, getWeatherStatus } from '../utils/helpers'; 
import { 
    Cloud, Droplets, Wind, MapPin, Save, Star, X, 
    Sun, Eye, ThermometerSun, Gauge, ArrowRightCircle, Sunrise, Sunset
} from 'lucide-react';

const MetricItem = ({ icon: Icon, label, value, unit, opacity = 1 }) => (
    <div className="metric-glass-card" style={{ opacity }}>
        <div className="metric-icon-wrapper">
            <Icon size={18} />
        </div>
        <div className="metric-info">
            <span className="metric-label">{label}</span>
            <b className="metric-value">{value}{unit}</b>
        </div>
    </div>
);

const TodayWeather = () => {
    const { user } = useContext(AuthContext);
    const { weatherData, favorites, getWeatherByCoords, fetchFavorites, loading } = useContext(WeatherContext);
    const { formatTemperature, getTemperatureUnit, t, preferences } = useContext(PreferencesContext);
    const [saveLoading, setSaveLoading] = useState(false);
    const [activeMetric, setActiveMetric] = useState('temp'); 

    if (!weatherData) return (
        <div className="full-page-background">
            <div className="full-page-overlay"></div>
            <div className="content-container" style={{textAlign: 'center', paddingTop: 150}}>
                <h1 style={{fontSize: 42, color: '#fff'}}>{t('today.title')}</h1>
            </div>
        </div>
    );

    const { current, city_name, country, hourly, daily, lat, lon } = weatherData;
    const isSaved = favorites.some(fav => fav.city_name === city_name);

    const handleAddToFavorites = async () => {
        if (!user) { alert(t('account.pleaseLogin')); return; }
        setSaveLoading(true);
        try {
            await api.post('favorites/', { city_name, latitude: lat, longitude: lon });
            if (fetchFavorites) fetchFavorites(); 
        } catch (error) { alert(t('common.error')); }
        setSaveLoading(false);
    };

    const chartData = hourly.slice(0, 24).map(h => ({
        time: h.time || "", weathercode: h.weathercode, temp: Number(h.temp), rain: Number(h.rain),
        uv: h.uv_index, visibility: h.visibility ? Number((h.visibility / 1000).toFixed(1)) : 0, 
        dewpoint: Number(h.dewpoint_2m || h.dewpoint), pressure: Number(h.pressure_msl || h.pressure)
    }));

    // Debug: check data
    console.log('Sample hourly data:', hourly[0]);
    console.log('Chart data sample:', chartData[0]);

    const metricsOptions = [
        { id: 'temp', label: t('today.temperature'), icon: <ThermometerSun size={14}/> },
        { id: 'rain', label: t('today.precipitation'), icon: <Cloud size={14}/> },
        { id: 'uv', label: t('today.uvIndex'), icon: <Sun size={14}/> },
        { id: 'visibility', label: t('today.visibility'), icon: <Eye size={14}/> },
        { id: 'dewpoint', label: t('today.dewPoint'), icon: <Droplets size={14}/> },
        { id: 'pressure', label: t('today.pressure'), icon: <Gauge size={14}/> },
    ];

    return (
        <div className="full-page-background">
            <div className="full-page-overlay"></div>
            <div className="content-container">
                
                {/* FAVORITES */}
                {favorites.length > 0 && (
                    <div className="favorites-section">
                        <h3 className="section-heading"><Star size={20} fill="#fff"/> {t('today.favorites').toUpperCase()}</h3>
                        <div className="glass-cards-grid">
                            {favorites.map((fav) => (
                                <div key={fav.id} className="glass-card" onClick={() => getWeatherByCoords(fav.latitude, fav.longitude, fav.city_name, fav.country)}>
                                    <button className="btn-delete-fav" onClick={async (e) => { e.stopPropagation(); await api.delete(`favorites/${fav.id}/`); fetchFavorites(); }}><X size={14} /></button>
                                    <div><h4 className="glass-city-name">{fav.city_name}</h4><p className="glass-country-name">{fav.country || 'Việt Nam'}</p></div>
                                    <div className="glass-weather-row"><img src={getWeatherIcon(fav.weathercode)} alt="icon" className="glass-icon" /><span className="glass-temp-big">{formatTemperature(fav.current_temp)}°</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main layout */}
                <div className="main-grid-layout">
                    <div className="weather-info-panel">
                        <div className="panel-header">
                            <div className="location-info">
                                <div className="location-name-row">
                                    <MapPin size={24} color="#3182ce" />
                                    <h2>{city_name}, {country}</h2>
                                </div>
                                <Link to="/forecast" className="btn-forecast-pill">
                                    <ArrowRightCircle size={14} />
                                    {t('today.forecastLink')}
                                </Link>
                            </div>
                            
                            {/* Save button */}
                            <button className={`btn-save-new ${isSaved ? 'saved' : ''}`} onClick={handleAddToFavorites} disabled={isSaved}>
                                <Save size={18} /> {isSaved ? t('common.success') : t('today.addFavorite')}
                            </button>
                        </div>

                        <div className="current-main-row">
                            <div className="main-temp-group">
                                <img src={getWeatherIcon(current.weathercode)} alt="icon" className="main-status-icon" />
                                <div className="temp-wrapper">
                                    <span className="current-temp-big">{formatTemperature(current.temperature)}{getTemperatureUnit()}</span>
                                    <p className="current-status-text">{getWeatherStatus(current.weathercode, preferences.language)}</p>
                                </div>
                            </div>
                            <div className="metrics-grid-compact">
                                <MetricItem icon={ThermometerSun} label={t('today.feelsLike')} value={formatTemperature(current.apparent_temperature)} unit={getTemperatureUnit()} />
                                <MetricItem icon={Wind} label={t('today.wind')} value={current.windspeed} unit=" km/h" />
                                <MetricItem icon={Droplets} label={t('today.humidity')} value={current.humidity} unit="%" />
                                <MetricItem icon={Sun} label={t('today.uvIndex')} value={current.uv_index?.toFixed(1) || 0} unit="" />
                                <MetricItem icon={Eye} label={t('today.visibility')} value={(current.visibility/1000).toFixed(1)} unit=" km" />
                                <MetricItem icon={Cloud} label={t('today.dewPoint')} value={formatTemperature(current.dewpoint_2m)} unit={getTemperatureUnit()} opacity={0.7} />
                                <MetricItem icon={Sunrise} label={t('today.sunrise')} value={new Date(daily.sunrise[0]).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} unit="" />
                                <MetricItem icon={Sunset} label={t('today.sunset')} value={new Date(daily.sunset[0]).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} unit="" />
                            </div>
                        </div>
                    </div>

                    <div className="map-panel-new">
                        <iframe title="Windy" src={`https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&zoom=10&overlay=wind&product=ecmwf&marker=true&metricWind=km%2Fh&metricTemp=%C2%B0C`} frameBorder="0"></iframe>
                    </div>
                </div>

                <div className="chart-panel-full">
                    <div className="segmented-control">
                        {metricsOptions.map(opt => (
                            <button key={opt.id} className={activeMetric === opt.id ? 'active' : ''} onClick={() => setActiveMetric(opt.id)}>
                                {opt.icon} <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                    <WeatherChart data={chartData} dataKey={activeMetric} />
                </div>
            </div>
        </div>
    );
};

export default TodayWeather;