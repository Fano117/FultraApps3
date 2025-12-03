import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {Header, LoadingOverlay} from '../../shared/components';
import {useAuth} from '../../shared/hooks';
import {getInitials} from '../../shared/utils/helpers';
import {colors} from '../../design-system/theme/colors';
import {typography} from '../../design-system/theme/typography';
import {spacing} from '../../design-system/theme/spacing';
import {shadows} from '../../design-system/theme/spacing';
import {RootStackParamList} from '../../navigation/types';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showArrow?: boolean;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightComponent,
  showArrow = true,
  danger = false,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress && !rightComponent}
    activeOpacity={0.7}>
    <View
      style={[
        styles.iconContainer,
        {backgroundColor: danger ? colors.error + '15' : colors.primary + '15'},
      ]}>
      <Icon
        name={icon}
        size={20}
        color={danger ? colors.error : colors.primary}
      />
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, danger && styles.dangerText]}>
        {title}
      </Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightComponent || (showArrow && onPress && (
      <Icon name="chevron-forward" size={20} color={colors.gray[400]} />
    ))}
  </TouchableOpacity>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({navigation}) => {
  const {user, logout, isLoading} = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  }, [logout]);

  const handleEditProfile = useCallback(() => {
    Alert.alert('Próximamente', 'Esta función estará disponible pronto.');
  }, []);

  const handleChangePassword = useCallback(() => {
    Alert.alert('Próximamente', 'Esta función estará disponible pronto.');
  }, []);

  const handleLanguage = useCallback(() => {
    Alert.alert('Idioma', 'Actualmente solo está disponible el idioma español.');
  }, []);

  const handleHelp = useCallback(() => {
    Alert.alert('Ayuda', 'Contacta a soporte en soporte@fultraapp.com');
  }, []);

  const handleAbout = useCallback(() => {
    Alert.alert(
      'Acerca de FultraApp',
      'Versión 1.0.0\n\nFultraApp es tu solución integral para gestión de entregas.\n\n© 2024 FultraApp',
    );
  }, []);

  const handlePrivacy = useCallback(() => {
    Alert.alert('Próximamente', 'La política de privacidad estará disponible pronto.');
  }, []);

  const handleTerms = useCallback(() => {
    Alert.alert('Próximamente', 'Los términos de servicio estarán disponibles pronto.');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LoadingOverlay visible={isLoading} message="Cerrando sesión..." />

      <Header
        title="Configuración"
        showBackButton
        onBackPress={handleGoBack}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} onPress={handleEditProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.fullName || 'U')}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || 'Usuario'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.gray[400]} />
        </TouchableOpacity>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="person-outline"
              title="Editar perfil"
              onPress={handleEditProfile}
            />
            <SettingItem
              icon="lock-closed-outline"
              title="Cambiar contraseña"
              onPress={handleChangePassword}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="language-outline"
              title="Idioma"
              subtitle="Español"
              onPress={handleLanguage}
            />
            <SettingItem
              icon="notifications-outline"
              title="Notificaciones"
              showArrow={false}
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{false: colors.gray[300], true: colors.primary + '50'}}
                  thumbColor={notificationsEnabled ? colors.primary : colors.gray[400]}
                />
              }
            />
            <SettingItem
              icon="location-outline"
              title="Ubicación en segundo plano"
              showArrow={false}
              rightComponent={
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                  trackColor={{false: colors.gray[300], true: colors.primary + '50'}}
                  thumbColor={locationEnabled ? colors.primary : colors.gray[400]}
                />
              }
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="help-circle-outline"
              title="Centro de ayuda"
              onPress={handleHelp}
            />
            <SettingItem
              icon="information-circle-outline"
              title="Acerca de"
              onPress={handleAbout}
            />
            <SettingItem
              icon="shield-outline"
              title="Política de privacidad"
              onPress={handlePrivacy}
            />
            <SettingItem
              icon="document-text-outline"
              title="Términos de servicio"
              onPress={handleTerms}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="log-out-outline"
              title="Cerrar sesión"
              onPress={handleLogout}
              showArrow={false}
              danger
            />
          </View>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>FultraApp v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: 12,
    ...shadows.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.textStyles.h4,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    ...typography.textStyles.h5,
    color: colors.text.primary,
  },
  profileEmail: {
    ...typography.textStyles.bodySmall,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.textStyles.labelSmall,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.base,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingTitle: {
    ...typography.textStyles.body,
    color: colors.text.primary,
  },
  settingSubtitle: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  dangerText: {
    color: colors.error,
  },
  versionText: {
    ...typography.textStyles.caption,
    color: colors.text.quaternary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default SettingsScreen;
