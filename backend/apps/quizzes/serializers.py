from rest_framework import serializers
from .models import Quiz, Question, Answer, QuizAttempt, StudentAnswer



class QuizBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'total_questions', 'pass_score', 'time_limit_minutes']


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text']


class AnswerWithCorrectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'text', 'question_type',
            'marks', 'order', 'answers'
        ]


class QuizSerializer(serializers.ModelSerializer):
    total_questions = serializers.IntegerField(read_only=True)
    total_marks = serializers.IntegerField(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description', 'pass_score',
            'time_limit_minutes', 'max_attempts',
            'shuffle_questions', 'total_questions', 'total_marks'
        ]


class QuizDetailSerializer(QuizSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta(QuizSerializer.Meta):
        fields = QuizSerializer.Meta.fields + ['questions']


class StudentAnswerInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    answer_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True
    )


class QuizSubmitSerializer(serializers.Serializer):
    answers = StudentAnswerInputSerializer(many=True)
    time_taken_seconds = serializers.IntegerField(default=0)


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'status', 'score', 'passed',
            'started_at', 'completed_at', 'time_taken_seconds',
            'attempt_number'
        ]