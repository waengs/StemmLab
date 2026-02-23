import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Grid,
} from '@mui/material';
import { Video, Gauge, Volume2, MapPin, Activity, Move, Play, Save } from 'lucide-react';
import { SENSORS } from '../types';
import { getTeam, saveSensorLog, getSensorLogs } from '../utils/storage';
import type { SensorLog } from '../types';

const iconMap: Record<string, any> = {
  Video,
  Gauge,
  Volume2,
  MapPin,
  Activity,
  Move,
};

export function Sensors() {
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sensorValue, setSensorValue] = useState<string>('');
  const [logs, setLogs] = useState<SensorLog[]>([]);

  const team = getTeam();

  useEffect(() => {
    if (team) {
      const allLogs = getSensorLogs();
      const teamLogs = allLogs.filter(l => l.teamDiscriminator === team.discriminator);
      setLogs(teamLogs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
    }
  }, [team]);

  const handleSensorClick = (sensorId: string) => {
    setSelectedSensor(sensorId);
    setIsRecording(false);
    setSensorValue('');
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    simulateSensorData();
  };

  const simulateSensorData = () => {
    const sensor = SENSORS[selectedSensor as keyof typeof SENSORS];
    let value = '';

    switch (selectedSensor) {
      case 'g-force':
        value = (Math.random() * 5 + 1).toFixed(2) + ' g';
        break;
      case 'sound-meter':
        value = (Math.random() * 40 + 40).toFixed(1) + ' dB';
        break;
      case 'vibration':
        value = (Math.random() * 100 + 20).toFixed(1) + ' Hz';
        break;
      case 'movement-detector':
        value = (Math.random() * 10 + 1).toFixed(2) + ' m/s';
        break;
      case 'location':
        value = `${(Math.random() * 90).toFixed(4)}°N, ${(Math.random() * 180).toFixed(4)}°E`;
        break;
      case 'slow-mo':
        value = 'Video recording started at 240 fps';
        break;
    }

    setSensorValue(value);
  };

  const handleSave = () => {
    if (!team || !selectedSensor) return;

    const log: SensorLog = {
      id: Date.now().toString(),
      sensorType: SENSORS[selectedSensor as keyof typeof SENSORS].name,
      timestamp: Date.now(),
      data: sensorValue,
      teamDiscriminator: team.discriminator,
    };

    saveSensorLog(log);
    setLogs([log, ...logs].slice(0, 10));
    setSelectedSensor(null);
    setIsRecording(false);
    setSensorValue('');
  };

  const handleClose = () => {
    setSelectedSensor(null);
    setIsRecording(false);
    setSensorValue('');
  };

  const sensor = selectedSensor ? SENSORS[selectedSensor as keyof typeof SENSORS] : null;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Sensors
      </Typography>

      <Grid container spacing={2}>
        {Object.values(SENSORS).map((sensor) => {
          const Icon = iconMap[sensor.icon];
          return (
            <Grid item xs={12} sm={6} key={sensor.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleSensorClick(sensor.id)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{sensor.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sensor.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {logs.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recent Logs
          </Typography>
          {logs.map((log) => (
            <Card key={log.id} sx={{ mb: 1 }}>
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Chip label={log.sensorType} size="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" component="span">
                      {log.data}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.timestamp).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={!!selectedSensor} onClose={handleClose} maxWidth="sm" fullWidth>
        {sensor && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {iconMap[sensor.icon] && iconMap[sensor.icon]({ size: 24 })}
                {sensor.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                {sensor.description}
              </Typography>

              {!isRecording ? (
                <Button
                  variant="contained"
                  startIcon={<Play size={18} />}
                  onClick={handleStartRecording}
                  fullWidth
                  size="large"
                >
                  Start Measurement
                </Button>
              ) : (
                <Box>
                  <Card sx={{ bgcolor: 'primary.main', color: 'white', p: 3, textAlign: 'center', mb: 2 }}>
                    <Typography variant="h3">{sensorValue}</Typography>
                  </Card>
                  <TextField
                    fullWidth
                    label="Notes (optional)"
                    multiline
                    rows={2}
                    value={sensorValue}
                    onChange={(e) => setSensorValue(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              {isRecording && (
                <Button
                  variant="contained"
                  startIcon={<Save size={18} />}
                  onClick={handleSave}
                >
                  Save to Log
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
