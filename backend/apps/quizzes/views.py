from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Quiz, Question, Answer, QuizAttempt, StudentAnswer
from .serializers import (
    QuizSerializer, QuizDetailSerializer,
    QuizSubmitSerializer, QuizAttemptSerializer
)
from .grader import grade_attempt
from apps.courses.models import Enrollment
from apps.courses.permissions import IsStudent, IsInstructor


class QuizListView(generics.ListAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(
            course_id=self.kwargs['course_id'],
            is_active=True
        )


class QuizDetailView(generics.RetrieveAPIView):
    serializer_class = QuizDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(is_active=True)

    def retrieve(self, request, *args, **kwargs):
        quiz = self.get_object()

        # Shuffle questions if enabled
        if quiz.shuffle_questions:
            questions = list(quiz.questions.prefetch_related('answers'))
            import random
            random.shuffle(questions)
            from .serializers import QuestionSerializer
            data = QuizDetailSerializer(quiz).data
            data['questions'] = QuestionSerializer(questions, many=True).data
            return Response(data)

        return super().retrieve(request, *args, **kwargs)


class StartQuizView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id, is_active=True)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found.'}, status=404)

        # Check enrollment
        if not Enrollment.objects.filter(
            student=request.user,
            course=quiz.course,
            status__in=['active', 'completed']
        ).exists():
            return Response(
                {'error': 'You must be enrolled to take this quiz.'},
                status=403
            )

        # Check max attempts
        attempt_count = QuizAttempt.objects.filter(
            student=request.user,
            quiz=quiz,
            status='completed'
        ).count()

        if quiz.max_attempts > 0 and attempt_count >= quiz.max_attempts:
            # Get best score from all attempts
            best_attempt = QuizAttempt.objects.filter(
                student=request.user,
                quiz=quiz,
                status='completed'
            ).order_by('-score').first()

            return Response({
                'error': 'max_attempts_reached',
                'message': f'You have used all {quiz.max_attempts} attempts.',
                'attempts_used': attempt_count,
                'max_attempts': quiz.max_attempts,
                'best_score': float(best_attempt.score) if best_attempt else 0,
                'passed': best_attempt.passed if best_attempt else False,
                'pass_score': quiz.pass_score,
            }, status=403)

        # Check for in-progress attempt — mark it completed so user can start fresh
        existing = QuizAttempt.objects.filter(
            student=request.user,
            quiz=quiz,
            status='in_progress'
        ).first()

        if existing:
            # Auto-complete the old attempt so user can start fresh
            existing.status = 'completed'
            existing.completed_at = timezone.now()
            existing.save()

        # Create new attempt
        attempt = QuizAttempt.objects.create(
            student=request.user,
            quiz=quiz,
            status='in_progress'
        )

        return Response({
            'message': 'Quiz started! Good luck! 🎯',
            'attempt_id': attempt.id,
            'quiz': QuizDetailSerializer(quiz).data,
            'time_limit_minutes': quiz.time_limit_minutes,
            'attempts_used': attempt_count + 1,
            'max_attempts': quiz.max_attempts,
        }, status=201)


class SubmitQuizView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, attempt_id):
        try:
            attempt = QuizAttempt.objects.get(
                id=attempt_id,
                student=request.user,
                status='in_progress'
            )
        except QuizAttempt.DoesNotExist:
            return Response({'error': 'Attempt not found.'}, status=404)

        serializer = QuizSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        answers_data = serializer.validated_data['answers']
        time_taken = serializer.validated_data['time_taken_seconds']

        # Save student answers
        for answer_data in answers_data:
            question_id = answer_data['question_id']
            answer_ids = answer_data['answer_ids']

            try:
                question = attempt.quiz.questions.get(id=question_id)
            except Question.DoesNotExist:
                continue

            student_answer, _ = StudentAnswer.objects.get_or_create(
                attempt=attempt,
                question=question
            )
            student_answer.selected_answers.set(
                Answer.objects.filter(id__in=answer_ids)
            )
            student_answer.save()

        # Grade the attempt
        grading_result = grade_attempt(attempt)

        # Update attempt record
        attempt.score = grading_result['score']
        attempt.passed = grading_result['passed']
        attempt.status = 'completed'
        attempt.completed_at = timezone.now()
        attempt.time_taken_seconds = time_taken
        attempt.save()

        return Response({
            'message': '🎉 Quiz submitted successfully!',
            'score': grading_result['score'],
            'passed': grading_result['passed'],
            'earned_marks': grading_result['earned_marks'],
            'total_marks': grading_result['total_marks'],
            'pass_score': attempt.quiz.pass_score,
            'results': grading_result['results'],
            'attempt_number': attempt.attempt_number,
        })


class MyQuizAttemptsView(generics.ListAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsStudent]

    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user,
            quiz_id=self.kwargs.get('quiz_id')
        ).select_related('quiz')


class QuizResultView(generics.RetrieveAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(student=self.request.user)