from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'certificate_number', 'issued_at']
    readonly_fields = ['certificate_id', 'issued_at']
    search_fields = ['student__email', 'course__title']