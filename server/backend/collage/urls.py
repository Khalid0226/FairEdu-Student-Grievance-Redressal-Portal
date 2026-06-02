from django.urls import path
from . import views

urlpatterns = [
    # 🟢 LOGIN ENDPOINT
    path('login/', views.college_login, name='college-login'), 

    # 🔑 PASSWORD MANAGEMENT
    path('change-password/', views.collage_change_password, name='collage-change-password'),

    # 🔔 NOTIFICATIONS (Header ke liye - Fetching)
    path('notifications/', views.get_notifications, name='college-notifications'),

    # 🆕 NOTIFICATION CLEAR LOGIC (Mark as Read)
    path('notifications/read/<int:pk>/', views.mark_notification_read, name='mark-notification-read'),

    # 💬 CHAT LIST & MESSAGING
    # 📢 NOTE: Ye upar hona chahiye taaki 'unread' word dynamic ID se na takraye
    path('messages/unread/', views.college_unread_messages, name='college-unread-messages'), 
    path('chat-list/', views.college_chat_list, name='college-chat-list'),
    path('messages/<str:identifier>/', views.college_get_messages, name='college-get-messages'),
    path('send-message/', views.college_send_message, name='college-send-message'),

    # 📊 DASHBOARD STATS
    path('stats/', views.get_college_stats, name='college-stats'),
    
    # 📋 REPORTS MANAGEMENT
    path('reports/', views.get_all_reports, name='college-reports'),
    path('reports/<int:pk>/resolve/', views.resolve_report, name='resolve_report'),

    # 🎓 STUDENT MANAGEMENT 
    path('students/', views.get_college_students, name='college-students'),
    path('register-student/', views.register_student, name='register-student'),
    path('students/<int:pk>/delete/', views.delete_student, name='delete-student'), 

    # 🏛️ COMMITTEE MANAGEMENT
    path('committee/', views.committee_api, name='college-committee'),
    path('committee/<int:pk>/', views.committee_api, name='college-committee-detail'),
    
    # 👤 PROFILE MANAGEMENT
    path('profile/', views.get_college_profile, name='college-profile'),
]