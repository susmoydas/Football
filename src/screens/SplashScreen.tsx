import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { C } from '../types';
import { AppLogo } from '../components';

interface Props { onFinish: () => void; }

export default function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const t = setTimeout(onFinish, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.container}>
      <AppLogo size={96} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
});
