"""
EduNaija Quiz Grading Engine
Handles auto-grading logic for single, multiple choice and true/false questions.
"""


def grade_single_choice(question, selected_answer_ids):
    """
    Single choice: full marks if the one selected answer is correct.
    """
    if not selected_answer_ids:
        return False, 0

    correct_answers = set(
        question.answers.filter(is_correct=True).values_list('id', flat=True)
    )
    selected = set(selected_answer_ids)

    is_correct = selected == correct_answers
    marks_earned = question.marks if is_correct else 0
    return is_correct, marks_earned


def grade_multiple_choice(question, selected_answer_ids):
    """
    Multiple choice: partial marking supported.
    - Full marks if all correct answers selected and no wrong answers.
    - Partial marks = (correct_selected / total_correct) * marks
    - Penalty: each wrong selection reduces score.
    """
    if not selected_answer_ids:
        return False, 0

    all_answers = question.answers.all()
    correct_ids = set(
        a.id for a in all_answers if a.is_correct
    )
    wrong_ids = set(
        a.id for a in all_answers if not a.is_correct
    )
    selected = set(selected_answer_ids)

    correct_selected = selected & correct_ids
    wrong_selected = selected & wrong_ids

    if not correct_ids:
        return False, 0

    # Partial scoring
    raw_score = (len(correct_selected) / len(correct_ids)) * question.marks
    penalty = (len(wrong_selected) / max(len(wrong_ids), 1)) * question.marks
    marks_earned = max(0, raw_score - penalty)
    marks_earned = round(marks_earned, 2)

    is_correct = (
        correct_selected == correct_ids and
        len(wrong_selected) == 0
    )
    return is_correct, marks_earned


def grade_true_false(question, selected_answer_ids):
    """
    True/False: same as single choice — one answer, full marks or zero.
    """
    return grade_single_choice(question, selected_answer_ids)


def grade_attempt(attempt):
    """
    Main grading function. Grades an entire quiz attempt.
    Returns: dict with score, passed, total_marks, earned_marks, results per question
    """
    from .models import StudentAnswer

    student_answers = StudentAnswer.objects.filter(
        attempt=attempt
    ).prefetch_related('selected_answers', 'question__answers')

    total_marks = attempt.quiz.total_marks
    earned_marks = 0
    results = []

    for student_answer in student_answers:
        question = student_answer.question
        selected_ids = list(
            student_answer.selected_answers.values_list('id', flat=True)
        )

        # Route to correct grader based on question type
        if question.question_type == 'single':
            is_correct, marks = grade_single_choice(question, selected_ids)
        elif question.question_type == 'multiple':
            is_correct, marks = grade_multiple_choice(question, selected_ids)
        elif question.question_type == 'true_false':
            is_correct, marks = grade_true_false(question, selected_ids)
        else:
            is_correct, marks = False, 0

        # Update student answer record
        student_answer.is_correct = is_correct
        student_answer.marks_earned = marks
        student_answer.save()

        earned_marks += marks

        # Build result with explanation
        correct_answers = list(
            question.answers.filter(is_correct=True).values('id', 'text')
        )
        results.append({
            'question_id': question.id,
            'question_text': question.text,
            'is_correct': is_correct,
            'marks_earned': marks,
            'total_marks': question.marks,
            'explanation': question.explanation,
            'correct_answers': correct_answers,
        })

    # Calculate percentage score
    if total_marks > 0:
        score_percentage = round((earned_marks / total_marks) * 100, 2)
    else:
        score_percentage = 0

    passed = score_percentage >= attempt.quiz.pass_score

    return {
        'score': score_percentage,
        'passed': passed,
        'earned_marks': earned_marks,
        'total_marks': total_marks,
        'results': results,
    }