import {
  User,
  AuthCredentials,
  RegisterData,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  UpdateProfileData,
  ChangePasswordData,
} from '../models/User';
import {ApiResponse} from '../models/ApiResponse';
import {get, post, put, saveTokens, clearTokens} from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = '@fultra_user';

// Mock data for development
const mockUser: User = {
  id: '1',
  email: 'demo@fultraapp.com',
  fullName: 'Usuario Demo',
  phone: '+52 555 123 4567',
  role: 'driver',
  isVerified: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  preferences: {
    language: 'es',
    notifications: {
      push: true,
      email: true,
      sms: false,
      newDelivery: true,
      deliveryUpdates: true,
      promotions: false,
    },
    theme: 'system',
  },
};

const mockAuthResponse: AuthResponse = {
  user: mockUser,
  accessToken: 'mock-access-token-12345',
  refreshToken: 'mock-refresh-token-67890',
  expiresIn: 3600,
};

// Enable mock mode for development
const USE_MOCK = __DEV__;

/**
 * Login with email and password
 */
export const login = async (
  credentials: AuthCredentials,
): Promise<ApiResponse<AuthResponse>> => {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation
    if (credentials.email === 'demo@fultraapp.com' && credentials.password === 'demo123') {
      await saveTokens(mockAuthResponse.accessToken, mockAuthResponse.refreshToken);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
      return {
        success: true,
        data: mockAuthResponse,
        message: 'Inicio de sesión exitoso',
      };
    }

    // Any other email/password combination for testing
    if (credentials.email && credentials.password.length >= 6) {
      const testUser: User = {
        ...mockUser,
        email: credentials.email,
        fullName: credentials.email.split('@')[0],
      };
      const testAuthResponse: AuthResponse = {
        ...mockAuthResponse,
        user: testUser,
      };
      await saveTokens(testAuthResponse.accessToken, testAuthResponse.refreshToken);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(testUser));
      return {
        success: true,
        data: testAuthResponse,
        message: 'Inicio de sesión exitoso',
      };
    }

    return {
      success: false,
      data: null as unknown as AuthResponse,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas. Intenta con demo@fultraapp.com / demo123',
      },
    };
  }

  const response = await post<AuthResponse>('/auth/login', credentials);

  if (response.success && response.data) {
    await saveTokens(response.data.accessToken, response.data.refreshToken);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
  }

  return response;
};

/**
 * Register a new user
 */
export const register = async (
  data: RegisterData,
): Promise<ApiResponse<AuthResponse>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        data: null as unknown as AuthResponse,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Las contraseñas no coinciden',
        },
      };
    }

    const newUser: User = {
      ...mockUser,
      id: Date.now().toString(),
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const authResponse: AuthResponse = {
      user: newUser,
      accessToken: `mock-access-token-${Date.now()}`,
      refreshToken: `mock-refresh-token-${Date.now()}`,
      expiresIn: 3600,
    };

    await saveTokens(authResponse.accessToken, authResponse.refreshToken);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));

    return {
      success: true,
      data: authResponse,
      message: 'Registro exitoso',
    };
  }

  const response = await post<AuthResponse>('/auth/register', data);

  if (response.success && response.data) {
    await saveTokens(response.data.accessToken, response.data.refreshToken);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
  }

  return response;
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<ApiResponse<null>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    await clearTokens();
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    return {
      success: true,
      data: null,
      message: 'Sesión cerrada exitosamente',
    };
  }

  try {
    const response = await post<null>('/auth/logout');
    await clearTokens();
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    return response;
  } catch (error) {
    // Clear tokens even if API call fails
    await clearTokens();
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    return {
      success: true,
      data: null,
      message: 'Sesión cerrada localmente',
    };
  }
};

/**
 * Request password reset
 */
export const forgotPassword = async (
  data: PasswordResetRequest,
): Promise<ApiResponse<PasswordResetResponse>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        message: `Se ha enviado un correo de recuperación a ${data.email}`,
        success: true,
      },
    };
  }

  return post<PasswordResetResponse>('/auth/forgot-password', data);
};

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<ApiResponse<User>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));

    const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      return {
        success: true,
        data: JSON.parse(storedUser),
      };
    }

    return {
      success: false,
      data: null as unknown as User,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuario no autenticado',
      },
    };
  }

  return get<User>('/auth/profile');
};

/**
 * Update user profile
 */
export const updateProfile = async (
  data: UpdateProfileData,
): Promise<ApiResponse<User>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      const updatedUser: User = {
        ...currentUser,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      return {
        success: true,
        data: updatedUser,
        message: 'Perfil actualizado exitosamente',
      };
    }

    return {
      success: false,
      data: null as unknown as User,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuario no autenticado',
      },
    };
  }

  return put<User>('/auth/profile', data);
};

/**
 * Change user password
 */
export const changePassword = async (
  data: ChangePasswordData,
): Promise<ApiResponse<null>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (data.newPassword !== data.confirmNewPassword) {
      return {
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Las contraseñas nuevas no coinciden',
        },
      };
    }

    return {
      success: true,
      data: null,
      message: 'Contraseña cambiada exitosamente',
    };
  }

  return put<null>('/auth/change-password', data);
};

/**
 * Check if user is authenticated
 */
export const checkAuthStatus = async (): Promise<ApiResponse<User | null>> => {
  try {
    const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        success: true,
        data: user,
      };
    }
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error al verificar estado de autenticación',
      },
    };
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (token: string): Promise<ApiResponse<null>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: null,
      message: 'Email verificado exitosamente',
    };
  }

  return post<null>('/auth/verify-email', {token});
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (): Promise<ApiResponse<null>> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: null,
      message: 'Email de verificación enviado',
    };
  }

  return post<null>('/auth/resend-verification');
};
