import io 
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, update_session_auth_hash
from rest_framework.authtoken.models import Token 
from django.shortcuts import get_object_or_404
from django.db.models import Q 
from django.contrib.auth.models import User 
from django.http import HttpResponse 

# --- PDF GENERATION IMPORTS ---
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch

# --- MODELS AND SERIALIZERS IMPORTS ---
from .models import Report, Message, StudentProfile, EmergencyAlert
from collage.models import CollegeProfile
from university.models import UniversityProfile

from .serializers import (
    StudentRegisterSerializer, 
    ReportSerializer, 
    StudentProfileSerializer,
    MessageSerializer
)

# --- 1. Registration Logic ---
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = StudentRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "status": "success",
            "message": "Registration Successful!"
        }, status=status.HTTP_201_CREATED)
    return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_student_email(request):
    email = request.data.get('email')
    if not email:
        return Response({"status": "error", "message": "Email is required"}, status=400)
    
    user = User.objects.filter(email=email).first()
    if user:
        is_student = hasattr(user, 'student_profile') or hasattr(user, 'studentprofile')
        is_official = hasattr(user, 'college_profile') or hasattr(user, 'university_profile')

        if is_student and not is_official:
            return Response({"status": "success", "message": "Email verified"}, status=200)
        elif is_official:
            return Response({"status": "error", "message": "Admins cannot reset password from student portal."}, status=403)
            
    return Response({"status": "error", "message": "This email is not registered with us."}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_student_password(request):
    email = request.data.get('email')
    new_password = request.data.get('password')
    
    if not email or not new_password:
        return Response({"status": "error", "message": "Email and password are required"}, status=400)
    
    user = User.objects.filter(email=email).first()
    if user:
        is_student = hasattr(user, 'student_profile') or hasattr(user, 'studentprofile')
        is_official = hasattr(user, 'college_profile') or hasattr(user, 'university_profile')

        if is_student and not is_official:
            user.set_password(new_password)
            user.save()
            return Response({"status": "success", "message": "Password updated successfully"}, status=200)
    
    return Response({"status": "error", "message": "Unauthorized or User not found"}, status=404)

# --- 2. Unified Login Logic ---
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email') or request.data.get('username')
    password = request.data.get('password')

    if not email or not password:
        return Response({"status": "error", "message": "Email and password are required"}, status=400)

    user = authenticate(username=email.lower().strip(), password=password)

    if user is not None:
        role = 'unknown'
        full_name = user.get_full_name() or user.username
        profile_details = {}

        if hasattr(user, 'college_profile'):
            role = 'college'
            full_name = user.college_profile.college_name
            profile_details = {"college_code": user.college_profile.college_code}
        elif hasattr(user, 'university_profile'):
            role = 'university'
            full_name = user.university_profile.university_name
        elif hasattr(user, 'student_profile'): 
            role = 'student'
            full_name = user.student_profile.full_name
            profile_details = {
                "student_id": user.student_profile.student_id,
                "college": user.student_profile.college
            }
        elif hasattr(user, 'studentprofile'): 
            role = 'student'
            full_name = user.studentprofile.full_name
            profile_details = {
                "student_id": user.studentprofile.student_id,
                "college": user.studentprofile.college
            }
        elif user.is_superuser:
            role = 'admin'

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "status": "success",
            "token": token.key,
            "user": {
                "email": user.email,
                "full_name": full_name,
                "role": role,
                **profile_details
            }
        }, status=200)
    
    return Response({"status": "error", "message": "Invalid email or password"}, status=401)

# --- 3. Profile Management ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    profile = getattr(request.user, 'student_profile', getattr(request.user, 'studentprofile', None))
    
    if not profile:
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        
    serializer = StudentProfileSerializer(profile)
    return Response({"status": "success", "profile": serializer.data})

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    profile = get_object_or_404(StudentProfile, user=request.user)
    serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"status": "success", "message": "Profile updated successfully"})
    return Response({"status": "error", "errors": serializer.errors}, status=400)

# --- 4. Dashboard Stats ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    try:
        user = request.user
        if hasattr(user, 'college_profile'):
            reports = Report.objects.filter(college=user.college_profile)
        elif user.is_staff or user.is_superuser:
            reports = Report.objects.all()
        else:
            reports = Report.objects.filter(user=user)
        
        total_reports = reports.count()
        active_reports = reports.filter(status__in=['pending', 'investigating', 'under_review']).count()
        resolved_reports = reports.filter(status='resolved').count()
        
        unread_count = Message.objects.filter(
            Q(report__in=reports) | Q(receiver_email=user.email),
            is_read=False
        ).exclude(sender=user).distinct().count()

        return Response({
            "status": "success",
            "total_reports": total_reports,
            "active_reports": active_reports,
            "resolved_reports": resolved_reports,
            "unread_messages": unread_count
        })
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

