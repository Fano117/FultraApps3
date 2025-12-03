import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {Button, Input, LoadingOverlay} from '../../shared/components';
import {useAuth} from '../../shared/hooks';
import {validateForgotPasswordForm} from '../../shared/utils/validation';
import {colors} from '../../design-system/theme/colors';
import {typography} from '../../design-system/theme/typography';
import {spacing} from '../../design-system/theme/spacing';
import {RootStackParamList} from '../../navigation/types';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const {forgotPassword, isLoading, clearError} = useAuth();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = useCallback(async () => {
    clearError();
    setErrors({});

    const validation = validateForgotPasswordForm(email);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const success = await forgotPassword(email);

    if (success) {
      setEmailSent(true);
    } else {
      Alert.alert(
        'Error',
        'No se pudo enviar el correo de recuperación. Intenta de nuevo.',
      );
    }
  }, [email, forgotPassword, clearError]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleResend = useCallback(() => {
    setEmailSent(false);
    handleSubmit();
  }, [handleSubmit]);

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="mail-outline" size={60} color={colors.primary} />
          </View>
          <Text style={styles.successTitle}>Correo enviado</Text>
          <Text style={styles.successMessage}>
            Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.successHint}>
            Revisa tu bandeja de entrada y sigue las instrucciones del correo.
          </Text>

          <Button
            title="Volver al inicio de sesión"
            onPress={handleGoBack}
            fullWidth
            style={styles.backButton}
          />

          <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
            <Text style={styles.resendText}>¿No recibiste el correo? Reenviar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LoadingOverlay visible={isLoading} message="Enviando correo..." />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Back button */}
          <TouchableOpacity onPress={handleGoBack} style={styles.backArrow}>
            <Icon name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="key-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              No te preocupes, ingresa tu correo electrónico y te enviaremos las
              instrucciones para restablecerla.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Correo electrónico"
              placeholder="ejemplo@correo.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
            />

            <Button
              title="Enviar instrucciones"
              onPress={handleSubmit}
              isLoading={isLoading}
              fullWidth
              size="large"
              style={styles.submitButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Recordaste tu contraseña?</Text>
            <TouchableOpacity onPress={handleGoBack}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  backArrow: {
    marginBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing['2xl'],
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
  },
  loginLink: {
    ...typography.textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },

  // Success state styles
  successContainer: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successMessage: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  successHint: {
    ...typography.textStyles.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  resendButton: {
    padding: spacing.md,
  },
  resendText: {
    ...typography.textStyles.bodySmall,
    color: colors.primary,
  },
});

export default ForgotPasswordScreen;
