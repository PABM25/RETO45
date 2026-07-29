import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckSquare, Square, ChevronRight } from 'lucide-react-native';
import { useAppContext } from '../../store/AppContext';

const CHECKLIST_ITEMS = [
  "Cero Alcohol",
  "Ejercicio Diario",
  "Cero Comida Chatarra",
  "Lectura Diaria (10 págs)",
  "Tarea Semanal: Agua Helada"
];

export default function DashboardScreen() {
  const router = useRouter();
  const { currentDay, markDayCompleted, dailyProgress } = useAppContext();

  const currentDayData = dailyProgress.find(d => d.day === currentDay);
  const isAlreadyCompleted = currentDayData?.completed ?? false;

  const [checklist, setChecklist] = useState<boolean[]>(new Array(5).fill(false));

  const toggleCheck = (index: number) => {
    if (isAlreadyCompleted) return;
    setChecklist(prev => {
      const newChecklist = [...prev];
      newChecklist[index] = !newChecklist[index];
      return newChecklist;
    });
  };

  const allChecked = checklist.every(Boolean);

  const handleCompleteDay = () => {
    if (allChecked && !isAlreadyCompleted) {
      markDayCompleted(currentDay);
      // Reset checklist for the next day
      setChecklist(new Array(5).fill(false));
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
});
