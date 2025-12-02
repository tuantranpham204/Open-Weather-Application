# backend/weather_api/urls.py

from django.urls import path
from .views import (
    SearchCityView, 
    WeatherDataView, 
    RegisterView, 
    FavoriteLocationView, 
    FavoriteLocationDetailView,
    WeatherChatbotView,
    UserProfileView,
    ChangePasswordView,
    UserPreferencesView,
    climate_data
)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # 1. Auth: Sign in & Log in 
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),       
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),

    # 2. Search weather
    path('search-city/', SearchCityView.as_view(), name='search-city'),
    path('weather/', WeatherDataView.as_view(), name='weather-data'),

    # 3. Favorite location: view/ edit/ delete
    path('favorites/', FavoriteLocationView.as_view(), name='favorites-list'),
    path('favorites/<int:pk>/', FavoriteLocationDetailView.as_view(), name='favorites-detail'), 
    
    # 4. Chatbot
    path('chatbot/', WeatherChatbotView.as_view(), name='weather-chatbot'),
    
    # 5. User Profile & Password
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('preferences/', UserPreferencesView.as_view(), name='user-preferences'),
    # 6. Climate Normals
    path('climate-history/', climate_data, name='climate-history'),
]