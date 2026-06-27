import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert, Dimensions } from 'react-native';
import { api } from '../services/api';
import * as Haptics from 'expo-haptics';

export default function BoardScreen({ route }) {
  const { teamId, teamName } = route.params;
  const displayTeamName = teamName || teamId;
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Jira-style Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  const { width } = Dimensions.get('window');
  const columnWidth = width;
  
  const priorities = ['LOW', 'MEDIUM', 'HIGH'];

  const loadTasksAndMembers = async () => {
    try {
      const data = await api.getTeamTasks(teamId);
      setTasks(data);
      const members = await api.getTeamMembers(teamId);
      setTeamMembers(members);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadTasksAndMembers();
  }, [teamId]);

  const handleCreateTask = async () => {
    if (!newTaskTitle) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await api.createTask(teamId, { title: newTaskTitle, description: '', status: 'TODO', priority: 'LOW', assignedTo: 'Nieprzypisane' });
    setNewTaskTitle('');
    loadTasksAndMembers();
  };

  const handleSaveDetails = async () => {
    if (!selectedTask) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? selectedTask : t));
      await api.updateTask(teamId, selectedTask.id, selectedTask);
      setSelectedTask(null);
    } catch (e) {
      console.log(e);
      loadTasksAndMembers();
    }
  };

  const moveTask = async (task, newStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      await api.updateTask(teamId, task.id, { ...task, status: newStatus });
    } catch (e) {
      loadTasksAndMembers();
    }
  };

  const deleteTask = async (taskId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await api.deleteTask(teamId, taskId);
    } catch (e) {
      loadTasks();
    }
  };

  const getPriorityColor = (p) => {
    if (p === 'HIGH') return '#ef4444';
    if (p === 'MEDIUM') return '#f59e0b';
    return '#3b82f6';
  };

  const renderColumn = (status, title) => {
    const colTasks = tasks.filter(t => t.status === status);
    return (
      <View style={[styles.column, { width: columnWidth }]}>
        <View style={styles.columnInner}>
          <Text style={styles.colHeader}>{title} ({colTasks.length})</Text>
          <ScrollView style={{ flex: 1 }}>
          {colTasks.map(task => (
            <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => { Haptics.selectionAsync(); setSelectedTask({ ...task }); }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.priority && <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]} />}
              </View>
              
              <Text style={styles.assigneeText}>👤 {task.assignedTo && task.assignedTo !== 'Nieprzypisane' ? task.assignedTo : 'Brak'}</Text>
              
              <View style={styles.actions}>
                {status === 'TODO' && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => moveTask(task, 'IN_PROGRESS')}>
                    <Text style={styles.actionText}>Rozpocznij</Text>
                  </TouchableOpacity>
                )}
                {status === 'IN_PROGRESS' && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10b981' }]} onPress={() => moveTask(task, 'DONE')}>
                    <Text style={styles.actionText}>Zakończ</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }]} onPress={() => deleteTask(task.id)}>
                  <Text style={styles.actionText}>Usuń</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.addBox}>
        <TextInput 
          style={styles.input} 
          placeholder="Nowe zadanie..." 
          placeholderTextColor="#94a3b8"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
        />
        <TouchableOpacity style={styles.btn} onPress={handleCreateTask}>
          <Text style={styles.btnText}>Dodaj</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {renderColumn('TODO', 'Do Zrobienia')}
        {renderColumn('IN_PROGRESS', 'W Trakcie')}
        {renderColumn('DONE', 'Gotowe')}
      </ScrollView>

      {/* MODAL SZCZEGÓŁÓW ZADANIA */}
      <Modal visible={!!selectedTask} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTask && (
              <ScrollView>
                <Text style={styles.modalTitle}>Szczegóły Zadania</Text>
                
                <Text style={styles.label}>Tytuł</Text>
                <TextInput style={styles.modalInput} value={selectedTask.title} onChangeText={t => setSelectedTask({...selectedTask, title: t})} />

                <Text style={styles.label}>Opis</Text>
                <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]} multiline value={selectedTask.description} onChangeText={t => setSelectedTask({...selectedTask, description: t})} placeholder="Wpisz opis..." placeholderTextColor="#64748b" />

                <Text style={styles.label}>Priorytet</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                  {priorities.map(p => (
                    <TouchableOpacity key={p} style={[styles.chip, selectedTask.priority === p && styles.chipActive]} onPress={() => setSelectedTask({...selectedTask, priority: p})}>
                      <Text style={[styles.chipText, selectedTask.priority === p && { color: '#fff' }]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Przypisane do</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                  <TouchableOpacity style={[styles.chip, selectedTask.assignedTo === 'Nieprzypisane' && styles.chipActive]} onPress={() => setSelectedTask({...selectedTask, assignedTo: 'Nieprzypisane'})}>
                    <Text style={[styles.chipText, selectedTask.assignedTo === 'Nieprzypisane' && { color: '#fff' }]}>Nieprzypisane</Text>
                  </TouchableOpacity>
                  {teamMembers.map(m => (
                    <TouchableOpacity key={m.uid} style={[styles.chip, selectedTask.assignedTo === m.displayName && styles.chipActive]} onPress={() => setSelectedTask({...selectedTask, assignedTo: m.displayName})}>
                      <Text style={[styles.chipText, selectedTask.assignedTo === m.displayName && { color: '#fff' }]}>{m.displayName}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                  <TouchableOpacity style={[styles.btn, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3b82f6' }]} onPress={() => setSelectedTask(null)}>
                    <Text style={[styles.btnText, { color: '#3b82f6' }]}>Anuluj</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={handleSaveDetails}>
                    <Text style={styles.btnText}>Zapisz</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  addBox: { padding: 15, flexDirection: 'row', gap: 10, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(30,41,59,0.5)' },
  input: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btn: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  
  column: { paddingHorizontal: 10, marginTop: 10 },
  columnInner: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 15 },
  colHeader: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  taskCard: { backgroundColor: 'rgba(30, 41, 59, 0.8)', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  taskTitle: { color: '#fff', fontSize: 16, marginBottom: 5, flex: 1 },
  priorityBadge: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  assigneeText: { color: '#94a3b8', fontSize: 12, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  actionBtn: { backgroundColor: '#3b82f6', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6 },
  actionText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 5, textTransform: 'uppercase' },
  modalInput: { backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 10 },
  chipActive: { backgroundColor: '#3b82f6' },
  chipText: { color: '#94a3b8', fontSize: 14 }
});
