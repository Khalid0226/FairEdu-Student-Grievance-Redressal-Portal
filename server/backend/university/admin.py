from django.contrib import admin
from .models import UniversityProfile

@admin.register(UniversityProfile)
class UniversityProfileAdmin(admin.ModelAdmin):
    list_display = ('university_name', 'university_code', 'state', 'vice_chancellor')
    search_fields = ('university_name', 'university_code')