import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return null;

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2 style={{ margin: 0, background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          WebApps Board
        </h2>
      </div>
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          <LayoutDashboard size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          Zespoły
        </Link>
        <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
          <User size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          Profil
        </Link>
      </div>
    </nav>
  );
}
