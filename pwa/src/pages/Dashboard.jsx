import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinTeamId, setJoinTeamId] = useState('');
  const navigate = useNavigate();

  const loadTeams = async () => {
    try {
      const data = await api.getMyTeams();
      setTeams(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTeamName) return;
    try {
      await api.createTeam(newTeamName);
      setNewTeamName('');
      loadTeams();
    } catch (e) {
      alert('Nie udało się utworzyć zespołu.');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinTeamId) return;
    try {
      await api.joinTeam(joinTeamId);
      setJoinTeamId('');
      loadTeams();
    } catch (e) {
      alert('Nie udało się dołączyć do zespołu. Sprawdź ID.');
    }
  };

  const handleDeleteTeam = async (e, teamId) => {
    e.stopPropagation();
    if (window.confirm('Czy na pewno chcesz bezpowrotnie usunąć ten zespół i wszystkie jego zadania?')) {
      try {
        await api.deleteTeam(teamId);
        loadTeams();
      } catch (err) {
        alert('Błąd podczas usuwania zespołu.');
      }
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          <div>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: '600' }}>Twoje Zespoły</h2>
            {teams.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>Nie należysz jeszcze do żadnego zespołu.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {teams.map(team => (
                  <div 
                    key={team.id} 
                    className="glass-panel team-card" 
                    style={{ 
                      cursor: 'pointer', 
                      padding: '1.5rem', 
                      background: 'linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      position: 'relative'
                    }} 
                    onClick={() => navigate(`/teams/${team.id}`, { state: { teamName: team.name } })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{team.name}</h3>
                      <button 
                        className="btn-danger" 
                        style={{ padding: '6px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                        onClick={(e) => handleDeleteTeam(e, team.id)}
                        title="Usuń zespół"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.9rem' }}>
                        <Users size={14} />
                        <span>Członków: {team.members?.length || 1}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '12px' }}>
                        ID: {team.id.substring(0,8)}...
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ background: 'linear-gradient(145deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.6) 100%)' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Utwórz nowy zespół</h3>
              <form onSubmit={handleCreate}>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Nazwa zespołu" 
                    value={newTeamName} 
                    onChange={e => setNewTeamName(e.target.value)} 
                    style={{ background: 'rgba(0,0,0,0.2)' }}
                  />
                </div>
                <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                  <Plus size={18} /> Utwórz Zespół
                </button>
              </form>
            </div>

            <div className="glass-panel" style={{ background: 'linear-gradient(145deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.6) 100%)' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Dołącz do zespołu</h3>
              <form onSubmit={handleJoin}>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Wpisz ID zespołu" 
                    value={joinTeamId} 
                    onChange={e => setJoinTeamId(e.target.value)} 
                    style={{ background: 'rgba(0,0,0,0.2)' }}
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Dołącz
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
