from django.db import models
from django.contrib.auth.models import User

class UniversityProfile(models.Model):
    # Auth & Basic Info
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='university_profile')
    university_name = models.CharField(max_length=255)
    university_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, default='university')
    
    # Location & Contact
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100, default="Ahmedabad")
    address = models.TextField(null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)
    contact_number = models.CharField(max_length=15, null=True, blank=True)
    
    # Official Details
    vice_chancellor = models.CharField(max_length=100, null=True, blank=True)
    established_year = models.IntegerField(null=True, blank=True)
    logo = models.ImageField(upload_to='university_logos/', null=True, blank=True)
    website = models.URLField(max_length=200, null=True, blank=True)

    # --- NAYI FIELDS (ACCERDITATION & GRADES) ---
    accreditation_grade = models.CharField(max_length=50, default="NAAC A++", null=True, blank=True)
    official_grade = models.CharField(max_length=20, default="A++", null=True, blank=True)

    # Status
    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.university_name} ({self.university_code})"

    class Meta:
        verbose_name = "University Profile"
        verbose_name_plural = "University Profiles"