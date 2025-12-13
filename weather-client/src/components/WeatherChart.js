// src/components/WeatherChart.js
import React, { useContext } from 'react';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { getWeatherIcon } from '../utils/helpers';
import { PreferencesContext } from '../context/PreferencesContext';

/**
 * Custom Dot: Giữ nguyên logic cũ hiển thị icon và text trên đỉnh đường biểu đồ
 */
const CustomizedDot = (props) => {
    const { cx, cy, payload, dataKey, stroke } = props;
    
    // Chỉ hiện icon và số nếu đang xem biểu đồ Nhiệt độ (temp)
    if (dataKey !== 'temp') return <circle cx={cx} cy={cy} r={4} stroke="none" fill={stroke} />;

    const code = payload.weathercode !== undefined ? payload.weathercode : 3; 
    const iconUrl = getWeatherIcon(code);
    return (
        <g>
            <foreignObject x={cx - 15} y={cy - 35} width={30} height={30}>
                <img src={iconUrl} alt="icon" style={{ width: '100%', height: '100%' }} />
            </foreignObject>
            <text x={cx} y={cy + 15} dy={4} textAnchor="middle" fill="#4a5568" fontSize={12} fontWeight="600">
                {Math.round(payload.temp)}°
            </text>
        </g>
    );
};

/**
 * CustomTooltip: Hiển thị hộp thông tin khi hover
 */
const CustomTooltip = ({ active, payload, label, unitLabel }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0,0,0,0.05)', 
                borderRadius: '12px',
                padding: '10px 15px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                color: '#333', 
                minWidth: '120px'
            }}>
                <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', marginBottom: 5 }}>{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ margin: 0, color: entry.color, fontSize: '13px', fontWeight: 500 }}>
                        {entry.name}: <b>{entry.value} {unitLabel}</b>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const WeatherChart = ({ data, dataKey = 'temp' }) => {
    const { getTemperatureUnit, t } = useContext(PreferencesContext);
    if (!data || data.length === 0) return <div style={{textAlign:'center', padding:20, color:'#fff'}}>{t('forecast.noData')}</div>;

    const tempUnit = getTemperatureUnit();
    const config = {
        temp:       { color: '#f59e0b', name: t('today.temperature'), unit: tempUnit },
        rain:       { color: '#3b82f6', name: t('today.precipitation'), unit: 'mm' },
        uv:         { color: '#e53e3e', name: t('today.uvIndex'), unit: '' },
        visibility: { color: '#10b981', name: t('today.visibility'), unit: 'km' },
        dewpoint:   { color: '#8b5cf6', name: t('today.dewPoint'), unit: tempUnit },
        pressure:   { color: '#6366f1', name: t('today.pressure'), unit: 'hPa' },
    };

    const currentConfig = config[dataKey] || config.temp;

    return (
        <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
                {/* SỬA LỖI TRỤC Y: 
                  - Thay margin left: -20 thành 5 để hiện trục Y.
                  - Thêm padding top để tránh icon bị cắt mất.
                */}
                <AreaChart data={data} margin={{ top: 40, right: 10, left: 5, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0}/>
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />

                    <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#718096', fontSize: 11}} 
                        dy={10}
                    />

                    {/* HIỆN TRỤC Y RÕ RÀNG: Đã thêm width={35} để đủ chỗ cho con số */}
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#718096', fontSize: 11}} 
                        width={35}
                        domain={['auto', 'auto']}
                    />

                    <Tooltip content={<CustomTooltip unitLabel={currentConfig.unit} />} />

                    <Area 
                        type="monotone" 
                        dataKey={dataKey} 
                        name={currentConfig.name}
                        stroke={currentConfig.color} 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={1500}
                        dot={<CustomizedDot dataKey={dataKey} stroke={currentConfig.color} />}
                        activeDot={{ r: 6 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeatherChart;