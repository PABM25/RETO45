import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, FlatList, LayoutChangeEvent } from 'react-native';

interface RulerSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
}

const TICK_WIDTH = 10;
const MARKER_COLOR = '#E63946';

export default function RulerSlider({ min, max, step = 1, value, onChange, unit = '' }: RulerSliderProps) {
  const steps = Math.round((max - min) / step);
  const data = Array.from({ length: steps + 1 }, (_, i) => min + i * step);

  const [currentValue, setCurrentValue] = useState(value);
  const [containerWidth, setContainerWidth] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const initialScrollDone = useRef(false);

  // Initial scroll to value
  useEffect(() => {
    if (containerWidth > 0 && flatListRef.current && !initialScrollDone.current) {
      let index = Math.round((value - min) / step);
      if (index < 0) index = 0;
      if (index > steps) index = steps;

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: index * TICK_WIDTH,
          animated: false,
        });
        initialScrollDone.current = true;
      }, 100);
    }
  }, [containerWidth, value, min, step, steps]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / TICK_WIDTH);
    let newVal = min + index * step;
    if (newVal < min) newVal = min;
    if (newVal > max) newVal = max;

    if (newVal !== currentValue) {
      setCurrentValue(newVal);
      onChange(newVal);
    }
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  // Center alignment offset
  const paddingH = containerWidth > 0 ? (containerWidth / 2) - (TICK_WIDTH / 2) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{currentValue}</Text>
        {unit ? <Text style={styles.unitText}>{unit}</Text> : null}
      </View>

      <View style={styles.rulerContainer} onLayout={handleLayout}>
        {/* Center Marker */}
        <View style={styles.marker} />
        <View style={styles.markerTriangle} />

        {containerWidth > 0 && (
          <FlatList
            ref={flatListRef}
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
            snapToInterval={TICK_WIDTH}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyExtractor={(item) => item.toString()}
            contentContainerStyle={{
               paddingHorizontal: paddingH,
            }}
            renderItem={({ item }) => {
              const isTenth = item % 10 === 0;
              const isFifth = item % 5 === 0 && !isTenth;

              return (
                <View style={[styles.tickContainer, { width: TICK_WIDTH }]}>
                  <View
                    style={[
                      styles.tick,
                      isTenth ? styles.tickLong : isFifth ? styles.tickMedium : styles.tickShort
                    ]}
                  />
                  {isTenth ? (
                    <Text style={styles.tickText}>{item}</Text>
                  ) : null}
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  valueText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
  },
  unitText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E63946',
    marginLeft: 5,
  },
  rulerContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
    justifyContent: 'flex-start',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2c2c2c',
    overflow: 'hidden',
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 30, // leave space for text
    left: '50%',
    width: 4,
    backgroundColor: MARKER_COLOR,
    transform: [{ translateX: -2 }],
    zIndex: 10,
    borderRadius: 2,
  },
  markerTriangle: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: MARKER_COLOR,
    transform: [{ translateX: -8 }],
    zIndex: 11,
  },
  tickContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 100,
  },
  tick: {
    backgroundColor: '#666',
    width: 2,
    borderRadius: 1,
    marginTop: 10,
  },
  tickLong: {
    height: 40,
    backgroundColor: '#aaaaaa',
  },
  tickMedium: {
    height: 25,
  },
  tickShort: {
    height: 15,
  },
  tickText: {
    color: '#aaaaaa',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
    position: 'absolute',
    bottom: 10,
  },
});
