from django.urls import path
from .views import (
    QuizListView,
    QuizDetailView,
    StartQuizView,
    SubmitQuizView,
    MyQuizAttemptsView,
    QuizResultView,
)

urlpatterns = [
    path('courses/<int:course_id>/quizzes/', QuizListView.as_view(), name='quiz-list'),
    path('<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('<int:quiz_id>/start/', StartQuizView.as_view(), name='quiz-start'),
    path('attempts/<int:attempt_id>/submit/', SubmitQuizView.as_view(), name='quiz-submit'),
    path('<int:quiz_id>/attempts/', MyQuizAttemptsView.as_view(), name='quiz-attempts'),
    path('attempts/<int:pk>/result/', QuizResultView.as_view(), name='quiz-result'),
]