import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import AuthContext from './AuthContext';
import { getTranslation } from '../utils/translations';

export const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    
    const [preferences, setPreferences] = useState({
        temperature_unit: localStorage.getItem('temperature_unit') || 'C',
        language: localStorage.getItem('language') || 'vi',
        theme: localStorage.getItem('theme') || 'light',
        email_notifications: true,
        severe_weather_alerts: true,
        daily_summary: false
    });

    // Load preferences from backend when user logs in
    useEffect(() => {
        if (user) {
            loadPreferences();
        }
    }, [user]);

    const loadPreferences = async () => {
        try {
            const res = await api.get('preferences/');
            const prefs = {
                temperature_unit: res.data.temperature_unit || 'C',
                language: res.data.language || 'vi',
                theme: res.data.theme || 'light',
                email_notifications: res.data.email_notifications !== undefined ? res.data.email_notifications : true,
                severe_weather_alerts: res.data.severe_weather_alerts !== undefined ? res.data.severe_weather_alerts : true,
                daily_summary: res.data.daily_summary !== undefined ? res.data.daily_summary : false
            };
            setPreferences(prefs);
            
            // Save to localStorage for persistence
            localStorage.setItem('temperature_unit', prefs.temperature_unit);
            localStorage.setItem('language', prefs.language);
            localStorage.setItem('theme', prefs.theme);
        } catch (error) {
            console.error('Load preferences error:', error);
        }
    };

    const updatePreferences = (newPreferences) => {
        setPreferences(prev => ({ ...prev, ...newPreferences }));
        
        // Update localStorage immediately
        if (newPreferences.temperature_unit) {
            localStorage.setItem('temperature_unit', newPreferences.temperature_unit);
        }
        if (newPreferences.language) {
            localStorage.setItem('language', newPreferences.language);
        }
        if (newPreferences.theme) {
            localStorage.setItem('theme', newPreferences.theme);
        }
    };

    // Convert temperature based on unit preference
    const formatTemperature = (celsius) => {
        if (celsius === null || celsius === undefined) return '--';
        
        if (preferences.temperature_unit === 'F') {
            const fahrenheit = (celsius * 9/5) + 32;
            return Math.round(fahrenheit);
        }
        return Math.round(celsius);
    };

    const getTemperatureUnit = () => {
        return preferences.temperature_unit === 'F' ? '°F' : '°C';
    };

    // Translation helper
    const t = (key) => {
        return getTranslation(preferences.language, key);
    };

    return (
        <PreferencesContext.Provider value={{
            preferences,
            updatePreferences,
            loadPreferences,
            formatTemperature,
            getTemperatureUnit,
            t
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};
