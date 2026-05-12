import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { C } from '../types';

interface Props { onFinish: () => void; }

export default function SplashScreen({ onFinish }: Props) {
  const dot1 = React.useRef(new Animated.Value(0)).current;
  const dot2 = React.useRef(new Animated.Value(0)).current;
  const dot3 = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -8, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );

    Animated.parallel([bounce(dot1, 0), bounce(dot2, 150), bounce(dot3, 300)]).start();
    const t = setTimeout(onFinish, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.container}>
      <View style={s.iconBox}>
        <Text style={s.iconEmoji}>⚽</Text>
      </View>
      <Text style={s.title}>Football 2026 Code</Text>
      <Text style={s.subtitle}>Live scores, fixtures & football updates</Text>
      <View style={s.dots}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[s.dot, { transform: [{ translateY: d }] }]} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconBox: {
    width: 120, height: 120, borderRadius: 28,
    backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  iconEmoji: { fontSize: 64 },
  title: { color: C.textPrimary, fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { color: C.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 60 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.accent },
});
