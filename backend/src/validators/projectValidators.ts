export interface ProjectValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateCreateProjectInput = (data: any): ProjectValidationResult => {
  const errors: Record<string, string> = {};

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const originalImageUrl = typeof data.originalImageUrl === 'string' ? data.originalImageUrl.trim() : '';

  if (!name) {
    errors['name'] = 'Project name is required';
  } else if (name.length > 100) {
    errors['name'] = 'Project name cannot exceed 100 characters';
  }

  if (!originalImageUrl) {
    errors['originalImageUrl'] = 'Original room image URL is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUpdateProjectInput = (data: any): ProjectValidationResult => {
  const errors: Record<string, string> = {};

  if (data.name !== undefined) {
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!name) {
      errors['name'] = 'Project name cannot be empty';
    } else if (name.length > 100) {
      errors['name'] = 'Project name cannot exceed 100 characters';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
