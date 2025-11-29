// src/pages/WeatherMap.js
import React, { useContext } from 'react';
import { WeatherContext } from '../context/WeatherContext';

const WeatherMap = () => {
    const { mapCenter } = useContext(WeatherContext);

    return (
        <div className="map-page" style={{ height: '100%', borderRadius: '20px', overflow: 'hidden' }}>
            <iframe 
                width="100%" 
                height="800px" 
                src={`https://embed.windy.com/embed2.html?lat=${mapCenter[0]}&lon=${mapCenter[1]}&detailLat=${mapCenter[0]}&detailLon=${mapCenter[1]}&width=650&height=450&zoom=10&level=surface&overlay=wind&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
                frameBorder="0"
                title="Windy Map"
            ></iframe>
        </div>
    );
};
export default WeatherMap;