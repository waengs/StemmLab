import React from 'react';
import { View, Text, TouchableOpacity, Platform, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';

interface TrialVideoPlayerProps {
  videoUri: string;
  compact?: boolean;
}

const PORTRAIT_FALLBACK = 9 / 16;

function readAspectRatio(player: ReturnType<typeof useVideoPlayer> | null): number | null {
  const size = player?.videoTrack?.size;
  if (size?.width && size?.height) {
    return size.width / size.height;
  }
  return null;
}

export function TrialVideoPlayer({ videoUri, compact = false }: TrialVideoPlayerProps) {
  const { colors } = useTheme();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [aspectRatio, setAspectRatio] = React.useState(PORTRAIT_FALLBACK);

  const styles = useThemedStyles(({ colors: c, typography }) => ({
    videoPlayer: {
      width: '100%',
      backgroundColor: '#000',
      borderTopLeftRadius: BorderRadius.md,
      borderTopRightRadius: BorderRadius.md,
      overflow: 'hidden',
      elevation: 4,
    },
    slowMoContainer: {
      width: '100%',
      borderRadius: BorderRadius.md,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      overflow: 'hidden',
    },
    slowMoContainerCompact: {
      borderRadius: BorderRadius.sm,
    },
    slowMoControls: {
      padding: Spacing.md,
      backgroundColor: c.background,
    },
    slowMoControlsCompact: {
      padding: Spacing.sm,
    },
    timerDisplayContainer: {
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    slowMoTimerText: {
      ...typography.h2,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      color: c.primary,
    },
    slowMoTimerTextCompact: {
      ...typography.h3,
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
      flexWrap: 'wrap',
    },
    iconBtn: {
      backgroundColor: c.textSecondary,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconBtnCompact: {
      width: 38,
      height: 38,
      borderRadius: 19,
    },
    playBtn: {
      backgroundColor: c.primary,
    },
    iconBtnText: {
      ...typography.caption,
      color: c.white,
      fontWeight: 'bold',
      marginTop: -2,
      fontSize: 10,
    },
    speedBadge: {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.full,
      backgroundColor: c.borderLight,
    },
    speedBadgeCompact: {
      paddingHorizontal: Spacing.sm,
    },
    speedBadgeActive: {
      backgroundColor: c.primary,
    },
    speedBadgeText: {
      ...typography.bodySmall,
      color: c.textSecondary,
      fontWeight: '600',
    },
    speedBadgeTextActive: {
      color: c.white,
    },
  }));

  const player = useVideoPlayer({ uri: videoUri }, (p) => {
    p.loop = true;
    p.pause();
    p.playbackRate = 1;
    p.preservesPitch = false;
  });

  React.useEffect(() => {
    setAspectRatio(PORTRAIT_FALLBACK);
  }, [videoUri]);

  React.useEffect(() => {
    const applyAspectRatio = () => {
      const next = readAspectRatio(player);
      if (next) setAspectRatio(next);
    };

    applyAspectRatio();
    const subscription = player.addListener('statusChange', applyAspectRatio);
    return () => subscription.remove();
  }, [player, videoUri]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (player) {
        setCurrentTime(player.currentTime);
        setIsPlaying(player.playing);
        const next = readAspectRatio(player);
        if (next) setAspectRatio(next);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [player]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const maxVideoHeight = compact ? 360 : 520;
  const naturalHeight = containerWidth > 0 ? containerWidth / aspectRatio : maxVideoHeight;
  const videoHeight = Math.max(160, Math.min(naturalHeight, maxVideoHeight));

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
      if (wasPlaying) {
        player.pause();
        setTimeout(() => {
          player.play();
        }, 50);
      }
    }
  };

  return (
    <View style={[styles.slowMoContainer, compact && styles.slowMoContainerCompact]} onLayout={handleLayout}>
      <View style={[styles.videoPlayer, { height: videoHeight }]}>
        <VideoView
          style={{ width: '100%', height: '100%' }}
          player={player}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="contain"
          surfaceType={Platform.OS === 'android' ? 'textureView' : undefined}
        />
      </View>
      <View style={[styles.slowMoControls, compact && styles.slowMoControlsCompact]}>
        <View style={styles.timerDisplayContainer}>
          <Text style={[styles.slowMoTimerText, compact && styles.slowMoTimerTextCompact]}>
            {currentTime.toFixed(3)} s
          </Text>
        </View>

        <View style={styles.slowMoRow}>
          <TouchableOpacity onPress={() => handleSeek(-0.033)} style={[styles.iconBtn, compact && styles.iconBtnCompact]}>
            <Ionicons name="play-back" size={compact ? 16 : 20} color={colors.white} />
            <Text style={styles.iconBtnText}>-1f</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => (player?.playing ? player.pause() : player?.play())}
            style={[styles.iconBtn, styles.playBtn, compact && styles.iconBtnCompact]}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={compact ? 20 : 24} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSeek(0.033)} style={[styles.iconBtn, compact && styles.iconBtnCompact]}>
            <Ionicons name="play-forward" size={compact ? 16 : 20} color={colors.white} />
            <Text style={styles.iconBtnText}>+1f</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.speedRow}>
          {[1, 0.5, 0.25, 0.1].map((rate) => (
            <TouchableOpacity
              key={rate}
              onPress={() => setSpeed(rate)}
              style={[styles.speedBadge, compact && styles.speedBadgeCompact, playbackRate === rate && styles.speedBadgeActive]}
            >
              <Text style={[styles.speedBadgeText, playbackRate === rate && styles.speedBadgeTextActive]}>
                {rate}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
