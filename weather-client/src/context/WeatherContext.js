import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
// Import AuthContext
import AuthContext from './AuthContext'; 

export const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
    // Lấy user từ AuthContext an toàn
    const authContext = useContext(AuthContext);
    const user = authContext ? authContext.user : null;
    
    const [citySearch, setCitySearch] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [mapCenter, setMapCenter] = useState([21.02, 105.85]); 
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    // Tự động lấy vị trí khi mở app
    useEffect(() => {
        if (navigator.geolocation && !weatherData) {
            navigator.geolocation.getCurrentPosition(
                (p) => getWeatherByCoords(p.coords.latitude, p.coords.longitude),
                () => console.log("User denied geolocation")
            );
        }
    }, []); 

    // Khi user đăng nhập thành công thì mới lấy danh sách yêu thích
    useEffect(() => {
        if (user) {
            fetchFavorites();
        } else {
            setFavorites([]); 
        }
    }, [user]);

    // Khi có dữ liệu thời tiết mới, chọn ngày đầu tiên làm mặc định
    useEffect(() => {
        if (weatherData && weatherData.forecast && weatherData.forecast.length > 0) {
            setSelectedDate(weatherData.forecast[0].date);
        }
    }, [weatherData]);

    // --- 1. LẤY THỜI TIẾT (GỌI BACKEND) ---
    const getWeatherByCoords = async (lat, lon, name="Vị trí đã chọn", country="") => {
        setLoading(true);
        try {
            // Gọi về Backend Django (file views.py bạn vừa sửa)
            const res = await api.get(`weather/?lat=${lat}&lon=${lon}`);
            
            setWeatherData({ 
                ...res.data, // Dữ liệu full từ backend (UV, Visibility...)
                city_name: name, 
                country: country, 
                lat: lat, 
                lon: lon 
            });
            setMapCenter([lat, lon]);

            // Cập nhật ngày hiển thị mặc định
            if(res.data.forecast && res.data.forecast.length > 0) {
                setSelectedDate(res.data.forecast[0].date);
            }

        } catch (err) { 
            console.error("Lỗi lấy thời tiết:", err); 
            alert("Không thể tải dữ liệu thời tiết. Vui lòng thử lại.");
        }
        setLoading(false);
    };

    const handleSearch = async (e) => {
        if(e) e.preventDefault();
        if(!citySearch) return;
        
        setLoading(true);
        try {
            const resGeo = await api.get(`search-city/?city=${citySearch}`);
            if (resGeo.data.length > 0) {
                const { latitude, longitude, name, country } = resGeo.data[0];
                getWeatherByCoords(latitude, longitude, name, country);
                setCitySearch(''); 
            } else {
                alert("Không tìm thấy địa điểm này!");
            }
        } catch { alert("Lỗi kết nối tìm kiếm!"); } 
        setLoading(false);
    };

    // --- 2. LẤY DANH SÁCH YÊU THÍCH (CẬP NHẬT QUAN TRỌNG) ---
    const fetchFavorites = async () => {
        if (!user) return;
        try {
            const res = await api.get('favorites/');
            
            // Dùng Promise.all để lấy dữ liệu thời tiết cho từng địa điểm yêu thích
            // Gọi qua Backend của bạn để đảm bảo cấu trúc dữ liệu đồng nhất
            const listWithTemp = await Promise.all(res.data.map(async (item) => {
                try {
                    // Gọi endpoint weather của Backend cho từng item
                    const w = await api.get(`weather/?lat=${item.latitude}&lon=${item.longitude}`);
                    
                    // Trích xuất dữ liệu cần thiết cho thẻ Card nhỏ
                    return { 
                        ...item, 
                        current_temp: w.data.current.temperature,          // Nhiệt độ
                        weathercode: w.data.current.weathercode,           // Icon thời tiết
                        real_feel: w.data.current.apparent_temperature     // Cảm giác thực (Mới thêm)
                    };
                } catch (err) {
                    console.error("Lỗi item favorite:", err);
                    return { ...item, current_temp: null };
                }
            }));
            setFavorites(listWithTemp);
        } catch (error) { console.error("Lỗi tải favorites:", error); }
    };

    const addToFavorites = async () => {
        if (!user) { alert("Bạn cần đăng nhập để lưu địa điểm!"); return; }
        if (!weatherData) return;
        try {
            await api.post('favorites/', { 
                city_name: weatherData.city_name, 
                latitude: weatherData.lat, 
                longitude: weatherData.lon 
            });
            alert(`Đã lưu "${weatherData.city_name}" vào yêu thích!`);
            fetchFavorites(); 
        } catch (error) { 
            if(error.response && error.response.status === 400) alert("Địa điểm này đã có trong danh sách!");
            else alert("Lỗi khi lưu địa điểm."); 
        }
    };

    const removeFavorite = async (id, e) => {
        if(e) e.stopPropagation(); 
        if(!window.confirm("Bạn có chắc muốn xóa địa điểm này?")) return;
        try {
            await api.delete(`favorites/${id}/`);
            fetchFavorites();
        } catch { alert("Lỗi khi xóa!"); }
    };

    return (
        <WeatherContext.Provider value={{
            weatherData, favorites, mapCenter, loading, selectedDate, setSelectedDate,
            citySearch, setCitySearch, 
            handleSearch, getWeatherByCoords, addToFavorites, removeFavorite, fetchFavorites
        }}>
            {children}
        </WeatherContext.Provider>
    );
};