import { auth } from '../config/firebase';

const API_BASE_URL = 'https://backend-webapps-qurf.onrender.com/api';

async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

async function fetchWithAuth(endpoint, options = {}) {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  if (options.method === 'DELETE') {
    return null;
  }
  
  return response.json();
}

export const api = {
  createTeam: (name) => fetchWithAuth('/teams', { method: 'POST', body: JSON.stringify({ name }) }),
  getMyTeams: () => fetchWithAuth('/teams'),
  joinTeam: (teamId) => fetchWithAuth(`/teams/${teamId}/join`, { method: 'POST' }),
  getTeamTasks: (teamId) => fetchWithAuth(`/teams/${teamId}/tasks`),
  createTask: (teamId, task) => fetchWithAuth(`/teams/${teamId}/tasks`, { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (teamId, taskId, task) => fetchWithAuth(`/teams/${teamId}/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(task) }),
  deleteTask: (teamId, taskId) => fetchWithAuth(`/teams/${teamId}/tasks/${taskId}`, { method: 'DELETE' }),

  getTeamMembers: (teamId) => fetchWithAuth(`/teams/${teamId}/members`),
  deleteTeam: (teamId) => fetchWithAuth(`/teams/${teamId}`, { method: 'DELETE' })
};
