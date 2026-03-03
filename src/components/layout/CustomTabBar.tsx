import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadows, Spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ORDER = [
  { name: 'activities/index', icon: 'flask-outline' as IoniconsName, labelKey: 'activities' },
  { name: 'sensors', icon: 'radio-outline' as IoniconsName, labelKey: 'sensors' },
  { name: 'index', icon: 'home' as IoniconsName, labelKey: 'home', center: true },
  { name: 'leaderboard', icon: 'trophy-outline' as IoniconsName, labelKey: 'leaderboard' },
  { name: 'forum', icon: 'chatbubbles-outline' as IoniconsName, labelKey: 'forum' },
];

export function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bar: {
          flexDirection: 'row',
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingTop: Spacing.sm,
          paddingBottom: Math.max(insets.bottom, Spacing.md),
          paddingHorizontal: Spacing.xs,
          alignItems: 'flex-end',
        },
        tab: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingVertical: Spacing.xs,
          minHeight: 52,
        },
        label: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          color: colors.textMuted,
        },
        labelActive: {
          color: colors.primary,
        },
        centerTab: {
          flex: 1,
          alignItems: 'center',
          marginTop: -22,
        },
        centerBtn: {
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          ...Shadows.lg,
        },
        centerBtnActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primaryDark,
        },
        centerLabel: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 6,
          color: colors.textMuted,
        },
        centerLabelActive: {
          color: colors.primary,
        },
      }),
    [colors, insets.bottom]
  );

  return (
    <View style={styles.bar}>
      {TAB_ORDER.map((tab) => {
        const routeIndex = state.routes.findIndex((r: { name: string }) => r.name === tab.name);
        if (routeIndex === -1) return <View key={tab.name} style={styles.tab} />;

        const route = state.routes[routeIndex];
        const isFocused = state.index === routeIndex;
        const label = t(`tabs.${tab.labelKey}` as 'tabs.home');

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (tab.center) {
          return (
            <Pressable
              key={tab.name}
              onPress={onPress}
              style={styles.centerTab}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
            >
              <View style={[styles.centerBtn, isFocused && styles.centerBtnActive]}>
                <Ionicons
                  name={tab.icon}
                  size={28}
                  color={isFocused ? colors.white : colors.primary}
                />
              </View>
              <Text style={[styles.centerLabel, isFocused && styles.centerLabelActive]}>{label}</Text>
            </Pressable>
          );
        }

        const color = isFocused ? colors.primary : colors.textMuted;

        return (
          <Pressable
            key={tab.name}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={label}
            android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
          >
            <Ionicons name={tab.icon} size={22} color={color} />
            <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
