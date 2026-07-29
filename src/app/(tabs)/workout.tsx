import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { Play, Square, Video } from 'lucide-react-native';
import { useAppContext } from '../../store/AppContext';
import { Routine } from '../../types';

export default function WorkoutScreen() {
  const { routines, currentDay } = useAppContext();

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

  const toggleTimer = () => {
    if (timerActive) {
      setTimerActive(false);
      setTimeLeft(60);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setTimerActive(true);
    }
  };

  const renderRoutineCard = ({ item }: { item: Routine }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>

      <View style={styles.cardDetails}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Series</Text>
          <Text style={styles.detailValue}>{item.sets}</Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Reps</Text>
          <Text style={styles.detailValue}>{item.reps}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.videoButton}
        onPress={() => Linking.openURL(item.videoUrl)}
      >
        <Video size={16} color="#ffffff" />
        <Text style={styles.videoButtonText}>VER VIDEO</Text>
      </TouchableOpacity>
    </View>
  );

  const todaysRoutine = routines.filter(r => r.day === currentDay);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>RUTINA DÍA {currentDay}</Text>

      <FlatList
        data={todaysRoutine}
        keyExtractor={(item) => item.id}
        renderItem={renderRoutineCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.floatingTimer, timerActive && styles.floatingTimerActive]}
        onPress={toggleTimer}
        activeOpacity={0.8}
      >
        <View style={styles.timerContent}>
          {timerActive ? (
            <Square size={20} color="#ffffff" fill="#ffffff" />
          ) : (
            <Play size={20} color="#ffffff" fill="#ffffff" />
          )}
          <Text style={styles.timerText}>
            {timerActive ? `${timeLeft}s` : '60s'}
          </Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
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
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E63946',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
  },
  videoButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  floatingTimer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1e1e1e',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2c2c2c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  floatingTimerActive: {
    borderColor: '#E63946',
    backgroundColor: '#E63946',
  },
  timerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
});
