from django.db import models
from django.conf import settings
from apps.courses.models import Course, Lesson


class Quiz(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='quizzes'
    )
    lesson = models.OneToOneField(
        Lesson,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quiz'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    pass_score = models.PositiveIntegerField(default=70)
    time_limit_minutes = models.PositiveIntegerField(
        default=0,
        help_text='0 means no time limit'
    )
    max_attempts = models.PositiveIntegerField(
        default=0,
        help_text='0 means unlimited attempts'
    )
    shuffle_questions = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Quizzes'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.course.title} — {self.title}"

    @property
    def total_questions(self):
        return self.questions.count()

    @property
    def total_marks(self):
        return sum(q.marks for q in self.questions.all())


class Question(models.Model):
    class QuestionType(models.TextChoices):
        SINGLE = 'single', 'Single Choice'
        MULTIPLE = 'multiple', 'Multiple Choice'
        TRUE_FALSE = 'true_false', 'True/False'

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    text = models.TextField()
    question_type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.SINGLE
    )
    marks = models.PositiveIntegerField(default=1)
    explanation = models.TextField(
        blank=True,
        help_text='Shown after answer is submitted'
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {self.text[:50]}"


class Answer(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers'
    )
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{'✅' if self.is_correct else '❌'} {self.text[:50]}"


class QuizAttempt(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        TIMED_OUT = 'timed_out', 'Timed Out'

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_attempts'
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='attempts'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )
    passed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_taken_seconds = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.email} — {self.quiz.title} ({self.score}%)"

    @property
    def attempt_number(self):
        return QuizAttempt.objects.filter(
            student=self.student,
            quiz=self.quiz,
            started_at__lte=self.started_at
        ).count()


class StudentAnswer(models.Model):
    attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        related_name='student_answers'
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='student_answers'
    )
    selected_answers = models.ManyToManyField(
        Answer,
        blank=True
    )
    is_correct = models.BooleanField(default=False)
    marks_earned = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"{self.attempt.student.email} — {self.question.text[:30]}"