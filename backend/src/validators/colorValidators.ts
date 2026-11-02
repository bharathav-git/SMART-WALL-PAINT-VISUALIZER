export interface ColorValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateColorInput = (data: any): ColorValidationResult => {
  const errors: Record<string, string> = {};

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const hex = typeof data.hex === 'string' ? data.hex.trim().toUpperCase() : '';
  const category = typeof data.category === 'string' ? data.category.trim() : '';

  if (!name) {
    errors['name'] = 'Color name is required';
  }

  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hex || !hexRegex.test(hex)) {
    errors['hex'] = 'Valid HEX color code is required (e.g., #4A90E2)';
  }

  if (!category) {
    errors['category'] = 'Category is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
