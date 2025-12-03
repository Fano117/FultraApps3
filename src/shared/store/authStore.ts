import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  AuthCredentials,
  RegisterData,
  UpdateProfileData,
} from '../models/User';
import * as authService from '../services/authService';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  login: (credentials: AuthCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false,

      // Actions
      login: async (credentials: AuthCredentials) => {
        set({isLoading: true, error: null});

        try {
          const response = await authService.login(credentials);

          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Error al iniciar sesión',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'Error de conexión. Intenta de nuevo.',
          });
          return false;
        }
      },

      register: async (data: RegisterData) => {
        set({isLoading: true, error: null});

        try {
          const response = await authService.register(data);

          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Error al registrarse',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'Error de conexión. Intenta de nuevo.',
          });
          return false;
        }
      },

      logout: async () => {
        set({isLoading: true});

        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      forgotPassword: async (email: string) => {
        set({isLoading: true, error: null});

        try {
          const response = await authService.forgotPassword({email});

          if (response.success) {
            set({isLoading: false});
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Error al enviar correo',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'Error de conexión. Intenta de nuevo.',
          });
          return false;
        }
      },

      updateProfile: async (data: UpdateProfileData) => {
        set({isLoading: true, error: null});

        try {
          const response = await authService.updateProfile(data);

          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || 'Error al actualizar perfil',
            });
            return false;
          }
        } catch (error) {
          set({
            isLoading: false,
            error: 'Error de conexión. Intenta de nuevo.',
          });
          return false;
        }
      },

      checkAuthStatus: async () => {
        try {
          const response = await authService.checkAuthStatus();

          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isInitialized: true,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isInitialized: true,
            });
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
          });
        }
      },

      clearError: () => {
        set({error: null});
      },

      setLoading: (loading: boolean) => {
        set({isLoading: loading});
      },
    }),
    {
      name: 'fultra-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectIsInitialized = (state: AuthState) => state.isInitialized;
