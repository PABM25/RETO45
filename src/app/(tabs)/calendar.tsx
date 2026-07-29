import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useAppContext } from '../../store/AppContext';

export default function CalendarScreen() {
  const { dailyProgress } = useAppContext();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>TU PROGRESO</Text>

        <View style={styles.gridContainer}>
          {dailyProgress.map((item) => (
            <View
              key={item.day}
              style={[
                styles.gridBox,
                item.completed && styles.gridBoxCompleted
              ]}
            >
              <Text
                style={[
                  styles.gridText,
                  item.completed && styles.gridTextCompleted
                ]}
              >
                {item.day}
              </Text>
            </View>
          ))}
        </View>
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
    alignItems: 'center',
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10, // Available in newer React Native versions, otherwise margins can be used on items
    padding: 5,
  },
  gridBox: {
    width: 60,
    height: 60,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2c2c2c',
    margin: 4, // Fallback for gap
  },
  gridBoxCompleted: {
    backgroundColor: '#E63946',
    borderColor: '#E63946',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  gridText: {
    color: '#aaaaaa',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gridTextCompleted: {
    color: '#ffffff',
    fontWeight: '900',
  },
});
