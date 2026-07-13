import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4"
    style={{ background: '#f8fafc' }}>
    <div>
      <p className="text-8xl mb-4">🎓</p>
      <h1 className="text-5xl font-bold mb-3" style={{ color: '#0f172a' }}>404</h1>
      <p className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</p>
      <p className="text-gray-500 mb-8 max-w-sm mx-auto">
        Looks like this lesson doesn't exist yet. Let's get you back on track!
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          to="/"
          className="px-6 py-3 rounded-xl font-bold text-white transition hover:opacity-90"
          style={{ background: '#0f172a', textDecoration: 'none' }}
        >
          Go Home
        </Link>
        <Link
          to="/courses"
          className="px-6 py-3 rounded-xl font-bold border-2 transition hover:bg-gray-50"
          style={{ borderColor: '#0f172a', color: '#0f172a', textDecoration: 'none' }}
        >
          Browse Courses
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;