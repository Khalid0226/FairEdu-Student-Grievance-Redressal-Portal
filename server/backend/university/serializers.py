from rest_framework import serializers
from .models import College  # Apne model ka sahi naam check kar lena

class CollegeSerializer(serializers.ModelSerializer):
    # Agar ye fields model mein direct nahi hain, toh hum default value de rahe hain
    # Taaki frontend blank na dikhe
    reports_count = serializers.IntegerField(read_only=True, default=0)
    pending_cases = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = College
        fields = [
            'id', 'name', 'college_code', 'type', 
            'status', 'compliance', 'students', 
            'address', 'email', 'contact',
            'reports_count', 'pending_cases'
        ]