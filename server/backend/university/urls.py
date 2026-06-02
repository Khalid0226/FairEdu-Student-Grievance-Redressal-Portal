from django.urls import path
from . import views

urlpatterns = [
    # --- 1. University Auth & Dashboard ---
    path('login/', views.university_login, name='university-login'),
    path('stats/', views.get_university_stats, name='university-stats'),
    
    # 🟢 Reports Dashboard
    path('reports-dashboard/', views.university_reports_dashboard, name='university-reports-dashboard'),

    # --- 2. Colleges Management ---
    path('colleges/', views.get_all_colleges, name='university-colleges-list'),
    path('college/<int:id>/', views.get_college_detail, name='university-college-detail'),
    
    # ✅ Naya Node Register karne ke liye
    path('register-node/', views.register_college_node, name='university-register-node'),
    
    # 🔴 Delete College Node
    path('colleges/<int:id>/delete/', views.delete_college_node, name='university-delete-college'),

    # --- 3. Student Directory ---
    path('students/', views.get_university_students, name='university-students-list'),

    # ✅ Profile Management
    path('profile/', views.get_university_profile, name='university-profile-get'),
    path('profile/update/', views.update_university_profile, name='university-profile-update'),

    # 💬 --- CHAT SYSTEM & NOTIFICATIONS ---
    path('conversations/', views.get_university_conversations, name='get_university_conversations'),
    path('messages/', views.get_university_messages, name='get_university_messages'),
    path('send-message/', views.university_send_message, name='university_send_message'),
    
    # 🔔 Header Notifications (Only for Chat Messages)
    path('notifications/', views.get_university_notifications, name='university-notifications'),

    # 🔐 --- SECURITY & SETTINGS (Corrected for your updated views) ---
    path('verify-password/', views.verify_university_password, name='university-verify-password'),
    path('change-password/', views.change_university_password, name='university-change-password'),
]