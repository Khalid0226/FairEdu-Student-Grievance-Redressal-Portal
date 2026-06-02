from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken import views as auth_views

urlpatterns = [
    # 1. Django Admin Panel
    path('admin/', admin.site.urls),
    
    # 2. Student App APIs
    path('api/student/', include('student.urls')), 

    # 🟢 FIX: 'collage' (app name) aur 'college' (frontend request) dono ko handle karne ke liye
    # Frontend agar 'api/collage/' hit karega toh ye kaam karega
    path('api/collage/', include('collage.urls')), 
    
    # Optional: Agar aapne frontend mein 'college' use kiya hai toh ise bhi rehne dein
    path('api/college/', include('collage.urls')),

    # 4. University App APIs
    path('api/university/', include('university.urls')),

    # 5. Admin App APIs
    path('api/admin-portal/', include('admin_app.urls')),
    
    # 6. Token Authentication
    path('api/api-token-auth/', auth_views.obtain_auth_token),

]

# Media & Static Files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)