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
#favorite location
class FavoriteLocationView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteLocationSerializer

    def get_queryset(self):
        return FavoriteLocation.objects.filter(user=self.request.user).order_by('-added_on')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
#Chatbot
#6. API chatbot
#6. API chatbot
class WeatherChatbotView(APIView):
    permission_classes = [AllowAny]
    
    def classify_intent(self, question):
        """
        Phân loại ý định của câu hỏi người dùng
        Returns: 'greeting', 'weather', 'outfit', 'activity', 'other'
        """
        question_lower = question.lower()
        
        # Greeting keywords
        greeting_keywords = ['chào', 'hi', 'hello', 'xin chào', 'bạn khỏe', 'sao vậy', 'ơi']
        if any(kw in question_lower for kw in greeting_keywords):
            return 'greeting'
        
        # Weather keywords
        weather_keywords = ['thời tiết', 'nhiệt độ', 'mưa', 'nắng', 'nóng', 'lạnh', 'gió', 'độ ẩm', 'áp suất', 'mây', 'sương', 'thế nào', 'như thế nào', 'tình hình', 'trời']
        if any(kw in question_lower for kw in weather_keywords):
            return 'weather'
        
        # Outfit/clothing keywords
        outfit_keywords = ['mặc gì', 'mặc', 'quần áo', 'áo', 'quần', 'giày', 'trang phục', 'mặc sao', 'nên mặc', 'phục trang']
        if any(kw in question_lower for kw in outfit_keywords):
            return 'outfit'
        
        # Activity/outdoor keywords
        activity_keywords = ['làm gì', 'nên làm', 'hoạt động', 'chơi', 'đi', 'có thể', 'được không', 'được', 'tốt không', 'hợp không', 'ngoài trời', 'ngoài']
        if any(kw in question_lower for kw in activity_keywords):
            return 'activity'
        
        return 'other'
    
    def post(self, request, *args, **kwargs):
        lat = request.data.get('lat')
        lon = request.data.get('lon')
        city_name = request.data.get('city', 'khu vực này')
        user_question = request.data.get('question')

        if not lat or not lon:
            return Response({"error": "Thiếu toạ độ"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Gọi API thời tiết
            weather_params = {
                'latitude': lat, 
                'longitude': lon, 
                'current': 'temperature_2m,weathercode,windspeed_10m,winddirection_10m,precipitation,relative_humidity_2m,pressure_msl',
                'daily': 'temperature_2m_max,temperature_2m_min,weathercode'
            }
            res = requests.get('https://api.open-meteo.com/v1/forecast', params=weather_params)
            w_data = res.json().get('current', {})
            daily_data = res.json().get('daily', {})
            
            # Giải thích mã thời tiết WMO
            weather_codes = {
                0: 'Trời quang', 1: 'Hầu như quang', 2: 'Hơi mây', 3: 'Mây',
                45: 'Sương mù', 48: 'Sương mù đóng tuyết',
                51: 'Mưa nhẹ', 53: 'Mưa nhẹ', 55: 'Mưa nhẹ dày đặc',
                61: 'Mưa vừa', 63: 'Mưa nặng', 65: 'Mưa rất nặng',
                71: 'Tuyết nhẹ', 73: 'Tuyết', 75: 'Tuyết dày đặc',
                80: 'Mưa rào vừa', 81: 'Mưa rào nặng', 82: 'Mưa rào dữ dội',
                95: 'Bão với mưa đá', 96: 'Bão với mưa đá', 99: 'Bão với mưa đá'
            }
            
            weather_code = w_data.get('weathercode', 3)
            weather_desc_text = weather_codes.get(weather_code, 'Không xác định')
            
            weather_desc = f"""
            Vị trí: {city_name}
            Nhiệt độ: {w_data.get('temperature_2m')}°C
            Trạng thái: {weather_desc_text} (mã: {weather_code})
            Gió: {w_data.get('windspeed_10m')} km/h, hướng {w_data.get('winddirection_10m')}°
            Độ ẩm: {w_data.get('relative_humidity_2m')}%
            Mưa: {w_data.get('precipitation')} mm
            Áp suất: {w_data.get('pressure_msl')} hPa
            Dự báo hôm nay: min {daily_data.get('temperature_2m_min', [0])[0]}°C, max {daily_data.get('temperature_2m_max', [0])[0]}°C
                        """

            # 2. Phân loại ý định
            intent = self.classify_intent(user_question) if user_question else 'other'

            # 3. Tạo PROMPT theo intent
            if intent == 'greeting':
                system_instruction = f""" Trả lời tiếng anh.
            Bạn là trợ lý thời tiết thân thiện. Dữ liệu thời tiết: {weather_desc}

            NHIỆM VỤ: Người dùng chào hỏi bạn. 
            - Trả lời chào hỏi ngắn gọn, thân thiện.
            - Sau đó, gợi ý thông tin thời tiết hoặc trang phục.
            - Trả về dạng JSON Array danh sách câu.
            Ví dụ: ["Chào bạn! 👋", "Hôm nay trời ấm áp 🌤️", "Mình có thể giúp gì cho bạn?"]
                """
            elif intent == 'weather':
                system_instruction = f""" Trả lời tiếng anh.
            Bạn là trợ lý thời tiết chuyên nghiệp. Dữ liệu: {weather_desc}

            NHIỆM VỤ: Người dùng hỏi về thời tiết.
            - Trả lời chi tiết, dễ hiểu, dùng emoji minh họa.
            - Giải thích tình hình thời tiết hiện tại và dự báo.
            - Trả về JSON Array.
            Ví dụ: ["Hiện tại tại {city_name} trời khá ấm áp 🌤️", "Nhiệt độ khoảng 25°C, gió nhẹ", "Không có mưa dự báo trong hôm nay"]
                """
            elif intent == 'outfit':
                system_instruction = f""" Trả lời tiếng anh.
            Bạn là stylist thời tiết. Dữ liệu: {weather_desc}

            NHIỆM VỤ: Gợi ý trang phục dựa vào thời tiết.
            - Trả lời không quá dài dòng, đủ ý là được.
            - Kiến nghị cụ thể: loại áo, quần, phụ kiện.
            - Giải thích tại sao (dựa vào nhiệt độ, độ ẩm, mưa).
            - Trả về JSON Array.
            Ví dụ: ["Với nhiệt độ 25°C, bạn nên mặc áo sơ mi mỏng hoặc áo phông 👕", "Quần linen hoặc quần shorts sẽ rất thoải mái", "Đôi giày sneaker hoặc dép thoáng khí là lựa chọn tốt 👟"]
                            """
            elif intent == 'activity':
                system_instruction = f""" Trả lời tiếng anh.
            Bạn là cố vấn hoạt động ngoài trời. Dữ liệu: {weather_desc}

            NHIỆM VỤ: Gợi ý hoạt động phù hợp với thời tiết.

            - Nêu hoạt động ngoài trời phù hợp.
            - Cảnh báo nếu cần (nắng, mưa, gió mạnh).
            - Trả về JSON Array.
            Ví dụ: ["Hôm nay thời tiết đẹp, rất hợp để đi dạo công viên 🚶", "Bạn có thể chơi thể thao ngoài trời hoặc picnic", "Nhớ mang theo nước và áo chống nắng nhé ☀️"]
                """
            else:  # other
                system_instruction = f""" Trả lời tiếng anh.
            Bạn là trợ lý thời tiết. Dữ liệu: {weather_desc}

            NHIỆM VỤ: Người dùng hỏi về chủ đề không liên quan trực tiếp.
            - Trả lời ngắn gọn rằng bạn chuyên về thời tiết.
            - Gợi ý điều gì bạn có thể giúp.
            - Trả về JSON Array.
            Ví dụ: ["Mình là trợ lý thời tiết 🌤️", "Không chắc về chủ đề đó, nhưng mình có thể giúp bạn với thời tiết!", "Bạn muốn biết thời tiết hoặc gợi ý trang phục không?"]
                            """

            prompt = f"""{system_instruction}\n\nPhân loại ý định: {intent}\nCâu hỏi: "{user_question}"\n\nHãy trả lời dưới dạng JSON Array các câu."""

            # 4. Gọi Gemini
            gemini_res = model.generate_content(prompt)
            
            # Xử lý sạch text để lấy JSON
            clean_text = gemini_res.text.replace('```json', '').replace('```', '').strip()
            
            try:
                reply_list = json.loads(clean_text)
            except:
                reply_list = [clean_text]

            # Trả về List các câu + phân loại intent
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