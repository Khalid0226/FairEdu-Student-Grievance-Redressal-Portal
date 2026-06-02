from django.contrib.auth import authenticate, update_session_auth_hash
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import UniversityProfile
from collage.models import CollegeProfile 
from student.models import Report, StudentProfile, Message 
from django.db.models import Count, Q 
from django.utils import timezone
import datetime
from dateutil.relativedelta import relativedelta  # Fixed Month Logic
import logging

# --- PASSWORD SETTINGS LOGIC (UPDATED & SYNCED WITH URLS/FRONTEND) ---

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_university_password(request):
    """Frontend ke 'Verify' button ke liye logic - Match with urls.py name"""
    old_password = request.data.get('old_password')
    
    if not old_password:
        return Response({"error": "Old password is required"}, status=400)
    
    user = request.user
    
    # check_password() Django ka built-in method hai jo hash verify karta hai
    if user.check_password(old_password):
        # Response status code 200 handles 'response.ok' in frontend
        return Response({"status": "verified", "message": "Password matches"}, status=200)
    else:
        # Status 400 trigger setPasswordError in frontend
        return Response({"error": "Password incorrect! Please try again."}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_university_password(request):
    """Naya password set karne ke liye logic"""
    new_password = request.data.get('new_password')
    
    if not new_password:
        return Response({"error": "New password is required"}, status=400)
    
    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters long"}, status=400)

    try:
        user = request.user
        user.set_password(new_password)
        user.save()
        
        # update_session_auth_hash isliye zaroori hai taaki Django session invalid na ho
        update_session_auth_hash(request, user)
        
        return Response({"status": "success", "message": "Password updated successfully"}, status=200)
    except Exception as e:
        return Response({"error": f"Failed to update password: {str(e)}"}, status=500)


# --- EXISTING VIEWS START HERE (NO CHANGES MADE BELOW) ---

logger = logging.getLogger(__name__)

# --- 1. UNIVERSITY LOGIN ---
@api_view(['POST'])
@permission_classes([AllowAny])
def university_login(request):
    username = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')

    if not username or not password:
        return Response({"status": "error", "message": "Credentials missing"}, status=400)

    user = authenticate(username=username, password=password)

    if user is not None:
        try:
            univ_profile = UniversityProfile.objects.get(user=user)
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "status": "success",
                "token": token.key,
                "user_details": {
                    "username": user.username,
                    "full_name": univ_profile.university_name,
                    "role": "university"
                }
            }, status=200)
        except UniversityProfile.DoesNotExist:
            return Response({"status": "error", "message": "Account not linked to University profile."}, status=403)
    
    return Response({"status": "error", "message": "Invalid credentials"}, status=401)

# --- 2. GET ALL STUDENTS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_university_students(request):
    try:
        students = StudentProfile.objects.select_related('user').exclude(
            user__username__icontains='college'
        ).exclude(user__username__icontains='admin')
        
        data = []
        for s in students:
            student_reports = Report.objects.filter(user=s.user)
            total_count = student_reports.count()
            pending_count = student_reports.filter(status__in=['pending', 'investigating', 'under_review']).count()
            resolved_count = student_reports.filter(status='resolved').count()

            full_name = getattr(s, 'full_name', '')
            if not full_name:
                full_name = f"{s.user.first_name} {s.user.last_name}".strip()
            display_name = full_name.upper() if full_name else s.user.username.upper()

            std_id = getattr(s, 'student_id', None) or getattr(s, 'roll_number', 'N/A')
            course = getattr(s, 'course', 'MCA')
            semester = getattr(s, 'semester', None) or getattr(s, 'current_year', '4')

            data.append({
                "id": s.id,
                "name": display_name,
                "full_name": display_name,
                "email": s.user.email,
                "rollNo": str(std_id).upper(),
                "student_id": str(std_id).upper(),
                "institution": str(getattr(s, 'college', 'RBIMS')).upper(),
                "college": str(getattr(s, 'college', 'RBIMS')).upper(),
                "course": str(course).upper(),
                "department": str(course).upper(),
                "academic_year": str(semester).upper(),
                "year": f"SEMESTER {semester}".upper(),
                "semester": str(semester).upper(),
                "status": "Active", 
                "compliance": "COMPLIANT" if pending_count == 0 else "PENDING",
                "total_reports": total_count,
                "reports": total_count,
                "pending_cases": pending_count,
                "pendingCases": pending_count,
                "resolved_reports": resolved_count,
                "contact_number": getattr(s, 'phone_number', 'N/A'),
                "phone": getattr(s, 'phone_number', 'N/A'),
                "emergency_contact": getattr(s, 'emergency_contact', 'N/A'),
                "address": str(getattr(s, 'address', 'NOT PROVIDED')).upper(),
            })

        return Response(data, status=200)
    except Exception as e:
        logger.error(f"Student Sync Error: {str(e)}")
        return Response([], status=200)

