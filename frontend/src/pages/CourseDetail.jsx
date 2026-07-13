import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  useEffect(() => {
    if (user && course) {
      checkEnrollment();
      fetchReviews();
    }
  }, [user, course]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/${slug}/`);
      setCourse(res.data);
      if (res.data.sections?.length > 0) {
        setOpenSection(res.data.sections[0].id);
      }
    } catch {
      toast.error('Course not found');
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const res = await api.get('/courses/my/enrollments/');
      const enrollments = res.data.results || res.data;
      const found = enrollments.find(
        (e) => e.course.slug === slug
      );
      setEnrollment(found || null);
    } catch {}
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/courses/${course.id}/reviews/`);
      setReviews(res.data.results || res.data);
    } catch {}
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can enroll in courses');
      return;
    }
    setEnrolling(true);
    try {
      if (course.is_free || course.price === 0) {
        await api.post(`/courses/${course.id}/enroll/`);
        toast.success('Enrolled successfully! 🎉');
        checkEnrollment();
      } else {
        const res = await api.post(`/courses/${course.id}/pay/`);
        window.location.href = res.data.payment_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/courses/${course.id}/reviews/`, reviewForm);
      toast.success('Review submitted! ⭐');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
      <div className="h-64 bg-gray-200 rounded mb-4" />
    </div>
  );

  if (!course) return null;

  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.status === 'completed';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="text-green-600 mb-6 flex items-center gap-1 hover:underline"
      >
        ← Back to Courses
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Course Header */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                style={{ background: '#dcfce7', color: '#166534' }}>
                {course.level}
              </span>
              <span className="text-xs text-gray-400">{course.category?.name}</span>
              <span className="text-xs text-gray-400">• {course.language}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span> {course.average_rating || 'No ratings yet'}</span>
              <span>👥 {course.total_enrollments} students</span>
              <span>📚 {course.total_lessons} lessons</span>
              <span>⏱ {course.total_duration} minutes</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: '#1a1a2e' }}>
                {course.instructor?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800">{course.instructor?.username}</p>
                <p className="text-xs text-gray-400">Instructor</p>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          {course.thumbnail && (
            <div className="rounded-xl overflow-hidden mb-6 shadow">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-64 object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/800x300?text=EduNaija'; }}
              />
            </div>
          )}

          {/* What you'll learn */}
          {course.what_you_learn && (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">What You'll Learn</h2>
              <ul className="space-y-2">
                {course.what_you_learn.split('\n').filter(Boolean).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {course.requirements && (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {course.requirements.split('\n').filter(Boolean).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                    <span className="text-gray-400 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Curriculum */}
          {course.sections?.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Course Curriculum ({course.total_lessons} lessons)
              </h2>
              <div className="space-y-3">
                {course.sections.map((section) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setOpenSection(
                        openSection === section.id ? null : section.id
                      )}
                      className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition"
                    >
                      <span className="font-medium text-gray-800">{section.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {section.lessons?.length} lessons
                        </span>
                        <span>{openSection === section.id ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {openSection === section.id && (
                      <div className="border-t border-gray-100">
                        {section.lessons?.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                          >
                            <span className="text-lg">
                              {lesson.lesson_type === 'video' ? '▶️' :
                               lesson.lesson_type === 'quiz' ? '📝' : '📄'}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700">{lesson.title}</p>
                              {lesson.duration_minutes > 0 && (
                                <p className="text-xs text-gray-400">{lesson.duration_minutes} min</p>
                              )}
                            </div>
                            {lesson.is_preview && (
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: '#dcfce7', color: '#166534' }}>
                                Preview
                              </span>
                            )}
                            {isEnrolled && (
                              <span className="text-xs text-green-500">
                                {enrollment?.lesson_progress?.find(
                                  (p) => p.lesson === lesson.id && p.is_completed
                                ) ? '✅' : '○'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Student Reviews ({reviews.length})
            </h2>

            {user?.role === 'student' && isEnrolled && (
              <form onSubmit={handleReviewSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">Write a Review</h3>
                <div className="flex gap-1 mb-3">
  {[1, 2, 3, 4, 5].map((star) => (
    <button
      key={star}
      type="button"
      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
      className="text-3xl transition hover:scale-110"
      style={{ 
        color: star <= reviewForm.rating ? '#fbbf24' : '#d1d5db',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0',
      }}
    >
      ★
    </button>
  ))}
  <span className="ml-2 text-sm text-gray-500 self-center">
    {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
  </span>
</div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={3}
                  placeholder="Share your experience..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: '#1a1a2e' }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review '}
                </button>
              </form>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2"></p>
                <p>No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{review.student_name}</p>
                        <p className="text-yellow-400 text-sm">{'⭐'.repeat(review.rating)}</p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-NG', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </p>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl shadow p-6 sticky top-24">
            {/* Price */}
            <div className="text-center mb-4">
              <p className="text-3xl font-bold" style={{ color: '#1a1a2e' }}>
                {course.is_free ? ' Free' : `₦${Number(course.price).toLocaleString()}`}
              </p>
            </div>

            {/* Enrollment Progress */}
            {isEnrolled && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium text-green-600">
                    {enrollment.progress_percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${enrollment.progress_percentage}%`,
                      background: '#4ade80'
                    }}
                  />
                </div>
                {isCompleted && (
                  <p className="text-green-600 text-sm font-medium mt-2 text-center">
                    🎓 Course Completed!
                  </p>
                )}
              </div>
            )}

            {/* Action Button */}
            {isEnrolled ? (
              <div className="space-y-3">
               <Link to={`/courses/${slug}/learn`}
              className="w-full py-3 rounded-lg font-bold text-white transition block text-center"
             style={{ background: '#166534', textDecoration: 'none' }}>
             Continue Learning →
             </Link>
                {isCompleted && (
                  <Link
                    to="/certificates"
                    className="w-full py-3 rounded-lg font-bold text-center block transition"
                    style={{
                      background: '#1a1a2e',
                      color: 'white',
                      textDecoration: 'none'
                    }}
                  >
                    🎓 Get Certificate
                  </Link>
                )}
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-3 rounded-lg font-bold text-white transition disabled:opacity-50"
                style={{ background: '#1a1a2e' }}
              >
                {enrolling ? 'Processing...' :
                  course.is_free ? 'Enroll for Free 🎓' : `Enroll — ₦${Number(course.price).toLocaleString()}`}
              </button>
            )}

            {/* Course Info */}
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>📚</span>
                <span>{course.total_lessons} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⏱</span>
                <span>{course.total_duration} minutes total</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📊</span>
                <span className="capitalize">{course.level} level</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🌍</span>
                <span>{course.language}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🏆</span>
                <span>Certificate of completion</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;