import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { WeatherContext } from '../context/WeatherContext';
import { PreferencesContext } from '../context/PreferencesContext';
import api from '../utils/api';
import { User, Lock, Star, Settings, Shield, Mail, Save, Eye, EyeOff, Trash2, MapPin, Sun, Moon, Globe, Bell, X } from 'lucide-react';

const AccountPage = () => {
    const navigate = useNavigate();
    const { user, logoutUser } = useContext(AuthContext);
    const { favorites, fetchFavorites, removeFavorite, getWeatherByCoords } = useContext(WeatherContext);
    const { preferences: globalPreferences, updatePreferences: updateGlobalPreferences, loadPreferences: loadGlobalPreferences, formatTemperature, getTemperatureUnit, t } = useContext(PreferencesContext);
    
    // Profile state
    const [profile, setProfile] = useState({ email: '', first_name: '', last_name: '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    
    // Password state
    const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');
    
    // Preferences state
    const [preferences, setPreferences] = useState({
        temperature_unit: 'C',
        language: 'vi',
        theme: 'light',
        email_notifications: true,
        severe_weather_alerts: true,
        daily_summary: false
    });
    const [preferencesLoading, setPreferencesLoading] = useState(false);
    const [preferencesMessage, setPreferencesMessage] = useState('');
    
    // Active section
    const [activeSection, setActiveSection] = useState('profile');

    // Load data on mount
    useEffect(() => {
        if (user) {
            loadProfile();
            loadPreferences();
            if (fetchFavorites) fetchFavorites();
        }
    }, [user]);

    // Sync local state with global preferences
    useEffect(() => {
        setPreferences(globalPreferences);
    }, [globalPreferences]);

    const loadProfile = async () => {
        try {
            const res = await api.get('profile/');
            setProfile({
                email: res.data.email || '',
                first_name: res.data.first_name || '',
                last_name: res.data.last_name || ''
            });
        } catch (error) {
            console.error('Load profile error:', error);
            setProfileMessage(t('common.error'));
        }
    };

    const loadPreferences = async () => {
        try {
            // Load from global context instead
            await loadGlobalPreferences();
        } catch (error) {
            console.error('Load preferences error:', error);
            setPreferencesMessage(t('common.error'));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage('');
        try {
            const res = await api.put('profile/', profile);
            setProfileMessage(t('account.updateSuccess'));
            if (res.data.data) {
                setProfile({
                    email: res.data.data.email || '',
                    first_name: res.data.data.first_name || '',
                    last_name: res.data.data.last_name || ''
                });
            }
            setTimeout(() => setProfileMessage(''), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.email?.[0] || t('common.error');
            setProfileMessage(t('account.updateFailed') + ': ' + errorMsg);
        }
        setProfileLoading(false);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        
        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordMessage(t('account.passwordMismatch'));
            return;
        }
        
        if (passwordData.new_password.length < 8) {
            setPasswordMessage(t('account.passwordTooShort'));
            return;
        }
        
        setPasswordLoading(true);
        try {
            await api.post('change-password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
                confirm_password: passwordData.confirm_password
            });
            setPasswordMessage(t('account.passwordChangeSuccess'));
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            setShowPasswords({ old: false, new: false, confirm: false });
            setTimeout(() => setPasswordMessage(''), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.old_password?.[0] || t('account.updateFailed');
            setPasswordMessage('✗ ' + errorMsg);
        }
        setPasswordLoading(false);
    };

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault();
        setPreferencesLoading(true);
        setPreferencesMessage('');
        try {
            const res = await api.put('preferences/', preferences);
            setPreferencesMessage(t('account.settingsUpdateSuccess'));
            
            // Update global preferences immediately
            updateGlobalPreferences(preferences);
            
            if (res.data.data) {
                const updatedPrefs = {
                    temperature_unit: res.data.data.temperature_unit || 'C',
                    language: res.data.data.language || 'vi',
                    theme: res.data.data.theme || 'light',
                    email_notifications: res.data.data.email_notifications !== undefined ? res.data.data.email_notifications : true,
                    severe_weather_alerts: res.data.data.severe_weather_alerts !== undefined ? res.data.data.severe_weather_alerts : true,
                    daily_summary: res.data.data.daily_summary !== undefined ? res.data.data.daily_summary : false
                };
                setPreferences(updatedPrefs);
                updateGlobalPreferences(updatedPrefs);
            }
            setTimeout(() => setPreferencesMessage(''), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || t('account.updateFailed');
            setPreferencesMessage('✗ ' + errorMsg);
        }
        setPreferencesLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(t('account.deleteAccountConfirm') || 'Are you sure you want to delete your account? This action cannot be undone!')) return;
        if (!window.confirm(t('account.deleteAccountFinalConfirm') || 'FINAL CONFIRMATION: All data will be permanently deleted!')) return;
        
        try {
            // TODO: Implement delete account API endpoint
            alert(t('common.developing'));
        } catch (error) {
            alert(t('common.error'));
        }
    };

    const handleFavoriteClick = (fav) => {
        if (getWeatherByCoords) {
            getWeatherByCoords(fav.latitude, fav.longitude, fav.city_name, fav.country || '');
            navigate('/');
        }
    };

    if (!user) {
        return (
            <div className="full-page-background">
                <div className="full-page-overlay"></div>
                <div className="content-container" style={{textAlign: 'center', paddingTop: 150}}>
                    <h2 style={{color: '#fff'}}>{t('account.pleaseLogin')}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="full-page-background">
            <div className="full-page-overlay"></div>
            <div className="content-container account-page">
                
                {/* Header */}
                <div className="account-header">
                    <div className="account-avatar">
                        <User size={48} />
                    </div>
                    <div className="account-info">
                        <h1>{user.username}</h1>
                        <p>{profile.email || t('account.noEmail')}</p>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="account-tabs">
                    <button className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>
                        <User size={18} /> {t('account.profile')}
                    </button>
                    <button className={activeSection === 'password' ? 'active' : ''} onClick={() => setActiveSection('password')}>
                        <Lock size={18} /> {t('account.password')}
                    </button>
                    <button className={activeSection === 'favorites' ? 'active' : ''} onClick={() => setActiveSection('favorites')}>
                        <Star size={18} /> {t('account.favorites')} ({favorites.length})
                    </button>
                    <button className={activeSection === 'settings' ? 'active' : ''} onClick={() => setActiveSection('settings')}>
                        <Settings size={18} /> {t('account.settings')}
                    </button>
                    <button className={activeSection === 'security' ? 'active' : ''} onClick={() => setActiveSection('security')}>
                        <Shield size={18} /> {t('account.security')}
                    </button>
                </div>

                {/* Content Sections */}
                <div className="account-content">
                    
                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <div className="account-section">
                            <h2><User size={24} /> {t('account.profile')}</h2>
                            <form onSubmit={handleProfileUpdate}>
                                <div className="form-group">
                                    <label>{t('account.username')}</label>
                                    <input type="text" value={user.username} disabled />
                                </div>
                                <div className="form-group">
                                    <label><Mail size={16} /> {t('account.email')}</label>
                                    <input 
                                        type="email" 
                                        value={profile.email} 
                                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('account.lastName')}</label>
                                        <input 
                                            type="text" 
                                            value={profile.last_name} 
                                            onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                                            placeholder={t('account.lastNamePlaceholder')}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('account.firstName')}</label>
                                        <input 
                                            type="text" 
                                            value={profile.first_name} 
                                            onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                                            placeholder={t('account.firstNamePlaceholder')}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" disabled={profileLoading}>
                                    <Save size={18} /> {profileLoading ? t('account.saving') : t('account.saveChanges')}
                                </button>
                                {profileMessage && (
                                    <div className={`message ${profileMessage.startsWith('✓') ? 'success' : 'error'}`}>
                                        {profileMessage}
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Password Section */}
                    {activeSection === 'password' && (
                        <div className="account-section">
                            <h2><Lock size={24} /> {t('account.password')}</h2>
                            <form onSubmit={handlePasswordChange}>
                                <div className="form-group">
                                    <label>{t('account.currentPassword')}</label>
                                    <div className="password-input">
                                        <input 
                                            type={showPasswords.old ? 'text' : 'password'} 
                                            value={passwordData.old_password}
                                            onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPasswords({...showPasswords, old: !showPasswords.old})}>
                                            {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{t('account.newPassword')}</label>
                                    <div className="password-input">
                                        <input 
                                            type={showPasswords.new ? 'text' : 'password'} 
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                            minLength={8}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}>
                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>{t('account.confirmPassword')}</label>
                                    <div className="password-input">
                                        <input 
                                            type={showPasswords.confirm ? 'text' : 'password'} 
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}>
                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" disabled={passwordLoading}>
                                    <Lock size={18} /> {passwordLoading ? t('account.processing') : t('account.changePassword')}
                                </button>
                                {passwordMessage && (
                                    <div className={`message ${passwordMessage.startsWith('✓') ? 'success' : 'error'}`}>
                                        {passwordMessage}
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Favorites Section */}
                    {activeSection === 'favorites' && (
                        <div className="account-section">
                            <h2><Star size={24} /> {t('account.favorites')} ({favorites.length})</h2>
                            {favorites.length === 0 ? (
                                <div className="empty-state">
                                    <Star size={48} />
                                    <p>{t('account.noFavorites')}</p>
                                    <p style={{fontSize: '14px', opacity: 0.7}}>{t('account.addFromHome')}</p>
                                </div>
                            ) : (
                                <div className="favorites-grid">
                                    {favorites.map((fav) => (
                                        <div 
                                            key={fav.id} 
                                            className="favorite-card"
                                            onClick={() => handleFavoriteClick(fav)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <button className="btn-remove" onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (removeFavorite) removeFavorite(fav.id, e);
                                            }}>
                                                <X size={16} />
                                            </button>
                                            <MapPin size={20} color="#3182ce" />
                                            <h3>{fav.city_name}</h3>
                                            <p>{fav.country || 'Việt Nam'}</p>
                                            {fav.current_temp !== null && fav.current_temp !== undefined ? (
                                                <span className="temp">{formatTemperature(fav.current_temp)}{getTemperatureUnit()}</span>
                                            ) : (
                                                <span className="temp" style={{opacity: 0.5}}>--{getTemperatureUnit()}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Settings Section */}
                    {activeSection === 'settings' && (
                        <div className="account-section">
                            <h2><Settings size={24} /> {t('account.appSettings')}</h2>
                            <form onSubmit={handlePreferencesUpdate}>
                                <div className="form-group">
                                    <label><Sun size={16} /> {t('account.temperatureUnit')}</label>
                                    <select value={preferences.temperature_unit} onChange={(e) => setPreferences({...preferences, temperature_unit: e.target.value})}>
                                        <option value="C">{t('account.celsius')}</option>
                                        <option value="F">{t('account.fahrenheit')}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label><Globe size={16} /> {t('account.language')}</label>
                                    <select value={preferences.language} onChange={(e) => setPreferences({...preferences, language: e.target.value})}>
                                        <option value="vi">{t('account.vietnamese')}</option>
                                        <option value="en">{t('account.english')}</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label><Moon size={16} /> {t('account.theme')}</label>
                                    <select value={preferences.theme} onChange={(e) => setPreferences({...preferences, theme: e.target.value})}>
                                        <option value="light">{t('account.light')}</option>
                                        <option value="dark">{t('account.dark')}</option>
                                        <option value="auto">{t('account.auto')}</option>
                                    </select>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={preferences.email_notifications}
                                            onChange={(e) => setPreferences({...preferences, email_notifications: e.target.checked})}
                                        />
                                        <Bell size={16} /> {t('account.emailNotifications')}
                                    </label>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={preferences.severe_weather_alerts}
                                            onChange={(e) => setPreferences({...preferences, severe_weather_alerts: e.target.checked})}
                                        />
                                        <Bell size={16} /> {t('account.severeWeatherAlerts')}
                                    </label>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={preferences.daily_summary}
                                            onChange={(e) => setPreferences({...preferences, daily_summary: e.target.checked})}
                                        />
                                        <Bell size={16} /> {t('account.dailySummary')}
                                    </label>
                                </div>
                                <button type="submit" className="btn-primary" disabled={preferencesLoading}>
                                    <Save size={18} /> {preferencesLoading ? t('account.saving') : t('account.saveSettings')}
                                </button>
                                {preferencesMessage && (
                                    <div className={`message ${preferencesMessage.startsWith('✓') ? 'success' : 'error'}`}>
                                        {preferencesMessage}
                                    </div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Security Section */}
                    {activeSection === 'security' && (
                        <div className="account-section">
                            <h2><Shield size={24} /> {t('account.securityPrivacy')}</h2>
                            
                            <div className="security-item">
                                <div>
                                    <h3>{t('account.logoutAll')}</h3>
                                    <p>{t('account.logoutAllDesc')}</p>
                                </div>
                                <button className="btn-secondary" onClick={logoutUser}>
                                    {t('header.logout')}
                                </button>
                            </div>

                            <div className="security-item danger">
                                <div>
                                    <h3>{t('account.deleteAccount')}</h3>
                                    <p>{t('account.deleteAccountDesc')}</p>
                                </div>
                                <button className="btn-danger" onClick={handleDeleteAccount}>
                                    <Trash2 size={18} /> {t('account.deleteAccount')}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AccountPage;
