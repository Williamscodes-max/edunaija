from django.urls import path
from .views import (
    IssueCertificateView,
    DownloadCertificateView,
    MyCertificatesView,
    VerifyCertificateView,
)

urlpatterns = [
    path(
        'issue/<int:course_id>/',
        IssueCertificateView.as_view(),
        name='issue-certificate'
    ),
    path(
        'download/<uuid:certificate_id>/',
        DownloadCertificateView.as_view(),
        name='download-certificate'
    ),
    path(
        'my/',
        MyCertificatesView.as_view(),
        name='my-certificates'
    ),
    path(
        'verify/<uuid:certificate_id>/',
        VerifyCertificateView.as_view(),
        name='verify-certificate'
    ),
]