# --- 5. Incident Reporting ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_incident(request):
    try:
        profile = getattr(request.user, 'student_profile', getattr(request.user, 'studentprofile', None))
        if not profile:
             return Response({"status": "error", "message": "Student profile not found"}, status=404)
             
        student_college_name = profile.college
        college_obj = CollegeProfile.objects.filter(college_name__icontains=student_college_name).first()

        serializer = ReportSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(
                user=request.user, 
                college=college_obj,
                is_seen_by_student=True, 
                evidence_image=request.FILES.get('evidence_image'),
                evidence_video=request.FILES.get('evidence_video'),
                evidence_audio=request.FILES.get('evidence_audio')
            )
            return Response({"status": "success", "message": "Reported successfully"}, status=201)
        return Response({"status": "error", "errors": serializer.errors}, status=400)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports(request):
    try:
        user = request.user
        # Yahan '-created_at' use kiya hai taaki NEW report hamesha upar aaye
        if hasattr(user, 'college_profile'):
            reports = Report.objects.filter(college=user.college_profile).order_by('-created_at')
        elif user.is_staff:
            reports = Report.objects.all().order_by('-created_at')
        else:
            reports = Report.objects.filter(user=user).order_by('-created_at')
            
        # Update seen status for students
        if not hasattr(user, 'college_profile') and not user.is_staff:
            reports.filter(is_seen_by_student=False).update(is_seen_by_student=True)
            
        serializer = ReportSerializer(reports, many=True)
        return Response({"status": "success", "reports": serializer.data})
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

# --- 6. Update Report Status ---
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_report_status(request, report_id):
    is_official = hasattr(request.user, 'college_profile') or request.user.is_staff
    if not is_official:
        return Response({"status": "error", "message": "Unauthorized"}, status=403)
    
    report = get_object_or_404(Report, id=report_id)
    if hasattr(request.user, 'college_profile') and report.college != request.user.college_profile:
         return Response({"status": "error", "message": "Permission denied"}, status=403)

    new_status = request.data.get('status')
    if new_status in ['pending', 'investigating', 'resolved', 'rejected', 'under_review']:
        report.status = new_status
        report.is_seen_by_student = False 
        report.save()
        return Response({"status": "success", "new_status": report.status})
    return Response({"status": "error", "message": "Invalid status"}, status=400)

# --- 7. Messaging ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, report_id):
    try:
        user = request.user
        base_url = request.build_absolute_uri('/')[:-1]
        
        if report_id in ['college', 'university']:
            messages = Message.objects.filter(
                report__isnull=True
            ).filter(
                Q(receiver_role=report_id) | Q(sender_type='official')
            ).filter(
                Q(sender=user) | Q(receiver_email=user.email) | Q(sender_email=user.email)
            ).distinct().order_by('timestamp')
            
            filtered_messages = []
            for m in messages:
                if m.sender_type == 'official' and m.sender != user:
                    sender_is_college = hasattr(m.sender, 'college_profile')
                    sender_is_uni = hasattr(m.sender, 'university_profile')
                    
                    if report_id == 'college' and sender_is_college:
                        filtered_messages.append(m)
                    elif report_id == 'university' and sender_is_uni:
                        filtered_messages.append(m)
                else:
                    if m.receiver_role == report_id or m.sender == user:
                        filtered_messages.append(m)
            messages_list = filtered_messages
        else:
            messages_list = Message.objects.filter(report_id=report_id).order_by('timestamp')
        
        if isinstance(messages_list, list):
            ids_to_update = [m.id for m in messages_list if not m.is_read and m.sender != user]
            Message.objects.filter(id__in=ids_to_update).update(is_read=True)
        else:
            messages_list.filter(is_read=False).exclude(sender=user).update(is_read=True)
        
        data = []
        for m in messages_list:
            data.append({
                "id": getattr(m, 'id', None),
                "sender": m.sender_type,
                "text": m.text or "",
                "file": base_url + m.file.url if m.file else None,
                "is_file": m.is_file,
                "time": m.timestamp.isoformat(), 
                "is_mine": m.sender == user
            })
        return Response({"status": "success", "messages": data})
    except Exception as e:
        return Response({"status": "error", "detail": str(e)}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser]) 
