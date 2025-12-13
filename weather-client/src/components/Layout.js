// src/components/Layout.js
import React, { useContext } from 'react'; 
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import TopHeader from './TopHeader';

// 1. Import Chatbot
import AiAssistant from './AiAssistant';

// 2. Import WeatherContext (Lưu ý: import trong ngoặc nhọn {})
import { WeatherContext } from '../context/WeatherContext';

const Layout = () => {
    // 3. Lấy weatherData từ Context
    const { weatherData } = useContext(WeatherContext);

    return (
        <div className="app-layout" style={{ position: 'relative' }}>
            <Sidebar />
            
            <main className="main-content">
                <TopHeader /> 
                
                <div className="page-content-wrapper">
                     <Outlet /> 
                </div> 
            </main>

            {/* --- 4. TRUYỀN DỮ LIỆU VÀO CHATBOT --- */}
            <AiAssistant 
                // Dùng optional chaining (?.) để không lỗi khi weatherData đang null (lúc mới mở app)
                lat={weatherData?.lat}
                lon={weatherData?.lon}
                city={weatherData?.city_name} // Trong Context bạn đặt tên là city_name
            />
        </div>
    );
};

export default Layout;