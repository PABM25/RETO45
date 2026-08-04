import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../store/AppContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { UserProfile } from '../../types';

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile, dailyProgress } = useAppContext();
  const [newWeight, setNewWeight] = useState(userProfile?.weight.toString() || '');
  const [isUpdatingWeight, setIsUpdatingWeight] = useState(false);

  const completedDaysCount = dailyProgress.filter((day) => day.completed).length;

  const handleUpdateWeight = async () => {
    if (!userProfile) return;

    const parsedWeight = parseFloat(newWeight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      // Avoid updating if the weight is invalid
      return;
    }

    setIsUpdatingWeight(true);

    try {
      const parsedHeight = userProfile.height;
      const parsedAge = userProfile.age;
      const gender = userProfile.gender;
      const level = userProfile.level;
      const goal = userProfile.goal;

      // Calculate new IMC
      let newImc = 0;
      if (parsedWeight > 0 && parsedHeight > 0) {
        const heightInMeters = parsedHeight / 100;
        newImc = parsedWeight / (heightInMeters * heightInMeters);
      }

      // Calculate new Target Calories
      let newTargetCalories = 0;
      if (parsedWeight > 0 && parsedHeight > 0 && parsedAge > 0) {
        // Basic Mifflin-St Jeor Equation
        let bmr = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge;
        bmr += gender === 'Hombre' ? 5 : -161;

        // Activity multiplier
        let multiplier = 1.2; // Sedentary
        if (level === 'Principiante') multiplier = 1.375;
        else if (level === 'Intermedio') multiplier = 1.55;
        else if (level === 'Avanzado') multiplier = 1.725;

        const maintenance = bmr * multiplier;

        if (goal === 'Pérdida de Peso') {
          newTargetCalories = maintenance * 0.8; // 20% deficit
        } else {
          newTargetCalories = maintenance * 1.2; // 20% surplus
        }
      }

      const updatedProfile: UserProfile = {
        ...userProfile,
        weight: parsedWeight,
        imc: newImc,
        targetCalories: newTargetCalories,
      };

      await setUserProfile(updatedProfile);
    } catch (e) {
      console.error("Failed to update weight", e);
    } finally {
      setIsUpdatingWeight(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {userProfile ? (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>MIS ESTADÍSTICAS</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Días Completados:</Text>
                <Text style={styles.statValue}>{completedDaysCount} / 45</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Entorno:</Text>
                <Text style={styles.statValue}>{userProfile.environment}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Nivel:</Text>
                <Text style={styles.statValue}>{userProfile.level}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Edad:</Text>
                <Text style={styles.statValue}>{userProfile.age} años</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Altura:</Text>
                <Text style={styles.statValue}>{userProfile.height} cm</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Peso Actual:</Text>
                <Text style={styles.statValue}>{userProfile.weight} kg</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>IMC:</Text>
                <Text style={styles.statValue}>{userProfile.imc.toFixed(1)}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Calorías Meta:</Text>
                <Text style={styles.statValue}>{Math.round(userProfile.targetCalories)} kcal</Text>
              </View>
            </View>

            <View style={styles.updateCard}>
              <Text style={styles.updateTitle}>ACTUALIZAR PESO</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={newWeight}
                  onChangeText={setNewWeight}
                  placeholder="Peso en kg"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={[styles.updateButton, isUpdatingWeight && styles.buttonDisabled]}
                  onPress={handleUpdateWeight}
                  disabled={isUpdatingWeight}
                >
                  {isUpdatingWeight ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.updateButtonText}>ACTUALIZAR</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
  statsCard: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c2c2c',
    marginBottom: 20,
  },
  statsTitle: {
    color: '#E63946',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 15,
    letterSpacing: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  statLabel: {
    color: '#aaaaaa',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateCard: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2c2c2c',
    marginBottom: 30,
  },
  updateTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#121212',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2c2c2c',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginRight: 10,
  },
  updateButton: {
    backgroundColor: '#E63946',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  buttonDisabled: {
    backgroundColor: '#555555',
  },
  logoutButton: {
    backgroundColor: '#transparent',
    borderWidth: 2,
    borderColor: '#E63946',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#E63946',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  loadingText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  }
});
