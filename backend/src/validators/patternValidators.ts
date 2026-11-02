export interface PatternValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validatePatternInput = (data: any): PatternValidationResult => {
  const errors: Record<string, string> = {};

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const category = typeof data.category === 'string' ? data.category.trim() : '';

  if (!name) {
    errors['name'] = 'Pattern name is required';
  }

  if (!category) {
    errors['category'] = 'Category is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
