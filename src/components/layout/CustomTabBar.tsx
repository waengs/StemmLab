import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { GradientBox } from '../ui/GradientBox';
import { BorderRadius, Shadows, Spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ORDER = [
  { name: 'activities/index', icon: 'flask-outline' as IoniconsName, labelKey: 'activities', colorKey: 'science' as const },
  { name: 'sensors', icon: 'radio-outline' as IoniconsName, labelKey: 'sensors', colorKey: 'technology' as const },
  { name: 'index', icon: 'home' as IoniconsName, labelKey: 'home', center: true, colorKey: 'primary' as const },
  { name: 'leaderboard', icon: 'trophy-outline' as IoniconsName, labelKey: 'leaderboard', colorKey: 'accent' as const },
  { name: 'forum', icon: 'chatbubbles-outline' as IoniconsName, labelKey: 'forum', colorKey: 'maths' as const },
];

export function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();

  const getTabColor = (colorKey: (typeof TAB_ORDER)[number]['colorKey']) => {
    if (colorKey === 'primary') return colors.primary;
    return colors[colorKey];
  };

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
        centerTab: {
          flex: 1,
          alignItems: 'center',
          marginTop: -22,
        },
        centerBtn: {
          width: 58,
          height: 58,
          borderRadius: 29,
          alignItems: 'center',
          justifyContent: 'center',
          ...Shadows.lg,
        },
        centerBtnInactive: {
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor: colors.primaryLight,
        },
        centerLabel: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 6,
          color: colors.textMuted,
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
        const tabColor = getTabColor(tab.colorKey);

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
              {isFocused ? (
                <GradientBox colors={colors.gradientPrimary} style={styles.centerBtn}>
                  <Ionicons name={tab.icon} size={28} color={colors.white} />
                </GradientBox>
              ) : (
                <View style={[styles.centerBtn, !isFocused && styles.centerBtnInactive, isFocused && { backgroundColor: colors.primary }]}>
                  <Ionicons
                    name={tab.icon}
                    size={28}
                    color={isFocused ? colors.white : colors.primary}
                  />
                </View>
              )}
              <Text style={[styles.centerLabel, isFocused && { color: tabColor }]}>{label}</Text>
            </Pressable>
          );
        }

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
            <View
              style={
                isFocused
                  ? {
                      backgroundColor: tabColor + (isDark ? '28' : '18'),
                      borderRadius: BorderRadius.full,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }
                  : undefined
              }
            >
              <Ionicons name={tab.icon} size={22} color={isFocused ? tabColor : colors.textMuted} />
            </View>
            <Text style={[styles.label, isFocused && { color: tabColor }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
