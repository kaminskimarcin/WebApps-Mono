import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error("Login failed", error);
      alert("Błąd podczas logowania. Spróbuj ponownie.");
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-panel auth-card">
        <h1>WebApps Board</h1>
        <p style={{ marginBottom: '2rem' }}>Zarządzaj swoimi zadaniami nowocześnie i szybko. Zaloguj się, aby kontynuować.</p>
        
        <button className="btn" style={{ width: '100%', padding: '16px' }} onClick={handleLogin}>
          <LogIn size={20} />
          Zaloguj przez Google
        </button>
      </div>
    </div>
  );
}