# --- 3. GET ALL COLLEGES ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_colleges(request):
    try:
        colleges = CollegeProfile.objects.select_related('user').all()
        data = []
        for col in colleges:
            college_reports = Report.objects.filter(college=col)
            pending_count = college_reports.filter(status__in=['pending', 'investigating', 'under_review']).count()
            
            data.append({
                "id": col.id,
                "name": col.college_name.upper(),
                "college_code": col.college_code,
                "address": (col.location or "Address Not Provided").upper(),
                "status": "VERIFIED" if col.is_verified else "PENDING",
                "compliance": "COMPLIANT" if pending_count == 0 else "NON-COMPLIANT", 
                "students": StudentProfile.objects.filter(college__icontains=col.college_name).count(), 
                "reports_count": college_reports.count(), 
                "pending_cases": pending_count,
                "contact_person": (col.contact_person or "N/A").upper(),
                "user_email": col.user.email if col.user else "N/A",
                "phone_number": col.alternate_contact or "N/A",
            })
        return Response(data, status=200)
    except Exception:
        return Response([], status=200)

# --- 4. UNIVERSITY DASHBOARD STATS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_university_stats(request):
    try:
        all_reports = Report.objects.all()
        total_reports_count = all_reports.count()
        valid_students = StudentProfile.objects.exclude(user__username__icontains='college')
        
        chart_data = []
        for col in CollegeProfile.objects.all():
            college_reports = Report.objects.filter(college=col)
            pending_count = college_reports.filter(status__in=['pending', 'investigating', 'under_review']).count()
            
            chart_data.append({
                "id": col.id,
                "name": col.college_name.upper(),
                "college_name": col.college_name.upper(),
                "code": col.college_code,
                "college_code": col.college_code,
                "reports": college_reports.count(),
                "reports_count": college_reports.count(),
                "pending_cases": pending_count,
                "address": (col.location or "LOCATION NOT PROVIDED").upper(),
                "contact_person": (col.contact_person or "N/A").upper(),
                "user_email": col.user.email if col.user else "N/A",
                "phone_number": col.alternate_contact or "N/A",
                "status": "VERIFIED" if col.is_verified else "PENDING",
                "compliance": "COMPLIANT" if pending_count == 0 else "NON-COMPLIANT",
                "students": StudentProfile.objects.filter(college__icontains=col.college_name).count(),
            })

        case_types_query = Report.objects.values('incident_type').annotate(count=Count('id'))
        case_types = []
        for item in case_types_query:
            label = item['incident_type'].replace('_', ' ').upper() if item['incident_type'] else "OTHER"
            percentage = round((item['count'] / total_reports_count * 100), 1) if total_reports_count > 0 else 0
            case_types.append({"label": label, "value": item['count'], "percentage": percentage})

        # --- UPDATED GRAPH LOGIC (FIXED MONTHS) ---
        monthly_trends = []
        base_date = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        for i in range(5, -1, -1):
            target_date = base_date - relativedelta(months=i)
            month_name = target_date.strftime('%b')
            
            month_reports = Report.objects.filter(
                created_at__year=target_date.year, 
                created_at__month=target_date.month
            )
            
            reported_count = month_reports.count()
            resolved_count = month_reports.filter(status='resolved').count()

            monthly_trends.append({
                "month": month_name, 
                "cases": reported_count,
                "reported": reported_count,
                "resolved": resolved_count
            })

        return Response({
            "status": "success",
            "stats": {
                "total_colleges": CollegeProfile.objects.count(),
                "total_students": valid_students.count(), 
                "total_reports": total_reports_count,
                "resolved_reports": all_reports.filter(status='resolved').count(),
                "pending_reports": all_reports.filter(status__in=['pending', 'investigating', 'under_review']).count(),
                "compliance_rate": round(((all_reports.filter(status='resolved').count() / total_reports_count) * 100), 1) if total_reports_count > 0 else 100,
            },
            "chart_data": chart_data,
            "case_types": case_types,
            "monthly_trends": monthly_trends
        }, status=200)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

