import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Linking, Vibration, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { Play, Square, Video, Timer, Bot, X } from 'lucide-react-native';
import { useAppContext } from '../../store/AppContext';
import { Exercise } from '../../types';
import { getExerciseExplanation } from '../../services/aiService';

export default function WorkoutScreen() {
  const { routines, currentDay, userProfile } = useAppContext();

  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const startTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (timeLeft === 0 && timerActive) {
      Vibration.vibrate([0, 500, 200, 500]); // Vibrate twice
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [timeLeft, timerActive]);

  const [modalVisible, setModalVisible] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [selectedExerciseTitle, setSelectedExerciseTitle] = useState('');

  const handleAiPress = async (exercise: Exercise) => {
    setSelectedExerciseTitle(exercise.title);
    setAiExplanation('');
    setModalVisible(true);
    setAiLoading(true);

    try {
      const explanation = await getExerciseExplanation(exercise.title, exercise.description);
      setAiExplanation(explanation);
    } catch (error) {
      setAiExplanation("Error al conectar con la IA. Mantén la forma estricta y sigue adelante.");
    } finally {
      setAiLoading(false);
    }
  };

  const todaysRoutine = routines.find(
    r => r.dayNumber === currentDay && r.environment === (userProfile?.environment || 'CASA')
  );

  let recommendedSets = 3;
  if (userProfile?.level === 'Intermedio') recommendedSets = 4;
  else if (userProfile?.level === 'Avanzado') recommendedSets = 5;

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>

      <View style={styles.cardDetails}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Series (Recomendadas)</Text>
          <Text style={styles.detailValue}>{recommendedSets}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Reps</Text>
          <Text style={styles.detailValue}>{item.reps}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        {item.videoUrl && (
          <TouchableOpacity
            style={[styles.actionButton, styles.videoButton]}
            onPress={() => Linking.openURL(item.videoUrl!)}
          >
            <Video size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>VER VIDEO</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.aiButton]}
          onPress={() => handleAiPress(item)}
        >
          <Bot size={16} color="#E63946" />
          <Text style={styles.aiButtonText}>EXPLICACIÓN IA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!todaysRoutine) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Rutina no encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>{todaysRoutine.title}</Text>

      <FlatList
        data={todaysRoutine.exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExerciseCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.timerContainer}>
        {timerActive ? (
          <View style={styles.activeTimerRow}>
            <View style={styles.timerInfo}>
              <Timer size={24} color="#E63946" />
              <Text style={styles.activeTimerText}>Descanso: {timeLeft}s</Text>
            </View>
            <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
              <Square size={20} color="#ffffff" fill="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inactiveTimerRow}>
            <Text style={styles.timerTitle}>INICIAR DESCANSO</Text>
            <View style={styles.timerButtons}>
              <TouchableOpacity style={styles.timerButton} onPress={() => startTimer(60)}>
                <Text style={styles.timerButtonText}>60s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timerButton} onPress={() => startTimer(90)}>
                <Text style={styles.timerButtonText}>90s</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Bot size={24} color="#E63946" />
                <Text style={styles.modalTitle}>Explicación IA</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#aaaaaa" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalExerciseTitle}>{selectedExerciseTitle}</Text>

            {aiLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E63946" />
                <Text style={styles.loadingText}>Generando estrategia...</Text>
              </View>
            ) : (
              <ScrollView style={styles.aiExplanationScroll}>
                <Text style={styles.aiExplanationText}>{aiExplanation}</Text>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>ENTENDIDO, SEÑOR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#aaaaaa',
    fontSize: 18,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Make room for floating timer
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c2c2c',
    padding: 20,
    marginBottom: 15,
  },
  cardTitle: {
    color: '#E63946',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  cardDescription: {
    color: '#aaaaaa',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailBox: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  detailLabel: {
    color: '#aaaaaa',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  detailValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  cardActions: {
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  videoButton: {
    backgroundColor: '#E63946',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  aiButton: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#E63946',
  },
  aiButtonText: {
    color: '#E63946',
    fontWeight: 'bold',
    fontSize: 14,
  },
  timerContainer: {
    backgroundColor: '#1e1e1e',
    borderTopWidth: 1,
    borderTopColor: '#2c2c2c',
    padding: 20,
    paddingBottom: 30, // account for safe area
  },
  activeTimerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activeTimerText: {
    color: '#E63946',
    fontSize: 24,
    fontWeight: '900',
  },
  stopButton: {
    backgroundColor: '#E63946',
    padding: 15,
    borderRadius: 8,
  },
  inactiveTimerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerTitle: {
    color: '#aaaaaa',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  timerButton: {
    backgroundColor: '#2c2c2c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  timerButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    color: '#E63946',
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modalExerciseTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaaaaa',
    marginTop: 15,
    fontSize: 16,
  },
  aiExplanationScroll: {
    marginBottom: 20,
  },
  aiExplanationText: {
    color: '#cccccc',
    fontSize: 16,
    lineHeight: 24,
  },
  closeModalButton: {
    backgroundColor: '#E63946',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
});
