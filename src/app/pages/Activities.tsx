import { useNavigate } from 'react-router';
import { Card, CardContent, Typography, Chip, Box, Grid } from '@mui/material';
import { Wrench, Stethoscope, ChevronRight } from 'lucide-react';
import { ACTIVITIES } from '../types';

export function Activities() {
  const navigate = useNavigate();

  const engineeringActivities = Object.values(ACTIVITIES).filter(a => a.category === 'Engineering');
  const healthActivities = Object.values(ACTIVITIES).filter(a => a.category === 'Health/Medical');

  const CategorySection = ({ title, activities, icon: Icon, color }: any) => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Icon size={24} color={color} />
        <Typography variant="h5">
          {title}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {activities.map((activity: any) => (
          <Grid item xs={12} key={activity.id}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: 3,
                },
              }}
              onClick={() => navigate(`/app/activities/${activity.id}`)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {activity.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {activity.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {activity.sensors.map((sensor: string) => (
                        <Chip
                          key={sensor}
                          label={sensor.replace('-', ' ')}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                  <ChevronRight size={24} color="#9e9e9e" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        STEM Activities
      </Typography>

      <CategorySection
        title="Engineering Challenges"
        activities={engineeringActivities}
        icon={Wrench}
        color="#2196F3"
      />

      <CategorySection
        title="Health & Medical"
        activities={healthActivities}
        icon={Stethoscope}
        color="#4CAF50"
      />
    </div>
  );
}