# --- 5. GET SINGLE COLLEGE DETAIL ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_college_detail(request, id):
    try:
        college = CollegeProfile.objects.select_related('user').get(id=id)
        college_reports = Report.objects.filter(college=college)
        
        c_total = college_reports.count()
        c_resolved = college_reports.filter(status='resolved').count()
        c_pending = college_reports.filter(status__in=['pending', 'investigating']).count()

        incident_logs = [{
            "id": r.id,
            "incident_type": str(getattr(r, 'incident_type', 'GENERAL')).upper(),
            "status": r.status.upper(),
            "severity": str(getattr(r, 'severity', 'medium')).upper(),
            "incident_date": r.created_at.strftime('%Y-%m-%d') if r.created_at else "N/A"
        } for r in college_reports.order_by('-created_at')[:10]]

        return Response({"status": "success", "data": {
            "id": college.id,
            "name": college.college_name.upper(),
            "college_code": college.college_code,
            "address": (college.location or "N/A").upper(),
            "contact_person": (college.contact_person or "N/A").upper(),
            "user_email": college.user.email if college.user else "N/A",
            "status": "VERIFIED" if college.is_verified else "PENDING",
            "students": StudentProfile.objects.filter(college__icontains=college.college_name).count(),
            "reports_count": c_total,
            "resolved_cases": c_resolved,
            "pending_cases": c_pending,
            "incident_logs": incident_logs 
        }}, status=200)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

# --- 6. UNIVERSITY REPORTS DASHBOARD ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def university_reports_dashboard(request):
    try:
        all_reports = Report.objects.all()
        all_colleges = CollegeProfile.objects.all()
        total_reports_count = all_reports.count()
        total_colleges_count = all_colleges.count()
        
        resolved_count = all_reports.filter(status='resolved').count()
        compliant_colleges_count = all_colleges.exclude(
            id__in=Report.objects.filter(status__in=['pending', 'investigating']).values('college')
        ).count()

        summary = {
            "totalColleges": total_colleges_count,
            "compliantColleges": compliant_colleges_count,
            "totalCases": total_reports_count,
            "resolvedCases": resolved_count,
            "avgComplianceRate": f"{round(((resolved_count / total_reports_count) * 100), 1) if total_reports_count > 0 else 100}%"
        }

        reports_list = []
        for col in all_colleges:
            col_reports = all_reports.filter(college=col)
            c_total = col_reports.count()
            c_resolved = col_reports.filter(status='resolved').count()
            c_pending = col_reports.filter(status__in=['pending', 'investigating']).count()
            
            display_status = "Generated" if c_pending == 0 else "Pending"
            display_type = "Compliance" 
            
            if c_pending > 5: display_priority = "Critical"
            elif c_pending > 2: display_priority = "High"
            elif c_pending > 0: display_priority = "Medium"
            else: display_priority = "Low"

            reports_list.append({
                "id": col.id,
                "title": f"Institutional Compliance Audit: {col.college_name.upper()}",
                "type": display_type,
                "status": display_status, 
                "priority": display_priority,
                "date": timezone.now().strftime('%Y-%m-%d'),
                "dateGenerated": timezone.now().strftime('%Y-%m-%d'),
                "colleges": 1,
                "collegesCovered": 1, 
                "totalCases": c_total,
                "resolvedCases": c_resolved,
                "complianceRate": f"{round((c_resolved/c_total*100), 1)}%" if c_total > 0 else "100%",
                "format": "PDF",
                "fileSize": "1.8 MB",
                "collegeName": col.college_name.upper(),
                "description": f"Safety and compliance audit report for {col.college_name.upper()}."
            })

        return Response({
            "status": "success",
            "summary": summary,
            "reports": reports_list
        }, status=200)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

# --- 7. UNIVERSITY PROFILE (FETCH) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_university_profile(request):
    try:
        univ = UniversityProfile.objects.get(user=request.user)
        logo_url = None
        if univ.logo:
            logo_url = univ.logo.url

        return Response({
            "university_name": univ.university_name or "N/A",
            "university_code": univ.university_code or "N/A",
            "contact_email": univ.contact_email or "N/A",
            "contact_number": univ.contact_number or "N/A",
            "address": univ.address or "No address provided",
            "city": univ.city or "---",
            "state": univ.state or "---",
            "vice_chancellor": univ.vice_chancellor or "---",
            "established_year": univ.established_year or "---",
            "website": univ.website or "---",
            "accreditation_grade": univ.accreditation_grade or "NAAC A++",
            "official_grade": univ.official_grade or "A++",
            "logo": logo_url,
            "status": "success"
        }, status=200)
    except UniversityProfile.DoesNotExist:
        return Response({"status": "error", "message": "Profile not found"}, status=404)

