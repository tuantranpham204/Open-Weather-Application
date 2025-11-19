from django.urls import path
from .views import ( 
    RegisterView, 
    SearchCityView

)

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # 1. Auth: Sign in & Log in 
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),       
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('search-city/', SearchCityView.as_view(), name='search-city'), 
]