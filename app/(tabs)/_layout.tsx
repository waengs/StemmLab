import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ITEMS: { name: string; title: string; icon: IoniconsName; iconFocused: IoniconsName }[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'activities/index', title: 'Activities', icon: 'flask-outline', iconFocused: 'flask' },
  { name: 'sensors', title: 'Sensors', icon: 'radio-outline', iconFocused: 'radio' },
  { name: 'leaderboard', title: 'Leaderboard', icon: 'trophy-outline', iconFocused: 'trophy' },
  { name: 'forum', title: 'Forum', icon: 'chatbubbles-outline', iconFocused: 'chatbubbles' },
  { name: 'settings', title: 'Settings', icon: 'settings-outline', iconFocused: 'settings' },
];

export default function TabsLayout() {
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
