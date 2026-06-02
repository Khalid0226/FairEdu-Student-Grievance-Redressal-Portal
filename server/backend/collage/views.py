from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, update_session_auth_hash # 👈 update_session_auth_hash added
from rest_framework.authtoken.models import Token 
from django.contrib.auth.models import User
from django.db.models import Q

# Models Imports
from student.models import Report, StudentProfile, Message # 👈 Message Import Added
from .models import CollegeProfile, CommitteeMember

# Serializers Imports
from .serializers import CommitteeMemberSerializer, CollegeProfileSerializer

import logging

# Logger setup
logger = logging.getLogger(__name__)

# --- 🟢 HELPER: Get Logged-in College Profile ---
def get_current_college(user):
    return CollegeProfile.objects.filter(user=user).first()

# --- 🆕 ADDED: CHANGE PASSWORD VIEW (Puraane code ko bina chhede) ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def collage_change_password(request):
    try:
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        user = request.user

        if not old_password or not new_password:
            return Response({'error': 'Both Password Required'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({'error': 'Old Password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        
        # Password badalne ke baad session update karein taaki user logout na ho
        update_session_auth_hash(request, user)
        
        return Response({'message': 'Password change successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Password Change Error: {str(e)}")
        return Response({'error': 'Kuch galti hui hai'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- 🆕 UPDATED: NOTIFICATIONS VIEW (Bell Icon - Working) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    try:
        college = get_current_college(request.user)
        if not college:
            return Response([], status=200)

        notifications_qs = Report.objects.filter(
            college=college, 
            is_read_by_college=False 
        ).order_by('-created_at')[:5]
        
        data = []
        for n in notifications_qs:
            sender = "Anonymous Student"
            if not getattr(n, 'is_anonymous', False) and n.user:
                sender = n.user.get_full_name() or n.user.username

            data.append({
                "id": n.id,
                "title": f"New {getattr(n, 'incident_type', 'Report')} Filed",
                "message": f"From {sender}: {n.description[:40]}..." if n.description else f"New incident reported by {sender}",
                "time": n.created_at.strftime('%I:%M %p') if n.created_at else "Now",
                "unread": True
            })
        return Response(data, status=200)
    except Exception as e:
        logger.error(f"Notification Error: {str(e)}")
        return Response([], status=200)

# --- 🆕 MARK NOTIFICATION AS READ ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    try:
        college = get_current_college(request.user)
        report = Report.objects.get(id=pk, college=college)
        report.is_read_by_college = True 
        report.save(update_fields=['is_read_by_college'])
        return Response({"status": "success", "message": "Notification cleared"}, status=200)
    except Report.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

# --- ✉️ FIXED: UNREAD MESSAGES FOR ENVELOPE ICON ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def college_unread_messages(request):
    """
    Frontend ke Envelope icon ke liye fixed function.
    Iska naam urls.py ke 'college_unread_messages' se match hona chahiye.
    """
    try:
        user = request.user
        # Filter: Wo messages jo is college user ko mile hain aur abhi tak read nahi hue
        unread_qs = Message.objects.filter(
            receiver_email=user.email,
            is_read=False
        ).order_by('-timestamp')

        data = []
        for m in unread_qs:
            # Sender display logic
            sender_display = "University Admin" if m.sender_type == 'official' else "Student"
            
            data.append({
                "id": m.id,
                "sender_name": sender_display,
                "sender_type": m.sender_type.upper(),
                "text": m.text[:50] + "..." if m.text and len(m.text) > 50 else (m.text or "Sent a file"),
                "time": m.timestamp.strftime('%I:%M %p'),
                "full_sender_email": m.sender_email,
                "unread": True
            })
        
        return Response(data, status=200)
    except Exception as e:
        logger.error(f"Unread Messages Error: {str(e)}")
        # Error aane par empty list bhej rahe hain taaki frontend crash na ho
        return Response([], status=200)
    
    
# --- 🔴 NEW: MARK MESSAGE AS READ ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_message_read(request, pk):
    try:
        message = Message.objects.get(id=pk, receiver_email=request.user.email)
        message.is_read = True
        message.save(update_fields=['is_read'])
        return Response({"status": "success"}, status=200)
    except Message.DoesNotExist:
        return Response({"error": "Message not found"}, status=404)

# --- 🟢 COLLEGE LOGIN VIEW ---
@api_view(['POST'])
@permission_classes([AllowAny])
def college_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)

    if user:
        user_role = getattr(user, 'role', '').lower()
        if user_role not in ['college', 'collage']:
            return Response({
                'error': f'Access Denied: This is a {user_role} account.'
            }, status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=user)
        college_profile = get_current_college(user)
        
        return Response({
            'token': token.key,
            'role': 'college',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'college_name': college_profile.college_name if college_profile else "College Admin"
            }
        }, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# --- 1. COLLEGE PROFILE VIEW ---
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_college_profile(request):
    try:
        college = get_current_college(request.user)
        if not college:
            return Response({"error": "No Profile found for this college"}, status=404)
        
        if request.method == 'GET':
            serializer = CollegeProfileSerializer(college)
            data = serializer.data
            data['phone_number'] = data.get('alternate_contact', '')
            data['address'] = data.get('location', '')
            return Response([data], status=200)
        
        elif request.method == 'PATCH':
            input_data = request.data.copy()
            if 'phone_number' in input_data:
                input_data['alternate_contact'] = input_data.pop('phone_number')
            if 'address' in input_data:
                input_data['location'] = input_data.pop('address')

            serializer = CollegeProfileSerializer(college, data=input_data, partial=True)
            if serializer.is_valid():
                serializer.save()
                updated_data = serializer.data
                updated_data['phone_number'] = updated_data.get('alternate_contact')
                updated_data['address'] = updated_data.get('location')
                
                return Response({
                    "status": "success", 
                    "message": "Profile updated successfully",
                    "data": updated_data
                }, status=200)
            return Response(serializer.errors, status=400)

    except Exception as e:
        logger.error(f"Profile Error: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=500)

# --- 2. DASHBOARD STATS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_college_stats(request):
    try:
        college = get_current_college(request.user)
        if not college:
            return Response({"error": "College not found"}, status=404)

        all_reports = Report.objects.filter(college=college)
        
        return Response({
            "status": "success",
            "total_reports": all_reports.count(),
            "active_reports": all_reports.filter(status__in=['pending', 'investigating']).count(),
            "resolved_reports": all_reports.filter(status='resolved').count(),
            "committee_count": CommitteeMember.objects.filter(college_profile=college).count(),
            "urgent_cases": all_reports.filter(incident_type__icontains='Ragging').count()
        })
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)

# --- 3. GET ALL REPORTS ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_reports(request):
    try:
        college = get_current_college(request.user)
        if not college:
            return Response({"status": "success", "reports": []})

        reports_qs = Report.objects.filter(college=college).select_related('user').order_by('-created_at')
        
        data = []
        total = reports_qs.count()
        
        base_url = request.build_absolute_uri('/')[:-1]

        for index, r in enumerate(reports_qs):
            profile = StudentProfile.objects.filter(user=r.user).first() if r.user else None
            
            def get_full_url(file_field):
                if file_field and hasattr(file_field, 'url'):
                    return base_url + file_field.url
                return None

            data.append({
                "id": r.id,
                "serial_no": total - index,
                "incident_type": getattr(r, 'incident_type', 'General Inquiry'), 
                "description": getattr(r, 'description', 'No description provided.'),
                "status": r.status or "pending", 
                "is_anonymous": getattr(r, 'is_anonymous', False),
                "display_status": r.get_status_display() if hasattr(r, 'get_status_display') else str(r.status).replace('_', ' ').capitalize(),
                "incident_date": r.incident_date.strftime('%Y-%m-%d') if r.incident_date else "N/A",
                "student_name": r.user.get_full_name() or r.user.username if r.user else "Anonymous",
                "student_details": {
                    "student_id": profile.student_id if profile else "N/A"
                },
                "location": getattr(r, 'location', 'Main Campus Area'),
                "involved_parties": getattr(r, 'involved_parties', 'Not Mentioned'),
                "incident_time": str(r.incident_time) if r.incident_time else 'N/A',
                "evidence_image": get_full_url(r.evidence_image),
                "evidence_video": get_full_url(r.evidence_video),
                "evidence_audio": get_full_url(r.evidence_audio),
            })
        return Response({"status": "success", "reports": data})
    except Exception as e:
        logger.error(f"Reports Fetch Error: {str(e)}")
        return Response({"status": "error", "reports": [], "message": str(e)}, status=200)

# --- 4. STUDENT MANAGEMENT ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_college_students(request):
    try:
        college_profile = get_current_college(request.user)
        if not college_profile:
            return Response({"status": "error", "message": "College not found"}, status=404)

        students = StudentProfile.objects.filter(college__icontains=college_profile.college_name).select_related('user')

        data = []
        for s in students:
            student_address = s.address if s.address and s.address.strip() != "" else "Ahmedabad, Gujarat"
            
            data.append({
                "id": s.id,
                "name": s.full_name or (s.user.username if s.user else "Unknown"),
                "email": s.user.email if s.user else "N/A",
                "roll_no": getattr(s, 'student_id', 'N/A'), 
                "department": getattr(s, 'course', 'MCA'),
                "phone": getattr(s, 'phone_number', 'N/A'),
                "college_name": college_profile.college_name,
                "university": s.university or "Gujarat Technological University",
                "address": student_address,
                "semester": getattr(s, 'semester', '1'),
                "status": "Active"
            })
        return Response({"status": "success", "students": data})
    except Exception as e:
        logger.error(f"Students Fetch Error: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=400)

# --- 🔴 DELETE STUDENT ---
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_student(request, pk):
    try:
        college_profile = get_current_college(request.user)
        student = StudentProfile.objects.get(id=pk, college__icontains=college_profile.college_name)
        
        with transaction.atomic():
            user = student.user
            student.delete()
            if user:
                user.delete()
                
        return Response({"status": "success", "message": "Student deleted from database"}, status=200)
    except StudentProfile.DoesNotExist:
        return Response({"status": "error", "message": "Student not found"}, status=404)
    except Exception as e:
        logger.error(f"Delete Student Error: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=400)

# --- 🆕 REGISTER STUDENT VIEW ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_student(request):
    try:
        college_profile = get_current_college(request.user)
        if not college_profile:
            return Response({"status": "error", "message": "Unauthorized College Access"}, status=403)

        data = request.data
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')

        if User.objects.filter(username=email).exists():
            return Response({"status": "error", "message": "Student with this email already exists"}, status=400)

        with transaction.atomic():
            user = User.objects.create_user(
                username=email, 
                email=email, 
                password=password
            )
            
            StudentProfile.objects.create(
                user=user,
                full_name=full_name,
                student_id=data.get('student_id'),
                phone_number=data.get('phone_number'),
                course=data.get('course'),
                semester=data.get('semester'),
                address=data.get('address'),
                college=college_profile.college_name,
                university=data.get('university', "Gujarat Technological University"),
                role='student'
            )

        return Response({"status": "success", "message": "Student Registered Successfully"}, status=201)

    except Exception as e:
        logger.error(f"Registration Error: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=400)

# --- 5. COMMITTEE API ---
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def committee_api(request, pk=None):
    college = get_current_college(request.user)
    if not college:
        return Response({"error": "College profile not found"}, status=404)
    
    if request.method == 'GET':
        members = CommitteeMember.objects.filter(college_profile=college).order_by('-created_at')
        serializer = CommitteeMemberSerializer(members, many=True)
        return Response(serializer.data, status=200)
    
    elif request.method == 'POST':
        serializer = CommitteeMemberSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(college_profile=college)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        if pk:
            member = get_object_or_404(CommitteeMember, id=pk, college_profile=college)
            member.delete()
            return Response({"status": "success", "message": "Member deleted"}, status=200)
        return Response({"error": "ID required"}, status=400)

# --- 6. RESOLVE/UPDATE REPORT ---
@api_view(['PATCH', 'POST'])
@permission_classes([IsAuthenticated])
def resolve_report(request, pk):
    try:
        college = get_current_college(request.user)
        input_status = request.data.get('status')
        
        if not input_status:
            return Response({"status": "error", "message": "No status provided"}, status=400)

        status_map = {
            'Pending': 'pending',
            'Under Investigation': 'investigating',
            'Resolved': 'resolved',
            'Rejected': 'rejected'
        }

        final_status = status_map.get(input_status, input_status.lower().replace(' ', '_'))

        with transaction.atomic():
            report = Report.objects.select_for_update().get(id=pk, college=college)
            report.status = final_status
            report.save(update_fields=['status'])
            
        return Response({
            "status": "success", 
            "message": f"Report status successfully updated to: {report.status}"
        }, status=200)

    except Report.DoesNotExist:
        return Response({"status": "error", "message": "Report not found or access denied"}, status=404)
    except Exception as e:
        logger.error(f"Update Status Error: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=400)

# --- 🆕 COLLEGE CHAT LIST VIEW (TIME FORMAT FIXED) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def college_chat_list(request):
    try:
        college_profile = get_current_college(request.user)
        if not college_profile:
            return Response({"chats": [], "error": "College profile not found"}, status=404)

        university_display_name = getattr(college_profile, 'university', 'University Admin') or "University Admin"
        
        last_univ_msg = Message.objects.filter(
            (Q(sender=request.user) & Q(receiver_role='university')) |
            (Q(receiver_email=request.user.email) & Q(sender_type='official'))
        ).order_by('-timestamp').first()

        univ_unread = Message.objects.filter(
            receiver_email=request.user.email,
            sender_type='official',
            is_read=False
        ).count()

        chats = [
            {
                "id": "university",
                "conversation_id": "conv_univ_admin",
                "type": "university",
                "name": str(university_display_name).upper(),
                "avatar": "U",
                "unread": univ_unread,
                "lastMessage": last_univ_msg.text[:30] if last_univ_msg and last_univ_msg.text else "Official Communication",
                "time": last_univ_msg.timestamp.isoformat() if last_univ_msg else "",
                "online": True,
                "email": "university_admin"
            }
        ]

        students = StudentProfile.objects.filter(
            college__icontains=college_profile.college_name
        ).select_related('user')

        for s in students:
            if not s.user: continue
            
            last_msg = Message.objects.filter(
                (Q(sender=s.user) & Q(receiver_email=request.user.email)) |
                (Q(sender=request.user) & Q(receiver_email=s.user.email))
            ).order_by('-timestamp').first()

            std_unread = Message.objects.filter(
                sender=s.user,
                receiver_email=request.user.email,
                is_read=False
            ).count()

            chats.append({
                "id": s.user.email,
                "conversation_id": f"conv_stud_{s.id}", 
                "type": "student",
                "name": "ANONYMOUS STUDENT", 
                "avatar": "S",
                "email": s.user.email,
                "unread": std_unread,
                "lastMessage": last_msg.text[:30] if last_msg and last_msg.text else "Click to reply",
                "time": last_msg.timestamp.isoformat() if last_msg else "",
                "online": False
            })

        return Response({"chats": chats}, status=200)

    except Exception as e:
        logger.error(f"Chat List Error: {str(e)}")
        return Response({"chats": [], "error": str(e)}, status=500)


# --- 🆕 GET MESSAGES ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def college_get_messages(request, identifier):
    try:
        base_url = request.build_absolute_uri('/')[:-1]
        user = request.user
        
        if identifier == 'university':
            msg_filter = (Q(sender=user) & Q(receiver_role='university')) | \
                         (Q(receiver_email=user.email) & Q(sender_type='official'))
        elif "@" in str(identifier):
            msg_filter = (Q(sender=user) & Q(receiver_email=identifier)) | \
                         (Q(sender__email=identifier) & Q(receiver_email=user.email))
        else:
            msg_filter = Q(report_id=identifier)

        Message.objects.filter(msg_filter).exclude(sender=user).filter(is_read=False).update(is_read=True)

        messages = Message.objects.filter(msg_filter).order_by('timestamp')
        
        data = []
        for m in messages:
            data.append({
                "id": m.id,
                "sender": m.sender_type,
                "text": m.text or "",
                "file_url": base_url + m.file.url if m.file else None,
                "is_file": bool(m.file),
                "time": m.timestamp.isoformat(), 
                "is_mine": m.sender == user,
                "is_read": m.is_read
            })
            
        return Response({"status": "success", "messages": data})
    except Exception as e:
        logger.error(f"Get Messages Error: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=500)


# --- 🆕 SEND MESSAGE ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def college_send_message(request):
    try:
        receiver_email = request.data.get('receiver_email') 
        receiver_type = request.data.get('receiver_type')   
        text = request.data.get('text', '')
        file_obj = request.FILES.get('file') 
        
        if receiver_type == 'university' or receiver_email == 'university_admin':
            final_role = 'university'
            target_email = None 
        else:
            final_role = 'student'
            target_email = receiver_email

        msg = Message.objects.create(
            sender=request.user,
            sender_type='official',
            sender_email=request.user.email,
            text=text,
            file=file_obj,
            receiver_email=target_email,
            receiver_role=final_role,
            is_file=True if file_obj else False,
            is_read=False 
        )
        
        return Response({
            "status": "success", 
            "message": "Message sent",
            "time": msg.timestamp.isoformat(), 
            "is_mine": True
        })
    except Exception as e:
        logger.error(f"Send Message Error: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=400)