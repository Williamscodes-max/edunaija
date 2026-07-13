import uuid
import os
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Course, Enrollment, Lesson, LessonProgress, CourseReview
from .serializers import (
    CategorySerializer, CourseSerializer, CourseDetailSerializer,
    EnrollmentSerializer, LessonProgressSerializer, CourseReviewSerializer
)
from .permissions import IsInstructor, IsStudent, IsCourseInstructor
from .paystack import initialize_payment, verify_payment


from apps.users.models import User
from .models import Course, Enrollment


class PlatformStatsView(APIView):
    permission_classes = []

    def get(self, request):
        return Response({
            "students": User.objects.filter(role="student").count(),
            "instructors": User.objects.filter(role="instructor").count(),
            "courses": Course.objects.filter(status="published").count(),
            "enrollments": Enrollment.objects.count(),
        })


class InitiateCoursePaymentView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id, status='published')
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=404)

        if course.is_free or course.price == 0:
            return Response({'error': 'This course is free — use the enroll endpoint.'}, status=400)

        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({'error': 'Already enrolled.'}, status=400)

        reference = f"EDU-{uuid.uuid4().hex[:10].upper()}"
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        callback_url = f"{frontend_url}/payment/verify?reference={reference}&course_id={course_id}"

        payment = initialize_payment(
            email=request.user.email,
            amount=float(course.price),
            reference=reference,
            callback_url=callback_url,
            metadata={
                'course_id': course_id,
                'student_id': request.user.id,
                'course_title': course.title,
            }
        )

        if payment.get('status'):
            return Response({
                'payment_url': payment['data']['authorization_url'],
                'reference': reference,
                'course': CourseSerializer(course).data,
            })

        return Response({'error': 'Payment initialization failed.'}, status=400)


class VerifyCoursePaymentView(APIView):
    permission_classes = [IsStudent]

    def post(self, request):
        reference = request.data.get('reference')
        course_id = request.data.get('course_id')

        if not reference or not course_id:
            return Response(
                {'error': 'Reference and course_id are required.'},
                status=400
            )

        result = verify_payment(reference)

        if result.get('status') and result['data']['status'] == 'success':
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return Response({'error': 'Course not found.'}, status=404)

            enrollment, created = Enrollment.objects.get_or_create(
                student=request.user,
                course=course,
                defaults={
                    'is_paid': True,
                    'payment_reference': reference,
                    'status': 'active',
                }
            )

            if not created:
                enrollment.is_paid = True
                enrollment.payment_reference = reference
                enrollment.save()

            return Response({
                'message': '🎉 Payment successful! You are now enrolled.',
                'enrollment': EnrollmentSerializer(enrollment).data,
            })

        return Response({'error': 'Payment verification failed.'}, status=400)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'level', 'is_free']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'created_at', 'title']

    def get_queryset(self):
        return Course.objects.filter(
            status='published'
        ).select_related('instructor', 'category')


class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Course.objects.filter(
            status='published'
        ).select_related('instructor', 'category').prefetch_related('sections__lessons')


class InstructorCourseListView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsInstructor]

    def get_queryset(self):
        return Course.objects.filter(
            instructor=self.request.user
        ).select_related('category')

    def perform_create(self, serializer):
        title = serializer.validated_data.get('title', '')
        slug = slugify(title) + '-' + uuid.uuid4().hex[:6]
        serializer.save(instructor=self.request.user, slug=slug)


class InstructorCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsInstructor, IsCourseInstructor]

    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user)


class EnrollView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id, status='published')
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=404)

        if Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({'error': 'Already enrolled.'}, status=400)

        if course.is_free or course.price == 0:
            enrollment = Enrollment.objects.create(
                student=request.user,
                course=course,
                is_paid=True,
                status='active'
            )
            return Response(
                EnrollmentSerializer(enrollment).data,
                status=status.HTTP_201_CREATED
            )

        return Response({
            'message': 'Payment required.',
            'price': str(course.price),
            'course_id': course.id,
        }, status=status.HTTP_402_PAYMENT_REQUIRED)


class MyEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return Enrollment.objects.filter(
            student=self.request.user
        ).select_related('course').prefetch_related('course__lessons')


class MarkLessonCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
            enrollment = Enrollment.objects.get(
                student=request.user,
                course=lesson.course,
                status='active'
            )
        except (Lesson.DoesNotExist, Enrollment.DoesNotExist):
            return Response({'error': 'Not found.'}, status=404)

        progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson
        )
        progress.is_completed = True
        progress.completed_at = timezone.now()
        progress.save()

        # Check if course is fully completed
        total_lessons = lesson.course.total_lessons
        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).count()

        if total_lessons > 0 and completed_lessons >= total_lessons:
            enrollment.status = 'completed'
            enrollment.completed_at = timezone.now()
            enrollment.save()
            return Response({
                'message': 'Lesson completed! 🎉 Course completed!',
                'progress': enrollment.progress_percentage,
                'course_completed': True,
            })

        return Response({
            'message': 'Lesson marked as complete ✅',
            'progress': enrollment.progress_percentage,
            'course_completed': False,
        })


