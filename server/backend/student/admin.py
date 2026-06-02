from django.contrib import admin
from .models import Report, StudentProfile, EmergencyAlert, Message
from rest_framework.authtoken.models import Token
from django.utils.html import format_html

# 1. Student Profile Admin
@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'student_id', 'college', 'role')
    list_filter = ('role', 'college', 'course')
    search_fields = ('full_name', 'user__email', 'student_id', 'college')
    list_editable = ('role',)

# 2. Report Model Admin
@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('serial_no', 'incident_type', 'get_student_name', 'college', 'severity', 'status', 'created_at')
    list_filter = ('status', 'incident_type', 'severity', 'college', 'created_at')
    search_fields = ('incident_type', 'location', 'user__username', 'user__email')
    list_editable = ('status',)

    def serial_no(self, obj):
        return f"#{obj.serial_number}"
    serial_no.short_description = 'Serial No.'

    def get_student_name(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return "Anonymous"
    get_student_name.short_description = 'Student Name'

# 3. Emergency Alert (SOS) Admin
@admin.register(EmergencyAlert)
class EmergencyAlertAdmin(admin.ModelAdmin):
    list_display = ('student', 'timestamp', 'is_resolved', 'location_lat', 'location_long')
    list_filter = ('is_resolved', 'timestamp')
    search_fields = ('student__username', 'student__email')
    list_editable = ('is_resolved',)

# 4. Message Admin (FIXED FOR NULL REPORTS)
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('get_source', 'colored_sender', 'message_preview', 'attachment_link', 'timestamp', 'is_read')
    list_filter = ('sender_type', 'is_read', 'timestamp', 'is_file', 'receiver_role')
    search_fields = ('text', 'sender__username', 'sender_email', 'receiver_role')
    readonly_fields = ('timestamp',)

    def get_source(self, obj):
        # 🔴 FIX: Check if report exists to prevent 'NoneType' error
        if obj.report:
            return f"Report #{obj.report.id}"
        # Agar report nahi hai toh Direct Chat info dikhao
        return format_html('<span style="color: #6366f1; font-weight: bold;">Direct: {}</span>', 
                           (obj.receiver_role or "General").upper())
    get_source.short_description = 'Source / Case ID'

    def colored_sender(self, obj):
        color = "#2563eb" if obj.sender_type == 'student' else "#ea580c"
        return format_html('<b style="color: {}; text-transform: uppercase;">{}</b>', color, obj.sender_type)
    colored_sender.short_description = 'Role'

    def message_preview(self, obj):
        if obj.is_file:
            return format_html('<i>📎 File: {}</i>', obj.text or "Attachment")
        if obj.text:
            return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text
        return "---"
    message_preview.short_description = 'Message Content'

    def attachment_link(self, obj):
        if obj.file:
            try:
                return format_html('<a href="{}" target="_blank" style="color: #2563eb; font-weight: bold;">View File</a>', obj.file.url)
            except:
                return "File Error"
        return "No File"
    attachment_link.short_description = 'Attachment'

# 5. Token Admin Customization
class TokenAdminCustom(admin.ModelAdmin):
    list_display = ('key', 'user', 'created')
    fields = ('user',)
    ordering = ('-created',)

try:
    admin.site.unregister(Token)
except admin.sites.NotRegistered:
    pass
admin.site.register(Token, TokenAdminCustom)