import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Learn': [
      { label: 'All Courses', to: '/courses' },
      { label: 'Web Development', to: '/courses?category=web-development' },
      { label: 'Data Science', to: '/courses?category=data-science' },
      { label: 'UI/UX Design', to: '/courses?category=design' },
     
    ],
    'Teach': [
      { label: 'Become an Instructor', to: '/register' },
      { label: 'Instructor Dashboard', to: '/instructor' },
      { label: 'Create a Course', to: '/instructor/courses/new' },
    ],
    'Account': [
      { label: 'My Dashboard', to: '/dashboard' },
      { label: 'My Certificates', to: '/certificates' },
      { label: 'Login', to: '/login' },
      { label: 'Register', to: '/register' },
    ],
  };

  const socialLinks = [
    { icon: '𝕏', label: 'Twitter', href: '#' },
    { icon: 'in', label: 'LinkedIn', href: '#' },
    { icon: 'f', label: 'Facebook', href: '#' },
    { icon: '▶', label: 'YouTube', href: '#' },
  ];

  return (
    <footer style={{ background: '#0f172a' }} className="text-white mt-16">

      {/* Newsletter Banner */}
      <div style={{ background: 'linear-gradient(135deg, #166534, #14532d)' }}
        className="py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">
              Stay ahead of the curve 🚀
            </h3>
            <p className="text-green-200 text-sm">
              Get notified about new courses and learning resources
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-64 px-4 py-2.5 rounded-lg text-gray-800 text-sm focus:outline-none"
            />
            <button
              className="px-5 py-2.5 rounded-lg font-bold text-sm transition hover:opacity-90 whitespace-nowrap"
              style={{ background: '#0f172a', color: '#4ade80' }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              to="/"
              style={{ color: '#4ade80', fontSize: '1.5rem', fontWeight: '800',
                textDecoration: 'none', letterSpacing: '-0.5px' }}
            >
              EduNaija 🎓
            </Link>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-xs">
              Nigeria's premier online learning platform. Learn in-demand skills
              from expert instructors and advance your career.
            </p>

            {/* Trust badges */}
            <div className="flex gap-3 mt-5 flex-wrap">
              {[
                { icon: '🔒', text: 'Secure Payments' },
                { icon: '🎓', text: 'Certified Courses' },
                { icon: '🇳🇬', text: 'Made in Nigeria' },
              ].map((badge) => (
                <div
                  key={badge.text}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                  style={{ background: '#1e293b', color: '#94a3b8' }}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex gap-3 mt-5">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition hover:opacity-80"
                  style={{ background: '#1e293b', color: '#94a3b8', textDecoration: 'none' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-green-400 transition text-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #1e293b' }}>
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {currentYear} EduNaija. All rights reserved. Made with ❤️ in Nigeria 🇳🇬
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-500 hover:text-gray-300 transition text-xs"
                style={{ textDecoration: 'none' }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;