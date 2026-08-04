import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckSquare, Square, ChevronRight, LogOut } from 'lucide-react-native';
import { useAppContext } from '../../store/AppContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CHECKLIST_ITEMS = [
  "Cero Alcohol",
  "Ejercicio Diario",
  "Cero Comida Chatarra",
  "Lectura Diaria (10 págs)",
  "Tarea Semanal: Agua Helada"
];

export default function DashboardScreen() {
  const router = useRouter();
  const { currentDay, markDayCompleted, dailyProgress, setMockAuth, firebaseUser } = useAppContext();

  const currentDayData = dailyProgress.find(d => d.day === currentDay);
  const isAlreadyCompleted = currentDayData?.completed ?? false;

  const [checklist, setChecklist] = useState<boolean[]>(new Array(5).fill(false));

  useEffect(() => {
    const fetchChecklist = async () => {
      if (firebaseUser) {
        try {
          const checklistDocRef = doc(db, 'users', firebaseUser.uid, 'checklist', String(currentDay));
          const docSnap = await getDoc(checklistDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setChecklist(data.items || new Array(5).fill(false));
          } else {
            setChecklist(new Array(5).fill(false));
          }
        } catch (e) {
          console.error("Failed to fetch checklist", e);
          Alert.alert('Error', 'No se pudo cargar tu progreso de Firestore. Intenta de nuevo.');
        }
      }
    };

    fetchChecklist();
  }, [currentDay, firebaseUser]);

  const toggleCheck = async (index: number) => {
    if (isAlreadyCompleted) return;

    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setChecklist(newChecklist);

    if (firebaseUser) {
      try {
        const checklistDocRef = doc(db, 'users', firebaseUser.uid, 'checklist', String(currentDay));
        await setDoc(checklistDocRef, { items: newChecklist });
      } catch (e) {
        console.error("Failed to save checklist to Firestore", e);
        Alert.alert('Error', 'No se pudo guardar tu progreso. Verifica tu conexión a internet e intenta de nuevo.');
      }
    }
  };

  const allChecked = checklist.every(Boolean);

  const handleCompleteDay = () => {
    if (allChecked && !isAlreadyCompleted) {
      markDayCompleted(currentDay);
      // Reset checklist for the next day
      setChecklist(new Array(5).fill(false));
    }
  };

  const handleLogout = async () => {
    try {
      setMockAuth(false);
      await signOut(auth);
      // The auth guard should catch this and redirect, or we can manually push:
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={styles.headerText}>MODO GUERRA ACTIVADO</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Día {currentDay} / 45</Text>
          </View>
        </View>

        <View style={styles.checklistContainer}>
          {CHECKLIST_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checklistItem}
              onPress={() => toggleCheck(index)}
              disabled={isAlreadyCompleted}
              activeOpacity={0.7}
            >
              {checklist[index] || isAlreadyCompleted ? (
                <CheckSquare size={24} color="#E63946" />
              ) : (
                <Square size={24} color="#aaaaaa" />
              )}
              <Text style={[styles.checklistText, (checklist[index] || isAlreadyCompleted) && styles.checklistTextChecked]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/workout')}
        >
          <Text style={styles.navButtonText}>IR A LA RUTINA DE HOY</Text>
          <ChevronRight size={24} color="#E63946" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.completeButton,
            (!allChecked || isAlreadyCompleted) && styles.completeButtonDisabled
          ]}
          onPress={handleCompleteDay}
          disabled={!allChecked || isAlreadyCompleted}
        >
          <Text style={styles.completeButtonText}>
            {isAlreadyCompleted ? 'DÍA COMPLETADO' : 'TACHAR DÍA'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#aaaaaa" />
          <Text style={styles.logoutButtonText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    flex: 1,
    textTransform: 'uppercase',
  },
  pill: {
    backgroundColor: '#E63946',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pillText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checklistContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c2c2c',
    padding: 15,
    marginBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  checklistText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 15,
    fontWeight: 'bold',
  },
  checklistTextChecked: {
    color: '#aaaaaa',
    textDecorationLine: 'line-through',
  },
  navButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E63946',
    marginBottom: 30,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  completeButton: {
    backgroundColor: '#E63946',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#555555',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 20,
    gap: 10,
  },
  logoutButtonText: {
    color: '#aaaaaa',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
