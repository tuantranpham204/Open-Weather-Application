// src/components/Sidebar.js
import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    Home, Map, Calendar, Activity, BarChart2, User, Navigation, ChevronLeft, ChevronRight 
} from 'lucide-react'; // Cài thư viện: npm install lucide-react
import { PreferencesContext } from '../context/PreferencesContext';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { t } = useContext(PreferencesContext);

    const menuItems = [
        { path: "/", name: t('nav.today'), icon: <Home size={20} /> },
        { path: "/forecast", name: t('nav.forecast'), icon: <Calendar size={20} /> },
        { path: "/map", name: t('nav.map'), icon: <Map size={20} /> },
        { path: "/sports", name: t('nav.sports'), icon: <Activity size={20} /> },
        { path: "/climate", name: t('nav.climate'), icon: <BarChart2 size={20} /> },
        { path: "/route", name: t('nav.route'), icon: <Navigation size={20} /> },
        { path: "/account", name: t('nav.account'), icon: <User size={20} /> },
    ];

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            <div className="sidebar-header">
                <div className="logo-icon">MB</div>
                {!isCollapsed && <span className="logo-text">MeteoApp</span>}
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                    <NavLink key={index} to={item.path} className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
                        {item.icon}
                        {!isCollapsed && <span>{item.name}</span>}
                    </NavLink>
                ))}
            </nav>

            <button className="toggle-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ? <ChevronRight /> : <><ChevronLeft /> {t('common.collapse')}</>}
            </button>
        </aside>
    );
};
export default Sidebar;