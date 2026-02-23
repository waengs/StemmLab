import { Outlet, useNavigate, useLocation } from 'react-router';
import { useEffect } from 'react';
import { Home, Beaker, Radar, Trophy, MessageSquare, Settings } from 'lucide-react';
import { getTeam } from '../utils/storage';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const team = getTeam();
    if (!team) {
      navigate('/');
    }
  }, [navigate]);

  const navItems = [
    { path: '/app', icon: Home, label: 'Home' },
    { path: '/app/activities', icon: Beaker, label: 'Activities' },
    { path: '/app/sensors', icon: Radar, label: 'Sensors' },
    { path: '/app/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/app/forum', icon: MessageSquare, label: 'Forum' },
    { path: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  const currentPath = location.pathname.split('/').slice(0, 3).join('/');
  const value = navItems.findIndex(item => item.path === currentPath);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto pb-16">
        <Outlet />
      </div>
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => navigate(navItems[newValue].path)}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={<Icon size={20} />}
            />
          );
        })}
      </BottomNavigation>
    </div>
  );
}
