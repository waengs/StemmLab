import { useState } from 'react';
import { useNavigate } from 'react-router';
import { TextField, Button, MenuItem, IconButton, Paper, Typography, Box } from '@mui/material';
import { Plus, Trash2, Users } from 'lucide-react';
import { saveTeam, generateDiscriminator } from '../utils/storage';
import type { Team } from '../types';

export function TeamSetup() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [members, setMembers] = useState(['']);
  const [gradeLevel, setGradeLevel] = useState('');

  const gradeLevels = [
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'Year 1', 'Year 2', 'Year 3', 'Year 4'
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredMembers = members.filter(m => m.trim() !== '');
    if (!teamName || !password || filteredMembers.length === 0 || !gradeLevel) {
      alert('Please fill in all fields and add at least one team member');
      return;
    }

    const team: Team = {
      name: teamName,
      password,
      members: filteredMembers,
      gradeLevel,
      discriminator: generateDiscriminator(),
    };

    saveTeam(team);
    navigate('/app');
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Paper elevation={3} sx={{ maxWidth: 500, width: '100%', p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Users size={48} className="mx-auto mb-2 text-blue-600" />
          <Typography variant="h4" gutterBottom>
            STEM Lab Team Setup
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your team to get started
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Team Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            select
            label="Grade or Year Level"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            required
            margin="normal"
          >
            {gradeLevels.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
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
            sx={{ mt: 1, mb: 3 }}
          >
            Add Member
          </Button>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
          >
            Create Team
          </Button>
        </form>
      </Paper>
    </div>
  );
}
