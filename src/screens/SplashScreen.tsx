import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '../types';
import { AppLogo } from '../components';

export default function SplashScreen() {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: C.bg }}
      edges={['top', 'bottom']}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <AppLogo size={64} />
      </View>
    </SafeAreaView>
  );
}