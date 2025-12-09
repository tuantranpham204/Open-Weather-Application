# backend/weather_api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import FavoriteLocation, UserPreferences, ClimateNormal

# 1. Serializer sign in
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) 

    class Meta:
        model = User
        fields = ['username', 'password', 'email']
    
    def create(self, validated_data):
    
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )
        return user

# 2. Serializer favorite location 
class FavoriteLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteLocation
        fields = ['id', 'city_name', 'latitude', 'longitude', 'added_on'] 
        read_only_fields = ['user']

# 3. User Profile Serializer
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['username']

# 4. Change Password Serializer
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Mật khẩu xác nhận không khớp."})
        return data

# 5. User Preferences Serializer
class UserPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreferences
        fields = ['temperature_unit', 'language', 'theme', 'email_notifications', 
                  'severe_weather_alerts', 'daily_summary']
class ClimateNormalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClimateNormal
        fields = ['day', 'month', 'max_avg', 'min_avg', 'max_record', 'min_record', 'rain_avg']