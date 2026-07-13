from django.contrib import admin
from .models import Quiz, Question, Answer, QuizAttempt, StudentAnswer


class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 2


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'pass_score', 'time_limit_minutes', 'max_attempts', 'is_active']
    list_filter = ['is_active']
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['text', 'quiz', 'question_type', 'marks', 'order']
    list_filter = ['question_type']
    inlines = [AnswerInline]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'quiz', 'score', 'passed', 'status', 'started_at']
    list_filter = ['passed', 'status']
    readonly_fields = ['score', 'passed', 'status']