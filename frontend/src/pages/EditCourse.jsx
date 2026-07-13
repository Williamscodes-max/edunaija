import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionTitle, setSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [lessonForms, setLessonForms] = useState({});

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await api.get(`/courses/instructor/courses/${id}/`);
      setCourse(res.data);
    } catch {
      toast.error('Course not found');
      navigate('/instructor');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await api.patch(`/courses/instructor/courses/${id}/`, { status: 'published' });
      toast.success('Course published! 🎉');
      fetchCourse();
    } catch {
      toast.error('Failed to publish course');
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-500">
      Loading course...
    </div>
  );

  if (!course) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate('/instructor')}
        className="text-green-600 mb-6 flex items-center gap-1 hover:underline"
      >
        ← Back to Dashboard
      </button>

      {/* Course header */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{course.description}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${
            course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {course.status}
          </span>
        </div>
        {course.status === 'draft' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
            ⚠️ This course is in draft mode. Add at least one lesson, then publish it to make it visible to students.
            <button
              onClick={handlePublish}
              className="ml-3 px-3 py-1 rounded-lg text-white text-xs font-medium"
              style={{ background: '#166534' }}
            >
              Publish Now
            </button>
          </div>
        )}
      </div>

      {/* Important note about sections/lessons */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 mb-6">
        💡 <strong>Note:</strong> Sections and Lessons are managed through the Django Admin for now.
        Go to <code className="bg-blue-100 px-1 rounded">http://127.0.0.1:8000/admin</code> →
        Courses → click on "{course.title}" → add Sections and Lessons inline.
        A dedicated UI for this is a great next feature to build!
      </div>

      <div className="flex gap-3">
        <a
          href={`http://127.0.0.1:8000/admin/courses/course/${id}/change/`}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-lg text-white font-medium inline-block"
          style={{ background: '#1a1a2e', textDecoration: 'none' }}
        >
          Open in Django Admin →
        </a>
        <button
          onClick={fetchCourse}
          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition"
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

export default EditCourse;