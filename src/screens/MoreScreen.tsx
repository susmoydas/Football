import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ChampionIcon, ArrowUp01Icon, ArrowDown01Icon, CheckmarkCircle01Icon, Notification02Icon, Calendar03Icon, FootballIcon } from '@hugeicons/core-free-icons';
import { C, League } from '../types';
import { saveSelectedLeague, NotificationSettings, getNotificationSettings, saveNotificationSettings } from '../services/storage';
import { FEATURED_LEAGUES } from '../services/api';
import { requestNotificationPermissions } from '../services/notifications';
import { AppLogo } from '../components';

interface Props {
  selectedLeagueId: string;
  onLeagueChange: (id: string) => void;
}

export default function MoreScreen({ selectedLeagueId, onLeagueChange }: Props) {
  const [showLeagues, setShowLeagues] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    enabled: true,
    matchToday: true,
    matchRunning: true,
    matchDone: true,
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    const settings = await getNotificationSettings();
    setNotifSettings(settings);
  };

  const handleNotificationChange = async (key: keyof NotificationSettings, value: boolean) => {
    if (key === 'enabled' && value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device Settings to receive match alerts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
    }
    const updated = { ...notifSettings, [key]: value };
    setNotifSettings(updated);
    await saveNotificationSettings(updated);
  };

  const handleLeagueSelect = async (id: string) => {
    await saveSelectedLeague(id);
    onLeagueChange(id);
    setShowLeagues(false);
  };

  const activeName = FEATURED_LEAGUES.find(l => l.id === selectedLeagueId)?.name ?? '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 40 }}>
      {/* Profile card */}
      <View style={s.profileCard}>
        <AppLogo size={64} />
        <View>
          <Text style={s.profileName}>Football Fan</Text>
          <Text style={s.profileSub}>Football 2026</Text>
        </View>
      </View>

      {/* League selection */}
      <Text style={s.sectionLabel}>Default League</Text>
      <TouchableOpacity style={s.settingRow} onPress={() => setShowLeagues(!showLeagues)}>
        <View style={s.settingLeft}>
          <View style={[s.settingIcon, { backgroundColor: C.accent + '20' }]}>
            <HugeiconsIcon icon={ChampionIcon} size={20} color={C.accent} />
          </View>
          <View>
            <Text style={s.settingTitle}>League</Text>
            <Text style={s.settingValue} numberOfLines={1}>{activeName}</Text>
          </View>
        </View>
        <HugeiconsIcon icon={showLeagues ? ArrowUp01Icon : ArrowDown01Icon} size={20} color={C.textSecondary} />
      </TouchableOpacity>

      {showLeagues && (
        <View style={s.leagueList}>
          {FEATURED_LEAGUES.map(l => (
            <TouchableOpacity
              key={l.id}
              style={[s.leagueItem, l.id === selectedLeagueId && { backgroundColor: C.accent + '20' }]}
              onPress={() => handleLeagueSelect(l.id)}
            >
              <Text style={[s.leagueItemText, l.id === selectedLeagueId && { color: C.accent }]}>{l.name}</Text>
              {l.id === selectedLeagueId && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color={C.accent} />}
            </TouchableOpacity>
          ))}
        </View>
        )}

      {/* Notifications */}
      <Text style={s.sectionLabel}>Notifications</Text>
      <View style={s.card}>
        <View style={s.settingRow}>
          <View style={s.settingLeft}>
            <View style={[s.settingIcon, { backgroundColor: C.accent + '20' }]}>
              <HugeiconsIcon icon={Notification02Icon} size={20} color={C.accent} />
            </View>
            <View>
              <Text style={s.settingTitle}>Enable Notifications</Text>
              <Text style={s.settingValue}>Google-style match alerts</Text>
            </View>
          </View>
          <Switch
            value={notifSettings.enabled}
            onValueChange={(v) => handleNotificationChange('enabled', v)}
            trackColor={{ false: C.border, true: C.accent + '60' }}
            thumbColor={notifSettings.enabled ? C.accent : C.textSecondary}
          />
        </View>

        {notifSettings.enabled && (
          <>
            <View style={[s.settingRow, { borderTopWidth: 1, borderTopColor: C.border }]}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: C.gold + '20' }]}>
                  <HugeiconsIcon icon={Calendar03Icon} size={20} color={C.gold} />
                </View>
                <Text style={s.settingTitle}>Match Today</Text>
              </View>
              <Switch
                value={notifSettings.matchToday}
                onValueChange={(v) => handleNotificationChange('matchToday', v)}
                trackColor={{ false: C.border, true: C.accent + '60' }}
                thumbColor={notifSettings.matchToday ? C.accent : C.textSecondary}
              />
            </View>

            <View style={[s.settingRow, { borderTopWidth: 1, borderTopColor: C.border }]}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: C.red + '20' }]}>
                  <HugeiconsIcon icon={FootballIcon} size={20} color={C.red} />
                </View>
                <Text style={s.settingTitle}>Match Running</Text>
              </View>
              <Switch
                value={notifSettings.matchRunning}
                onValueChange={(v) => handleNotificationChange('matchRunning', v)}
                trackColor={{ false: C.border, true: C.accent + '60' }}
                thumbColor={notifSettings.matchRunning ? C.accent : C.textSecondary}
              />
            </View>

            <View style={[s.settingRow, { borderTopWidth: 1, borderTopColor: C.border }]}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: C.gold + '20' }]}>
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color={C.gold} />
                </View>
                <Text style={s.settingTitle}>Match Done</Text>
              </View>
              <Switch
                value={notifSettings.matchDone}
                onValueChange={(v) => handleNotificationChange('matchDone', v)}
                trackColor={{ false: C.border, true: C.accent + '60' }}
                thumbColor={notifSettings.matchDone ? C.accent : C.textSecondary}
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  profileCard: {
    backgroundColor: C.card, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 24,
  },
  profileIcon: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.accent,
  },
  profileName: { color: C.textPrimary, fontSize: 18, fontWeight: '700' },
  profileSub: { color: C.textSecondary, fontSize: 13, marginTop: 2 },
  sectionLabel: { color: C.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 4, paddingHorizontal: 4 },
  card: { backgroundColor: C.card, borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingTitle: { color: C.textPrimary, fontSize: 15, fontWeight: '500' },
  settingValue: { color: C.textSecondary, fontSize: 12, marginTop: 2, maxWidth: 180 },
  leagueList: { backgroundColor: C.card, borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
  leagueItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  leagueItemText: { color: C.textPrimary, fontSize: 14 },
});
