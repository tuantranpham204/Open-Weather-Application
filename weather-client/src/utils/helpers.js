// src/utils/helpers.js
import { getTranslation } from './translations';

export const getWeatherStatus = (code, language = 'vi') => {
    if (code === undefined) return "";
    
    // Map WMO codes to translation keys
    if (code === 0) return getTranslation(language, 'weather.clear');
    if (code <= 3) return getTranslation(language, 'weather.cloudy');
    if (code <= 48) return getTranslation(language, 'weather.fog');
    if (code <= 67) return getTranslation(language, 'weather.rain');
    if (code >= 95) return getTranslation(language, 'weather.thunderstorm');
    return getTranslation(language, 'weather.rain');
};

export const formatDate = (dateStr) => { 
    if(!dateStr) return ""; 
    const [y,m,d] = dateStr.split("-"); 
    return `${d}/${m}`; 
};

export const getDayName = (dateStr, language = 'vi') => {
    const date = new Date(dateStr);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
        return getTranslation(language, 'weather.today');
    }
    
    const dayNames = {
        vi: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    
    const lang = language === 'en' ? 'en' : 'vi';
    return dayNames[lang][date.getDay()];
};

export const getWeatherIcon = (code) => {
    if (code === 0) return "https://cdn-icons-png.flaticon.com/512/869/869869.png"; 
    if (code <= 3) return "https://cdn-icons-png.flaticon.com/512/1163/1163661.png";
    if (code <= 67) return "https://cdn-icons-png.flaticon.com/512/1163/1163627.png";
    return "https://cdn-icons-png.flaticon.com/512/1163/1163636.png";
};