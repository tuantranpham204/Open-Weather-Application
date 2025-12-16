import json
import os
from django.core.management.base import BaseCommand
from weather_api.models import ClimateNormal
from django.conf import settings

class Command(BaseCommand):
    help = 'Nạp dữ liệu khí hậu từ file JSON vào Database'

    def handle(self, *args, **kwargs):
        # Tự động tìm file json nằm cùng cấp với manage.py (BASE_DIR)
        file_path = os.path.join(settings.BASE_DIR, 'world_climate_data_full.json')
        
        self.stdout.write(f" Đang đọc file từ: {file_path}")

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(' Không tìm thấy file world_climate_data_full.json'))
            return

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f' Lỗi đọc file JSON: {str(e)}'))
            return

        self.stdout.write(f" Tìm thấy {len(data)} dòng dữ liệu. Đang nạp...")

        # Xóa dữ liệu cũ nếu muốn (bỏ comment dòng dưới)
        # ClimateNormal.objects.all().delete()

        objects = []
        for item in data:
            obj = ClimateNormal(
                lat=item['lat'],
                lon=item['lon'],
                day=item['d'],
                month=item['m'],
                max_record=item['max_r'],
                min_record=item['min_r'],
                max_avg=item['max_a'],
                min_avg=item['min_a'],
                rain_avg=item['rain_a']
            )
            objects.append(obj)

        # Bulk create để nạp nhanh
        ClimateNormal.objects.bulk_create(objects)
        
        self.stdout.write(self.style.SUCCESS(f'THÀNH CÔNG! Đã nạp {len(objects)} bản ghi.'))