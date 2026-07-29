import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useAppContext } from '../store/AppContext';
import { UserProfile } from '../types';

export default function OnboardingScreen() {
  const router = useRouter();
  const { setUserProfile } = useAppContext();

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<'Hombre' | 'Mujer'>('Hombre');
  const [environment, setEnvironment] = useState<'CASA' | 'GYM'>('CASA');
  const [level, setLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Principiante');
  const [goal, setGoal] = useState<'Pérdida de Peso' | 'Ganancia Muscular'>('Pérdida de Peso');

  const parsedAge = parseInt(age, 10);
  const parsedWeight = parseFloat(weight);
  const parsedHeight = parseInt(height, 10);

  const imc = useMemo(() => {
    if (parsedWeight > 0 && parsedHeight > 0) {
      const heightInMeters = parsedHeight / 100;
      return parsedWeight / (heightInMeters * heightInMeters);
    }
    return 0;
  }, [parsedWeight, parsedHeight]);

  const targetCalories = useMemo(() => {
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
        return maintenance * 0.8; // 20% deficit
      } else {
        return maintenance * 1.2; // 20% surplus
      }
    }
    return 0;
  }, [parsedWeight, parsedHeight, parsedAge, gender, level, goal]);

  const isFormValid = parsedAge > 0 && parsedWeight > 0 && parsedHeight > 0;

  const handleStart = () => {
    if (isFormValid) {
      const profile: UserProfile = {
        age: parsedAge,
        weight: parsedWeight,
        height: parsedHeight,
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headline}>TU RENACER EN 45 DÍAS</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Edad</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
            placeholder="Años"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
            placeholder="kg"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Altura (cm)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            placeholder="cm"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Género</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue as 'Hombre' | 'Mujer')}
              style={styles.picker}
              dropdownIconColor="#E63946"
            >
              <Picker.Item label="Hombre" value="Hombre" color="#fff" />
              <Picker.Item label="Mujer" value="Mujer" color="#fff" />
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Entorno</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={environment}
              onValueChange={(itemValue) => setEnvironment(itemValue as 'CASA' | 'GYM')}
              style={styles.picker}
              dropdownIconColor="#E63946"
            >
              <Picker.Item label="CASA" value="CASA" color="#fff" />
              <Picker.Item label="GYM" value="GYM" color="#fff" />
            </Picker>
          </View>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Nivel</Text>
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

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Objetivo</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={goal}
              onValueChange={(itemValue) => setGoal(itemValue as 'Pérdida de Peso' | 'Ganancia Muscular')}
              style={styles.picker}
              dropdownIconColor="#E63946"
            >
              <Picker.Item label="Pérdida de Peso" value="Pérdida de Peso" color="#fff" />
              <Picker.Item label="Ganancia Muscular" value="Ganancia Muscular" color="#fff" />
            </Picker>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>IMC:</Text>
            <Text style={styles.cardValue}>{imc > 0 ? imc.toFixed(1) : '--'}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Calorías Diarias Meta:</Text>
            <Text style={styles.cardValue}>{targetCalories > 0 ? Math.round(targetCalories) : '--'} kcal</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !isFormValid && styles.buttonDisabled]}
          onPress={handleStart}
          disabled={!isFormValid}
        >
          <Text style={styles.buttonText}>INICIAR EL RETO</Text>
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
  headline: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 20,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    borderWidth: 2,
    borderColor: '#2c2c2c',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: 15,
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
  card: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E63946',
    marginVertical: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardLabel: {
    color: '#aaaaaa',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  button: {
    backgroundColor: '#E63946',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#555555',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
