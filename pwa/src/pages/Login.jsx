import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle, signInWithEmail, registerWithEmail, currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error("Login failed", error);
      alert("Błąd podczas logowania Google. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isRegister) {
        if (!displayName) {
          alert('Proszę podać swoje imię!');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/');
    } catch (error) {
      console.error("Auth failed", error);
      alert("Błąd: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-panel auth-card">
        <h1>WebApps Board</h1>
        <p style={{ marginBottom: '2rem' }}>Zarządzaj swoimi zadaniami nowocześnie i szybko. Zaloguj się, aby kontynuować.</p>
        
        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isRegister && (
            <input 
              type="text" 
              className="input-field" 
              placeholder="Twoje Imię (np. Jan Kowalski)" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          )}
          <input 
            type="email" 
            className="input-field" 
            placeholder="E-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            className="input-field" 
            placeholder="Hasło" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn" style={{ width: '100%', padding: '16px' }} disabled={loading}>
            {isRegister ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={() => setIsRegister(!isRegister)} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {isRegister ? 'Masz już konto? Zaloguj się' : 'Nie masz konta? Zarejestruj się'}
          </button>
        </div>

        {!isRegister && (
          <div style={{ marginTop: '25px' }}>
            <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '15px' }}>LUB</p>
            <button type="button" className="btn" style={{ width: '100%', padding: '16px', backgroundColor: '#fff', color: '#000' }} onClick={handleGoogleLogin} disabled={loading}>
              <LogIn size={20} />
              Zaloguj przez Google
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
