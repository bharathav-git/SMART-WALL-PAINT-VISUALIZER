export interface RegisterValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateRegisterInput = (data: any): RegisterValidationResult => {
  const errors: Record<string, string> = {};

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data.password === 'string' ? data.password : '';
  const confirmPassword = typeof data.confirmPassword === 'string' ? data.confirmPassword : '';

  if (!name || name.length < 2) {
    errors['name'] = 'Full name must be at least 2 characters';
  } else if (name.length > 100) {
    errors['name'] = 'Full name cannot exceed 100 characters';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors['email'] = 'A valid email address is required';
  }

  if (!password || password.length < 6) {
    errors['password'] = 'Password must be at least 6 characters';
  }

  if (confirmPassword && password !== confirmPassword) {
    errors['confirmPassword'] = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLoginInput = (data: any): RegisterValidationResult => {
  const errors: Record<string, string> = {};
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!email) {
    errors['email'] = 'Email is required';
  }

  if (!password) {
    errors['password'] = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
