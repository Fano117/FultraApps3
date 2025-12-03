import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet, ViewStyle} from 'react-native';
import {colors} from '../../design-system/theme/colors';
import {typography} from '../../design-system/theme/typography';
import {spacing} from '../../design-system/theme/spacing';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = colors.primary,
  message,
  fullScreen = false,
  overlay = false,
  style,
}) => {
  const containerStyles = [
    styles.container,
    fullScreen && styles.fullScreen,
    overlay && styles.overlay,
    style,
  ];

  return (
    <View style={containerStyles}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={color} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
};

// Full screen loading component
export const FullScreenLoader: React.FC<{message?: string}> = ({
  message = 'Cargando...',
}) => {
  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.fullScreenMessage}>{message}</Text>
      </View>
    </View>
  );
};

// Overlay loading component
export const LoadingOverlay: React.FC<{
  visible: boolean;
  message?: string;
}> = ({visible, message}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={colors.white} />
        {message && <Text style={styles.overlayMessage}>{message}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  content: {
    alignItems: 'center',
  },
  message: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  // Full screen loader styles
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  loaderBox: {
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  fullScreenMessage: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing.base,
  },

  // Overlay styles
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: colors.gray[800],
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    minWidth: 120,
  },
  overlayMessage: {
    ...typography.textStyles.bodySmall,
    color: colors.white,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