class CourseReviewView(generics.ListCreateAPIView):
    serializer_class = CourseReviewSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsStudent()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        return CourseReview.objects.filter(
            course_id=self.kwargs['course_id']
        ).select_related('student')

    def perform_create(self, serializer):
        course_id = self.kwargs['course_id']
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise serializers.ValidationError('Course not found.')

        if not Enrollment.objects.filter(
            student=self.request.user,
            course=course
        ).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('You must be enrolled to review this course.')

        if CourseReview.objects.filter(
            course=course,
            student=self.request.user
        ).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('You have already reviewed this course.')

        serializer.save(student=self.request.user, course=course)


class CourseProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            enrollment = Enrollment.objects.get(
                student=request.user,
                course_id=course_id
            )
        except Enrollment.DoesNotExist:
            return Response({'error': 'Not enrolled.'}, status=404)

        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).values_list('lesson_id', flat=True)

        return Response({
            'progress_percentage': enrollment.progress_percentage,
            'status': enrollment.status,
            'completed_lessons': list(completed_lessons),
            'total_lessons': enrollment.course.total_lessons,
        })
    

class StudentCourseContentView(generics.RetrieveAPIView):
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        return Course.objects.select_related(
            'instructor', 'category'
        ).prefetch_related('sections__lessons')

    def retrieve(self, request, *args, **kwargs):
        course = self.get_object()

        # Verify enrollment
        try:
            enrollment = Enrollment.objects.get(
                student=request.user,
                course=course,
                status__in=['active', 'completed']
            )
        except Enrollment.DoesNotExist:
            return Response(
                {'error': 'You must be enrolled to access this content.'},
                status=403
            )

        completed_lesson_ids = list(
            LessonProgress.objects.filter(
                enrollment=enrollment,
                is_completed=True
            ).values_list('lesson_id', flat=True)
        )

        data = CourseDetailSerializer(course).data
        data['completed_lesson_ids'] = completed_lesson_ids
        data['progress_percentage'] = enrollment.progress_percentage
        data['enrollment_status'] = enrollment.status

        return Response(data)
    


from django.db.models import Sum, Avg, Count


class InstructorStatsView(APIView):
    permission_classes = [IsInstructor]

    def get(self, request):
        courses = Course.objects.filter(instructor=request.user)

        total_courses = courses.count()
        published_courses = courses.filter(status='published').count()

        total_enrollments = Enrollment.objects.filter(
            course__instructor=request.user
        ).count()

        total_revenue = Enrollment.objects.filter(
            course__instructor=request.user,
            is_paid=True
        ).aggregate(
            total=Sum('course__price')
        )['total'] or 0

        avg_rating = CourseReview.objects.filter(
            course__instructor=request.user
        ).aggregate(avg=Avg('rating'))['avg'] or 0

        # Per-course breakdown
        course_stats = []
        for course in courses:
            course_stats.append({
                'id': course.id,
                'title': course.title,
                'status': course.status,
                'enrollments': course.total_enrollments,
                'revenue': float(course.price) * course.enrollments.filter(is_paid=True).count(),
                'rating': course.average_rating,
                'total_lessons': course.total_lessons,
            })

        return Response({
            'total_courses': total_courses,
            'published_courses': published_courses,
            'total_enrollments': total_enrollments,
            'total_revenue': float(total_revenue) if isinstance(total_revenue, (int, float)) else 0,
            'average_rating': round(avg_rating, 1),
            'courses': course_stats,
        })
    

from django.db.models import Avg
from rest_framework.permissions import AllowAny
from apps.users.models import User

class PlatformStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "students": User.objects.filter(role="student").count(),
            "instructors": User.objects.filter(role="instructor").count(),
            "courses": Course.objects.filter(status="published").count(),
            "enrollments": Enrollment.objects.count(),
        })
    



class PublicStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()

        total_students = User.objects.filter(role='student').count()
        total_instructors = User.objects.filter(role='instructor').count()
        total_courses = Course.objects.filter(status='published').count()
        total_enrollments = Enrollment.objects.filter(status__in=['active', 'completed']).count()
        completed_enrollments = Enrollment.objects.filter(status='completed').count()

        completion_rate = 0
        if total_enrollments > 0:
            completion_rate = round((completed_enrollments / total_enrollments) * 100)

        return Response({
            'total_students': total_students,
            'total_instructors': total_instructors,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'completion_rate': f"{completion_rate}%",
        })