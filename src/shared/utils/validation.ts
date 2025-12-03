// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (minimum 6 characters)
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Strong password validation
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return strongRegex.test(password);
};

// Phone number validation (Mexican format)
export const isValidPhone = (phone: string): boolean => {
  // Accepts formats: +52 555 123 4567, 5551234567, etc.
  const phoneRegex = /^(\+?52)?[\s-]?\d{2,3}[\s-]?\d{3,4}[\s-]?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Name validation (at least 2 characters, letters only)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
  return nameRegex.test(name.trim());
};

// Full name validation (first and last name)
export const isValidFullName = (name: string): boolean => {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts.every(part => isValidName(part));
};

// Postal code validation (Mexican format: 5 digits)
export const isValidPostalCode = (code: string): boolean => {
  const postalRegex = /^\d{5}$/;
  return postalRegex.test(code);
};

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Login form validation
export const validateLoginForm = (
  email: string,
  password: string,
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!isValidEmail(email)) {
    errors.email = 'Ingresa un correo electrónico válido';
  }

  if (!password) {
    errors.password = 'La contraseña es requerida';
  } else if (!isValidPassword(password)) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Register form validation
export const validateRegisterForm = (
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!fullName.trim()) {
    errors.fullName = 'El nombre completo es requerido';
  } else if (!isValidFullName(fullName)) {
    errors.fullName = 'Ingresa nombre y apellido válidos';
  }

  if (!email.trim()) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!isValidEmail(email)) {
    errors.email = 'Ingresa un correo electrónico válido';
  }

  if (!password) {
    errors.password = 'La contraseña es requerida';
  } else if (!isValidPassword(password)) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Forgot password form validation
export const validateForgotPasswordForm = (email: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!email.trim()) {
    errors.email = 'El correo electrónico es requerido';
  } else if (!isValidEmail(email)) {
    errors.email = 'Ingresa un correo electrónico válido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Address validation
export const validateAddress = (address: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!address.trim()) {
    errors.address = 'La dirección es requerida';
  } else if (address.trim().length < 10) {
    errors.address = 'Ingresa una dirección más específica';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Generic required field validation
export const validateRequired = (
  value: string,
  fieldName: string,
): string | null => {
  if (!value || !value.trim()) {
    return `${fieldName} es requerido`;
  }
  return null;
};

// Generic min length validation
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string,
): string | null => {
  if (value.length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  return null;
};

// Generic max length validation
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string,
): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} no puede tener más de ${maxLength} caracteres`;
  }
  return null;
};
