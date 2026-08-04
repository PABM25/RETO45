import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Dumbbell, Home, ChevronRight, Check, Activity, Target } from 'lucide-react-native';
import { useAppContext } from '../store/AppContext';
import { UserProfile } from '../types';
import RulerSlider from '../components/RulerSlider';
import { Picker } from '@react-native-picker/picker'; // Kept for gender/age/level simplifications if needed, or we can use custom buttons

export default function OnboardingScreen() {
  const router = useRouter();
  const { setUserProfile } = useAppContext();

  // Step state
  const [step, setStep] = useState(1);

  // Profile fields
  const [age, setAge] = useState<number>(25);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [gender, setGender] = useState<'Hombre' | 'Mujer'>('Hombre');
  const [environment, setEnvironment] = useState<'CASA' | 'GYM'>('CASA');
  const [level, setLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Principiante');
  const [goal, setGoal] = useState<'Pérdida de Peso' | 'Ganancia Muscular'>('Pérdida de Peso');

  const imc = useMemo(() => {
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      return weight / (heightInMeters * heightInMeters);
    }
    return 0;
  }, [weight, height]);

  const targetCalories = useMemo(() => {
    if (weight > 0 && height > 0 && age > 0) {
      let bmr = 10 * weight + 6.25 * height - 5 * age;
      bmr += gender === 'Hombre' ? 5 : -161;

      let multiplier = 1.2;
      if (level === 'Principiante') multiplier = 1.375;
      else if (level === 'Intermedio') multiplier = 1.55;
      else if (level === 'Avanzado') multiplier = 1.725;

      const maintenance = bmr * multiplier;

      if (goal === 'Pérdida de Peso') {
        return maintenance * 0.8;
      } else {
        return maintenance * 1.2;
      }
    }
    return 0;
  }, [weight, height, age, gender, level, goal]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const profile: UserProfile = {
        age,
        weight,
        height,
        gender,
        environment,
        level,
        goal,
        imc,
        targetCalories,
      };
      setUserProfile(profile);
      router.replace('/(tabs)');
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.progressStep}>
          <View style={[styles.progressCircle, step >= i && styles.progressCircleActive]}>
            <Text style={[styles.progressText, step >= i && styles.progressTextActive]}>{i}</Text>
          </View>
          {i < 3 && <View style={[styles.progressLine, step > i && styles.progressLineActive]} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>TU CUERPO</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>PESO</Text>
        <RulerSlider min={40} max={150} value={weight} onChange={setWeight} unit="kg" />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>ALTURA</Text>
        <RulerSlider min={140} max={220} value={height} onChange={setHeight} unit="cm" />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>DETALLES</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>EDAD</Text>
        <RulerSlider min={15} max={80} value={age} onChange={setAge} unit="Años" />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>GÉNERO</Text>
        <View style={styles.rowCards}>
          <TouchableOpacity
            style={[styles.smallCard, gender === 'Hombre' && styles.smallCardSelected]}
            onPress={() => setGender('Hombre')}
          >
            <Text style={[styles.smallCardText, gender === 'Hombre' && styles.smallCardTextSelected]}>HOMBRE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallCard, gender === 'Mujer' && styles.smallCardSelected]}
            onPress={() => setGender('Mujer')}
          >
            <Text style={[styles.smallCardText, gender === 'Mujer' && styles.smallCardTextSelected]}>MUJER</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>NIVEL ACTUAL</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={level}
            onValueChange={(itemValue) => setLevel(itemValue as 'Principiante' | 'Intermedio' | 'Avanzado')}
            style={styles.picker}
            dropdownIconColor="#E63946"
          >
            <Picker.Item label="Principiante" value="Principiante" color="#fff" />
            <Picker.Item label="Intermedio" value="Intermedio" color="#fff" />
            <Picker.Item label="Avanzado" value="Avanzado" color="#fff" />
          </Picker>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>TUS METAS</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>¿DÓNDE ENTRENARÁS?</Text>

        <TouchableOpacity
          style={[styles.optionCard, environment === 'CASA' && styles.optionCardSelected]}
          onPress={() => setEnvironment('CASA')}
        >
          <Home size={32} color={environment === 'CASA' ? '#E63946' : '#aaaaaa'} />
          <View style={styles.optionCardContent}>
            <Text style={[styles.optionCardTitle, environment === 'CASA' && styles.optionCardTitleSelected]}>CASA</Text>
            <Text style={styles.optionCardDesc}>Sin equipo especial. Usa tu cuerpo.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, environment === 'GYM' && styles.optionCardSelected]}
          onPress={() => setEnvironment('GYM')}
        >
          <Dumbbell size={32} color={environment === 'GYM' ? '#E63946' : '#aaaaaa'} />
          <View style={styles.optionCardContent}>
            <Text style={[styles.optionCardTitle, environment === 'GYM' && styles.optionCardTitleSelected]}>GYM</Text>
            <Text style={styles.optionCardDesc}>Acceso a pesas y máquinas.</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>OBJETIVO PRINCIPAL</Text>

        <TouchableOpacity
          style={[styles.optionCard, goal === 'Pérdida de Peso' && styles.optionCardSelected]}
          onPress={() => setGoal('Pérdida de Peso')}
        >
          <Activity size={32} color={goal === 'Pérdida de Peso' ? '#E63946' : '#aaaaaa'} />
          <View style={styles.optionCardContent}>
            <Text style={[styles.optionCardTitle, goal === 'Pérdida de Peso' && styles.optionCardTitleSelected]}>PÉRDIDA DE PESO</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, goal === 'Ganancia Muscular' && styles.optionCardSelected]}
          onPress={() => setGoal('Ganancia Muscular')}
        >
          <Target size={32} color={goal === 'Ganancia Muscular' ? '#E63946' : '#aaaaaa'} />
          <View style={styles.optionCardContent}>
            <Text style={[styles.optionCardTitle, goal === 'Ganancia Muscular' && styles.optionCardTitleSelected]}>GANANCIA MUSCULAR</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headline}>RETO 45</Text>
        {renderProgressBar()}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{step < 3 ? 'SIGUIENTE' : 'FINALIZAR'}</Text>
          {step < 3 ? <ChevronRight size={24} color="#fff" /> : <Check size={24} color="#fff" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  headline: {
    fontSize: 24,
    fontWeight: '900',
    color: '#E63946',
    letterSpacing: 2,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#444',
  },
  progressCircleActive: {
    borderColor: '#E63946',
    backgroundColor: '#E63946',
  },
  progressText: {
    color: '#aaaaaa',
    fontWeight: 'bold',
  },
  progressTextActive: {
    color: '#ffffff',
  },
  progressLine: {
    width: 50,
    height: 2,
    backgroundColor: '#444',
    marginHorizontal: 5,
  },
  progressLineActive: {
    backgroundColor: '#E63946',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputGroup: {
    marginBottom: 30,
  },
  label: {
    color: '#aaaaaa',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rowCards: {
    flexDirection: 'row',
    gap: 15,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2c2c2c',
    alignItems: 'center',
  },
  smallCardSelected: {
    borderColor: '#E63946',
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
  },
  smallCardText: {
    color: '#aaaaaa',
    fontWeight: 'bold',
    fontSize: 16,
  },
  smallCardTextSelected: {
    color: '#E63946',
  },
  pickerWrapper: {
    backgroundColor: '#1e1e1e',
    borderWidth: 2,
    borderColor: '#2c2c2c',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: '#ffffff',
    backgroundColor: '#1e1e1e',
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2c2c2c',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15,
  },
  optionCardSelected: {
    borderColor: '#E63946',
    backgroundColor: 'rgba(230, 57, 70, 0.1)',
  },
  optionCardContent: {
    flex: 1,
  },
  optionCardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 5,
  },
  optionCardTitleSelected: {
    color: '#E63946',
  },
  optionCardDesc: {
    color: '#aaaaaa',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#2c2c2c',
  },
  button: {
    backgroundColor: '#E63946',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
