# weather_api/models.py
from django.db import models
from django.contrib.auth.models import User

class FavoriteLocation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    city_name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    added_on = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'latitude', 'longitude')
    def __str__(self):
        return f"{self.user.username} - {self.city_name}"

class UserPreferences(models.Model):
    TEMP_CHOICES = [('C', 'Celsius'), ('F', 'Fahrenheit')]
    LANG_CHOICES = [('vi', 'Tiếng Việt'), ('en', 'English')]
    THEME_CHOICES = [('light', 'Light'), ('dark', 'Dark'), ('auto', 'Auto')]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preferences")
    temperature_unit = models.CharField(max_length=1, choices=TEMP_CHOICES, default='C')
    language = models.CharField(max_length=2, choices=LANG_CHOICES, default='vi')
    theme = models.CharField(max_length=5, choices=THEME_CHOICES, default='light')
    email_notifications = models.BooleanField(default=True)
    severe_weather_alerts = models.BooleanField(default=True)
    daily_summary = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'weather_api_userpreferences'
    
    def __str__(self):
        return f"{self.user.username} - Preferences"
    # weather_api/models.py

class ClimateNormal(models.Model):
    
    lat = models.FloatField()
    lon = models.FloatField()
    
   
    day = models.IntegerField()
    month = models.IntegerField()
    
    
    max_record = models.FloatField() 
    max_avg = models.FloatField()   
    min_avg = models.FloatField()   
    min_record = models.FloatField() 
    rain_avg = models.FloatField()   

    class Meta:
        
        indexes = [
            models.Index(fields=['lat', 'lon', 'month', 'day']),
        ]

    def __str__(self):
        return f"{self.lat},{self.lon} - {self.day}/{self.month}"