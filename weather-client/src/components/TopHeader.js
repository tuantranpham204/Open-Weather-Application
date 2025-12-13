import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, LogOut, Thermometer } from 'lucide-react';
import { WeatherContext } from '../context/WeatherContext';
import { PreferencesContext } from '../context/PreferencesContext';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';

const TopHeader = () => {
    const { citySearch, setCitySearch, handleSearch, loading, getWeatherByCoords } = useContext(WeatherContext);
    const { preferences, updatePreferences, t } = useContext(PreferencesContext);
    const authContext = useContext(AuthContext);
    const user = authContext ? authContext.user : null;
    const logoutUser = authContext ? authContext.logoutUser : () => {};

    // Autocomplete state
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    
    // Refs
    const searchRef = useRef(null);
    const debounceTimer = useRef(null);

    // Fetch suggestions with debouncing
    const fetchSuggestions = async (query) => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        setIsLoadingSuggestions(true);
        try {
            const response = await api.get(`search-city/?city=${encodeURIComponent(query)}&autocomplete=true`);
            setSuggestions(response.data.suggestions || []);
            setShowDropdown((response.data.suggestions || []).length > 0);
            setSelectedIndex(-1);
        } catch (error) {
            console.error('Autocomplete error:', error);
            setSuggestions([]);
            setShowDropdown(false);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    // Debounced input handler
    const handleInputChange = (e) => {
        const value = e.target.value;
        setCitySearch(value);

        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer (300ms debounce)
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    // Select suggestion
    const selectSuggestion = (suggestion) => {
        setCitySearch(suggestion.name);
        getWeatherByCoords(suggestion.latitude, suggestion.longitude, suggestion.name, suggestion.country);
        setSuggestions([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!showDropdown) {
            if (e.key === 'Enter') {
                handleSearch(e);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    selectSuggestion(suggestions[selectedIndex]);
                } else {
                    handleSearch(e);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    // Highlight matched text
    const highlightMatch = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) => 
            regex.test(part) ? <strong key={i} style={{fontWeight: 700}}>{part}</strong> : part
        );
    };

    return (
        <header className="top-header">
            {/* Search bar with autocomplete */}
            <div className="header-search-container" ref={searchRef}>
                <form className="header-search-bar" onSubmit={handleSearch}>
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        placeholder={t('header.search')} 
                        value={citySearch} 
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        autoComplete="off"
                        role="combobox"
                        aria-expanded={showDropdown}
                        aria-autocomplete="list"
                        aria-controls="search-suggestions"
                        aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
                    />
                    {isLoadingSuggestions && (
                        <div className="autocomplete-loading">
                            <div className="spinner"></div>
                        </div>
                    )}
                </form>

                {/* Suggestions dropdown */}
                {showDropdown && suggestions.length > 0 && (
                    <ul 
                        className="autocomplete-dropdown"
                        role="listbox"
                        id="search-suggestions"
                    >
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={`${suggestion.id}-${index}`}
                                id={`suggestion-${index}`}
                                className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                                role="option"
                                aria-selected={index === selectedIndex}
                                onClick={() => selectSuggestion(suggestion)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className="suggestion-main">
                                    <span className="suggestion-name">
                                        {highlightMatch(suggestion.name, citySearch)}
                                    </span>
                                    <span className="suggestion-meta">
                                        {[suggestion.admin1, suggestion.country].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                                <span className="suggestion-type">📍</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Auth section */}
            <div className="header-auth">
                {/* Language Toggle */}
                <button 
                    className="temp-unit-toggle"
                    onClick={() => {
                        const newLang = preferences.language === 'vi' ? 'en' : 'vi';
                        updatePreferences({ language: newLang });
                        // Save to backend
                        if (user) {
                            api.put('preferences/', { ...preferences, language: newLang }).catch(console.error);
                        }
                    }}
                    title={`${t('header.currentLanguage')}: ${preferences.language === 'vi' ? 'Tiếng Việt' : 'English'}. Click ${t('common.toSwitch')}`}
                >
                    <span style={{fontSize: '14px', fontWeight: 600}}>{preferences.language === 'vi' ? '🇻🇳' : '🇬🇧'}</span>
                    <span>{preferences.language.toUpperCase()}</span>
                </button>

                {/* Temperature Unit Toggle */}
                <button 
                    className="temp-unit-toggle"
                    onClick={() => {
                        const newUnit = preferences.temperature_unit === 'C' ? 'F' : 'C';
                        updatePreferences({ temperature_unit: newUnit });
                        // Save to backend
                        if (user) {
                            api.put('preferences/', { ...preferences, temperature_unit: newUnit }).catch(console.error);
                        }
                    }}
                    title={`${t('header.currentUnit')}: ${preferences.temperature_unit === 'C' ? 'Celsius' : 'Fahrenheit'}. Click ${t('common.toSwitch')}`}
                >
                    <Thermometer size={18} />
                    <span>°{preferences.temperature_unit}</span>
                </button>

                {user ? (
                    <div className="user-info">
                        <span className="user-name"><User size={18}/> {user.username}</span>
                        <button onClick={logoutUser} className="btn-auth logout">
                            <LogOut size={18} /> {t('header.logout')}
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="btn-auth login">{t('header.login')}</Link>
                        <Link to="/register" className="btn-auth register">{t('header.register')}</Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default TopHeader;