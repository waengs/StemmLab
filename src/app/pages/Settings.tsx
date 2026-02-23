import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Plus, Trash2, LogOut, Save } from 'lucide-react';
import { getTeam, saveTeam, clearTeam } from '../utils/storage';
import type { Team } from '../types';

export function Settings() {
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [gradeLevel, setGradeLevel] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [saved, setSaved] = useState(false);

  const gradeLevels = [
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'Year 1', 'Year 2', 'Year 3', 'Year 4'
  ];

  useEffect(() => {
    const teamData = getTeam();
    if (teamData) {
      setTeam(teamData);
      setTeamName(teamData.name);
      setPassword(teamData.password);
      setMembers(teamData.members);
      setGradeLevel(teamData.gradeLevel);
    }
  }, []);

  const addMember = () => {
    setMembers([...members, '']);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleSave = () => {
    if (!team) return;

    const filteredMembers = members.filter(m => m.trim() !== '');
    if (!teamName || !password || filteredMembers.length === 0 || !gradeLevel) {
      alert('Please fill in all fields and add at least one team member');
      return;
    }

    const updatedTeam: Team = {
      ...team,
      name: teamName,
      password,
      members: filteredMembers,
      gradeLevel,
    };

    saveTeam(updatedTeam);
    setTeam(updatedTeam);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    clearTeam();
    navigate('/');
  };

  if (!team) return null;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Team Settings
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Changes saved successfully!
        </Alert>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Team Information
          </Typography>

          <TextField
            fullWidth
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Team Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />

          <TextField
            fullWidth
            select
            label="Grade or Year Level"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            margin="normal"
          >
            {gradeLevels.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ mt: 3, mb: 1, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Team ID:</strong> {team.discriminator}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              This unique code identifies your team on the leaderboard
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Team Members
          </Typography>

          {members.map((member, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                fullWidth
                label={`Member ${index + 1}`}
                value={member}
                onChange={(e) => updateMember(index, e.target.value)}
                size="small"
              />
              {members.length > 1 && (
                <IconButton
                  onClick={() => removeMember(index)}
                  color="error"
                  size="small"
                >
                  <Trash2 size={18} />
                </IconButton>
              )}
            </Box>
          ))}

          <Button
            startIcon={<Plus size={18} />}
            onClick={addMember}
            variant="outlined"
            fullWidth
            sx={{ mt: 1 }}
          >
            Add Member
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Save size={18} />}
          onClick={handleSave}
          fullWidth
        >
          Save Changes
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<LogOut size={18} />}
          onClick={() => setShowLogoutDialog(true)}
          fullWidth
        >
          Logout
        </Button>
      </Box>

      <Dialog open={showLogoutDialog} onClose={() => setShowLogoutDialog(false)}>
        <DialogTitle>Logout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to logout? You'll need to log back in with your team credentials.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
          <Button onClick={handleLogout} color="error" variant="contained">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
