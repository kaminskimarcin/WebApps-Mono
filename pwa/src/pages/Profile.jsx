import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { LogOut, Edit2, Save, X } from 'lucide-react';
import { updateProfile } from 'firebase/auth';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === currentUser.displayName) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName: newName.trim() });
      setIsEditing(false);
      // Odświeżenie wymusza ponowne zaciągnięcie danych z currentUser
      window.location.reload();
    } catch (error) {
      alert("Wystąpił błąd podczas aktualizacji profilu.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', background: 'linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)' }}>
          
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Avatar" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '1rem', border: '3px solid var(--primary)' }} 
            />
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 1rem', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
              {newName ? newName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}

          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '2rem' }}>
              <input 
                type="text" 
                className="input-field" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                style={{ width: '200px', textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}
                autoFocus
              />
              <button className="btn" style={{ padding: '8px' }} onClick={handleUpdateName} disabled={loading}>
                <Save size={18} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => setIsEditing(false)}>
                <X size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>{currentUser.displayName || 'Użytkownik'}</h2>
              <button 
                onClick={() => setIsEditing(true)} 
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                title="Edytuj nazwę"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
          
          <p style={{ marginBottom: '2.5rem', color: '#94a3b8' }}>{currentUser.email}</p>
          
          <button className="btn btn-danger" onClick={() => logout()} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <LogOut size={20} /> Wyloguj się z urządzenia
          </button>
        </div>
      </div>
    </div>
  );
}
