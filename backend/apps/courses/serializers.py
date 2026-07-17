from rest_framework import serializers
from .models import Category, Course, Section, Lesson, Enrollment, LessonProgress, CourseReview
from apps.users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon']


class LessonSerializer(serializers.ModelSerializer):
    quiz = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'lesson_type', 'video_url',
            'content', 'duration_minutes', 'order',
            'is_preview', 'quiz'
        ]

    def get_quiz(self, obj):
        if hasattr(obj, 'quiz') and obj.quiz:
            return {'id': obj.quiz.id, 'title': obj.quiz.title}
        return None


class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'title', 'order', 'lessons']


class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    total_lessons = serializers.IntegerField(read_only=True)
    total_duration = serializers.IntegerField(read_only=True)
    total_enrollments = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description',
            'thumbnail', 'thumbnail_url', 'price', 'level', 'status',
            'is_free', 'requirements', 'what_you_learn',
            'language', 'instructor', 'category', 'category_id',
            'total_lessons', 'total_duration', 'total_enrollments',
            'average_rating', 'created_at',
        ]
        read_only_fields = ['slug', 'instructor']

    def get_thumbnail_url(self, obj):
        if not obj.thumbnail:
            return None

        url = obj.thumbnail.url

        # Cloudinary already returns a complete URL
        if url.startswith("http://") or url.startswith("https://"):
            return url

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(url)

        return url

class CourseDetailSerializer(CourseSerializer):
    sections = SectionSerializer(many=True, read_only=True)

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['sections']


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            'id', 'course', 'status', 'is_paid',
            'progress_percentage', 'enrolled_at', 'completed_at'
        ]
        read_only_fields = ['status', 'is_paid', 'enrolled_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'is_completed', 'completed_at']


class CourseReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    student_email = serializers.EmailField(source='student.email', read_only=True)

    class Meta:
        model = CourseReview
        fields = ['id', 'student_name', 'student_email', 'rating', 'comment', 'created_at']
        read_only_fields = ['student_name', 'student_email', 'created_at']