from rest_framework import serializers
from .models import Certificate
from apps.courses.serializers import CourseSerializer


class CertificateSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_id', 'certificate_number',
            'course', 'student_name', 'issued_at'
        ]

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username