# --- 8. UNIVERSITY PROFILE (UPDATE) ---
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_university_profile(request):
    try:
        univ = UniversityProfile.objects.get(user=request.user)
        data = request.data
        
        univ.university_name = data.get('university_name', univ.university_name)
        univ.contact_email = data.get('contact_email', univ.contact_email)
        univ.contact_number = data.get('contact_number', univ.contact_number)
        univ.address = data.get('address', univ.address)
        univ.city = data.get('city', univ.city)
        univ.state = data.get('state', univ.state)
        univ.vice_chancellor = data.get('vice_chancellor', univ.vice_chancellor)
        univ.website = data.get('website', univ.website)
        univ.established_year = data.get('established_year', univ.established_year)
        univ.accreditation_grade = data.get('accreditation_grade', univ.accreditation_grade)
        univ.official_grade = data.get('official_grade', univ.official_grade)
        
        if 'logo' in request.FILES:
            univ.logo = request.FILES['logo']
        
        univ.save()
        new_logo_url = univ.logo.url if univ.logo else None
        
        return Response({
            "status": "success", 
            "message": "Profile updated",
            "logo": new_logo_url,
            "accreditation_grade": univ.accreditation_grade,
            "official_grade": univ.official_grade
        }, status=200)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=400)

# --- 9. REGISTER NEW COLLEGE NODE ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_college_node(request):
    try:
        data = request.data
        try:
            univ_profile = UniversityProfile.objects.get(user=request.user)
        except UniversityProfile.DoesNotExist:
            return Response({"status": "error", "message": "Only universities can register colleges"}, status=403)

        college_name = data.get('college_name')
        college_code = data.get('college_code')
        email = data.get('email')
        password = data.get('password')
        contact_person = data.get('contact_person')
        alternate_contact = data.get('alternate_contact')
        location = data.get('location')

        if not all([college_name, college_code, email, password]):
            return Response({"status": "error", "message": "Basic credentials are required"}, status=400)

        if User.objects.filter(username=email).exists():
            return Response({"status": "error", "message": "A user with this email already exists"}, status=400)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=college_name[:30]
        )

        CollegeProfile.objects.create(
            user=user,
            university=univ_profile,
            college_name=college_name,
            college_code=college_code,
            contact_person=contact_person,
            alternate_contact=alternate_contact,
            location=location,
            is_verified=True
        )

        return Response({"status": "success", "message": f"Node {college_code} deployed successfully!"}, status=201)

    except Exception as e:
        logger.error(f"Node Registration Error: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=500)

# --- 10. UNIVERSITY MESSAGING & CONVERSATIONS ---

def get_ist_time(timestamp):
    if not timestamp:
        return ""
    ist_time = timestamp + datetime.timedelta(hours=5, minutes=30)
    return ist_time.strftime('%I:%M %p')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_university_conversations(request):
    try:
        user = request.user
        
        # 1. Colleges List
        colleges = CollegeProfile.objects.all()
        college_data = []
        for c in colleges:
            last_msg = Message.objects.filter(
                (Q(sender_email=c.user.email) & Q(receiver_role='university')) | 
                (Q(sender=user) & Q(receiver_email=c.user.email))
            ).order_by('-timestamp').first()

            unread_count = Message.objects.filter(
                sender_email=c.user.email,
                receiver_role='university',
                is_read=False
            ).count()

            college_data.append({
                "id": c.id,
                "conversation_id": f"coll-{c.id}",
                "name": c.college_name.upper(),
                "email": c.user.email,
                "type": "college",
                "unread": unread_count,
                "last_message": last_msg.text[:30] if last_msg and last_msg.text else "No conversations",
                "time": get_ist_time(last_msg.timestamp) if last_msg else ""
            })

        # 2. Students List
        students = StudentProfile.objects.all()
        student_data = []
        for s in students:
            last_msg = Message.objects.filter(
                (Q(sender_email=s.user.email) & Q(receiver_role='university')) | 
                (Q(sender=user) & Q(receiver_email=s.user.email))
            ).order_by('-timestamp').first()

            unread_count = Message.objects.filter(
                sender_email=s.user.email,
                receiver_role='university',
                is_read=False
            ).count()

            student_data.append({
                "id": s.id,
                "conversation_id": f"stud-{s.id}",
                "name": s.full_name.upper() if getattr(s, 'full_name', None) else s.user.username.upper(),
                "email": s.user.email,
                "type": "student",
                "unread": unread_count,
                "college": str(getattr(s, 'college', 'N/A')).upper(),
                "last_message": last_msg.text[:30] if last_msg and last_msg.text else "No conversations",
                "time": get_ist_time(last_msg.timestamp) if last_msg else ""
            })

        return Response({"status": "success", "colleges": college_data, "students": student_data})
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_university_messages(request):
    try:
        user = request.user
        target_email = request.GET.get('target_email')
        if not target_email:
            return Response({"messages": []})

        Message.objects.filter(
            sender_email=target_email,
            receiver_role='university',
            is_read=False
        ).update(is_read=True)

        messages = Message.objects.filter(
            (Q(sender_email=target_email) & Q(receiver_role='university')) | 
            (Q(sender=user) & Q(receiver_email=target_email))
        ).order_by('timestamp')

        data = []
        base_url = request.build_absolute_uri('/')[:-1]
        for m in messages:
            data.append({
                "id": m.id,
                "sender": m.sender_type,
                "text": m.text or "",
                "time": get_ist_time(m.timestamp),
                "is_mine": m.sender == user,
                "is_read": m.is_read,
                "file": base_url + m.file.url if m.file else None,
                "is_file": bool(m.file)
            })
        return Response({"status": "success", "messages": data})
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def university_send_message(request):
    try:
        user = request.user
        target_email = request.data.get('receiver_email')
        text = request.data.get('text', '')
        file = request.FILES.get('file')

        if not target_email:
            return Response({"status": "error", "message": "Receiver email is required"}, status=400)

        is_college = CollegeProfile.objects.filter(user__email=target_email).exists()
        
        msg = Message.objects.create(
            sender=user,
            sender_type='official',
            sender_email=user.email,
            receiver_email=target_email,
            receiver_role='college' if is_college else 'student',
            text=text,
            file=file,
            is_file=True if file else False,
            is_read=False
        )
        return Response({
            "status": "success", 
            "message_id": msg.id,
            "time": get_ist_time(msg.timestamp)
        })
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=400)

