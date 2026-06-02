from django.urls import path
from .views import (
    register_user, 
    login_user, 
    verify_student_email,        # 🟢 Added
    reset_student_password,      # 🟢 Added
    get_dashboard_stats, 
    submit_incident,
    get_reports,
    update_report_status,
    get_messages,      
    send_message,
    get_profile,
    update_profile,
    trigger_sos,
    student_settings,
    change_password,
    verify_password,             # 🟢 UPDATED: Import verify_password
    delete_report,
    get_notification_summary,
    download_data_archive        # 🟢 NEW: Added PDF Download Import
)

urlpatterns = [
    # --- Auth & Password Recovery ---
    path('register/', register_user, name='student_register'),
    path('login/', login_user, name='student_login'),
    path('verify-email/', verify_student_email, name='verify_email'),       # 🟢 Added
    path('reset-password/', reset_student_password, name='reset_password'), # 🟢 Added

    # --- Profile ---
    path('profile/', get_profile, name='get_profile'),
    path('profile/update/', update_profile, name='update_profile'),

    # --- Settings & Security ---
    path('settings/', student_settings, name='student_settings'),
    path('change-password/', change_password, name='change_password'),
    path('verify-password/', verify_password, name='verify_password'),     # 🟢 UPDATED: Added verify-password path

    # --- Dashboard & Stats ---
    path('dashboard/stats/', get_dashboard_stats, name='dashboard_stats'),
    path('notifications/summary/', get_notification_summary, name='notification-summary'),
    
    # --- Data Management ---
    path('download-archive/', download_data_archive, name='download_archive'), # 🟢 NEW: PDF Download Path

    # --- Reports ---
    path('reports/', get_reports, name='get_reports'), 
    path('submit-incident/', submit_incident, name='submit_incident'),
    path('reports/<str:report_id>/status/', update_report_status, name='update_report_status'),
    path('reports/delete/<str:report_id>/', delete_report, name='delete_report'),

    # --- Messaging (ORDER MATTERS HERE) ---
    path('messages/send/', send_message, name='send_message'),
    path('messages/<str:report_id>/', get_messages, name='get_messages'),

    # --- SOS ---
    path('sos/trigger/', trigger_sos, name='trigger_sos'),
]