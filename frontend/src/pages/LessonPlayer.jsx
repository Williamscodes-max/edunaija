import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const LessonPlayer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [slug]);

  const fetchContent = async () => {
    try {
      const res = await api.get(`/courses/${slug}/learn/`);
      setCourse(res.data);
      setCompletedIds(res.data.completed_lesson_ids || []);

      // Auto-select first incomplete lesson, or first lesson
      const allLessons = res.data.sections.flatMap((s) => s.lessons);
      const firstIncomplete = allLessons.find(
        (l) => !res.data.completed_lesson_ids.includes(l.id)
      );
      setCurrentLesson(firstIncomplete || allLessons[0] || null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot access this course');
      navigate(`/courses/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    setMarking(true);
    try {
      const res = await api.post(`/courses/lessons/${currentLesson.id}/complete/`);
      setCompletedIds((prev) => [...new Set([...prev, currentLesson.id])]);
      toast.success(res.data.message);

      if (res.data.course_completed) {
        toast.success('🎉 Congratulations! Course completed!', { duration: 5000 });
      }

      // Auto-advance to next lesson
      const allLessons = course.sections.flatMap((s) => s.lessons);
      const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
      const nextLesson = allLessons[currentIndex + 1];
      if (nextLesson) {
        setCurrentLesson(nextLesson);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to mark complete');
    } finally {
      setMarking(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Loading course content...</p>
    </div>
  );

  if (!course) return null;

  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const isCurrentCompleted = currentLesson && completedIds.includes(currentLesson.id);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="lg:w-80 bg-white border-r border-gray-200 lg:h-screen lg:sticky lg:top-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <Link
            to={`/courses/${slug}`}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
            style={{ textDecoration: 'none' }}
          >
            ← Back to course
          </Link>
          <h2 className="font-bold text-gray-800 text-sm">{course.title}</h2>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Your Progress</span>
              <span className="font-medium" style={{ color: '#166534' }}>
                {course.progress_percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${course.progress_percentage}%`, background: '#4ade80' }}
              />
            </div>
          </div>
        </div>

        <div className="p-2">
          {course.sections.map((section) => (
            <div key={section.id} className="mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase px-3 py-2">
                {section.title}
              </p>
              {section.lessons.map((lesson) => {
                const isCompleted = completedIds.includes(lesson.id);
                const isActive = currentLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(lesson)}
                    className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition mb-1"
                    style={{
                      background: isActive ? '#f0fdf4' : 'transparent',
                      border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
                    }}
                  >
                    <span className="text-lg flex-shrink-0">
                      {isCompleted ? '✅' :
                       lesson.lesson_type === 'video' ? '▶️' :
                       lesson.lesson_type === 'quiz' ? '📝' : '📄'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isActive ? 'font-medium' : ''}`}
                        style={{ color: isActive ? '#166534' : '#374151' }}>
                        {lesson.title}
                      </p>
                      {lesson.duration_minutes > 0 && (
                        <p className="text-xs text-gray-400">{lesson.duration_minutes} min</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 lg:p-10">
        {!currentLesson ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📚</p>
            <p>No lessons available in this course yet.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <span className="text-xs px-2 py-1 rounded-full font-medium uppercase"
                style={{ background: '#dcfce7', color: '#166534' }}>
                {currentLesson.lesson_type}
              </span>
              <h1 className="text-2xl font-bold text-gray-800 mt-3">
                {currentLesson.title}
              </h1>
            </div>

            {/* Video */}
            {currentLesson.lesson_type === 'video' && currentLesson.video_url && (
              <div className="rounded-xl overflow-hidden shadow-lg mb-6 bg-black aspect-video">
                <iframe
                  src={currentLesson.video_url}
                  title={currentLesson.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {currentLesson.lesson_type === 'video' && !currentLesson.video_url && (
              <div className="rounded-xl bg-gray-800 text-white aspect-video flex items-center justify-center mb-6">
                <p>📹 Video not yet uploaded</p>
              </div>
            )}

            {/* Text content */}
            {currentLesson.content && (
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {currentLesson.content}
                </p>
              </div>
            )}

            {/* Quiz link */}
            {currentLesson.lesson_type === 'quiz' && (
              <div className="bg-white rounded-xl shadow p-6 mb-6 text-center">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-gray-600 mb-4">This lesson includes a quiz</p>
                {currentLesson.quiz ? (
                <Link
                  to={`/courses/${slug}/quiz/${currentLesson.quiz.id}`}
                  className="px-6 py-2 rounded-lg text-white font-medium inline-block"
                  style={{ background: '#0f172a', textDecoration: 'none' }}
                >
                  Take Quiz →
                </Link>
                ) : (
                  <p className="text-gray-500 text-sm">Quiz will be available soon.</p>
                )}
              </div>
            )}

            {/* Mark complete button */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate(-1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <button
                onClick={handleMarkComplete}
                disabled={marking || isCurrentCompleted}
                className="px-6 py-3 rounded-lg font-bold text-white transition disabled:opacity-50"
                style={{ background: isCurrentCompleted ? '#9ca3af' : '#166534' }}
              >
                {isCurrentCompleted ? '✅ Completed' :
                  marking ? 'Marking...' : 'Mark as Complete →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPlayer;