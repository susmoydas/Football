import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Search01Icon, Cancel01Icon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import { C, League } from '../../types';
import { groupLeaguesByCategory, getOfficialLeagueLogo, cleanLeagueName } from '../../utils/leagueGroupUtils';

const SNAP_POINTS = ['40%', '70%', '92%'];

interface Props {
  visible: boolean;
  leagues: League[];
  selectedLeagueId: string;
  onSelectLeague: (id: string) => void;
  onClose: () => void;
}

function LeagueLogo({ league }: { league: League }) {
  const [imgErr, setImgErr] = useState(false);
  const logo = getOfficialLeagueLogo(league);
  if (!imgErr) {
    return (
      <Image
        source={{ uri: logo }}
        style={s.leagueIcon}
        resizeMode="contain"
        onError={() => setImgErr(true)}
      />
    );
  }
  return <View style={[s.leagueIcon, s.leagueIconFallback]} />;
}

const Handle = () => (
  <View style={s.handleContainer}>
    <View style={s.handleBar} />
  </View>
);

export default function LeagueBottomSheet({
  visible, leagues, selectedLeagueId, onSelectLeague, onClose,
}: Props) {
  const [search, setSearch] = useState('');

  const filteredLeagues = useMemo(() => {
    if (!search.trim()) return leagues;
    const q = search.toLowerCase().trim();
    return leagues.filter(l => {
      const name = cleanLeagueName(l).toLowerCase();
      const raw = l.name.toLowerCase();
      return name.includes(q) || raw.includes(q);
    });
  }, [leagues, search]);

  const groups = useMemo(() => groupLeaguesByCategory(filteredLeagues), [filteredLeagues]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        onPress={onClose}
      />
    ),
    [onClose],
  );

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) onClose();
  }, [onClose]);

  return (
    <BottomSheet
      index={visible ? 1 : -1}
      snapPoints={SNAP_POINTS}
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      handleComponent={Handle}
      backgroundStyle={s.sheetBackground}
      enablePanDownToClose
      enableDynamicSizing={false}
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      animationConfigs={{ damping: 28, stiffness: 300, overshootClamping: true }}
    >
      <View style={s.headerRow}>
        <Text style={s.title}>Leagues</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <HugeiconsIcon icon={Cancel01Icon} size={24} color={C.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={s.searchBox}>
        <HugeiconsIcon icon={Search01Icon} size={18} color={C.textSecondary} />
        <BottomSheetTextInput
          style={s.searchInput}
          placeholder="Find leagues"
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
          selectionColor={C.accent}
        />
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        nestedScrollEnabled
      >
        {groups.length === 0 ? (
          <Text style={s.emptyText}>No leagues match "{search}"</Text>
        ) : (
          groups.map(group => (
            <View key={group.region} style={s.group}>
              <Text style={s.groupHeader}>{group.region}</Text>
              {group.leagues.map(l => {
                const isActive = l.id === selectedLeagueId;
                return (
                  <TouchableOpacity
                    key={l.id}
                    style={[s.leagueItem, isActive && s.leagueItemActive]}
                    onPress={() => onSelectLeague(l.id)}
                    activeOpacity={0.6}
                  >
                    <View style={s.leagueIconWrap}>
                      <LeagueLogo league={l} />
                    </View>
                    <Text
                      style={[s.leagueName, isActive && s.leagueNameActive]}
                      numberOfLines={1}
                    >
                      {cleanLeagueName(l)}
                    </Text>
                    {isActive && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} color="#0D9F68" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#1C1B23',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: '#1C1B23',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2A2931',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    marginLeft: 8,
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
  },
  group: {
    marginBottom: 8,
  },
  groupHeader: {
    color: '#999',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  leagueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 1,
  },
  leagueItemActive: {
    backgroundColor: '#0D9F6818',
  },
  leagueIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2931',
    overflow: 'hidden',
  },
  leagueIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  leagueIconFallback: {
    backgroundColor: '#3A3941',
  },
  leagueName: {
    flex: 1,
    marginLeft: 10,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  leagueNameActive: {
    color: '#0D9F68',
    fontWeight: '700',
  },
});
