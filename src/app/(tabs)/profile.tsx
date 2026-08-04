import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppContext } from '../../store/AppContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { UserProfile } from '../../types';
import { Activity, Flame, Scale, ActivitySquare, Award, X } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const getImcStatus = (imc: number) => {
  if (imc < 18.5) return 'Bajo peso';
  if (imc >= 18.5 && imc <= 24.9) return 'Normal';
  if (imc >= 25 && imc <= 29.9) return 'Sobrepeso';
  return 'Obesidad';
};

const getImcColor = (imc: number) => {
  if (imc < 18.5) return '#3498db'; // blue
  if (imc >= 18.5 && imc <= 24.9) return '#2ecc71'; // green
  if (imc >= 25 && imc <= 29.9) return '#f1c40f'; // yellow
  return '#e74c3c'; // red
};

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile, dailyProgress } = useAppContext();

  const [newWeight, setNewWeight] = useState(userProfile?.weight?.toString() || '');
  const [isUpdatingWeight, setIsUpdatingWeight] = useState(false);
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Semana');

  const completedDaysCount = dailyProgress.filter((day) => day.completed).length;
  const progressPercentage = (completedDaysCount / 45) * 100;

  const handleUpdateWeight = async () => {
    if (!userProfile) return;

    const parsedWeight = parseFloat(newWeight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
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
        let bmr = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge;
        bmr += gender === 'Hombre' ? 5 : -161;

        let multiplier = 1.2;
        if (level === 'Principiante') multiplier = 1.375;
        else if (level === 'Intermedio') multiplier = 1.55;
        else if (level === 'Avanzado') multiplier = 1.725;

        const maintenance = bmr * multiplier;

        if (goal === 'Pérdida de Peso') {
          newTargetCalories = maintenance * 0.8;
        } else {
          newTargetCalories = maintenance * 1.2;
        }
      }

      const updatedProfile: UserProfile = {
        ...userProfile,
        weight: parsedWeight,
        imc: newImc,
        targetCalories: newTargetCalories,
      };

      await setUserProfile(updatedProfile);
      setIsWeightModalVisible(false);
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

  const tabs = ['Día', 'Semana', 'Mes', 'Total'];

  // Mock data for chart
  const chartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [
          (userProfile?.weight || 70) + 1.2,
          (userProfile?.weight || 70) + 1.0,
          (userProfile?.weight || 70) + 0.8,
          (userProfile?.weight || 70) + 0.6,
          (userProfile?.weight || 70) + 0.4,
          (userProfile?.weight || 70) + 0.2,
          userProfile?.weight || 70
        ]
      }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Progreso</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Segmented Control */}
        <View style={styles.segmentedControl}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.segmentTab, selectedTab === tab && styles.segmentTabActive]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.segmentText, selectedTab === tab && styles.segmentTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {userProfile ? (
          <>
            {/* 2x2 Grid */}
            <View style={styles.gridContainer}>
              {/* Card 1: Completed Days */}
              <View style={[styles.gridCard, { backgroundColor: '#1E1E1E' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(52, 152, 219, 0.15)' }]}>
                    <Activity color="#3498db" size={20} />
                  </View>
                </View>
                <Text style={styles.cardLabel}>Días Completados</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.cardValue}>{completedDaysCount}</Text>
                  <Text style={styles.cardSuffix}> / 45</Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarFill, { width: `${progressPercentage}%`, backgroundColor: '#3498db' }]} />
                </View>
              </View>

              {/* Card 2: Daily Calories */}
              <View style={[styles.gridCard, { backgroundColor: '#1E1E1E' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(241, 196, 15, 0.15)' }]}>
                    <Flame color="#f1c40f" size={20} />
                  </View>
                </View>
                <Text style={styles.cardLabel}>Calorías Diarias</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.cardValue}>{Math.round(userProfile.targetCalories)}</Text>
                  <Text style={styles.cardSuffix}> kcal</Text>
                </View>
              </View>

              {/* Card 3: Weight */}
              <TouchableOpacity
                style={[styles.gridCard, { backgroundColor: '#1E1E1E' }]}
                onPress={() => {
                  setNewWeight(userProfile.weight.toString());
                  setIsWeightModalVisible(true);
                }}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(230, 57, 70, 0.15)' }]}>
                    <Scale color="#E63946" size={20} />
                  </View>
                </View>
                <Text style={styles.cardLabel}>Peso Actual</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.cardValue}>{userProfile.weight}</Text>
                  <Text style={styles.cardSuffix}> kg</Text>
                </View>
                <Text style={styles.tapToUpdateText}>Toca para actualizar</Text>
              </TouchableOpacity>

              {/* Card 4: IMC */}
              <View style={[styles.gridCard, { backgroundColor: '#1E1E1E' }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(155, 89, 182, 0.15)' }]}>
                    <ActivitySquare color="#9b59b6" size={20} />
                  </View>
                </View>
                <Text style={styles.cardLabel}>IMC</Text>
                <View style={styles.valueRow}>
                  <Text style={styles.cardValue}>{userProfile.imc.toFixed(1)}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getImcColor(userProfile.imc) }]}>
                  <Text style={styles.badgeText}>{getImcStatus(userProfile.imc)}</Text>
                </View>
              </View>
            </View>

            {/* Motivational Banner */}
            <View style={styles.bannerContainer}>
              <View style={styles.bannerIconContainer}>
                <Award color="#FFD700" size={28} />
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>¡No te rindas!</Text>
                <Text style={styles.bannerSubtitle}>La disciplina vence a la motivación</Text>
              </View>
            </View>

            {/* Chart Section */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Estadísticas</Text>
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: 'rgba(230, 57, 70, 0.15)' }]}>
                    <Scale color="#E63946" size={16} />
                  </View>
                  <Text style={styles.chartSubtitle}>Evolución de Peso</Text>
                </View>

                <LineChart
                  data={chartData}
                  width={screenWidth - 80}
                  height={220}
                  withDots={true}
                  withInnerLines={false}
                  withOuterLines={false}
                  chartConfig={{
                    backgroundColor: '#1E1E1E',
                    backgroundGradientFrom: '#1E1E1E',
                    backgroundGradientTo: '#1E1E1E',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(230, 57, 70, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(170, 170, 170, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#E63946"
                    }
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                    paddingRight: 30, // fix cutoff label
                  }}
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E63946" />
            <Text style={styles.loadingText}>Cargando perfil...</Text>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Weight Update Modal */}
      <Modal
        visible={isWeightModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsWeightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Actualizar Peso</Text>
              <TouchableOpacity onPress={() => setIsWeightModalVisible(false)} style={styles.closeButton}>
                <X color="#aaa" size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Ingresa tu peso actual en kilogramos.</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.modalInput}
                keyboardType="decimal-pad"
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder="70.5"
                placeholderTextColor="#666"
                autoFocus
              />
              <Text style={styles.inputSuffix}>kg</Text>
            </View>

            <TouchableOpacity
              style={[styles.updateButton, isUpdatingWeight && styles.buttonDisabled]}
              onPress={handleUpdateWeight}
              disabled={isUpdatingWeight}
            >
              {isUpdatingWeight ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.updateButtonText}>GUARDAR</Text>
              )}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentTabActive: {
    backgroundColor: '#2A2A2A',
  },
  segmentText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#888',
    fontSize: 13,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardSuffix: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 2,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#2A2A2A',
    borderRadius: 3,
    marginTop: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tapToUpdateText: {
    color: '#E63946',
    fontSize: 10,
    marginTop: 12,
    fontWeight: '600',
  },
  bannerContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  bannerIconContainer: {
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#aaa',
    fontSize: 13,
  },
  chartContainer: {
    marginBottom: 30,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartSubtitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaa',
    marginTop: 12,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  modalInput: {
    flex: 1,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 16,
  },
  inputSuffix: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#E63946',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  }
});
