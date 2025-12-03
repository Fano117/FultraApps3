export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export type UserRole = 'admin' | 'driver' | 'dispatcher' | 'customer';

export interface UserPreferences {
  language: 'es' | 'en';
  notifications: NotificationPreferences;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  newDelivery: boolean;
  deliveryUpdates: boolean;
  promotions: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  success: boolean;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Auth State
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Default values
export const defaultUserPreferences: UserPreferences = {
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
};

export const defaultNotificationPreferences: NotificationPreferences = {
  push: true,
  email: true,
  sms: false,
  newDelivery: true,
  deliveryUpdates: true,
  promotions: false,
};
