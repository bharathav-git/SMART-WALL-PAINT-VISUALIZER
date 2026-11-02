import mongoose from 'mongoose';
import { Pattern, IPattern } from '../models/Pattern';
import { validatePatternInput } from '../validators/patternValidators';

export class PatternService {
  static async getPatterns(options: { category?: string; isActiveOnly?: boolean } = {}): Promise<IPattern[]> {
    const query: any = {};

    if (options.isActiveOnly !== false) {
      query.isActive = true;
    }

    if (options.category && options.category !== 'All') {
      query.category = options.category;
    }

    return Pattern.find(query).sort({ category: 1, name: 1 });
  }

  static async getPatternById(id: string): Promise<IPattern> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err: any = new Error('Invalid pattern ID format');
      err.statusCode = 400;
      throw err;
    }

    const pattern = await Pattern.findById(id);
    if (!pattern) {
      const err: any = new Error('Pattern not found');
      err.statusCode = 404;
      throw err;
    }

    return pattern;
  }

  static async createPattern(data: any): Promise<IPattern> {
    const validation = validatePatternInput(data);
    if (!validation.isValid) {
      const err: any = new Error('Validation failed');
      err.statusCode = 400;
      err.errors = validation.errors;
      throw err;
    }

    return Pattern.create({
      name: data.name.trim(),
      description: data.description ? data.description.trim() : '',
      category: data.category.trim(),
      imageUrl: data.imageUrl,
      svgContent: data.svgContent,
      defaultScale: data.defaultScale || 1.0,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  static async updatePattern(id: string, data: any): Promise<IPattern> {
    const pattern = await this.getPatternById(id);

    if (data.name !== undefined) pattern.name = data.name.trim();
    if (data.description !== undefined) pattern.description = data.description.trim();
    if (data.category !== undefined) pattern.category = data.category.trim();
    if (data.imageUrl !== undefined) pattern.imageUrl = data.imageUrl;
    if (data.svgContent !== undefined) pattern.svgContent = data.svgContent;
    if (data.defaultScale !== undefined) pattern.defaultScale = data.defaultScale;
    if (data.isActive !== undefined) pattern.isActive = data.isActive;

    await pattern.save();
    return pattern;
  }

  static async deletePattern(id: string): Promise<void> {
    const pattern = await this.getPatternById(id);
    await Pattern.findByIdAndDelete(pattern._id);
  }
}
