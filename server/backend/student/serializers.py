from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StudentProfile, Report, Message, EmergencyAlert
from django.db import transaction
from django.utils import timezone  # 🟢 Future date check ke liye import kiya

# --- 1. Registration Serializer ---
class StudentRegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    # 🟢 Password length 6 kar di hai
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    # 🟢 id_number field add ki hai jo frontend se aayegi
    id_number = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = StudentProfile
        fields = ['full_name', 'email', 'id_number', 'password', 'role']

    def validate_email(self, value):
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("This email is already registered.")
        return email

    def validate_id_number(self, value):
        # 🟢 Enrollment number ki duplicate check
        if StudentProfile.objects.filter(student_id=value).exists():
            raise serializers.ValidationError("This enrollment number is already registered.")
        return value

    def create(self, validated_data):
        with transaction.atomic():
            raw_role = validated_data.get('role', 'student')
            clean_role = raw_role.lower().strip()
            
            # 🟢 Frontend ki id_number ko backend ki student_id mein convert kiya
            student_id_val = validated_data.pop('id_number')

            user = User.objects.create_user(
                username=validated_data['email'].lower(), 
                email=validated_data['email'].lower(),
                password=validated_data['password'],
                first_name=validated_data['full_name']
            )
            
            profile = StudentProfile.objects.create(
                user=user,
                full_name=validated_data['full_name'],
                student_id=student_id_val,
                role=clean_role
            )
            return profile

# --- 2. User/Profile Serializer ---
class UserBaseSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='studentprofile.role', read_only=True)
    full_name = serializers.CharField(source='studentprofile.full_name', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role']

# --- 3. Profile Serializer ---
class StudentProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'full_name', 'email', 'student_id', 'phone_number', 'role',
            'college', 'university', 'course', 'semester', 
            'emergency_contact', 'address'
        ]
    
    def get_role(self, obj):
        return obj.role.lower() if obj.role else 'student'

# --- 4. Message Serializer ---
class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.first_name')
    time_formatted = serializers.DateTimeField(source='timestamp', format="%Y-%m-%dT%H:%M:%S%z", read_only=True)
    report_serial = serializers.ReadOnlyField(source='report.serial_number')

    class Meta:
        model = Message
        fields = ['id', 'report', 'report_serial', 'sender', 'sender_name', 'sender_type', 'text', 'timestamp', 'time_formatted', 'is_read']

# --- 5. Report Serializer ---
class ReportSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='user.first_name')
    messages = MessageSerializer(many=True, read_only=True)
    serial_number = serializers.ReadOnlyField()
    student_details = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id', 'serial_number', 'student_name', 'student_details', 'incident_type', 
            'incident_date', 'incident_time', 'location', 'description', 
            'severity', 'is_anonymous', 'involved_parties', 'status', 
            'created_at', 'messages', 'user', 'college',
            'evidence_image', 'evidence_video', 'evidence_audio'
        ]
        read_only_fields = ['id', 'serial_number', 'status', 'created_at', 'user', 'college']

    # 🟢 Future Date Validation logic added here
    def validate_incident_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError("Incident date cannot be in the future.")
        return value

    def get_student_details(self, obj):
        if obj.is_anonymous:
            return "Anonymous Student"
        
        try:
            profile = obj.user.studentprofile 
            return {
                "full_name": profile.full_name,
                "student_id": profile.student_id,
                "college": profile.college
            }
        except:
            return obj.user.first_name

    def create(self, validated_data):
        return Report.objects.create(**validated_data)