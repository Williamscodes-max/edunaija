import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [enrollRes, certRes] = await Promise.all([
        api.get('/courses/my/enrollments/'),
        api.get('/certificates/my/'),
      ]);
      setEnrollments(enrollRes.data.results || enrollRes.data);
      setCertificates(certRes.data.results || certRes.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (courseId) => {
    try {
      await api.post(`/certificates/issue/${courseId}/`);
      toast.success('Certificate issued! 🎓');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to issue certificate');
    }
  };

  const handleDownload = async (certificateId, certificateNumber) => {
    try {
      toast.loading('Preparing download...');
      const token = localStorage.getItem('access_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
      const url = `${baseUrl}/certificates/download/${certificateId}/`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss();

      if (!response.ok) throw new Error(`Download failed: ${response.status}`);

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `EduNaija_Certificate_${certificateNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
      toast.success('Certificate downloaded! 🎓');
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || 'Failed to download certificate');
    }
  };

  const stats = [
    {
      label: 'Enrolled Courses',
      value: enrollments.length,
      icon: '📚',
      color: '#0f172a',
    },
    {
      label: 'Completed',
      value: enrollments.filter((e) => e.status === 'completed').length,
      icon: '✅',
      color: '#166534',
    },
    {
      label: 'In Progress',
      value: enrollments.filter((e) => e.status === 'active').length,
      icon: '📖',
      color: '#1e40af',
    },
    {
      label: 'Certificates',
      value: certificates.length,
      icon: '🎓',
      color: '#92400e',
    },
  ];

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Continue your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: `${stat.color}15` }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">My Courses</h2>
          <Link
            to="/courses"
            className="text-sm font-medium hover:underline"
            style={{ color: '#22c55e', textDecoration: 'none' }}
          >
            Browse More →
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-gray-500 mb-4">
              You haven't enrolled in any courses yet
            </p>
            <Link
              to="/courses"
              className="px-6 py-2 rounded-lg text-white font-medium inline-block"
              style={{ background: '#0f172a', textDecoration: 'none' }}
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const cert = certificates.find(
                (c) => c.course.id === enrollment.course.id
              );

              return (
                <div
                  key={enrollment.id}
                  className="border border-gray-100 rounded-xl p-4 hover:border-green-200 transition"
                >
                  <div className="flex flex-col md:flex-row gap-4">

                    {/* Thumbnail */}
                    <div
                      className="w-full md:w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl"
                      style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}
                    >
                      {enrollment.course.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : '🎓'}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {enrollment.course.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            👨‍🏫 {enrollment.course.instructor?.username} •
                            📚 {enrollment.course.total_lessons} lessons
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          enrollment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {enrollment.status === 'completed'
                            ? '✅ Completed'
                            : '📖 In Progress'}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium" style={{ color: '#22c55e' }}>
                            {enrollment.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${enrollment.progress_percentage}%`,
                              background: enrollment.status === 'completed'
                                ? '#22c55e'
                                : '#3b82f6',
                            }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <Link
                          to={`/courses/${enrollment.course.slug}/learn`}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                          style={{
                            background: '#0f172a',
                            color: 'white',
                            textDecoration: 'none',
                          }}
                        >
                          {enrollment.status === 'completed'
                            ? 'Review Course'
                            : 'Continue Learning →'}
                        </Link>

                        {enrollment.status === 'completed' && (
                          cert ? (
                            <button
                              onClick={() => handleDownload(
                                cert.certificate_id,
                                cert.certificate_number
                              )}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                              style={{
                                background: '#166534',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              🎓 Download Certificate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleIssueCertificate(enrollment.course.id)}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                              style={{
                                background: '#92400e',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              🎓 Get Certificate
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              My Certificates 🎓
            </h2>
            <Link
              to="/certificates"
              className="text-sm font-medium hover:underline"
              style={{ color: '#22c55e', textDecoration: 'none' }}
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="border-2 border-dashed rounded-xl p-4 text-center"
                style={{ borderColor: '#fbbf24', background: '#fffbeb' }}
              >
                <div className="text-3xl mb-2">🎓</div>
                <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">
                  {cert.course.title}
                </h3>
                <p className="text-xs text-gray-500 mb-1">
                  ID: {cert.certificate_number}
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  {new Date(cert.issued_at).toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <button
                  onClick={() => handleDownload(
                    cert.certificate_id,
                    cert.certificate_number
                  )}
                  className="text-xs px-4 py-2 rounded-lg font-medium w-full transition hover:opacity-90"
                  style={{
                    background: '#0f172a',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;