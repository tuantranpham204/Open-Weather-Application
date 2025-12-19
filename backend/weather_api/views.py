import requests
import json
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import FavoriteLocation, UserPreferences
from .serializers import FavoriteLocationSerializer, RegisterSerializer
from datetime import datetime

# API Gemini
GEMINI_API_KEY = "AIzaSyAl7RVOzAhJK4jq3nklB_S0G_0OUPN4Ei0"
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# URL API Open-Meteo
WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast'
GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'
AIR_QUALITY_API_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"

# 1. API SEARCH CITY (Enhanced with autocomplete support)
class SearchCityView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request, *args, **kwargs):
        city = request.query_params.get('city', None)
        if not city:
            return Response({"error": "Need city name."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Autocomplete mode: trigger only if query length >= 2
        autocomplete = request.query_params.get('autocomplete', 'false').lower() == 'true'
        if autocomplete and len(city.strip()) < 2:
            return Response({"suggestions": []}, status=status.HTTP_200_OK)
        
        # Determine result limit: 8 for autocomplete, 10 for full search
        result_limit = 8 if autocomplete else 10
        
        geo_params = {'name': city, 'count': result_limit, 'language': 'vi', 'format': 'json'}
        try:
            geo_response = requests.get(GEOCODING_API_URL, params=geo_params, timeout=3)
            geo_response.raise_for_status()
            geo_data = geo_response.json()

            if not geo_data.get('results'):
                # Return different response format based on mode
                if autocomplete:
                    return Response({"query": city, "suggestions": []}, status=status.HTTP_200_OK)
                return Response({"error": f"No result for'{city}'."}, status=status.HTTP_404_NOT_FOUND)
            
            locations = []
            for res in geo_data['results']:
                location_data = {
                    'id': res['id'],
                    'name': res.get('name', 'Unknown name'),
                    'country': res.get('country', ''),
                    'admin1': res.get('admin1', ''),
                    'latitude': res['latitude'],
                    'longitude': res['longitude'],
                }
                
                # Add autocomplete-specific fields
                if autocomplete:
                    location_data['type'] = 'city'
                    location_data['value'] = res.get('name', 'Unknown name')
                    # Calculate simple relevance score (prefix match boost)
                    query_lower = city.lower()
                    name_lower = location_data['name'].lower()
                    location_data['score'] = 100 if name_lower.startswith(query_lower) else 50
                
                locations.append(location_data)
            
            # Sort by score for autocomplete
            if autocomplete:
                locations.sort(key=lambda x: x['score'], reverse=True)
                return Response({"query": city, "suggestions": locations}, status=status.HTTP_200_OK)
            
            return Response(locations, status=status.HTTP_200_OK)

        except requests.exceptions.Timeout:
            return Response({"error": "Request timeout"}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except Exception as e:
            return Response({"error": f"Lỗi server: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# 2. API WEATHER Health Activity
class WeatherDataView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    # --- LOGIC health
    def analyze_health_activity(self, current):
        temp = current.get("temperature_2m", 0)
        humidity = current.get("relative_humidity_2m", 0)
        wind = current.get("windspeed_10m", 0)
        rain = current.get("precipitation", 0)
        pressure = current.get("pressure_msl", 1013)

        arthritis = 2 if (humidity > 75 or temp < 15) else 1 if humidity > 60 else 0
        sinus = 2 if pressure < 1000 else 1 if pressure < 1008 else 0
        flu = 2 if temp < 12 else 1 if temp < 18 else 0
        migraine = 2 if (pressure < 995 or temp > 35) else 1 if pressure < 1005 else 0
        asthma = 2 if humidity > 85 else 1 if humidity > 70 else 0

        fishing = 2 if rain == 0 and wind < 15 else 1 if rain < 1 else 0
        running = 2 if 18 <= temp <= 25 and rain == 0 else 1 if 15 <= temp <= 30 else 0
        golf = 2 if wind < 15 and rain == 0 else 1 if wind < 20 else 0
        bike = 2 if wind < 20 and rain == 0 else 1 if wind < 25 else 0
        beach = 2 if temp >= 28 and rain == 0 else 1 if temp >= 24 else 0
        drive = 2 if rain == 0 else 1 if rain < 2 else 0

        def map_health(level):
            if level == 2: return {"status": "Cao", "color": "#ef4444"}
            if level == 1: return {"status": "Trung bình", "color": "#eab308"}
            return {"status": "Thấp", "color": "#22c55e"}

        def map_activity(level):
            if level == 2: return {"status": "Tốt", "color": "#22c55e"}
            if level == 1: return {"status": "Khá", "color": "#eab308"}
            return {"status": "Kém", "color": "#ef4444"}

        return {
            "health": [
                {"id": "art", "label": "Viêm khớp", "icon": "bone", **map_health(arthritis)},
                {"id": "sin", "label": "Áp lực xoang", "icon": "head-side", **map_health(sinus)},
                {"id": "flu", "label": "Cảm cúm", "icon": "temperature", **map_health(flu)},
                {"id": "mig", "label": "Đau nửa đầu", "icon": "brain", **map_health(migraine)},
                {"id": "ast", "label": "Hen suyễn", "icon": "lungs", **map_health(asthma)},
            ],
            "activities": [
                {"id": "fis", "label": "Câu cá", "icon": "fish", **map_activity(fishing)},
                {"id": "run", "label": "Chạy bộ", "icon": "running", **map_activity(running)},
                {"id": "gol", "label": "Đánh gôn", "icon": "golf", **map_activity(golf)},
                {"id": "bik", "label": "Đạp xe", "icon": "bicycle", **map_activity(bike)},
                {"id": "bea", "label": "Bãi biển", "icon": "sun", **map_activity(beach)},
                {"id": "dri", "label": "Lái xe", "icon": "car", **map_activity(drive)},
            ],
        }

    # --- LOGIC AQI 
    def get_air_quality(self, lat, lon):
        try:
            params = {
                "latitude": lat,
                "longitude": lon,
                "current": "us_aqi,pm2_5",
                "timezone": "auto",
            }
            res = requests.get(AIR_QUALITY_API_URL, params=params, timeout=5) 
            res.raise_for_status()
            current = res.json().get("current", {})

            aqi = current.get("us_aqi", 0)
            pm25 = current.get("pm2_5", 0)

            def map_us_aqi(v):
                if v <= 50: return "Tốt", "#22c55e"               
                if v <= 100: return "Trung bình", "#eab308"         
                if v <= 150: return "Kém cho nhóm nhạy cảm", "#ff7e00" 
                if v <= 200: return "Xấu", "#ff0000"                
                if v <= 300: return "Rất xấu", "#8f3f97"          
                return "Nguy hại", "#7e0023"                        

            # PM2.5 theo chuẩn EPA (µg/m³)
            def map_pm25_epa(v):
                if v <= 12: return "Tốt", "#22c55e"
                if v <= 35.4: return "Trung bình", "#eab308"
                if v <= 55.4: return "Kém", "#ff7e00"
                if v <= 150.4: return "Xấu", "#ff0000"
                if v <= 250.4: return "Rất xấu", "#8f3f97"
                return "Nguy hại", "#7e0023"

            aqi_status, aqi_color = map_us_aqi(aqi)
            pm_status, pm_color = map_pm25_epa(pm25)

            return {
                "aqi": {"value": aqi, "status": aqi_status, "color": aqi_color, "percent": min(int(aqi / 300 * 100), 100)},
                "pm25": {"value": pm25, "status": pm_status, "color": pm_color, "percent": min(int(pm25 / 200 * 100), 100)},
            }
        except Exception:
            return {"aqi": {"value": 0, "status": "N/A", "color": "#ccc", "percent": 0}, "pm25": {"value": 0, "status": "N/A", "color": "#ccc", "percent": 0}}

    # --- GET DATA ---
    def get(self, request):
        lat = request.query_params.get("lat")
        lon = request.query_params.get("lon")

        if not lat or not lon:
            return Response({"error": "lat & lon required"}, status=400)

        try:
            weather_params = {
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weathercode,pressure_msl,windspeed_10m,winddirection_10m,uv_index,visibility,dew_point_2m",
                "daily": "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum",
                "hourly": "temperature_2m,precipitation,weathercode,pressure_msl,uv_index,visibility,dew_point_2m",
                "timezone": "auto",
                "forecast_days": 14,
            }

            data = requests.get(WEATHER_API_URL, params=weather_params).json()

            current = data.get("current", {})
            daily = data.get("daily", {})
            hourly = data.get("hourly", {})

            # 1. process Daily 
            forecast_list = []
            if "time" in daily:
                for i in range(len(daily["time"])):
                    forecast_list.append({
                        "date": daily["time"][i],
                        "max_temp": daily.get("temperature_2m_max", [])[i],
                        "min_temp": daily.get("temperature_2m_min", [])[i],
                        "weathercode": daily.get("weathercode", [])[i],
                        "precipitation": daily.get("precipitation_sum", [])[i],
                        "sunrise": daily.get("sunrise", [])[i],
                        "sunset": daily.get("sunset", [])[i],
                        "uv_index_max": daily.get("uv_index_max", [])[i] if "uv_index_max" in daily else 0,
                    })

            # 2. process Hourly 
            hourly_list = []
            if "time" in hourly:
                for i in range(len(hourly["time"])):
                    full_time = hourly["time"][i]
                    time_str = full_time.split('T')[1] if 'T' in full_time else full_time
                    
                    hourly_list.append({
                        "full_time": full_time, 
                        "time": time_str,      
                        "temp": hourly.get("temperature_2m", [])[i],
                        "weathercode": hourly.get("weathercode", [])[i],
                        "rain": hourly.get("precipitation", [])[i],
                        "uv_index": hourly.get("uv_index", [])[i] if "uv_index" in hourly else 0,
                        "visibility": hourly.get("visibility", [])[i] if "visibility" in hourly else 0,
                        "pressure_msl": hourly.get("pressure_msl", [])[i] if "pressure_msl" in hourly else 0,
                        "dewpoint_2m": hourly.get("dew_point_2m", [])[i] if "dew_point_2m" in hourly else 0,
                    })

            weather_data = {
                "current": {
                    "temperature": current.get("temperature_2m"),
                    "humidity": current.get("relative_humidity_2m"),
                    "precipitation": current.get("precipitation"),
                    "weathercode": current.get("weathercode"),
                    "windspeed": current.get("windspeed_10m"),
                    "winddirection": current.get("winddirection_10m"), 
                    "pressure": current.get("pressure_msl"),
                    "uv_index": current.get("uv_index"),
                    "visibility": current.get("visibility"),
                    "dewpoint_2m": current.get("dew_point_2m"),
                    "is_day": current.get("is_day"),
                    "apparent_temperature": current.get("apparent_temperature"),
                },
                "health_activity": self.analyze_health_activity(current),
                "air_quality": self.get_air_quality(lat, lon), 
                "forecast": forecast_list,
                "hourly": hourly_list,
                "daily": daily,
                "units": data.get("current_units", {}),
            }

            return Response(weather_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# register
class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": f"User '{user.username}' đã tạo thành công."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FavoriteLocationView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteLocationSerializer
    def get_queryset(self):
        return FavoriteLocation.objects.filter(user=self.request.user).order_by('-added_on')
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FavoriteLocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteLocationSerializer
    def get_queryset(self):
        return FavoriteLocation.objects.filter(user=self.request.user)

# 6. API chatbot
class WeatherChatbotView(APIView):
    permission_classes = [AllowAny]
    
    def classify_intent(self, question):
        """
        Classify user intent
        Returns: 'greeting', 'weather', 'outfit', 'activity', 'other'
        """
        question_lower = question.lower()
        
        # Greeting keywords
        greeting_keywords = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'how are you']
        if any(kw in question_lower for kw in greeting_keywords):
            return 'greeting'
        
        # Weather keywords
        weather_keywords = [
            'weather', 'temperature', 'rain', 'sunny', 'hot', 'cold',
            'wind', 'humidity', 'pressure', 'cloud', 'fog',
            'how is', 'what like', 'condition', 'sky'
        ]
        if any(kw in question_lower for kw in weather_keywords):
            return 'weather'
        
        # Outfit / clothing keywords
        outfit_keywords = [
            'what to wear', 'wear', 'clothes', 'shirt', 'pants',
            'shoes', 'outfit', 'dress', 'clothing'
        ]
        if any(kw in question_lower for kw in outfit_keywords):
            return 'outfit'
        
        # Activity / outdoor keywords
        activity_keywords = [
            'what to do', 'should do', 'activity', 'play', 'go',
            'can i', 'is it ok', 'good idea', 'suitable',
            'outdoor', 'outside'
        ]
        if any(kw in question_lower for kw in activity_keywords):
            return 'activity'
        
        return 'other'
    
    def post(self, request, *args, **kwargs):
        lat = request.data.get('lat')
        lon = request.data.get('lon')
        city_name = request.data.get('city', 'this area')
        user_question = request.data.get('question')

        if not lat or not lon:
            return Response({"error": "Missing coordinates"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Call weather API
            weather_params = {
                'latitude': lat, 
                'longitude': lon, 
                'current': 'temperature_2m,weathercode,windspeed_10m,winddirection_10m,precipitation,relative_humidity_2m,pressure_msl',
                'daily': 'temperature_2m_max,temperature_2m_min,weathercode'
            }
            res = requests.get('https://api.open-meteo.com/v1/forecast', params=weather_params)
            w_data = res.json().get('current', {})
            daily_data = res.json().get('daily', {})
            
            # WMO weather code explanation
            weather_codes = {
                0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy',
                45: 'Fog', 48: 'Freezing fog',
                51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
                61: 'Moderate rain', 63: 'Heavy rain', 65: 'Very heavy rain',
                71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
                80: 'Rain showers', 81: 'Heavy rain showers', 82: 'Violent rain showers',
                95: 'Thunderstorm with hail', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail'
            }
            
            weather_code = w_data.get('weathercode', 3)
            weather_desc_text = weather_codes.get(weather_code, 'Unknown')
            
            weather_desc = f"""
            Location: {city_name}
            Temperature: {w_data.get('temperature_2m')}°C
            Condition: {weather_desc_text} (code: {weather_code})
            Wind: {w_data.get('windspeed_10m')} km/h, direction {w_data.get('winddirection_10m')}°
            Humidity: {w_data.get('relative_humidity_2m')}%
            Precipitation: {w_data.get('precipitation')} mm
            Pressure: {w_data.get('pressure_msl')} hPa
            Today forecast: min {daily_data.get('temperature_2m_min', [0])[0]}°C, max {daily_data.get('temperature_2m_max', [0])[0]}°C
            """

            # 2. Intent classification
            intent = self.classify_intent(user_question) if user_question else 'other'

            # 3. Create prompt based on intent
            if intent == 'greeting':
                system_instruction = f"""
            You are a friendly weather assistant. Weather data: {weather_desc}

            TASK: The user is greeting you.
            - Reply politely and briefly.
            - Suggest weather or outfit information.
            - Return a JSON Array of sentences.
            Example: ["Hello! 👋", "The weather looks pleasant today 🌤️", "How can I help you?"]
                """
            elif intent == 'weather':
                system_instruction = f"""
            You are a professional weather assistant. Data: {weather_desc}

            TASK: The user is asking about the weather.
            - Answer clearly and in detail, using emojis.
            - Explain current conditions and forecast.
            - Return a JSON Array.
            Example: ["Currently in {city_name}, the weather is quite pleasant 🌤️", "Temperature is around 25°C with light wind", "No rain is expected today"]
                """
            elif intent == 'outfit':
                system_instruction = f"""
            You are a weather-based stylist. Data: {weather_desc}

            TASK: Suggest outfits based on the weather.
            - Keep it concise but informative.
            - Recommend clothing items and accessories.
            - Explain why (temperature, humidity, rain).
            - Return a JSON Array.
            Example: ["With a temperature of 25°C, a light shirt or T-shirt would be great 👕", "Linen pants or shorts will keep you comfortable", "Sneakers or breathable sandals are good choices 👟"]
                """
            elif intent == 'activity':
                system_instruction = f"""
            You are an outdoor activity advisor. Data: {weather_desc}

            TASK: Suggest activities suitable for the weather.
            - Recommend outdoor activities.
            - Give warnings if needed (sun, rain, strong wind).
            - Return a JSON Array.
            Example: ["The weather is great for a walk in the park 🚶", "Outdoor sports or a picnic would be perfect", "Remember to stay hydrated and use sunscreen ☀️"]
                """
            else:  # other
                system_instruction = f"""
            You are a weather assistant. Data: {weather_desc}

            TASK: The user asked something unrelated.
            - Politely say you specialize in weather.
            - Suggest what you can help with.
            - Return a JSON Array.
            Example: ["I'm a weather assistant 🌤️", "I'm not sure about that topic, but I can help with weather information!", "Would you like to know the weather or outfit suggestions?"]
                """

            prompt = f"""{system_instruction}

Intent: {intent}
Question: "{user_question}"

Please answer in JSON Array format."""

            # 4. Call Gemini
            gemini_res = model.generate_content(prompt)
            
            # Clean response to extract JSON
            clean_text = gemini_res.text.replace('```json', '').replace('```', '').strip()
            
            try:
                reply_list = json.loads(clean_text)
            except:
                reply_list = [clean_text]

            # Return response
            return Response({
                "reply": reply_list,
                "intent": intent,
                "weather_data": {
                    "temperature": w_data.get('temperature_2m'),
                    "weathercode": weather_code,
                    "status": weather_desc_text,
                    "windspeed": w_data.get('windspeed_10m'),
                    "humidity": w_data.get('relative_humidity_2m'),
                    "precipitation": w_data.get('precipitation')
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API User Profile
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .serializers import UserProfileSerializer
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        from .serializers import UserProfileSerializer
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Cập nhật thành công", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API Change Password
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        from .serializers import ChangePasswordSerializer
        from django.contrib.auth import update_session_auth_hash
        
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            # Kiểm tra mật khẩu cũ
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"error": "Mật khẩu hiện tại không đúng"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Đổi mật khẩu
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({"message": "Đổi mật khẩu thành công"}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API User Preferences
class UserPreferencesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .serializers import UserPreferencesSerializer
        preferences, created = UserPreferences.objects.get_or_create(user=request.user)
        serializer = UserPreferencesSerializer(preferences)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        from .serializers import UserPreferencesSerializer
        preferences, created = UserPreferences.objects.get_or_create(user=request.user)
        serializer = UserPreferencesSerializer(preferences, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Cập nhật thành công", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# Climate history

from django.db.models import F, FloatField, ExpressionWrapper
from .models import ClimateNormal
from .serializers import ClimateNormalSerializer
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([AllowAny])
def climate_data(request): 
    try:
        # 1. get location
        try:
            target_lat = float(request.GET.get('lat', 21.02))
            target_lon = float(request.GET.get('lon', 105.83))
        except (ValueError, TypeError):
            target_lat, target_lon = 21.02, 105.83

        # 2. get nearest location
        closest_station = ClimateNormal.objects.annotate(
            distance_pow2=ExpressionWrapper(
                (F('lat') - target_lat) ** 2 + (F('lon') - target_lon) ** 2,
                output_field=FloatField()
            )
        ).order_by('distance_pow2').first()

        if not closest_station:
            return Response([], status=status.HTTP_200_OK)

        # 3. get data
        data = ClimateNormal.objects.filter(
            lat=closest_station.lat,
            lon=closest_station.lon
        ).order_by('month', 'day')

        serializer = ClimateNormalSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)