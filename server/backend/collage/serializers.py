from rest_framework import serializers
from .models import CommitteeMember, CollegeProfile

class CollegeProfileSerializer(serializers.ModelSerializer):
    # User model se email lane ke liye logic
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CollegeProfile
        fields = [
            'college_name', 
            'college_code', 
            'contact_person', 
            'role', 
            'user_email', 
            'location',          # <--- Ye line missing thi
            'alternate_contact'  # <--- Ye line missing thi
        ]

class CommitteeMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommitteeMember
        fields = ['id', 'name', 'role', 'created_at']