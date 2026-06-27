import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import { Plus, Trash2, Edit2, User, AlertCircle } from 'lucide-react';

export default function Board() {
  const { teamId } = useParams();
  const location = useLocation();
  const teamName = location.state?.teamName || teamId;
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Jira-style Detailed Modal state
  const [selectedTask, setSelectedTask] = useState(null);

  // Drag & Drop
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const [teamMembers, setTeamMembers] = useState([]);

  const loadTasksAndMembers = async () => {
    try {
      const data = await api.getTeamTasks(teamId);
      setTasks(data);
      
      const members = await api.getTeamMembers(teamId);
      setTeamMembers(members);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTasksAndMembers();
    // eslint-disable-next-line
  }, [teamId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      await api.createTask(teamId, { title: newTaskTitle, description: '', status: 'TODO', priority: 'LOW', assignedTo: 'Nieprzypisane' });
      setShowModal(false);
      setNewTaskTitle('');
      loadTasksAndMembers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      // Optymistycznie
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? selectedTask : t));
      await api.updateTask(teamId, selectedTask.id, selectedTask);
      setSelectedTask(null);
    } catch (error) {
      console.error("Błąd zapisu detali", error);
      loadTasksAndMembers();
    }
  };

  const deleteTask = async (taskId, e) => {
    if(e) e.stopPropagation();
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await api.deleteTask(teamId, taskId);
    } catch (e) {
      console.error(e);
      loadTasksAndMembers();
    }
  };

  // --- HTML5 Drag & Drop ---
  const handleDragStart = (e, task) => {
    setDraggingTaskId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      const el = document.getElementById(`task-${task.id}`);
      if (el) el.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e, task) => {
    setDraggingTaskId(null);
    setDragOverCol(null);
    const el = document.getElementById(`task-${task.id}`);
    if (el) el.classList.remove('dragging');
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverCol(null);
  };

  const handleDrop = async (e, colId) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === colId) return;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: colId } : t));
    try {
      await api.updateTask(teamId, taskId, { ...task, status: colId });
    } catch (error) {
      loadTasksAndMembers();
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const columns = [
    { id: 'TODO', title: 'Do Zrobienia' },
    { id: 'IN_PROGRESS', title: 'W Trakcie' },
    { id: 'DONE', title: 'Gotowe' },
  ];

  const getPriorityColor = (priority) => {
    if (priority === 'HIGH') return '#ef4444';
    if (priority === 'MEDIUM') return '#f59e0b';
    return '#3b82f6'; // LOW
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className="container" style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Tablica Zadań (Zespół: {teamName})</h2>
          <button className="btn" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Dodaj Zadanie
          </button>
        </div>

        <div className="board-container">
          {columns.map(col => (
            <div 
              key={col.id} 
              className={`kanban-col ${dragOverCol === col.id ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="col-header">
                {col.title}
                <span style={{ color: 'var(--text-muted)' }}>{tasks.filter(t => t.status === col.id).length}</span>
              </div>
              <div className="task-list">
                {tasks.filter(t => t.status === col.id).map(task => (
                  <div 
                    key={task.id} 
                    id={`task-${task.id}`}
                    className="task-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={(e) => handleDragEnd(e, task)}
                    onMouseMove={handleMouseMove}
                    onClick={() => setSelectedTask({ ...task })}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ flex: 1, marginRight: '10px' }}>{task.title}</h3>
                      {task.priority && (
                        <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getPriorityColor(task.priority), marginTop: '4px' }} title={`Priorytet: ${task.priority}`} />
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <User size={14} style={{ marginRight: '5px' }} />
                      {task.assignedTo && task.assignedTo !== 'Nieprzypisane' ? task.assignedTo : 'Brak'}
                    </div>

                    <div className="task-meta">
                      <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={(e) => deleteTask(task.id, e)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Dodawania Zadań */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <h2>Szybkie dodawanie</h2>
            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <input type="text" className="input-field" placeholder="Tytuł zadania" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Anuluj</button>
                <button type="submit" className="btn" style={{ flex: 1 }}>Zapisz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JIRA STYLE DETAILED MODAL */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="glass-panel modal-content" style={{ maxWidth: '600px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}><Edit2 size={20} style={{ verticalAlign: 'middle', marginRight: '10px' }} />Szczegóły Zadania</h2>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {selectedTask.id.substring(0,8)}...</span>
            </div>

            <form onSubmit={handleSaveDetails}>
              <div className="input-group">
                <label style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>Tytuł</label>
                <input type="text" className="input-field" value={selectedTask.title} onChange={e => setSelectedTask({...selectedTask, title: e.target.value})} required />
              </div>

              <div className="input-group">
                <label style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>Opis</label>
                <textarea className="input-field" value={selectedTask.description || ''} onChange={e => setSelectedTask({...selectedTask, description: e.target.value})} rows={4} placeholder="Dodaj szerszy opis problemu..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>Przypisane do</label>
                  <select className="input-field" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} value={selectedTask.assignedTo || 'Nieprzypisane'} onChange={e => setSelectedTask({...selectedTask, assignedTo: e.target.value})}>
                    <option value="Nieprzypisane">Nieprzypisane</option>
                    {teamMembers.map(member => <option key={member.uid} value={member.displayName}>{member.displayName} ({member.email})</option>)}
                  </select>
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>Priorytet</label>
                  <select className="input-field" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} value={selectedTask.priority || 'LOW'} onChange={e => setSelectedTask({...selectedTask, priority: e.target.value})}>
                    <option value="LOW">Low (Niski)</option>
                    <option value="MEDIUM">Medium (Średni)</option>
                    <option value="HIGH">High (Wysoki)</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px', display: 'block' }}>Status</label>
                <select className="input-field" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} value={selectedTask.status} onChange={e => setSelectedTask({...selectedTask, status: e.target.value})}>
                  <option value="TODO">Do Zrobienia</option>
                  <option value="IN_PROGRESS">W Trakcie</option>
                  <option value="DONE">Gotowe</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedTask(null)}>Zamknij</button>
                <button type="submit" className="btn" style={{ flex: 1 }}>Zapisz Zmiany</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
