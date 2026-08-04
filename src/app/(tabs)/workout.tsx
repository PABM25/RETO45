import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Vibration, ActivityIndicator } from 'react-native';
import { ArrowLeft, StopCircle, Play, ChevronRight, Check } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../store/AppContext';
import { getExerciseGifName } from '../../utils/exerciseDictionary';
import exercisesData from '../../data/exercises.json';
import { Exercise } from '../../types';

export default function WorkoutScreen() {
  const router = useRouter();
  const { routines, currentDay, userProfile, markDayCompleted } = useAppContext();

  const todaysRoutine = routines.find(
    r => r.dayNumber === currentDay && r.environment === (userProfile?.environment || 'CASA')
  );

  const exercises = todaysRoutine?.exercises || [];
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const currentExercise = exercises[currentExerciseIndex] as Exercise | undefined;
  const nextExercise = exercises[currentExerciseIndex + 1] as Exercise | undefined;
  const isLastExercise = currentExerciseIndex === exercises.length - 1;

  // Derive duration in seconds from 'reps' field or default to 60 if it's not time-based
  const parseDuration = (repsString: string | undefined) => {
    if (!repsString) return 60;
    if (repsString.toLowerCase().includes('seg') || repsString.toLowerCase().includes('sec')) {
      const match = repsString.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    return 60; // default active time if reps-based
  };

  const [timerActive, setTimerActive] = useState(false);
  // Initialize with the parsed duration of the first exercise
  const [timeLeft, setTimeLeft] = useState(parseDuration(currentExercise?.reps));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [gifLoading, setGifLoading] = useState(true);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isLastExercise) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      const nextEx = exercises[nextIndex] as Exercise | undefined;
      setTimerActive(false);
      setTimeLeft(parseDuration(nextEx?.reps));
      setGifLoading(true);
    } else {
      // Complete day
      markDayCompleted(currentDay);
      router.replace('/(tabs)');
    }
  };

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            Vibration.vibrate([0, 500, 200, 500]); // Vibrate twice
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const toggleTimer = () => {
    if (timeLeft === 0) {
      // If timer is at 0, reset to start
      setTimeLeft(parseDuration(currentExercise?.reps || '60'));
    }
    setTimerActive(!timerActive);
  };

  if (!todaysRoutine || !currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Rutina no encontrada o día completado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get matching GIF from dataset
  const englishName = getExerciseGifName(currentExercise.title);
  const foundDatasetExercise = exercisesData.find((e: any) => e.name.toLowerCase().includes(englishName.toLowerCase())) as any;
  const gifUri = foundDatasetExercise ? `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/${foundDatasetExercise.gif_url || foundDatasetExercise.gifUrl}` : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RETO DIARIO</Text>
        <View style={{ width: 44 }} /> {/* Balance */}
      </View>

      {/* Media Container */}
      <View style={styles.mediaContainer}>
        {gifLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#E63946" />
          </View>
        )}
        {gifUri ? (
          <Image
            source={{ uri: gifUri }}
            style={styles.gifImage}
            contentFit="cover"
            onLoadEnd={() => setGifLoading(false)}
          />
        ) : (
          <View style={styles.noMediaFallback}>
            <Text style={styles.noMediaText}>GIF no disponible</Text>
          </View>
        )}
      </View>

      {/* Active Timer & Info Block */}
      <View style={styles.infoBlock}>
        <TouchableOpacity
          style={styles.timerPane}
          onPress={toggleTimer}
          activeOpacity={0.8}
        >
          <Text style={styles.timerTime}>
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
            {(timeLeft % 60).toString().padStart(2, '0')}
          </Text>
          <View style={styles.timerActionRow}>
            {timerActive ? (
              <StopCircle size={20} color="#ffffff" />
            ) : (
              <Play size={20} color="#ffffff" fill="#ffffff" />
            )}
            <Text style={styles.timerActionText}>
              {timerActive ? 'PAUSAR' : timeLeft === 0 ? 'REINICIAR' : 'INICIAR'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.detailsPane}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>{currentExerciseIndex + 1}/{exercises.length}</Text>
          </View>
          <Text style={styles.exerciseTitle} numberOfLines={2} adjustsFontSizeToFit>
            {currentExercise.title}
          </Text>
          <Text style={styles.exerciseReps}>{currentExercise.reps}</Text>
        </View>
      </View>

      {/* Next Up Section */}
      <View style={{ flex: 1 }} />
      <TouchableOpacity
        style={styles.nextUpContainer}
        onPress={handleNext}
      >
        <View style={styles.nextUpContent}>
          {!isLastExercise ? (
            <>
              <Text style={styles.nextUpLabel}>SIGUIENTE</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.nextUpTitle}>{nextExercise?.title}</Text>
                <Text style={styles.nextUpDuration}>{nextExercise?.reps}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.nextUpLabel}>¡CASI LISTO!</Text>
              <Text style={styles.nextUpTitle}>FINALIZAR ENTRENAMIENTO</Text>
            </>
          )}
        </View>
        <View style={styles.nextIconContainer}>
          {!isLastExercise ? <ChevronRight size={28} color="#ffffff" /> : <Check size={28} color="#E63946" />}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#aaaaaa',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  mediaContainer: {
    marginHorizontal: 20,
    height: 350,
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#2c2c2c',
    marginBottom: 20,
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    zIndex: 1,
  },
  noMediaFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMediaText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBlock: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 15,
  },
  timerPane: {
    flex: 1.2,
    backgroundColor: '#E63946',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerTime: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    marginBottom: 5,
  },
  timerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  detailsPane: {
    flex: 1.5,
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  stepBadge: {
    backgroundColor: '#2c2c2c',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  stepText: {
    color: '#aaaaaa',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  exerciseTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  exerciseReps: {
    color: '#aaaaaa',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextUpContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2c2c2c',
  },
  nextUpContent: {
    flex: 1,
  },
  nextUpLabel: {
    color: '#aaaaaa',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 5,
  },
  nextUpTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  nextUpDuration: {
    color: '#aaaaaa',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  nextIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2c2c2c',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
