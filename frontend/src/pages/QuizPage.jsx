import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ─── Phase constants ────────────────────────────────────────────────────────
const PHASE = {
  LOADING: 'loading',
  QUIZ: 'quiz',
  RESULT: 'result',
  MAX_ATTEMPTS: 'max_attempts',
};


const QuizPage = () => {
  const { slug, quizId } = useParams();
  const navigate = useNavigate();

  const [maxAttemptsData, setMaxAttemptsData] = useState(null);

  const [phase, setPhase] = useState(PHASE.LOADING);
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const mountedRef = useRef(true);

  // ─── Mount/unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    doStartQuiz();
    return () => {
      mountedRef.current = false;
      clearInterval(timerRef.current);
    };
  }, []);

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    clearInterval(timerRef.current);
    if (phase !== PHASE.QUIZ || timeLeft === null) return;

    timerRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          toast.error('⏰ Time is up!');
          doSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ─── Start quiz ───────────────────────────────────────────────────────────
  const doStartQuiz = async () => {
    clearInterval(timerRef.current);

    if (mountedRef.current) {
      setPhase(PHASE.LOADING);
      setQuiz(null);
      setAttemptId(null);
      setAnswers({});
      setCurrentIndex(0);
      setResult(null);
      setTimeLeft(null);
      setTimeTaken(0);
      setSubmitting(false);
    }

    try {
      const res = await api.post(`/quizzes/${quizId}/start/`);

      if (!mountedRef.current) return;

      const quizData = res.data.quiz;

      if (!quizData) {
        toast.error('Quiz data not found. Please try again.');
        navigate(`/courses/${slug}/learn`);
        return;
      }

      if (!quizData.questions || quizData.questions.length === 0) {
        toast.error('This quiz has no questions yet.');
        navigate(`/courses/${slug}/learn`);
        return;
      }

      setAttemptId(res.data.attempt_id);
      setQuiz(quizData);
      startTimeRef.current = Date.now();

      if (res.data.time_limit_minutes > 0) {
        setTimeLeft(res.data.time_limit_minutes * 60);
      }

      setPhase(PHASE.QUIZ);
    } catch (err) {
  if (!mountedRef.current) return;

  // Handle max attempts reached
  if (err.response?.status === 403 &&
      err.response?.data?.error === 'max_attempts_reached') {
    setMaxAttemptsData(err.response.data);
    setPhase('max_attempts');
    return;
  }

  const msg = err.response?.data?.error || 'Failed to start quiz.';
  toast.error(msg);
  navigate(`/courses/${slug}/learn`);
}
  };

  // ─── Select answer ────────────────────────────────────────────────────────
  const handleSelect = (questionId, answerId, isMultiple) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        return {
          ...prev,
          [questionId]: current.includes(answerId)
            ? current.filter((id) => id !== answerId)
            : [...current, answerId],
        };
      }
      return { ...prev, [questionId]: [answerId] };
    });
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const doSubmit = async (auto = false) => {
    if (!quiz || !attemptId || submitting) return;

    if (!auto) {
      const unanswered = quiz.questions.filter(
        (q) => !answers[q.id] || answers[q.id].length === 0
      ).length;

      if (unanswered > 0) {
        const ok = window.confirm(
          `You have ${unanswered} unanswered question(s). Submit anyway?`
        );
        if (!ok) return;
      }
    }

    clearInterval(timerRef.current);
    setSubmitting(true);

    const taken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setTimeTaken(taken);

    try {
      const res = await api.post(`/quizzes/attempts/${attemptId}/submit/`, {
        answers: quiz.questions.map((q) => ({
          question_id: q.id,
          answer_ids: answers[q.id] || [],
        })),
        time_taken_seconds: taken,
      });

      if (!mountedRef.current) return;
      setResult(res.data);
      setPhase(PHASE.RESULT);
    } catch (err) {
      if (!mountedRef.current) return;
      toast.error(err.response?.data?.error || 'Submission failed. Try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (phase === PHASE.LOADING) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-5xl mb-4 animate-bounce">📝</p>
          <p className="text-gray-500 font-medium">Preparing your quiz...</p>
          <p className="text-gray-400 text-xs mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // ─── Result ───────────────────────────────────────────────────────────────
  if (phase === PHASE.RESULT && result) {
    const correctCount = result.results?.filter((r) => r.is_correct).length ?? 0;
    const wrongCount = (result.results?.length ?? 0) - correctCount;

    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Score card */}
          <div
            className="rounded-2xl p-8 text-center text-white mb-8"
            style={{
              background: result.passed
                ? 'linear-gradient(135deg, #166534, #14532d)'
                : 'linear-gradient(135deg, #991b1b, #7f1d1d)',
            }}
          >
            <p className="text-6xl mb-3">{result.passed ? '🎉' : '😔'}</p>
            <h1 className="text-3xl font-bold mb-1">
              {result.passed ? 'You Passed!' : 'Keep Trying!'}
            </h1>
            <p className="opacity-75 text-sm mb-6">
              {result.passed
                ? 'Great work! You have mastered this topic.'
                : `You needed ${result.pass_score}% to pass. You can do better!`}
            </p>

            {/* Score circle */}
            <div
              className="inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 mb-6"
              style={{
                borderColor: 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
              }}
            >
              <span className="text-4xl font-bold">{result.score}%</span>
              <span className="text-xs opacity-70 mt-1">Your Score</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Correct', value: correctCount },
                { label: 'Wrong', value: wrongCount },
                { label: 'Marks', value: `${result.earned_marks}/${result.total_marks}` },
                { label: 'Time', value: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s` },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs opacity-70">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Answer review */}
          <h2 className="text-lg font-bold text-gray-800 mb-4">Answer Review</h2>
          <div className="space-y-4 mb-8">
            {result.results?.map((r, i) => (
              <div
                key={r.question_id}
                className="bg-white rounded-xl p-5 shadow-sm border-l-4"
                style={{ borderColor: r.is_correct ? '#22c55e' : '#ef4444' }}
              >
                <div className="flex gap-3 mb-3">
                  <span className="text-xl flex-shrink-0">
                    {r.is_correct ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Q{i + 1}: {r.question_text}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {r.marks_earned} / {r.total_marks} marks
                    </p>
                  </div>
                </div>
                <div className="ml-8">
                  <p className="text-xs font-semibold text-green-600 mb-1">
                    Correct answer{r.correct_answers.length > 1 ? 's' : ''}:
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {r.correct_answers.map((ans) => (
                      <span
                        key={ans.id}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ background: '#dcfce7', color: '#166534' }}
                      >
                        {ans.text}
                      </span>
                    ))}
                  </div>
                  {r.explanation && (
                    <p
                      className="text-xs text-gray-600 rounded-lg p-2"
                      style={{ background: '#f8fafc' }}
                    >
                      💡 {r.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/courses/${slug}/learn`)}
              className="flex-1 py-3 rounded-xl font-bold border-2 transition hover:bg-gray-50 text-sm"
              style={{ borderColor: '#0f172a', color: '#0f172a' }}
            >
              ← Back to Course
            </button>
            <button
              onClick={doStartQuiz}
              className="flex-1 py-3 rounded-xl font-bold text-white transition hover:opacity-90 text-sm"
              style={{ background: result.passed ? '#0f172a' : '#166534' }}
            >
              {result.passed ? '🔁 Retake Quiz' : '🔄 Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }


  // ─── Max Attempts Screen ──────────────────────────────────────────────────
if (phase === 'max_attempts' && maxAttemptsData) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div
          className="rounded-2xl p-8 text-center text-white mb-6"
          style={{
            background: maxAttemptsData.passed
              ? 'linear-gradient(135deg, #166534, #14532d)'
              : 'linear-gradient(135deg, #1e3a5f, #0f172a)',
          }}
        >
          <p className="text-6xl mb-4">
            {maxAttemptsData.passed ? '🏆' : '🔒'}
          </p>
          <h1 className="text-2xl font-bold mb-2">
            {maxAttemptsData.passed
              ? 'Quiz Completed!'
              : 'No More Attempts'}
          </h1>
          <p className="opacity-75 text-sm mb-6">
            {maxAttemptsData.message}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Attempts Used',
                value: `${maxAttemptsData.attempts_used}/${maxAttemptsData.max_attempts}`,
              },
              {
                label: 'Best Score',
                value: `${maxAttemptsData.best_score}%`,
              },
              {
                label: 'Pass Score',
                value: `${maxAttemptsData.pass_score}%`,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-5 text-center">
          {maxAttemptsData.passed ? (
            <>
              <p className="text-4xl mb-2">🎉</p>
              <p className="font-bold text-gray-800 mb-1">
                You passed this quiz!
              </p>
              <p className="text-sm text-gray-500">
                Your best score was{' '}
                <strong style={{ color: '#166534' }}>
                  {maxAttemptsData.best_score}%
                </strong>
                . Great work!
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl mb-2">📚</p>
              <p className="font-bold text-gray-800 mb-1">
                Maximum attempts reached
              </p>
              <p className="text-sm text-gray-500">
                You've used all {maxAttemptsData.max_attempts} attempts.
                Your best score was{' '}
                <strong style={{ color: '#0f172a' }}>
                  {maxAttemptsData.best_score}%
                </strong>
                . Review the course material and ask your instructor for help.
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/courses/${slug}/learn`)}
            className="flex-1 py-3 rounded-xl font-bold text-white transition hover:opacity-90"
            style={{ background: '#0f172a' }}
          >
            ← Back to Course
          </button>
          {maxAttemptsData.passed && (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 rounded-xl font-bold text-white transition hover:opacity-90"
              style={{ background: '#166534' }}
            >
              My Dashboard →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

  // ─── Quiz screen ──────────────────────────────────────────────────────────
  if (phase !== PHASE.QUIZ || !quiz) return null;

  const totalQ = quiz.questions.length;
  const question = quiz.questions[currentIndex];
  const isMultiple = question?.question_type === 'multiple';
  const selected = answers[question?.id] || [];
  const answeredCount = quiz.questions.filter(
    (q) => answers[q.id]?.length > 0
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top bar */}
      <div
        style={{ background: '#0f172a' }}
        className="text-white px-4 py-3 sticky top-0 z-10"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs text-gray-400 truncate max-w-xs">{quiz.title}</p>
              <p className="text-sm font-semibold">
                Question {currentIndex + 1} of {totalQ}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs px-2 py-1 rounded-lg"
                style={{ background: '#1e293b', color: '#94a3b8' }}
              >
                {answeredCount}/{totalQ} answered
              </span>
              {timeLeft !== null && (
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-lg"
                  style={{
                    background: timeLeft < 60 ? '#dc2626' : '#1e293b',
                    color: timeLeft < 60 ? 'white' : '#4ade80',
                  }}
                >
                  ⏱ {formatTime(timeLeft)}
                </span>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / totalQ) * 100}%`,
                background: '#4ade80',
              }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-5">

          {/* Question text */}
          <div className="flex gap-3 mb-5">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
              style={{ background: '#0f172a' }}
            >
              {currentIndex + 1}
            </span>
            <div>
              <p className="font-bold text-gray-800 leading-relaxed">
                {question?.text}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {isMultiple
                  ? '☑ Select all correct answers'
                  : question?.question_type === 'true_false'
                  ? '◉ True or False'
                  : '◉ Select one answer'}
                {' · '}{question?.marks} mark{question?.marks !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-3">
            {question?.answers.map((ans, idx) => {
              const isSelected = selected.includes(ans.id);
              const label = String.fromCharCode(65 + idx);
              return (
                <button
                  key={ans.id}
                  onClick={() => handleSelect(question.id, ans.id, isMultiple)}
                  className="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3"
                  style={{
                    borderColor: isSelected ? '#22c55e' : '#e2e8f0',
                    background: isSelected ? '#f0fdf4' : '#fafafa',
                  }}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all"
                    style={{
                      background: isSelected ? '#22c55e' : '#e2e8f0',
                      color: isSelected ? 'white' : '#64748b',
                      borderRadius: isMultiple ? '6px' : '50%',
                    }}
                  >
                    {isSelected ? '✓' : label}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: isSelected ? '#166534' : '#374151' }}
                  >
                    {ans.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition disabled:opacity-30"
            style={{ borderColor: '#0f172a', color: '#0f172a' }}
          >
            ← Previous
          </button>

          {/* Dot navigation */}
          <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
            {quiz.questions.map((q, i) => {
              const done = answers[q.id]?.length > 0;
              const active = i === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className="w-7 h-7 rounded-lg text-xs font-bold transition hover:scale-110"
                  style={{
                    background: done ? '#22c55e' : active ? '#0f172a' : '#e2e8f0',
                    color: done || active ? 'white' : '#64748b',
                    border: active ? '2px solid #4ade80' : '2px solid transparent',
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {currentIndex < totalQ - 1 ? (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition hover:opacity-90"
              style={{ background: '#0f172a' }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => doSubmit(false)}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: '#166534' }}
            >
              {submitting ? '⏳ Submitting...' : '✓ Submit Quiz'}
            </button>
          )}
        </div>

        {/* Submit from any question */}
        {currentIndex < totalQ - 1 && (
          <div className="text-center">
            <button
              onClick={() => doSubmit(false)}
              disabled={submitting}
              className="text-sm font-medium hover:underline disabled:opacity-50"
              style={{
                color: '#166534',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {submitting ? 'Submitting...' : 'Finish & Submit now →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;