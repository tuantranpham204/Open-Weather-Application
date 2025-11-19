import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import  RegisterSerializer

# URL API Open-Meteo
WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast'
GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'

#Register
class RegisterView(APIView):
    permission_classes = [AllowAny] 
    
    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": f"User '{user.username}' đã tạo thành công."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#Search
class SearchCityView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request, *args, **kwargs):
        city = request.query_params.get('city', None)
        if not city:
            return Response({"error": "Need city name."}, status=status.HTTP_400_BAD_REQUEST)
        
        geo_params = {'name': city, 'count': 10, 'language': 'vi', 'format': 'json'}
        
        try:
            geo_response = requests.get(GEOCODING_API_URL, params=geo_params)
            geo_response.raise_for_status()
            geo_data = geo_response.json()

            if not geo_data.get('results'):
                return Response({"error": f"No result for'{city}'."}, status=status.HTTP_404_NOT_FOUND)
            
            locations = []
            for res in geo_data['results']:
                locations.append({
                    'id': res['id'],
                    'name': res.get('name', 'Unknow name'),
                    'country': res.get('country', ''),
                    'admin1': res.get('admin1', ''),
                    'latitude': res['latitude'],
                    'longitude': res['longitude'],
                })
            return Response(locations, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Lỗi server: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# API weather 
class WeatherDataView(APIView):
    permission_classes = [AllowAny] 
    authentication_classes = []
    
    def get(self, request, *args, **kwargs):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        if not lat or not lon:
            return Response({"error": "'lat' and 'lon' are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            weather_params = {
                'latitude': lat,
                'longitude': lon,
                # 1. Real time 
                'current': 'temperature_2m,relative_humidity_2m,precipitation,weathercode,windspeed_10m,winddirection_10m,pressure_msl',
                # 2. Forecast 7 days
                'daily': 'weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum',
                # 3. Forecast 24h 
                'hourly': 'temperature_2m,weathercode,precipitation',
                'timezone': 'auto'
            }
            
            response = requests.get(WEATHER_API_URL, params=weather_params)
            response.raise_for_status()
            data = response.json()

            # --- CURRENT ---
            current = data.get('current', {})
            
            # --- DAILY --- 
            daily = data.get('daily', {})
            forecast_list = []
            if 'time' in daily:
                for i in range(len(daily['time'])):
                    forecast_list.append({
                        'date': daily['time'][i],
                        'max_temp': daily['temperature_2m_max'][i],
                        'min_temp': daily['temperature_2m_min'][i],
                        'weathercode': daily['weathercode'][i],
                        'precipitation': daily['precipitation_sum'][i],
                        'sunrise': daily['sunrise'][i],
                        'sunset': daily['sunset'][i]
                    })

            # --- HOURLY ---
            hourly = data.get('hourly', {})
            hourly_list = []
            if 'time' in hourly:
                for i in range(len(hourly['time'])):
                    # API return "2024-11-18T14:00"
                    full_time = hourly['time'][i]
                    # Extract hour 
                    time_str = full_time.split('T')[1] if 'T' in full_time else full_time
                    
                    hourly_list.append({
                        'full_time': full_time, 
                        'time': time_str,      
                        'temp': hourly['temperature_2m'][i],
                        'code': hourly['weathercode'][i],
                        'rain': hourly['precipitation'][i]
                    })

            # Return data
            weather_data = {
                'current': {
                    'temperature': current.get('temperature_2m'),
                    'humidity': current.get('relative_humidity_2m'),
                    'precipitation': current.get('precipitation'),
                    'weathercode': current.get('weathercode'),
                    'windspeed': current.get('windspeed_10m'),
                    'winddirection': current.get('winddirection_10m'),
                    'pressure': current.get('pressure_msl'),
                },
                'forecast': forecast_list, 
                'hourly': hourly_list,    
                'units': data.get('current_units', {})
            }
            
            return Response(weather_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Lỗi lấy dữ liệu: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#Chatbot
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