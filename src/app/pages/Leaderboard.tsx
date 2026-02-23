import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Box,
  Chip,
  Avatar,
} from '@mui/material';
import { Trophy, Medal, Award } from 'lucide-react';
import { getActivityResults } from '../utils/storage';
import type { ActivityResult } from '../types';

interface LeaderboardEntry {
  teamDiscriminator: string;
  teamName: string;
  score: number;
  count: number;
}

export function Leaderboard() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});

  useEffect(() => {
    const results = getActivityResults();
    const boards: Record<string, LeaderboardEntry[]> = {
      overall: [],
      'parachute-drop': [],
      'sound-pollution': [],
      'hand-fan': [],
      'earthquake': [],
      'human-performance': [],
      'reaction-board': [],
      'breathing-pace': [],
    };

    const teamStats: Record<string, { count: number; totalScore: number }> = {};

    results.forEach((result: ActivityResult) => {
      if (!teamStats[result.teamDiscriminator]) {
        teamStats[result.teamDiscriminator] = { count: 0, totalScore: 0 };
      }
      teamStats[result.teamDiscriminator].count += 1;

      const score = calculateScore(result);
      teamStats[result.teamDiscriminator].totalScore += score;

      const existingEntry = boards[result.activityId]?.find(
        e => e.teamDiscriminator === result.teamDiscriminator
      );

      if (existingEntry) {
        existingEntry.score = Math.max(existingEntry.score, score);
        existingEntry.count += 1;
      } else {
        if (!boards[result.activityId]) {
          boards[result.activityId] = [];
        }
        boards[result.activityId].push({
          teamDiscriminator: result.teamDiscriminator,
          teamName: `Team ${result.teamDiscriminator}`,
          score,
          count: 1,
        });
      }
    });

    Object.entries(teamStats).forEach(([discriminator, stats]) => {
      boards.overall.push({
        teamDiscriminator: discriminator,
        teamName: `Team ${discriminator}`,
        score: stats.totalScore,
        count: stats.count,
      });
    });

    Object.keys(boards).forEach(key => {
      boards[key].sort((a, b) => b.score - a.score);
    });

    setLeaderboards(boards);
  }, []);

  const calculateScore = (result: ActivityResult): number => {
    switch (result.activityId) {
      case 'parachute-drop':
        return Math.max(0, 100 - (parseFloat(result.data.gForce) || 0) * 10);
      case 'sound-pollution':
        return parseFloat(result.data.maxDecibels) || 0;
      case 'hand-fan':
        return parseFloat(result.data.windSpeed) || 0;
      case 'earthquake':
        return result.data.survived === 'Yes' ? 100 : 0;
      case 'human-performance':
        return (parseFloat(result.data.bendAngle) || 0) +
               (parseFloat(result.data.speed) || 0) * 2 +
               (parseFloat(result.data.gracefulness) || 0) * 3;
      case 'reaction-board':
        return (parseFloat(result.data.accuracy) || 0) -
               (parseFloat(result.data.reactionTime) || 1000) / 100;
      case 'breathing-pace':
        return (parseFloat(result.data.consistency) || 0) * 10;
      default:
        return 0;
    }
  };

  const categories = [
    { label: 'Overall', key: 'overall' },
    { label: 'Parachute Drop', key: 'parachute-drop' },
    { label: 'Sound Pollution', key: 'sound-pollution' },
    { label: 'Hand Fan', key: 'hand-fan' },
    { label: 'Earthquake', key: 'earthquake' },
    { label: 'Human Performance', key: 'human-performance' },
    { label: 'Reaction Board', key: 'reaction-board' },
    { label: 'Breathing Pace', key: 'breathing-pace' },
  ];

  const currentBoard = leaderboards[categories[selectedTab].key] || [];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy size={24} color="#FFD700" />;
      case 1:
        return <Medal size={24} color="#C0C0C0" />;
      case 2:
        return <Award size={24} color="#CD7F32" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Leaderboard
      </Typography>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat) => (
            <Tab key={cat.key} label={cat.label} />
          ))}
        </Tabs>
      </Card>

      {currentBoard.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No results yet for this category
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {currentBoard.map((entry, index) => (
            <Card
              key={entry.teamDiscriminator}
              sx={{
                mb: 1,
                bgcolor: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'background.paper',
                border: index === 0 ? '2px solid #FFD700' : 'none',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ minWidth: 40, textAlign: 'center' }}>
                    {getRankIcon(index) || (
                      <Typography variant="h6" color="text.secondary">
                        #{index + 1}
                      </Typography>
                    )}
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'primary.main',
                    }}
                  >
                    {entry.teamName.charAt(entry.teamName.length - 1)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{entry.teamName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {entry.count} {entry.count === 1 ? 'attempt' : 'attempts'}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${entry.score.toFixed(1)} pts`}
                    color={index === 0 ? 'primary' : 'default'}
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </div>
  );
}
