import {useCallback, useEffect} from 'react';
import {useAuthStore} from '../store/authStore';
import {AuthCredentials, RegisterData, UpdateProfileData} from '../models/User';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    checkAuthStatus,
    clearError,
  } = useAuthStore();

  // Check auth status on mount
  useEffect(() => {
    if (!isInitialized) {
      checkAuthStatus();
    }
  }, [isInitialized, checkAuthStatus]);

  const handleLogin = useCallback(
    async (credentials: AuthCredentials) => {
      return await login(credentials);
    },
    [login],
  );

  const handleRegister = useCallback(
    async (data: RegisterData) => {
      return await register(data);
    },
    [register],
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleForgotPassword = useCallback(
    async (email: string) => {
      return await forgotPassword(email);
    },
    [forgotPassword],
  );

  const handleUpdateProfile = useCallback(
    async (data: UpdateProfileData) => {
      return await updateProfile(data);
    },
    [updateProfile],
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    updateProfile: handleUpdateProfile,
    clearError,
  };
};
