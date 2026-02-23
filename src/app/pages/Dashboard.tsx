import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, Typography, Button, Grid, Box, Avatar } from '@mui/material';
import { Beaker, Radar, Trophy, MessageSquare, Zap } from 'lucide-react';
import { getTeam, getActivityResults } from '../utils/storage';
import type { Team } from '../types';

export function Dashboard() {
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const teamData = getTeam();
    setTeam(teamData);

    const results = getActivityResults();
    const teamResults = teamData ? results.filter(r => r.teamDiscriminator === teamData.discriminator) : [];
    setCompletedCount(teamResults.length);
  }, []);

  const quickActions = [
    {
      title: 'Start Activity',
      description: 'Choose from 7 STEM challenges',
      icon: Beaker,
      color: '#2196F3',
      path: '/app/activities',
    },
    {
      title: 'Use Sensors',
      description: 'Measure and record data',
      icon: Radar,
      color: '#4CAF50',
      path: '/app/sensors',
    },
    {
      title: 'View Leaderboard',
      description: 'See team rankings',
      icon: Trophy,
      color: '#FF9800',
      path: '/app/leaderboard',
    },
    {
      title: 'Forum',
      description: 'Ask questions & share ideas',
      icon: MessageSquare,
      color: '#9C27B0',
      path: '/app/forum',
    },
  ];

  if (!team) return null;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            margin: '0 auto 16px',
            fontSize: '2rem',
          }}
        >
          {team.name.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h4" gutterBottom>
          Welcome, {team.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Team ID: {team.discriminator} • {team.gradeLevel}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="primary">
              {team.members.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Team Members
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" color="primary">
              {completedCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Completed Activities
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Grid item xs={12} sm={6} key={action.title}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: action.color, width: 48, height: 48 }}>
                      <Icon size={24} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {completedCount > 0 && (
        <Card sx={{ mt: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Zap size={32} />
              <Box>
                <Typography variant="h6">
                  Great Progress!
                </Typography>
                <Typography variant="body2">
                  You've completed {completedCount} {completedCount === 1 ? 'activity' : 'activities'}. Keep exploring!
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
