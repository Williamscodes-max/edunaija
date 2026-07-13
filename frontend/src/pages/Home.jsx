import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../utils/getMediaUrl';
import CountUp from '../components/CountUp';

const CourseCard = ({ course }) => {
  const thumbnail = course.thumbnail_url || getMediaUrl(course.thumbnail);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 flex flex-col">
      {/* Thumbnail */}
      <div className="relative">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-40 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, #0f172a, #1e3a5f)` }}>
            <span className="text-5xl">
              {course.category?.icon || '🎓'}
            </span>
          </div>
        )}
        {course.is_free && (
          <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full font-bold"
            style={{ background: '#22c55e', color: 'white' }}>
            FREE
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded font-medium capitalize"
            style={{ background: '#f0fdf4', color: '#166534' }}>
            {course.level}
          </span>
          <span className="text-xs text-gray-400">{course.category?.name}</span>
        </div>

        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm leading-snug">
          {course.title}
        </h3>

        <p className="text-xs text-gray-500 mb-2">
          by {course.instructor?.username}
        </p>

        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
          {course.average_rating > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              {course.average_rating}
            </span>
          )}
          <span>•</span>
          <span>{course.total_lessons} lessons</span>
          <span>•</span>
          <span>{course.total_duration} min</span>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-gray-900">
            {course.is_free ? (
              <span style={{ color: '#22c55e' }}>Free</span>
            ) : (
              `₦${Number(course.price).toLocaleString()}`
            )}
          </span>
          <Link
            to={`/courses/${course.slug}`}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition hover:opacity-90"
            style={{ background: '#0f172a', color: 'white', textDecoration: 'none' }}
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

const Home = () => {

  
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, catsRes] = await Promise.all([
          api.get('/courses/?ordering=-created_at'),
          api.get('/courses/categories/'),
        ]);
        setCourses(coursesRes.data.results || coursesRes.data);
        setCategories(catsRes.data.results || catsRes.data);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/courses?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const stats = [
    { value: '500+', label: 'Students Enrolled' },
    { value: '50+', label: 'Expert Courses' },
    { value: '20+', label: 'Top Instructors' },
    { value: '95%', label: 'Completion Rate' },
  ];

  const features = [
    { icon: '🎯', title: 'Expert-Led Courses', desc: 'Learn directly from Nigeria\'s top professionals and academics.' },
    { icon: '📱', title: 'Learn at Your Pace', desc: 'Access course materials anytime, anywhere, on any device.' },
    { icon: '🏆', title: 'Earn Certificates', desc: 'Get recognized with verifiable completion certificates.' },
    { icon: '🤝', title: 'Community Support', desc: 'Connect with fellow learners and get help when you need it.' },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f4c2a 100%)' }}
        className="text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full mb-6 font-medium"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
            🇳🇬 Nigeria's Leading Learning Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Unlock Your Potential<br />
            <span style={{ color: '#4ade80' }}>Learn. Grow. Succeed.</span>
          </h1>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of Nigerians learning in-demand skills from expert instructors.
            Start your journey today with free and affordable courses.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto mb-8">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="What do you want to learn today?"
              className="flex-1 px-5 py-4 rounded-l-xl text-gray-800 focus:outline-none text-sm"
            />
            <button
              type="submit"
              className="px-6 py-4 rounded-r-xl font-bold transition hover:opacity-90 text-sm"
              style={{ background: '#22c55e', color: 'white' }}
            >
              Search
            </button>
          </form>

          <p className="text-xs text-gray-400">
            Popular: Python, Web Development, Data Science, UI/UX Design
          </p>
        </div>
      </div>

  
     {/* Stats */}
<div style={{ background: '#0f172a' }} className="py-8">
  <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4 text-center text-white">
    {[
      { end: 500, suffix: '+', label: 'Students Enrolled' },
      { end: 50, suffix: '+', label: 'Expert Courses' },
      { end: 20, suffix: '+', label: 'Top Instructors' },
      { end: 95, suffix: '%', label: 'Completion Rate' },
    ].map((stat) => (
      <div key={stat.label}>
        <p className="text-3xl font-bold" style={{ color: '#4ade80' }}>
          <CountUp end={stat.end} suffix={stat.suffix} duration={2000} />
        </p>
        <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
      </div>
    ))}
  </div>
</div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Browse Categories</h2>
          <div className="flex gap-3 flex-wrap">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/courses?category=${cat.slug}`}
                className="px-4 py-2 rounded-lg text-sm font-medium border transition hover:border-green-400 hover:text-green-700"
                style={{ borderColor: '#e2e8f0', color: '#374151', textDecoration: 'none', background: 'white' }}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Courses */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Latest Courses</h2>
          <Link to="/courses" style={{ color: '#22c55e', textDecoration: 'none' }}
            className="text-sm font-medium hover:underline">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
                <div className="w-full h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📚</p>
            <p>No courses available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {courses.slice(0, 8).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Why Learn with EduNaija?
            </h2>
            <p className="text-gray-500">
              Everything you need to grow your skills and advance your career
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Become Instructor CTA */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
          <div className="p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="text-6xl">👨‍🏫</div>
            <div className="flex-1 text-white">
              <h3 className="text-2xl font-bold mb-2">Become an Instructor</h3>
              <p className="text-gray-300 mb-4 text-sm">
                Share your knowledge with thousands of Nigerian learners.
                Create courses, set your own price, and earn while teaching.
              </p>
              <Link
                to="/register"
                className="inline-block px-6 py-3 rounded-lg font-bold text-sm transition hover:opacity-90"
                style={{ background: '#22c55e', color: 'white', textDecoration: 'none' }}
              >
                Start Teaching Today →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;