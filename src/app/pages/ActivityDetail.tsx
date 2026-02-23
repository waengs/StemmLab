import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { ACTIVITIES } from '../types';
import { getTeam, saveActivityResult, getActivityResults, deleteActivityResult } from '../utils/storage';
import type { ActivityResult } from '../types';

export function ActivityDetail() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [pastResults, setPastResults] = useState<ActivityResult[]>([]);

  const activity = activityId ? ACTIVITIES[activityId as keyof typeof ACTIVITIES] : null;
  const team = getTeam();

  useEffect(() => {
    if (team && activityId) {
      const allResults = getActivityResults();
      const teamResults = allResults.filter(
        r => r.teamDiscriminator === team.discriminator && r.activityId === activityId
      );
      setPastResults(teamResults.sort((a, b) => b.timestamp - a.timestamp));
    }
  }, [team, activityId]);

  if (!activity || !team) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result: ActivityResult = {
      id: Date.now().toString(),
      activityId: activity.id,
      activityName: activity.name,
      teamDiscriminator: team.discriminator,
      timestamp: Date.now(),
      data: formData,
    };

    saveActivityResult(result);
    setFormData({});
    setPastResults([result, ...pastResults]);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this result?')) {
      deleteActivityResult(id);
      setPastResults(pastResults.filter(r => r.id !== id));
    }
  };

  const getFormFields = () => {
    switch (activity.id) {
      case 'parachute-drop':
        return [
          { name: 'gForce', label: 'G-Force Measured', type: 'number' },
          { name: 'dropHeight', label: 'Drop Height (cm)', type: 'number' },
          { name: 'parachuteSize', label: 'Parachute Size (cm²)', type: 'number' },
        ];
      case 'sound-pollution':
        return [
          { name: 'maxDecibels', label: 'Max Sound Level (dB)', type: 'number' },
          { name: 'avgDecibels', label: 'Average Sound Level (dB)', type: 'number' },
          { name: 'location', label: 'Location', type: 'text' },
        ];
      case 'hand-fan':
        return [
          { name: 'windSpeed', label: 'Wind Speed (m/s)', type: 'number' },
          { name: 'fanSize', label: 'Fan Diameter (cm)', type: 'number' },
        ];
      case 'earthquake':
        return [
          { name: 'vibrationLevel', label: 'Max Vibration (Hz)', type: 'number' },
          { name: 'structureHeight', label: 'Structure Height (cm)', type: 'number' },
          { name: 'survived', label: 'Structure Survived', type: 'select', options: ['Yes', 'No'] },
        ];
      case 'human-performance':
        return [
          { name: 'bendAngle', label: 'Max Bend Angle (degrees)', type: 'number' },
          { name: 'speed', label: 'Movement Speed (1-10)', type: 'number' },
          { name: 'gracefulness', label: 'Gracefulness Score (1-10)', type: 'number' },
        ];
      case 'reaction-board':
        return [
          { name: 'reactionTime', label: 'Reaction Time (ms)', type: 'number' },
          { name: 'accuracy', label: 'Accuracy (%)', type: 'number' },
        ];
      case 'breathing-pace':
        return [
          { name: 'breathsPerMinute', label: 'Breaths Per Minute', type: 'number' },
          { name: 'consistency', label: 'Consistency Score (1-10)', type: 'number' },
        ];
      default:
        return [];
    }
  };

  const fields = getFormFields();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Button
        startIcon={<ArrowLeft size={18} />}
        onClick={() => navigate('/app/activities')}
        sx={{ mb: 2 }}
      >
        Back to Activities
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {activity.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {activity.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label={activity.category} color="primary" />
          {activity.sensors.map((sensor) => (
            <Chip key={sensor} label={sensor.replace('-', ' ')} variant="outlined" size="small" />
          ))}
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Record your measurements and results below. All data will be saved to your team profile.
        </Alert>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fields.map((field) =>
              field.type === 'select' ? (
                <TextField
                  key={field.name}
                  select
                  label={field.label}
                  value={formData[field.name] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.name]: e.target.value })
                  }
                  SelectProps={{ native: true }}
                  required
                >
                  <option value=""></option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </TextField>
              ) : (
                <TextField
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.name]: e.target.value })
                  }
                  required
                  inputProps={field.type === 'number' ? { step: 'any', min: 0 } : {}}
                />
              )
            )}

            <TextField
              label="Notes (optional)"
              multiline
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Save size={18} />}
            >
              Save Results
            </Button>
          </Box>
        </form>
      </Paper>

      {pastResults.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Past Results ({pastResults.length})
          </Typography>
          {pastResults.map((result) => (
            <Card key={result.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(result.timestamp).toLocaleString()}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {Object.entries(result.data).map(([key, value]) => (
                        <Typography key={key} variant="body2">
                          <strong>{key}:</strong> {value}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Trash2 size={16} />}
                    onClick={() => handleDelete(result.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </div>
  );
}
