from django.db import models
from django.contrib.auth.models import User

# 1. Student Profile Model
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, default='student')
    student_id = models.CharField(max_length=50, unique=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True)
    
    college = models.CharField(max_length=255, blank=True)
    university = models.CharField(max_length=255, blank=True)
    course = models.CharField(max_length=100, blank=True)
    semester = models.CharField(max_length=50, blank=True)
    
    emergency_contact = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)

    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    anonymous_reporting = models.BooleanField(default=False)
    security_alerts = models.BooleanField(default=True)
    newsletter = models.BooleanField(default=False)
    two_factor_auth = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.full_name} ({self.student_id})"

# 2. Report Model
class Report(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('investigating', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]

    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    
    college = models.ForeignKey(
        'collage.CollegeProfile', 
        on_delete=models.CASCADE, 
        related_name='college_reports',
        null=True, 
        blank=True
    )
    
    university = models.ForeignKey(
        'university.UniversityProfile', 
        on_delete=models.CASCADE, 
        related_name='university_reports',
        null=True, 
        blank=True
    )

    incident_type = models.CharField(max_length=100)
    description = models.TextField()
    incident_date = models.DateField()
    incident_time = models.TimeField()
    location = models.CharField(max_length=255)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium')
    is_anonymous = models.BooleanField(default=False)
    involved_parties = models.TextField(blank=True, null=True)
    
    evidence_image = models.ImageField(upload_to='evidence/images/', null=True, blank=True)
    evidence_video = models.FileField(upload_to='evidence/videos/', null=True, blank=True)
    evidence_audio = models.FileField(upload_to='evidence/audio/', null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    is_seen_by_student = models.BooleanField(default=True) 
    is_read_by_college = models.BooleanField(default=False) 

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # 🟢 AUTO-FILL UNIVERSITY LOGIC
    def save(self, *args, **kwargs):
        if self.college and not self.university:
            # CollageProfile se linked university fetch kar raha hai
            self.university = self.college.university
        super().save(*args, **kwargs)

    @property
    def serial_number(self):
        return Report.objects.filter(id__lte=self.id).count()

    def __str__(self):
        return f"Report #{self.serial_number} - {self.incident_type}"

# 3. SOS/Emergency Alert Model
class EmergencyAlert(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    location_long = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"SOS by {self.student.username}"

# 4. Message Model (UPDATED FOR DIRECT CHAT & NO-REPORT CHAT)
class Message(models.Model):
    SENDER_TYPES = [
        ('student', 'Student'),
        ('official', 'Official'),
    ]

    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    sender_type = models.CharField(max_length=20, choices=SENDER_TYPES)
    
    receiver_role = models.CharField(max_length=20, blank=True, null=True) 
    sender_email = models.EmailField(blank=True, null=True)
    receiver_email = models.EmailField(blank=True, null=True)

    text = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='chat_attachments/', blank=True, null=True)
    is_file = models.BooleanField(default=False)
    file_type = models.CharField(max_length=50, blank=True, null=True) 
    
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        type_str = "File" if self.is_file else "Text"
        if self.report:
            return f"{type_str} Msg on Report #{self.report.id} by {self.sender.username}"
        return f"{type_str} Direct Msg to {self.receiver_role} by {self.sender.username}"