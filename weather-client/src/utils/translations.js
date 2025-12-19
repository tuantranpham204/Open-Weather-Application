// Translation dictionary for Vietnamese and English
export const translations = {
    vi: {
        // Navigation
        nav: {
            today: 'Hôm nay',
            forecast: 'Dự báo',
            map: 'Bản đồ',
            climate: 'Khí hậu',
            route: 'Lộ trình',
            sports: 'Thể thao',
            account: 'Quản lý tài khoản'
        },
        
        // Header
        header: {
            search: 'Tìm kiếm địa điểm...',
            login: 'Đăng nhập',
            register: 'Đăng ký',
            logout: 'Đăng xuất',
            tempUnit: 'Đơn vị nhiệt độ',
            currentLanguage: 'Ngôn ngữ hiện tại',
            currentUnit: 'Đang dùng'
        },
        
        // Weather Status
        weather: {
            clear: 'Quang đãng',
            cloudy: 'Nhiều mây',
            overcast: 'U ám',
            fog: 'Sương mù',
            drizzle: 'Mưa phùn',
            rain: 'Mưa',
            snow: 'Tuyết',
            thunderstorm: 'Dông',
            today: 'Hôm nay',
            monday: 'Thứ Hai',
            tuesday: 'Thứ Ba',
            wednesday: 'Thứ Tư',
            thursday: 'Thứ Năm',
            friday: 'Thứ Sáu',
            saturday: 'Thứ Bảy',
            sunday: 'Chủ Nhật'
        },
        
        // Today Weather
        today: {
            title: 'MeteoApp Weather',
            favorites: 'Địa điểm yêu thích',
            addFavorite: 'Lưu địa điểm',
            forecastLink: 'Xem dự báo 14 ngày',
            temperature: 'Nhiệt độ',
            feelsLike: 'Cảm nhận',
            wind: 'Gió',
            humidity: 'Độ ẩm',
            uvIndex: 'UV Index',
            visibility: 'Tầm nhìn',
            dewPoint: 'Điểm sương',
            sunrise: 'Bình minh',
            sunset: 'Hoàng hôn',
            precipitation: 'Lượng mưa',
            pressure: 'Áp suất'
        },
        
        // Forecast Page
        forecast: {
            title: 'Dự báo 14 ngày tại',
            backToHome: 'Quay lại Trang chủ',
            loading: 'Đang tải dữ liệu...',
            noData: 'Không có dữ liệu chi tiết từng giờ cho ngày này.',
            detailTitle: 'Diễn biến chi tiết',
            high: 'Cao nhất',
            low: 'Thấp nhất'
        },
        
        // Account Page
        account: {
            profile: 'Thông tin cá nhân',
            password: 'Đổi mật khẩu',
            favorites: 'Yêu thích',
            settings: 'Cài đặt',
            security: 'Bảo mật',
            
            // Profile section
            username: 'Tên đăng nhập',
            email: 'Email',
            firstName: 'Tên',
            lastName: 'Họ',
            saveChanges: 'Lưu thay đổi',
            saving: 'Đang lưu...',
            
            // Password section
            currentPassword: 'Mật khẩu hiện tại',
            newPassword: 'Mật khẩu mới (tối thiểu 8 ký tự)',
            confirmPassword: 'Xác nhận mật khẩu mới',
            changePassword: 'Đổi mật khẩu',
            processing: 'Đang xử lý...',
            
            // Favorites section
            noFavorites: 'Chưa có địa điểm yêu thích nào',
            addFromHome: 'Thêm địa điểm yêu thích từ trang chủ',
            
            // Settings section
            appSettings: 'Cài đặt ứng dụng',
            temperatureUnit: 'Đơn vị nhiệt độ',
            celsius: 'Celsius (°C)',
            fahrenheit: 'Fahrenheit (°F)',
            language: 'Ngôn ngữ',
            vietnamese: 'Tiếng Việt',
            english: 'English',
            theme: 'Giao diện',
            light: 'Sáng',
            dark: 'Tối',
            auto: 'Tự động',
            emailNotifications: 'Thông báo qua Email',
            severeWeatherAlerts: 'Cảnh báo thời tiết nguy hiểm',
            dailySummary: 'Tóm tắt thời tiết hàng ngày',
            saveSettings: 'Lưu cài đặt',
            
            // Security section
            securityPrivacy: 'Bảo mật & Quyền riêng tư',
            logoutAll: 'Đăng xuất tất cả thiết bị',
            logoutAllDesc: 'Đăng xuất khỏi tất cả phiên làm việc trên các thiết bị khác',
            deleteAccount: 'Xóa tài khoản',
            deleteAccountDesc: 'Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu liên quan',
            
            // Messages
            updateSuccess: '✓ Cập nhật thành công!',
            updateFailed: '✗ Cập nhật thất bại',
            passwordMismatch: '✗ Mật khẩu xác nhận không khớp!',
            passwordTooShort: '✗ Mật khẩu mới phải có ít nhất 8 ký tự!',
            passwordChangeSuccess: '✓ Đổi mật khẩu thành công!',
            settingsUpdateSuccess: '✓ Cập nhật cài đặt thành công!',
            pleaseLogin: 'Vui lòng đăng nhập để truy cập trang này',
            noEmail: 'Chưa có email',
            firstNamePlaceholder: 'Văn A',
            lastNamePlaceholder: 'Nguyễn',
            deleteAccountConfirm: 'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!',
            deleteAccountFinalConfirm: 'XÁC NHẬN LẦN CUỐI: Tất cả dữ liệu sẽ bị xóa vĩnh viễn!'
        },
        
        // Health & Activity
        health: {
            title: 'Sức khỏe & Hoạt động',
            indices: 'Các chỉ số',
            uvIndex: 'Chỉ số UV',
            airQuality: 'Chất lượng không khí (AQI)',
            pm25: 'Bụi mịn (PM2.5)',
            activities: 'Hoạt động ngoài trời',
            low: 'Thấp',
            moderate: 'Trung bình',
            high: 'Cao',
            veryHigh: 'Rất cao',
            extreme: 'Cực cao',
            good: 'Tốt',
            fair: 'Khá',
            poor: 'Kém',
            veryPoor: 'Rất kém'
        },
        
        // Common
        common: {
            loading: 'Đang tải...',
            error: 'Lỗi',
            success: 'Thành công',
            cancel: 'Hủy',
            confirm: 'Xác nhận',
            close: 'Đóng',
            save: 'Lưu',
            delete: 'Xóa',
            edit: 'Sửa',
            search: 'Tìm kiếm',
            noResults: 'Không có kết quả',
            vietnam: 'Việt Nam',
            developing: 'Đang phát triển',
            collapse: 'Thu gọn',
            toSwitch: 'để chuyển'
        }
    },
    
    en: {
        // Navigation
        nav: {
            today: 'Today',
            forecast: 'Forecast',
            map: 'Map',
            climate: 'Climate',
            route: 'Route',
            sports: 'Sports',
            account: 'Account'
        },
        
        // Header
        header: {
            search: 'Search location...',
            login: 'Login',
            register: 'Register',
            logout: 'Logout',
            tempUnit: 'Temperature unit',
            currentLanguage: 'Current language',
            currentUnit: 'Using'
        },
        
        // Weather Status
        weather: {
            clear: 'Clear',
            cloudy: 'Cloudy',
            overcast: 'Overcast',
            fog: 'Fog',
            drizzle: 'Drizzle',
            rain: 'Rain',
            snow: 'Snow',
            thunderstorm: 'Thunderstorm',
            today: 'Today',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
            sunday: 'Sunday'
        },
        
        // Today Weather
        today: {
            title: 'MeteoApp Weather',
            favorites: 'Favorite Locations',
            addFavorite: 'Save Location',
            forecastLink: 'View 14-day forecast',
            temperature: 'Temperature',
            feelsLike: 'Feels like',
            wind: 'Wind',
            humidity: 'Humidity',
            uvIndex: 'UV Index',
            visibility: 'Visibility',
            dewPoint: 'Dew Point',
            sunrise: 'Sunrise',
            sunset: 'Sunset',
            precipitation: 'Precipitation',
            pressure: 'Pressure'
        },
        
        // Forecast Page
        forecast: {
            title: '14-Day Forecast for',
            backToHome: 'Back to Home',
            loading: 'Loading data...',
            noData: 'No hourly data available for this day.',
            detailTitle: 'Detailed Breakdown',
            high: 'High',
            low: 'Low'
        },
        
        // Account Page
        account: {
            profile: 'Personal Information',
            password: 'Change Password',
            favorites: 'Favorites',
            settings: 'Settings',
            security: 'Security',
            
            // Profile section
            username: 'Username',
            email: 'Email',
            firstName: 'First Name',
            lastName: 'Last Name',
            saveChanges: 'Save Changes',
            saving: 'Saving...',
            
            // Password section
            currentPassword: 'Current Password',
            newPassword: 'New Password (min 8 characters)',
            confirmPassword: 'Confirm New Password',
            changePassword: 'Change Password',
            processing: 'Processing...',
            
            // Favorites section
            noFavorites: 'No favorite locations yet',
            addFromHome: 'Add favorite locations from homepage',
            
            // Settings section
            appSettings: 'Application Settings',
            temperatureUnit: 'Temperature Unit',
            celsius: 'Celsius (°C)',
            fahrenheit: 'Fahrenheit (°F)',
            language: 'Language',
            vietnamese: 'Tiếng Việt',
            english: 'English',
            theme: 'Theme',
            light: 'Light',
            dark: 'Dark',
            auto: 'Auto',
            emailNotifications: 'Email Notifications',
            severeWeatherAlerts: 'Severe Weather Alerts',
            dailySummary: 'Daily Weather Summary',
            saveSettings: 'Save Settings',
            
            // Security section
            securityPrivacy: 'Security & Privacy',
            logoutAll: 'Logout All Devices',
            logoutAllDesc: 'Logout from all sessions on other devices',
            deleteAccount: 'Delete Account',
            deleteAccountDesc: 'Permanently delete account and all related data',
            
            // Messages
            updateSuccess: '✓ Updated successfully!',
            updateFailed: '✗ Update failed',
            passwordMismatch: '✗ Password confirmation does not match!',
            passwordTooShort: '✗ New password must be at least 8 characters!',
            passwordChangeSuccess: '✓ Password changed successfully!',
            settingsUpdateSuccess: '✓ Settings updated successfully!',
            pleaseLogin: 'Please login to access this page',
            noEmail: 'No email yet',
            firstNamePlaceholder: 'John',
            lastNamePlaceholder: 'Doe',
            deleteAccountConfirm: 'Are you sure you want to delete your account? This action cannot be undone!',
            deleteAccountFinalConfirm: 'FINAL CONFIRMATION: All data will be permanently deleted!'
        },
        
        // Health & Activity
        health: {
            title: 'Health & Activity',
            indices: 'Indices',
            uvIndex: 'UV Index',
            airQuality: 'Air Quality (AQI)',
            pm25: 'PM2.5',
            activities: 'Outdoor Activities',
            low: 'Low',
            moderate: 'Moderate',
            high: 'High',
            veryHigh: 'Very High',
            extreme: 'Extreme',
            good: 'Good',
            fair: 'Fair',
            poor: 'Poor',
            veryPoor: 'Very Poor'
        },
        
        // Common
        common: {
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            cancel: 'Cancel',
            confirm: 'Confirm',
            close: 'Close',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            search: 'Search',
            noResults: 'No results',
            vietnam: 'Vietnam',
            developing: 'Under Development',
            collapse: 'Collapse',
            toSwitch: 'to switch'
        }
    }
};

// Helper function to get translation
export const getTranslation = (language, key) => {
    const lang = language === 'en' ? 'en' : 'vi';
    const keys = key.split('.');
    let result = translations[lang];
    
    for (const k of keys) {
        if (result && result[k] !== undefined) {
            result = result[k];
        } else {
            return key; // Return key if translation not found
        }
    }
    
    return result;
};
