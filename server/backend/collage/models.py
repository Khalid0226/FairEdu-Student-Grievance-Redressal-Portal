from django.db import models
from django.contrib.auth.models import User
# University model ko import karna zaroori hai
from university.models import UniversityProfile

class CollegeProfile(models.Model):
    # Auth & Identity
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='college_profile')
    college_name = models.CharField(max_length=255)
    college_code = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20, default='college')
    
    # 🔗 University Connection (Relationship)
    # Yeh field University ko pata chalne degi ki kaunsa college uske under hai
    university = models.ForeignKey(
        UniversityProfile, 
        on_delete=models.SET_NULL, 
        related_name='affiliated_colleges', 
        null=True, 
        blank=True
    )
    
    # Profile Details
    contact_person = models.CharField(max_length=255)
    location = models.CharField(max_length=500, null=True, blank=True)
    alternate_contact = models.CharField(max_length=20, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.college_name} ({self.college_code})"

# 🟢 Committee Members Model
class CommitteeMember(models.Model):
    college_profile = models.ForeignKey(
        CollegeProfile, 
        on_delete=models.CASCADE, 
        related_name='committee_members'
    )
    
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100) # e.g., Chairperson, Secretary, Member
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Committee Member"
        verbose_name_plural = "Committee Members"
        # Ek college mein ek hi naam ka member repeat na ho
        unique_together = ('college_profile', 'name')

    def __str__(self):
        return f"{self.name} ({self.role}) - {self.college_profile.college_name}"