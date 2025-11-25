import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- setup leaflet---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 11);
    return null;
}
//today weather
const getWeatherStatus = (code) => {
    if (code === undefined) return ""; if (code === 0) return "Clear sky"; if (code <= 3) return "Partly cloudy"; if (code <= 48) return "Fog"; if (code <= 67) return "Rain"; if (code >= 95) return "Thunderstorm"; return "Rain";
};
const getWindDirection = (degree) => {
    if (degree === undefined) return ""; const d = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest']; return d[Math.round(degree/45)%8];
};
const formatDate = (dateStr) => { if(!dateStr) return ""; const [y,m,d] = dateStr.split("-"); return `${d}/${m}`; };
const getWeatherIcon = (code) => {
    if (code === 0) return "https://cdn-icons-png.flaticon.com/512/869/869869.png"; 
    if (code <= 3) return "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";
    if (code <= 67) return "https://cdn-icons-png.flaticon.com/512/1163/1163627.png";
    return "https://cdn-icons-png.flaticon.com/512/1163/1163636.png";
};
//homepage
const HomePage = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const [citySearch, setCitySearch] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [mapCenter, setMapCenter] = useState([21.02, 105.85]); 
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        if (user) fetchFavorites();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(p => getWeatherByCoords(p.coords.latitude, p.coords.longitude));
        }
    }, [user]);

    useEffect(() => {
        if (weatherData && weatherData.forecast.length > 0) {
            setSelectedDate(weatherData.forecast[0].date);
        }
    }, [weatherData]);

    

    const handleSearch = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const resGeo = await api.get(`search-city/?city=${citySearch}`);
            if (resGeo.data.length > 0) getWeatherByCoords(resGeo.data[0].latitude, resGeo.data[0].longitude, resGeo.data[0].name, resGeo.data[0].country);
            else alert("No results found!");
        } catch { alert("Something went wrong!"); } setLoading(false);
    };

    const getWeatherByCoords = async (lat, lon, name="Your location", country="") => {
        try {
            const res = await api.get(`weather/?lat=${lat}&lon=${lon}`);
            setWeatherData({ ...res.data, city_name: name, country: country, lat: lat, lon: lon });
            setMapCenter([lat, lon]);
        } catch { console.error("Err"); }
    };
    
    

    const getHourlyForSelectedDate = () => {
        if (!weatherData || !weatherData.hourly || !selectedDate) return [];
        return weatherData.hourly.filter(h => h.full_time.startsWith(selectedDate));
    };
    const hourlyDisplay = getHourlyForSelectedDate();

    return (
        <div className="dashboard-container">
            <style>{styles}</style>
            <header className="dashboard-header">
                <div className="search-wrap">
                    <form className="search-bar" onSubmit={handleSearch}>
                        <button disabled={loading}>🔍</button>
                        <input type="text" placeholder="Search city..." value={citySearch} onChange={e=>setCitySearch(e.target.value)} />
                    </form>
                </div>
                <div className="auth-section">
                    {user ? <><span style={{fontWeight:'bold'}}>{user.username}</span><button onClick={logoutUser} className="logout-btn">Out</button></> 
                          : <><Link to="/login" className="auth-link">Login</Link><Link to="/register" className="auth-link">Reg</Link></>}
                </div>
            </header>

            {weatherData ? (
                <>
                    <div className="main-grid">
                        <div className="weather-main-card">
                            <div className="weather-header">
                                <div><h2>📍 {weatherData.city_name}</h2><p>{weatherData.country}</p></div>
                                
                                {/* save button*/}
                                <button onClick={addToFavorites} className="save-btn">
                                    ❤️ Save location
                                </button>
                            </div>
                            <div className="temp-section">
                                <img src={getWeatherIcon(weatherData.current.weathercode)} width="100" alt="icon"/>
                                <div className="temp-details">
                                    <span className="temp-number">{weatherData.current.temperature}°</span>
                                    <div style={{fontSize:'20px'}}>{getWeatherStatus(weatherData.current.weathercode)}</div>
                                </div>
                            </div>
                            <div className="metrics-row">
                                <div className="metric-item"><div style={{fontSize:12}}>Wind</div><div className="metric-value">{weatherData.current.windspeed} km/h</div></div>
                                <div className="metric-item"><div style={{fontSize:12}}>Humidity</div><div className="metric-value">{weatherData.current.humidity}%</div></div>
                                <div className="metric-item"><div style={{fontSize:12}}>Pressure</div><div className="metric-value">{weatherData.current.pressure} hPa</div></div>
                                <div className="metric-item"><div style={{fontSize:12}}>Precipitation</div><div className="metric-value">{weatherData.current.precipitation} mm</div></div>
                            </div>
                        </div>
                        <div className="map-card">
                            <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                <ChangeView center={mapCenter} />
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={mapCenter}><Popup>{weatherData.city_name}</Popup></Marker>
                            </MapContainer>
                        </div>
                    </div>

                    <div className="forecast-section">
                        <h3 style={{marginBottom:15}}>📅 Forecast 7 days </h3>
                        <div className="forecast-row">
                            {weatherData.forecast.map((day, index) => (
                                <div 
                                    key={index} 
                                    className={`forecast-item ${selectedDate === day.date ? 'active' : ''}`}
                                    onClick={() => setSelectedDate(day.date)}
                                >
                                    <span style={{fontWeight:'bold'}}>{formatDate(day.date)}</span>
                                    <img src={getWeatherIcon(day.weathercode || 3)} width="40" style={{margin:'10px 0'}} alt="d"/>
                                    <b>{day.max_temp}°</b>
                                    <span style={{fontSize:12, opacity:0.7}}>{day.min_temp}°</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {hourlyDisplay.length > 0 && (
                        <div className="hourly-section">
                            <div className="hourly-header">
                                <h3> Forecast 24 hours {formatDate(selectedDate)}</h3>
                            </div>
                            <div className="hourly-scroll">
                                <div className="grid-line" style={{bottom: '50px'}}></div>
                                <div className="grid-line" style={{bottom: '100px'}}></div>
                                {hourlyDisplay.map((h, index) => {
                                    const heightOffset = (h.temp * 3) + 'px'; 
                                    return (
                                        <div key={index} className="hour-item">
                                            <div className="chart-bar" style={{marginBottom: heightOffset}}>
                                                <span style={{fontSize:11, opacity:0.8}}>{h.rain > 0 ? `${h.rain}mm` : ''}</span>
                                                <img src={getWeatherIcon(h.code)} width="30" alt="i"/>
                                                <span style={{fontWeight:'bold', fontSize:16}}>{h.temp}°</span>
                                            </div>
                                            <div style={{fontSize:12, marginTop: 10, opacity:0.6, borderTop:'1px solid rgba(255,255,255,0.1)', width:'100%', paddingTop:5}}>
                                                {h.time}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div style={{textAlign:'center', marginTop: 80, opacity: 0.6}}><h2>Enter city name...</h2></div>
            )}

        </div>
    );
};

export default HomePage;