def send_message(request):
    try:
        receiver_type = request.data.get('receiver_type')
        report_id = request.data.get('report_id')
        text = request.data.get('text', '')
        file = request.FILES.get('file')
        receiver_email = request.data.get('receiver_email') 
        
        profile = getattr(request.user, 'student_profile', getattr(request.user, 'studentprofile', None))

        final_receiver_email = receiver_email
        if receiver_type == 'college' and (not final_receiver_email or final_receiver_email == 'undefined'):
            if profile:
                student_college = profile.college
                college_obj = CollegeProfile.objects.filter(college_name__icontains=student_college).first()
                if college_obj:
                    final_receiver_email = college_obj.user.email
        
        elif receiver_type == 'university' and (not final_receiver_email or final_receiver_email == 'undefined'):
            univ_profile = UniversityProfile.objects.first()
            if univ_profile:
                final_receiver_email = univ_profile.user.email

        creation_data = {
            "sender": request.user,
            "sender_type": 'student',
            "text": text,
            "file": file,
            "is_file": True if file else False,
            "is_read": False,
            "sender_email": request.user.email,
            "receiver_email": final_receiver_email,
            "receiver_role": receiver_type
        }

        if report_id and report_id not in ['college', 'university']:
            creation_data["report"] = get_object_or_404(Report, id=report_id)
            creation_data["receiver_role"] = None
        else:
            creation_data["report"] = None

        message = Message.objects.create(**creation_data)
        return Response({
            "status": "success", 
            "message_id": message.id,
            "time": message.timestamp.isoformat() 
        })
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=400)

# --- 8. SOS Alert Logic ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_sos(request):
    try:
        lat = request.data.get('lat')
        lng = request.data.get('long') or request.data.get('lng')
        address = request.data.get('address', 'Location not provided')
        
        EmergencyAlert.objects.create(
            student=request.user,
            location_lat=lat,
            location_long=lng
        )

        # 🟢 Corrected Maps URL & Formatting
        maps_url = f"https://www.google.com/maps?q={lat},{lng}"
        profile = getattr(request.user, 'student_profile', getattr(request.user, 'studentprofile', None))
        student_name = profile.full_name if profile else request.user.get_full_name() or "A Student"

        # 🟢 Added 'f' before the string to enable variable injection
        sos_text = (
            "🚨 *EMERGENCY SOS ALERT*\n"
            "-------------------------------\n"
            f"👤 STUDENT: {student_name}\n"
            f"📍 AREA: {address}\n"
            "-------------------------------\n"
            "🌐 LIVE LOCATION LINK:\n"
            f"{maps_url}\n"
            "-------------------------------\n"
            "⚠️ Immediate Action Required!"
        )

        receiver_email = None
        if profile:
            student_college = profile.college
            college_obj = CollegeProfile.objects.filter(college_name__icontains=student_college).first()
            if college_obj:
                receiver_email = college_obj.user.email

        Message.objects.create(
            sender=request.user,
            sender_type='student',
            text=sos_text,
            receiver_role='college',
            receiver_email=receiver_email,
            sender_email=request.user.email,
            report=None
        )
        return Response({"status": "success", "message": "SOS Alert Sent!"})
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

