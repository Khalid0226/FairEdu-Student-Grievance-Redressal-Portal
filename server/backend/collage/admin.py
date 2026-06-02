from django.contrib import admin
from .models import CollegeProfile, CommitteeMember

# 1. College Profile Registration
@admin.register(CollegeProfile)
class CollegeProfileAdmin(admin.ModelAdmin):
    list_display = ('college_name', 'college_code', 'contact_person', 'is_verified')
    search_fields = ('college_name', 'college_code')
    list_filter = ('is_verified',)

# 2. Committee Member Registration (Ye missing tha)
@admin.register(CommitteeMember)
class CommitteeMemberAdmin(admin.ModelAdmin):
    # Admin table mein ye columns dikhenge
    list_display = ('name', 'role', 'get_college', 'created_at')
    
    # List ko filter karne ke liye sidebar
    list_filter = ('college_profile__college_name', 'role')
    
    # Search bar
    search_fields = ('name', 'role')

    # Helper function college ka naam dikhane ke liye
    def get_college(self, obj):
        return obj.college_profile.college_name
    get_college.short_description = 'College Name'