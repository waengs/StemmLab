import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';

interface TrialVideoPlayerProps {
  videoUri: string;
}

export function TrialVideoPlayer({ videoUri }: TrialVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [playbackRate, setPlaybackRate] = React.useState(1);

  const player = useVideoPlayer({ uri: videoUri }, (p) => {
    p.loop = true;
    p.pause();
    p.playbackRate = 1;
    p.preservesPitch = false;
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (player) {
        setCurrentTime(player.currentTime);
        setIsPlaying(player.playing);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [player]);

  const handleSeek = (amount: number) => {
    if (player) {
      player.pause();
      player.seekBy(amount);
    }
  };

  const setSpeed = (speed: number) => {
    if (player) {
      const wasPlaying = player.playing;
      player.playbackRate = speed;
      setPlaybackRate(speed);
      // Sometimes Android requires a pause/play cycle to apply rate changes
      if (wasPlaying) {
        player.pause();
        setTimeout(() => {
          player.play();
        }, 50);
      }
    }
  };

  return (
    <View style={styles.slowMoContainer}>
      <View style={styles.videoPlayer}>
        <VideoView
          style={{ width: '100%', height: '100%' }}
          player={player}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="contain"
          surfaceType={Platform.OS === 'android' ? 'textureView' : undefined}
        />
      </View>
      <View style={styles.slowMoControls}>
        <View style={styles.timerDisplayContainer}>
          <Text style={styles.slowMoTimerText}>{currentTime.toFixed(3)} s</Text>
        </View>
        
        <View style={styles.slowMoRow}>
          <TouchableOpacity onPress={() => handleSeek(-0.033)} style={styles.iconBtn}>
            <Ionicons name="play-back" size={20} color={Colors.white} />
            <Text style={styles.iconBtnText}>-1f</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => player?.playing ? player.pause() : player?.play()} style={[styles.iconBtn, { backgroundColor: Colors.primary }]}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleSeek(0.033)} style={styles.iconBtn}>
            <Ionicons name="play-forward" size={20} color={Colors.white} />
            <Text style={styles.iconBtnText}>+1f</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.speedRow}>
          {[1, 0.5, 0.25, 0.1].map(rate => (
            <TouchableOpacity 
              key={rate} 
              onPress={() => setSpeed(rate)}
              style={[styles.speedBadge, playbackRate === rate && styles.speedBadgeActive]}
            >
              <Text style={[styles.speedBadgeText, playbackRate === rate && styles.speedBadgeTextActive]}>{rate}x</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoPlayer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: BorderRadius.md,
    elevation: 4, // Fixes z-index rendering bug on Android when inside an elevated Card
  },
  slowMoContainer: {
    width: '100%',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slowMoControls: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
  timerDisplayContainer: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  slowMoTimerText: {
    ...Typography.h2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.primary,
  },
  slowMoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    backgroundColor: Colors.textSecondary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
    marginTop: -2,
    fontSize: 10,
  },
  speedBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.borderLight,
  },
  speedBadgeActive: {
    backgroundColor: Colors.primary,
  },
  speedBadgeText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  speedBadgeTextActive: {
    color: Colors.white,
  }
});
