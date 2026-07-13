from django.urls import path
from .views import PlatformStatsView
from .views import (
    CategoryListView,
    CourseListView,
    CourseDetailView,
    InstructorCourseListView,
    InstructorCourseDetailView,
    EnrollView,
    MyEnrollmentsView,
    MarkLessonCompleteView,
    CourseReviewView,
    CourseProgressView,
    InitiateCoursePaymentView,
    VerifyCoursePaymentView,
    StudentCourseContentView,
    InstructorStatsView,
    PublicStatsView,
    
)

urlpatterns = [
    # Public
    path('', CourseListView.as_view(), name='course-list'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('<slug:slug>/', CourseDetailView.as_view(), name='course-detail'),
    path('<int:course_id>/reviews/', CourseReviewView.as_view(), name='course-reviews'),
    path('<int:course_id>/progress/', CourseProgressView.as_view(), name='course-progress'),

    # Student — enrollment
    path('<int:course_id>/enroll/', EnrollView.as_view(), name='enroll'),
    path('my/enrollments/', MyEnrollmentsView.as_view(), name='my-enrollments'),
    path('<slug:slug>/learn/', StudentCourseContentView.as_view(), name='course-learn'),

    # Student — payments
    path('<int:course_id>/pay/', InitiateCoursePaymentView.as_view(), name='course-pay'),
    path('payment/verify/', VerifyCoursePaymentView.as_view(), name='course-payment-verify'),

    # Lesson progress
    path('lessons/<int:lesson_id>/complete/', MarkLessonCompleteView.as_view(), name='lesson-complete'),

    # Instructor
    path('instructor/courses/', InstructorCourseListView.as_view(), name='instructor-courses'),
    path('instructor/courses/<int:pk>/', InstructorCourseDetailView.as_view(), name='instructor-course-detail'),
     path('instructor/stats/', InstructorStatsView.as_view(), name='instructor-stats'),
     path("stats/", PlatformStatsView.as_view(), name="platform-stats"),
     path('stats/', PublicStatsView.as_view(), name='public-stats'),
]