# --- 11. UNIVERSITY NOTIFICATIONS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_university_notifications(request):
    try:
        unread_messages = Message.objects.filter(
            receiver_role='university',
            is_read=False
        ).order_by('-timestamp')[:10]

        notifications_data = []
        for m in unread_messages:
            display_text = m.text[:50] + "..." if m.text and len(m.text) > 50 else (m.text or "Sent a file")
            
            notifications_data.append({
                "id": m.id,
                "sender": m.sender_email,
                "text": display_text,
                "time": get_ist_time(m.timestamp),
                "type": "message"
            })

        return Response({
            "status": "success",
            "notifications": notifications_data,
            "unread_count": Message.objects.filter(receiver_role='university', is_read=False).count()
        }, status=200)

    except Exception as e:
        logger.error(f"Notification Fetch Error: {str(e)}")
        return Response({
            "status": "success", 
            "notifications": [], 
            "unread_count": 0,
            "error_log": str(e)
        }, status=200)
    
# --- 12. DELETE COLLEGE NODE ---
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_college_node(request, id):
    try:
        try:
            univ_profile = UniversityProfile.objects.get(user=request.user)
        except UniversityProfile.DoesNotExist:
            return Response({"status": "error", "message": "Unauthorized."}, status=403)

        try:
            college = CollegeProfile.objects.get(id=id, university=univ_profile)
            college_name = college.college_name 
        except CollegeProfile.DoesNotExist:
            return Response({"status": "error", "message": "College not found."}, status=404)

        students_to_cleanup = StudentProfile.objects.filter(college__icontains=college_name)
        for student in students_to_cleanup:
            if student.user:
                student.user.delete() 

        user_to_delete = college.user
        college.delete() 
        if user_to_delete:
            user_to_delete.delete()

        return Response({
            "status": "success", 
            "message": f"College '{college_name}' and all associated students deleted."
        }, status=200)

    except Exception as e:
        logger.error(f"Node Deletion Error: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=500)