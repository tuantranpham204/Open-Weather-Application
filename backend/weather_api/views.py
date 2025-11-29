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

# API Weather Data
class WeatherDataView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    # --- LOGIC TÍNH TOÁN SỨC KHỎE (GIỮ NGUYÊN CỦA FILE MỚI) ---
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

   
    def get_air_quality(self, lat, lon):
        try:
            params = {
                "latitude": lat,
                "longitude": lon,
                "current": "us_aqi,pm2_5",
                "timezone": "auto",
            }
            res = requests.get(AIR_QUALITY_API_URL, params=params, timeout=5) # Thêm timeout
            res.raise_for_status()
            current = res.json().get("current", {})

            aqi = current.get("us_aqi", 0)
            pm25 = current.get("pm2_5", 0)

            def map_us_aqi(v):
                if v <= 50: return "Tốt", "#22c55e"                 # Xanh lá
                if v <= 100: return "Trung bình", "#eab308"         # Vàng
                if v <= 150: return "Kém cho nhóm nhạy cảm", "#ff7e00" # Cam
                if v <= 200: return "Xấu", "#ff0000"                # Đỏ
                if v <= 300: return "Rất xấu", "#8f3f97"            # Tím
                return "Nguy hại", "#7e0023"                        # Nâu đỏ (Maroon)

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
            # Nếu lỗi lấy không khí, trả về mặc định để app không chết
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

            # 1. Xử lý Daily (Dùng .get để an toàn)
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

            # 2. Xử lý Hourly (QUAN TRỌNG: Khôi phục logic cắt chuỗi thời gian)
            hourly_list = []
            if "time" in hourly:
                for i in range(len(hourly["time"])):
                    full_time = hourly["time"][i]
                    # SỬA LẠI: Tách giờ như file cũ để Frontend không bị lỗi
                    time_str = full_time.split('T')[1] if 'T' in full_time else full_time
                    
                    hourly_list.append({
                        "full_time": full_time, # Thêm lại key này cho chắc
                        "time": time_str,       # Trả về giờ dạng ngắn (VD: 14:00)
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
                    "winddirection": current.get("winddirection_10m"), # Đảm bảo field này có
                    "pressure": current.get("pressure_msl"),
                    "uv_index": current.get("uv_index"),
                    "visibility": current.get("visibility"),
                    "dewpoint_2m": current.get("dew_point_2m"),
                    "is_day": current.get("is_day"),
                    "apparent_temperature": current.get("apparent_temperature"),
                },
                "health_activity": self.analyze_health_activity(current),
                "air_quality": self.get_air_quality(lat, lon), # Đã bọc try-except
                "forecast": forecast_list,
                "hourly": hourly_list,
                "daily": daily,
                "units": data.get("current_units", {}),
            }

            return Response(weather_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# Các API còn lại giữ nguyên
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

class WeatherChatbotView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        lat = request.data.get('lat')
        lon = request.data.get('lon')
        city_name = request.data.get('city', 'khu vực này')
        user_question = request.data.get('question')

        if not lat or not lon:
            return Response({"error": "Thiếu toạ độ"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            weather_params = {'latitude': lat, 'longitude': lon, 'current': 'temperature_2m,weathercode,windspeed_10m,precipitation'}
            res = requests.get('https://api.open-meteo.com/v1/forecast', params=weather_params)
            w_data = res.json().get('current', {})
            
            weather_desc = f"Vị trí: {city_name}, Nhiệt độ: {w_data.get('temperature_2m')}°C, WMO: {w_data.get('weathercode')}, Gió: {w_data.get('windspeed_10m')}km/h"

            system_instruction = f"""
            Bạn là trợ lý thời tiết thân thiện. Dữ liệu: {weather_desc}.
            YÊU CẦU: Trả lời ngắn gọn, Bằng tiếng anh.format JSON Array. Ví dụ: ["Câu 1", "Câu 2"].
            """

            if user_question:
                prompt = f"""{system_instruction} \n Người dùng hỏi: "{user_question}" Bằng tiếng anh.."""
            else:
                prompt = f"""{system_instruction} \n Đưa ra lời khuyên ngay lúc này. Bằng tiếng anh."""

            gemini_res = model.generate_content(prompt)
            clean_text = gemini_res.text.replace('```json', '').replace('```', '').strip()
            
            try:
                reply_list = json.loads(clean_text)
            except:
                reply_list = [clean_text]

            return Response({"reply": reply_list}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

