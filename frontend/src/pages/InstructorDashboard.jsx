import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/courses/instructor/stats/');
      setStats(res.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { label: 'Total Courses', value: stats.total_courses, icon: '📚', color: '#1a1a2e' },
    { label: 'Published', value: stats.published_courses, icon: '✅', color: '#166534' },
    { label: 'Total Students', value: stats.total_enrollments, icon: '👥', color: '#1e40af' },
    { label: 'Revenue', value: `₦${stats.total_revenue.toLocaleString()}`, icon: '💰', color: '#92400e' },
    { label: 'Avg Rating', value: `${stats.average_rating} ⭐`, icon: '⭐', color: '#a16207' },
  ] : [];

  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-700',
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Instructor Dashboard 👨‍🏫
          </h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.username}</p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="px-6 py-3 rounded-lg text-white font-medium transition"
          style={{ background: '#1a1a2e', textDecoration: 'none' }}
        >
          + Create New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">My Courses</h2>

        {!stats || stats.courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-gray-500 mb-4">You haven't created any courses yet</p>
            <Link
              to="/instructor/courses/new"
              className="px-6 py-2 rounded-lg text-white font-medium inline-block"
              style={{ background: '#1a1a2e', textDecoration: 'none' }}
            >
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Students</th>
                  <th className="pb-3 font-medium">Lessons</th>
                  <th className="pb-3 font-medium">Rating</th>
                  <th className="pb-3 font-medium">Revenue</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {stats.courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-4 font-medium text-gray-800">{course.title}</td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[course.status]}`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-600">{course.enrollments}</td>
                    <td className="py-4 text-gray-600">{course.total_lessons}</td>
                    <td className="py-4 text-gray-600">
                      {course.rating > 0 ? `⭐ ${course.rating}` : '—'}
                    </td>
                    <td className="py-4 font-medium" style={{ color: '#166534' }}>
                      ₦{course.revenue.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <Link
                        to={`/instructor/courses/${course.id}/edit`}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium"
                        style={{ background: '#1a1a2e', color: 'white', textDecoration: 'none' }}
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;