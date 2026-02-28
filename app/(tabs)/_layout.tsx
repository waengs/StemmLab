import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme';

import { useTranslation } from 'react-i18next';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabsLayout() {
  const { t } = useTranslation();

  const TAB_ITEMS: { name: string; title: string; icon: IoniconsName; iconFocused: IoniconsName }[] = [
    { name: 'index', title: t('tabs.home'), icon: 'home-outline', iconFocused: 'home' },
    { name: 'activities/index', title: t('tabs.activities'), icon: 'flask-outline', iconFocused: 'flask' },
    { name: 'sensors', title: t('tabs.sensors'), icon: 'radio-outline', iconFocused: 'radio' },
    { name: 'leaderboard', title: t('tabs.leaderboard'), icon: 'trophy-outline', iconFocused: 'trophy' },
    { name: 'forum', title: t('tabs.forum'), icon: 'chatbubbles-outline', iconFocused: 'chatbubbles' },
    { name: 'settings', title: t('tabs.settings'), icon: 'settings-outline', iconFocused: 'settings' },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
      {/* Hide the dynamic route from tabs */}
      <Tabs.Screen
        name="activities/[activityId]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
