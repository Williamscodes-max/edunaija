# from django.contrib import admin
# from django.urls import path, include
# from django.conf import settings
# from django.conf.urls.static import static

# admin.site.site_header = "EduNaija Admin"
# admin.site.site_title = "EduNaija LMS"

# urlpatterns = [
#     path('admin/', admin.site.urls),
# ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "EduNaija Admin"
admin.site.site_title = "EduNaija LMS"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/courses/', include('apps.courses.urls')),
    path('api/v1/quizzes/', include('apps.quizzes.urls')),
    path('api/v1/certificates/', include('apps.certificates.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)