# --- 9. Other Settings views ---
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def student_settings(request):
    profile, _ = StudentProfile.objects.get_or_create(user=request.user)
    if request.method == 'GET':
        return Response({
            "status": "success",
            "settings": {
                "emailNotifications": profile.email_notifications,
                "pushNotifications": profile.push_notifications,
                "anonymousReporting": profile.anonymous_reporting,
                "securityAlerts": profile.security_alerts,
                "newsletter": profile.newsletter,
                "twoFactorAuth": profile.two_factor_auth,
            }
        })
    elif request.method == 'PATCH':
        key = request.data.get('key')
        value = request.data.get('value')
        mapping = {
            "emailNotifications": "email_notifications",
            "pushNotifications": "push_notifications",
            "anonymousReporting": "anonymous_reporting",
            "securityAlerts": "security_alerts",
            "newsletter": "newsletter",
            "twoFactorAuth": "two_factor_auth"
        }
        db_field = mapping.get(key)
        if db_field:
            setattr(profile, db_field, value)
            profile.save()
            return Response({"status": "success", "message": "Setting updated"})
        return Response({"status": "error", "message": "Invalid key"}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")
    user = request.user
    if not user.check_password(old_password):
        return Response({"status": "error", "message": "Old password is incorrect"}, status=400)
    user.set_password(new_password)
    user.save()
    update_session_auth_hash(request, user)
    return Response({"status": "success", "message": "Password changed successfully"})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_report(request, report_id):
    try:
        report = Report.objects.get(id=report_id, user=request.user)
        report.delete()
        return Response({"status": "success", "message": "Report deleted successfully"}, status=200)
    except Report.DoesNotExist:
        return Response({"status": "error", "message": "Report not found"}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification_summary(request):
    try:
        user = request.user
        
        unread_messages_qs = Message.objects.filter(
            Q(report__user=user) | Q(receiver_email=user.email),
            is_read=False
        ).exclude(sender=user).distinct().order_by('-timestamp')

        unread_messages_count = unread_messages_qs.count()

        recent_messages = []
        for msg in unread_messages_qs[:5]:
            channel = 'college' 
            if msg.report:
                channel = str(msg.report.id)
            elif msg.receiver_role == 'university' or (hasattr(msg.sender, 'university_profile')):
                channel = 'university'
            elif msg.receiver_role == 'college' or (hasattr(msg.sender, 'college_profile')):
                channel = 'college'

            recent_messages.append({
                "id": msg.id,
                "sender_name": msg.sender_type.capitalize() if msg.sender_type else "Official",
                "text": msg.text[:40] + "..." if msg.text and len(msg.text) > 40 else (msg.text or "Sent a file"),
                "time": msg.timestamp.isoformat(),
                "channel": channel
            })

        unseen_reports_qs = Report.objects.filter(user=user, is_seen_by_student=False).order_by('-updated_at')
        unread_reports_count = unseen_reports_qs.count()

        updates_list = []
        for r in unseen_reports_qs:
            display_id = r.serial_number if (hasattr(r, 'serial_number') and r.serial_number) else r.id
            updates_list.append({
                "id": r.id,
                "type": r.incident_type,
                "status": r.status,
                "serial": display_id
            })

        return Response({
            "status": "success",
            "unread_messages": unread_messages_count,
            "unread_reports": unread_reports_count,
            "recent_messages": recent_messages,
            "updates": updates_list
        })
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_password(request):
    password = request.data.get('password')
    user = request.user
    
    if user.check_password(password):
        return Response({"valid": True, "message": "Password matched"})
    else:
        return Response({"valid": False, "message": "Password Doesn't Matching"}, status=200)

# 🟢 FINAL UPDATED PDF LOGIC (Fixed Sorting and Date Match)
# 🟢 FINAL UPDATED PDF LOGIC (Fixed Numbering, Sorting and Date Match)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_data_archive(request):
    try:
        user = request.user
        # Reports ko chronological order (purani se nayi) mein le rahe hain 
        # taaki numbering 1, 2, 3... natural lage
        reports = Report.objects.filter(user=user).order_by('created_at')

        if not reports.exists():
            return Response({"status": "error", "message": "No reports found."}, status=404)

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Header
        p.setFont("Helvetica-Bold", 16)
        p.drawString(1*inch, height - 1*inch, "STUDENT INCIDENT ARCHIVE")
        p.setFont("Helvetica", 10)
        p.drawString(1*inch, height - 1.2*inch, f"User: {user.username} | Total Reports: {reports.count()}")
        p.line(1*inch, height - 1.3*inch, width - 1*inch, height - 1.3*inch)

        y_pos = height - 1.8 * inch
        total_count = reports.count()

        # Enumerate use kar rahe hain index ke liye
        for index, report in enumerate(reports, start=1):
            # Naye page ka logic
            if y_pos < 2 * inch:
                p.showPage()
                y_pos = height - 1 * inch

            r_type = str(report.incident_type) if report.incident_type else "N/A"
            r_status = str(report.status).upper() if report.status else "PENDING"
            
            # Text wrapping handle karne ke liye description limit
            r_desc = str(report.description)
            if len(r_desc) > 95:
                r_desc = r_desc[:92] + "..."
            
            # Date Format
            try:
                r_date = report.created_at.strftime("%Y-%m-%d %H:%M") if report.created_at else "N/A"
            except:
                r_date = "N/A"

            # numbering fix: "Report 1 / 24"
            p.setFont("Helvetica-Bold", 11)
            p.drawString(1*inch, y_pos, f"REPORT NO: {index} / {total_count}") 
            
            p.setFont("Helvetica", 10)
            p.drawString(1.2*inch, y_pos - 0.25*inch, f"Category: {r_type}")
            p.drawString(1.2*inch, y_pos - 0.45*inch, f"Status: {r_status} | Date: {r_date}")
            
            # Details block
            p.setFont("Helvetica-Oblique", 9)
            p.drawString(1.2*inch, y_pos - 0.65*inch, f"Details: {r_desc}")
            
            # Separator Line
            p.setStrokeColor(colors.lightgrey)
            p.line(1*inch, y_pos - 0.85*inch, width - 1*inch, y_pos - 0.85*inch)
            
            y_pos -= 1.3 * inch

        p.showPage()
        p.save()

        buffer.seek(0)
        pdf_data = buffer.getvalue()
        buffer.close()

        response = HttpResponse(pdf_data, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Incident_Archive_{user.username}.pdf"'
        return response

    except Exception as e:
        print(f"CRITICAL PDF ERROR: {str(e)}")
        return Response({"status": "error", "message": "Server Error"}, status=500)