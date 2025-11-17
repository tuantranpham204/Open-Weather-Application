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