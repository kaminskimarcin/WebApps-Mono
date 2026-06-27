import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { auth } from '../config/firebase';
import { api } from '../services/api';
import * as Haptics from 'expo-haptics';

export default function TeamsScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState('');
  const [joinTeam, setJoinTeam] = useState('');

  const loadTeams = async () => {
    try {
      const data = await api.getMyTeams();
      setTeams(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTeams();
    });
    return unsubscribe;
  }, [navigation]);

  const handleCreate = async () => {
    if (!newTeam) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await api.createTeam(newTeam);
    setNewTeam('');
    loadTeams();
  };

  const handleJoin = async () => {
    if (!joinTeam) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await api.joinTeam(joinTeam);
    setJoinTeam('');
    loadTeams();
  };

  const handleDeleteTeam = async (teamId) => {
    Alert.alert(
      "Usuń Zespół",
      "Czy na pewno chcesz usunąć ten zespół?",
      [
        { text: "Anuluj", style: "cancel" },
        { 
          text: "Usuń", 
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await api.deleteTeam(teamId);
            loadTeams();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Twoje Zespoły</Text>
      </View>

      <FlatList 
        data={teams}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => {
              Haptics.selectionAsync();
              navigation.navigate('Board', { teamId: item.id, teamName: item.name });
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>ID: {item.id}</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteTeam(item.id)}>
              <Text style={{ color: '#ef4444', fontSize: 18 }}>🗑</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <View style={styles.actionBox}>
        <TextInput 
          style={styles.input} 
          placeholder="Nazwa nowego zespołu..." 
          placeholderTextColor="#94a3b8"
          value={newTeam}
          onChangeText={setNewTeam}
        />
        <TouchableOpacity style={styles.btn} onPress={handleCreate}>
          <Text style={styles.btnText}>Utwórz</Text>
        </TouchableOpacity>
        
        <View style={{ height: 15 }} />
        
        <TextInput 
          style={styles.input} 
          placeholder="Wpisz ID istniejącego zespołu..." 
          placeholderTextColor="#94a3b8"
          value={joinTeam}
          onChangeText={setJoinTeam}
        />
        <TouchableOpacity style={[styles.btn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]} onPress={handleJoin}>
          <Text style={styles.btnText}>Dołącz</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  logoutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  card: { 
    backgroundColor: 'rgba(30, 41, 59, 0.8)', 
    marginHorizontal: 20, 
    marginBottom: 15, 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardSub: { color: '#64748b', marginTop: 5, fontSize: 12 },
  deleteBtn: { padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 10 },
  actionBox: { padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: 'rgba(30, 41, 59, 0.95)', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10 },
  input: { backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btn: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
