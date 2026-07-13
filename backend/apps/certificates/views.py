from django.http import HttpResponse
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Certificate
from .serializers import CertificateSerializer
from .generator import generate_certificate
from apps.courses.models import Enrollment, Course


class IssueCertificateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=404)

        # Check if student completed the course
        try:
            enrollment = Enrollment.objects.get(
                student=request.user,
                course=course,
                status='completed'
            )
        except Enrollment.DoesNotExist:
            return Response({
                'error': 'You must complete the course to get a certificate.',
                'progress': Enrollment.objects.filter(
                    student=request.user,
                    course=course
                ).first().progress_percentage if Enrollment.objects.filter(
                    student=request.user,
                    course=course
                ).exists() else 0
            }, status=400)

        # Get or create certificate
        certificate, created = Certificate.objects.get_or_create(
            student=request.user,
            course=course
        )

        return Response({
            'message': '🎓 Certificate issued successfully!' if created else 'Certificate already exists.',
            'certificate': CertificateSerializer(certificate).data,
        }, status=201 if created else 200)


class DownloadCertificateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, certificate_id):
        try:
            certificate = Certificate.objects.get(
                certificate_id=certificate_id,
                student=request.user
            )
        except Certificate.DoesNotExist:
            return Response({'error': 'Certificate not found.'}, status=404)

        # Generate PDF
        pdf_bytes = generate_certificate(certificate)

        # Return as downloadable PDF
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = (
            f'attachment; filename="EduNaija_Certificate_{certificate.certificate_number}.pdf"'
        )
        return response


class MyCertificatesView(generics.ListAPIView):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(
            student=self.request.user
        ).select_related('course', 'student')


class VerifyCertificateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, certificate_id):
        try:
            certificate = Certificate.objects.get(
                certificate_id=certificate_id
            )
            return Response({
                'valid': True,
                'certificate': CertificateSerializer(certificate).data,
            })
        except Certificate.DoesNotExist:
            return Response({
                'valid': False,
                'message': 'Certificate not found or invalid.'
            }, status=404)