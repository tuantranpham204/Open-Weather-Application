import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 1. Import Contexts
import {AuthProvider} from './context/AuthContext';
import { WeatherProvider } from './context/WeatherContext';
import { PreferencesProvider } from './context/PreferencesContext';

// 2. Import Layout
import Layout from './components/Layout';

// 3. Import Styles
import './App.css';

// 4. Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodayWeather from './pages/TodayWeather';
import WeatherMap from './pages/WeatherMap';
import ClimatePage from './pages/ClimatePage';
import ForecastPage from './pages/ForecastPage';
import HealthActivity from './pages/HealthActivity';
import AccountPage from './pages/AccountPage';


const RouteForecastPlaceholder = () => <div style={{padding: 20}}>Dự báo lộ trình (Đang xây dựng)</div>;

function App() {
  return (
   
      <AuthProvider>
        <PreferencesProvider>
          <WeatherProvider>
            <Routes>
            {/* --- CÁC TRANG CÓ SIDEBAR (LAYOUT) --- */}
            <Route path="/" element={<Layout />}>
              <Route index element={<TodayWeather />} />
              <Route path="map" element={<WeatherMap />} />
              
              <Route path="route" element={ <RouteForecastPlaceholder /> } />
              <Route path="forecast" element={<ForecastPage />} />
              <Route path="sports" element={<HealthActivity/>} />
              <Route path="account" element={<AccountPage />} />
              <Route path="climate" element={<ClimatePage />} />
            </Route>

            {/* --- CÁC TRANG KHÔNG CÓ SIDEBAR (FULL SCREEN) --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
          </Routes>
          </WeatherProvider>
        </PreferencesProvider>
      </AuthProvider>
  
  );
}

export default App;