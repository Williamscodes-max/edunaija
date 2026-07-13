import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav style={{ background: '#0f172a' }} className="text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-4">

        {/* Logo */}
        <Link to="/"
          style={{ color: '#4ade80', fontSize: '1.3rem', fontWeight: '800', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          EduNaija 🎓
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/courses"
            className="text-gray-300 hover:text-white transition text-sm"
            style={{ textDecoration: 'none' }}>
            Explore Courses
          </Link>

          {user ? (
            <>
              {user.role === 'student' && (
                <>
                  <Link to="/dashboard"
                    className="text-gray-300 hover:text-white transition text-sm"
                    style={{ textDecoration: 'none' }}>
                    My Learning
                  </Link>
                  <Link to="/certificates"
                    className="text-gray-300 hover:text-white transition text-sm"
                    style={{ textDecoration: 'none' }}>
                    Certificates
                  </Link>
                </>
              )}
              {user.role === 'instructor' && (
                <Link to="/instructor"
                  className="text-gray-300 hover:text-white transition text-sm"
                  style={{ textDecoration: 'none' }}>
                  Instructor Panel
                </Link>
              )}
              <div className="flex items-center gap-3 ml-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: '#22c55e', color: '#0f172a' }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-300 hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-gray-300 hover:text-white transition text-sm"
                style={{ textDecoration: 'none' }}>
                Log In
              </Link>
              <Link to="/register"
                className="text-sm px-4 py-2 rounded-lg font-bold transition hover:opacity-90"
                style={{ background: '#22c55e', color: '#0f172a', textDecoration: 'none' }}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <div className="space-y-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: 'block', width: '22px', height: '2px',
                background: 'white', transition: 'all 0.3s',
                transform: menuOpen && i === 0 ? 'rotate(45deg) translateY(7px)'
                  : menuOpen && i === 2 ? 'rotate(-45deg) translateY(-7px)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }} />
            ))}
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: '#1e293b', borderTop: '1px solid #334155' }}
          className="md:hidden px-4 py-4 flex flex-col gap-4">
          <Link to="/courses" onClick={closeMenu}
            style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem' }}>
             Explore Courses
          </Link>
          {user ? (
            <>
              {user.role === 'student' && (
                <>
                  <Link to="/dashboard" onClick={closeMenu}
                    style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem' }}>
                    My Learning
                  </Link>
                  <Link to="/certificates" onClick={closeMenu}
                    style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem' }}>
                     Certificates
                  </Link>
                </>
              )}
              {user.role === 'instructor' && (
                <Link to="/instructor" onClick={closeMenu}
                  style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem' }}>
                  👨‍🏫 Instructor Panel
                </Link>
              )}
              <button onClick={handleLogout}
                style={{
                  background: '#ef4444', color: 'white', border: 'none',
                  padding: '0.6rem 1rem', borderRadius: '8px',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem'
                }}>
                 Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}
                style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem' }}>
                🔑 Log In
              </Link>
              <Link to="/register" onClick={closeMenu}
                style={{
                  background: '#22c55e', color: '#0f172a',
                  padding: '0.6rem 1rem', borderRadius: '8px',
                  textDecoration: 'none', fontWeight: 'bold',
                  fontSize: '0.9rem', textAlign: 'center'
                }}>
                ✨ Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;