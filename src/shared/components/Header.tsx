import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {colors} from '../../design-system/theme/colors';
import {typography} from '../../design-system/theme/typography';
import {spacing} from '../../design-system/theme/spacing';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  transparent?: boolean;
  dark?: boolean;
  centerTitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightIcon,
  onRightPress,
  rightComponent,
  leftComponent,
  transparent = false,
  dark = false,
  centerTitle = false,
}) => {
  const insets = useSafeAreaInsets();

  const backgroundColor = transparent
    ? 'transparent'
    : dark
      ? colors.gray[900]
      : colors.background.primary;

  const textColor = dark ? colors.white : colors.text.primary;
  const iconColor = dark ? colors.white : colors.text.primary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight : 0),
        },
      ]}>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : backgroundColor}
        translucent={transparent}
      />

      <View style={styles.content}>
        {/* Left section */}
        <View style={styles.leftSection}>
          {leftComponent ? (
            leftComponent
          ) : showBackButton ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.iconButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Center section - Title */}
        <View style={[styles.centerSection, centerTitle && styles.centerSectionAbsolute]}>
          {title && (
            <Text
              style={[styles.title, {color: textColor}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text
              style={[styles.subtitle, {color: dark ? colors.gray[400] : colors.text.tertiary}]}
              numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right section */}
        <View style={styles.rightSection}>
          {rightComponent ? (
            rightComponent
          ) : rightIcon ? (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.iconButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name={rightIcon} size={24} color={iconColor} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
    </View>
  );
};

// Simple header for screens that don't need full functionality
export const SimpleHeader: React.FC<{
  title: string;
  onBackPress?: () => void;
}> = ({title, onBackPress}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.simpleContainer,
        {paddingTop: insets.top + spacing.sm},
      ]}>
      {onBackPress && (
        <TouchableOpacity onPress={onBackPress} style={styles.simpleBackButton}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      )}
      <Text style={styles.simpleTitle}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.base,
  },
  leftSection: {
    minWidth: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  centerSectionAbsolute: {
    position: 'absolute',
    left: 60,
    right: 60,
  },
  rightSection: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.textStyles.h5,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.textStyles.caption,
    textAlign: 'center',
    marginTop: 2,
  },
  iconButton: {
    padding: spacing.xs,
  },
  placeholder: {
    width: 44,
  },

  // Simple header styles
  simpleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  simpleBackButton: {
    marginRight: spacing.md,
  },
  simpleTitle: {
    ...typography.textStyles.h5,
    color: colors.text.primary,
  },
});

export default Header;
