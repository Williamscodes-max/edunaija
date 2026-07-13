import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Certificate = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/certificates/my/');
      setCertificates(res.data.results || res.data);
    } catch {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
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

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Certificates 🎓</h1>
      <p className="text-gray-500 mb-8">
        Your earned certificates from completed courses
      </p>

      {certificates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-6xl mb-4">🎓</p>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            No certificates yet
          </h2>
          <p className="text-gray-500 mb-6">
            Complete a course to earn your first certificate!
          </p>
          <Link
            to="/courses"
            className="px-6 py-3 rounded-lg text-white font-medium inline-block"
            style={{ background: '#0f172a', textDecoration: 'none' }}
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl shadow-sm border-2 border-dashed overflow-hidden"
              style={{ borderColor: '#fbbf24' }}
            >
              {/* Certificate Header */}
              <div className="p-5"
                style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🎓</div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#4ade80' }}>
                      EduNaija Certificate
                    </p>
                    <p className="text-white font-bold text-sm mt-0.5">
                      Certificate of Completion
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="p-5 bg-yellow-50">
                <p className="text-xs text-gray-500 mb-1">Course Completed</p>
                <h3 className="font-bold text-gray-800 mb-3 text-sm">
                  {cert.course.title}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: '#0f172a' }}
                  >
                    {cert.student_name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {cert.student_name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>ID: <strong>{cert.certificate_number}</strong></span>
                  <span>
                    {new Date(cert.issued_at).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(cert.certificate_id, cert.certificate_number)}
                    className="flex-1 py-2 rounded-lg text-white text-xs font-bold transition hover:opacity-90"
                    style={{ background: '#0f172a', border: 'none', cursor: 'pointer' }}
                  >
                    ⬇️ Download PDF
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/certificates/verify/${cert.certificate_id}`
                      );
                      toast.success('Verification link copied!');
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-bold border transition hover:bg-gray-50"
                    style={{ borderColor: '#0f172a', color: '#0f172a', background: 'white', cursor: 'pointer' }}
                  >
                    🔗 Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificate;