import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { WeatherContext } from '../context/WeatherContext';
import {
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, LabelList
} from 'recharts';

const ClimatePage = () => {
    const { weatherData, mapCenter } = useContext(WeatherContext);

    const [climateData, setClimateData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let lat = 21.02;
                let lon = 105.83;

                if (mapCenter && mapCenter.length === 2) {
                    lat = mapCenter[0];
                    lon = mapCenter[1];
                } else if (weatherData) {
                    lat = weatherData.lat || 21.02;
                    lon = weatherData.lon || 105.83;
                }

                const cityName = weatherData?.city_name || weatherData?.location?.name || "Selected location";
                
                console.log(`ClimatePage calling API: ${cityName} [${lat}, ${lon}]`);

                const response = await axios.get(`http://127.0.0.1:8000/api/climate-history/?lat=${lat}&lon=${lon}`);
                const fullData = response.data;

                const today = new Date();
                const next6Days = [];
                for (let i = 0; i < 6; i++) {
                    const futureDate = new Date(today);
                    futureDate.setDate(today.getDate() + i);
                    next6Days.push({
                        day: futureDate.getDate(),
                        month: futureDate.getMonth() + 1
                    });
                }

                const filteredData = next6Days.map(targetDate => {
                    const record = fullData.find(item => item.day === targetDate.day && item.month === targetDate.month);
                    if (!record) return null;

                    const maxAvg = parseFloat(record.max_avg);
                    const minAvg = parseFloat(record.min_avg);
                    const rainAvg = parseFloat(record.rain_avg || 0);
                    const maxRecord = record.max_record ? parseFloat(record.max_record) : maxAvg + 5;
                    const minRecord = record.min_record ? parseFloat(record.min_record) : minAvg - 5;

                    return {
                        ...record,
                        dateLabel: `${record.day}/${record.month}`,
                        max_avg: maxAvg,
                        min_avg: minAvg,
                        rain_avg: rainAvg,
                        min_record_base: minRecord,
                        record_range_diff: maxRecord - minRecord
                    };
                }).filter(item => item !== null);

                setClimateData(filteredData);
            } catch (error) {
                console.error("Error fetching climate data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
    }, [weatherData, mapCenter]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const usefulData = payload.filter(p => p.dataKey !== 'min_record_base' && p.dataKey !== 'record_range_diff');
            return (
                <div style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#2d3748', fontWeight: 'bold', marginBottom: 5 }}>Date: {label}</p>
                    {usefulData.map((entry, index) => (
                        <p key={index} style={{ color: entry.stroke || entry.fill, margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                            {entry.name}: {entry.value?.toFixed(1)} {entry.unit}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) return <div style={{padding: 40, color: '#fff', textAlign: 'center'}}>Loading climate history...</div>;
    
    const displayName = weatherData?.city_name || weatherData?.location?.name || "Selected location";

    return (
        <div style={{ padding: '20px 40px', height: '100%', overflowY: 'auto' }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(15px)',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                maxWidth: '1200px',
                margin: '0 auto',
                border: '1px solid rgba(255,255,255,0.6)'
            }}>
                 <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '5px', color: '#2d3748' }}>
                        Climate history: {displayName}
                    </h2>
                    <p style={{ color: '#718096', fontSize: '1rem' }}>
                        6-day forecast compared to 30-year averages
                    </p>
                 </div>

                {climateData.length > 0 ? (
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '30px', marginBottom: '30px' }}>
                            {/* 1. MAX TEMP */}
                            <div style={{ flex: 1, minWidth: '350px', height: 320 }}>
                                <h4 style={{ textAlign: 'center', marginBottom: 15, color: '#dd6b20', fontWeight: 700 }}>Maximum temperature (°C)</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={climateData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="recordColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f6e05e" stopOpacity={0.6}/>
                                                <stop offset="95%" stopColor="#f6e05e" stopOpacity={0.2}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="dateLabel" stroke="#718096" interval={0} tickLine={false} style={{ fontSize: '0.85rem', fontWeight: 600 }} />
                                        <YAxis stroke="#718096" unit="°C" tickLine={false} domain={['dataMin - 3', 'dataMax + 3']} style={{ fontSize: '0.8rem' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="min_record_base" stackId="1" stroke="none" fill="transparent" />
                                        <Area type="monotone" dataKey="record_range_diff" stackId="1" stroke="none" fill="url(#recordColor)" name="Records" unit="°C" />
                                        <Line type="monotone" dataKey="max_avg" stroke="#dd6b20" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke:'#dd6b20' }} name="Avg max" unit="°C">
                                            <LabelList dataKey="max_avg" position="top" offset={10} style={{ fill: '#dd6b20', fontSize: '0.85rem', fontWeight: 800 }} />
                                        </Line>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                            {/* 2. MIN TEMP */}
                            <div style={{ flex: 1, minWidth: '350px', height: 320 }}>
                                <h4 style={{ textAlign: 'center', marginBottom: 15, color: '#3182ce', fontWeight: 700 }}>Minimum temperature (°C)</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={climateData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="dateLabel" stroke="#718096" interval={0} tickLine={false} style={{ fontSize: '0.85rem', fontWeight: 600 }} />
                                        <YAxis stroke="#718096" unit="°C" tickLine={false} domain={['dataMin - 3', 'dataMax + 3']} style={{ fontSize: '0.8rem' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="min_record_base" stackId="1" stroke="none" fill="transparent" />
                                        <Area type="monotone" dataKey="record_range_diff" stackId="1" stroke="none" fill="url(#recordColor)" name="Records" unit="°C" />
                                        <Line type="monotone" dataKey="min_avg" stroke="#3182ce" strokeWidth={4} dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke:'#3182ce' }} name="Avg min" unit="°C">
                                            <LabelList dataKey="min_avg" position="top" offset={10} style={{ fill: '#3182ce', fontSize: '0.85rem', fontWeight: 800 }} />
                                        </Line>
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div style={{ height: 1, backgroundColor: '#e2e8f0', width: '100%', marginBottom: '30px' }}></div>
                        <div style={{ height: 260 }}>
                            <h4 style={{ textAlign: 'center', marginBottom: 15, color: '#4299e1', fontWeight: 700 }}>Average precipitation (mm)</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={climateData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis dataKey="dateLabel" stroke="#718096" interval={0} tickLine={false} style={{ fontSize: '0.85rem', fontWeight: 600 }} />
                                    <YAxis stroke="#718096" unit="mm" tickLine={false} style={{ fontSize: '0.8rem' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="rain_avg" fill="#63b3ed" name="Avg rain" unit="mm" barSize={40} radius={[6, 6, 0, 0]}>
                                        <LabelList dataKey="rain_avg" position="top" style={{ fill: '#63b3ed', fontSize: '0.85rem', fontWeight: 'bold' }} formatter={(val) => val > 0 ? val : ''} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: 50, color: '#718096', fontSize: '1.2rem' }}>
                        No historical data found for this area ({weatherData?.lat || mapCenter?.[0] || '?'}, {weatherData?.lon || mapCenter?.[1] || '?'}).
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClimatePage;