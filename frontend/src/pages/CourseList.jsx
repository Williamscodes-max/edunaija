import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../utils/getMediaUrl';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category') || '';
  const selectedLevel = searchParams.get('level') || '';
  const selectedFree = searchParams.get('is_free') || '';

  useEffect(() => {
    api.get('/courses/categories/')
      .then((res) => setCategories(res.data.results || res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [search, selectedCategory, selectedLevel, selectedFree]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category__slug = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;
      if (selectedFree) params.is_free = selectedFree;
      const res = await api.get('/courses/', { params });
      setCourses(res.data.results || res.data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const current = Object.fromEntries(searchParams);
    if (value) {
      current[key] = value;
    } else {
      delete current[key];
    }
    setSearchParams(current);
  };

  const clearFilters = () => {
    setSearch('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">All Courses</h1>
      <p className="text-gray-500 mb-8">
        {courses.length} course{courses.length !== 1 ? 's' : ''} available
      </p>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <select
          value={selectedCategory}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</option>
          ))}
        </select>
        <select
          value={selectedLevel}
          onChange={(e) => updateFilter('level', e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          value={selectedFree}
          onChange={(e) => updateFilter('is_free', e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="">All Prices</option>
          <option value="true">Free Only</option>
          <option value="false">Paid Only</option>
        </select>
        {(selectedCategory || selectedLevel || selectedFree || search) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition text-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow overflow-hidden animate-pulse">
              <div className="w-full h-44 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-500 text-lg mb-4">No courses found.</p>
          <button onClick={clearFilters} className="text-green-600 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
             {course.thumbnail_url || course.thumbnail ? (
  <img
    src={course.thumbnail_url || getMediaUrl(course.thumbnail)}
    alt={course.title}
    className="w-full h-44 object-cover"
    onError={(e) => {
      e.target.style.display = 'none';
    }}
  />
) : (
  <div
    className="w-full h-44 flex items-center justify-center text-5xl"
    style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}
  >
    {course.category?.icon || '🎓'}
  </div>
)}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                    style={{ background: '#dcfce7', color: '#166534' }}>
                    {course.level}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">⭐</span>
                    <span className="text-xs text-gray-500">{course.average_rating || 'New'}</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-xs text-gray-500 mb-3">
                  👨‍🏫 {course.instructor?.username} • 📚 {course.total_lessons} lessons • ⏱ {course.total_duration} mins
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg" style={{ color: '#1a1a2e' }}>
                    {course.is_free ? '🆓 Free' : `₦${Number(course.price).toLocaleString()}`}
                  </span>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="text-sm px-3 py-1.5 rounded-lg font-medium transition"
                    style={{ background: '#1a1a2e', color: 'white', textDecoration: 'none' }}
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;