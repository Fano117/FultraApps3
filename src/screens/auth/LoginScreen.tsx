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
import {Button, Input, LoadingOverlay} from '../../shared/components';
import {useAuth} from '../../shared/hooks';
import {validateLoginForm} from '../../shared/utils/validation';
import {colors} from '../../design-system/theme/colors';
import {typography} from '../../design-system/theme/typography';
import {spacing} from '../../design-system/theme/spacing';
import {RootStackParamList} from '../../navigation/types';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {login, isLoading, error, clearError} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = useCallback(async () => {
    // Clear previous errors
    clearError();
    setErrors({});

    // Validate form
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Attempt login
    const success = await login({email, password});

    if (!success && error) {
      Alert.alert('Error', error);
    }
  }, [email, password, login, error, clearError]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LoadingOverlay visible={isLoading} message="Iniciando sesión..." />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>FultraApp</Text>
            <Text style={styles.title}>Bienvenido de vuelta</Text>
            <Text style={styles.subtitle}>
              Inicia sesión para continuar con tus entregas
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

            <Input
              label="Contraseña"
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              isPassword
              leftIcon="lock-closed-outline"
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              isLoading={isLoading}
              fullWidth
              size="large"
              style={styles.loginButton}
            />

            {/* Demo hint */}
            {__DEV__ && (
              <View style={styles.demoHint}>
                <Text style={styles.demoHintText}>
                  Demo: demo@fultraapp.com / demo123
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Regístrate</Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logo: {
    ...typography.textStyles.h1,
    color: colors.primary,
    marginBottom: spacing.base,
  },
  title: {
    ...typography.textStyles.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  form: {
    marginBottom: spacing['2xl'],
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    ...typography.textStyles.bodySmall,
    color: colors.primary,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  demoHint: {
    marginTop: spacing.base,
    padding: spacing.md,
    backgroundColor: colors.info + '10',
    borderRadius: 8,
  },
  demoHintText: {
    ...typography.textStyles.caption,
    color: colors.info,
    textAlign: 'center',
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
  registerLink: {
    ...typography.textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
