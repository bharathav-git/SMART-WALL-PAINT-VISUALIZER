import mongoose from 'mongoose';
import { Color, IColor } from '../models/Color';
import { validateColorInput } from '../validators/colorValidators';

export class ColorService {
  static async getColors(options: {
    category?: string;
    search?: string;
    finish?: string;
    isActiveOnly?: boolean;
  } = {}): Promise<IColor[]> {
    const query: any = {};

    if (options.isActiveOnly !== false) {
      query.isActive = true;
    }

    if (options.category && options.category !== 'All') {
      query.category = options.category;
    }

    if (options.finish && options.finish !== 'All') {
      query.finishOptions = options.finish;
    }

    if (options.search && options.search.trim()) {
      query.$or = [
        { name: { $regex: options.search.trim(), $options: 'i' } },
        { hex: { $regex: options.search.trim(), $options: 'i' } },
        { manufacturer: { $regex: options.search.trim(), $options: 'i' } }
      ];
    }

    return Color.find(query).sort({ category: 1, name: 1 });
  }

  static async getColorById(id: string): Promise<IColor> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err: any = new Error('Invalid color ID format');
      err.statusCode = 400;
      throw err;
    }

    const color = await Color.findById(id);
    if (!color) {
      const err: any = new Error('Color not found');
      err.statusCode = 404;
      throw err;
    }

    return color;
  }

  static async createColor(data: any): Promise<IColor> {
    const validation = validateColorInput(data);
    if (!validation.isValid) {
      const err: any = new Error('Validation failed');
      err.statusCode = 400;
      err.errors = validation.errors;
      throw err;
    }

    return Color.create({
      name: data.name.trim(),
      hex: data.hex.trim().toUpperCase(),
      manufacturer: data.manufacturer ? data.manufacturer.trim() : 'Smart Paint Studio',
      finishOptions: data.finishOptions || ['matte', 'satin', 'eggshell', 'glossy'],
      category: data.category.trim(),
      description: data.description ? data.description.trim() : '',
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  }

  static async updateColor(id: string, data: any): Promise<IColor> {
    const color = await this.getColorById(id);

    if (data.name !== undefined) color.name = data.name.trim();
    if (data.hex !== undefined) {
      const hex = data.hex.trim().toUpperCase();
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexRegex.test(hex)) {
        const err: any = new Error('Invalid HEX color code');
        err.statusCode = 400;
        throw err;
      }
      color.hex = hex;
    }
    if (data.manufacturer !== undefined) color.manufacturer = data.manufacturer.trim();
    if (data.finishOptions !== undefined) color.finishOptions = data.finishOptions;
    if (data.category !== undefined) color.category = data.category.trim();
    if (data.description !== undefined) color.description = data.description.trim();
    if (data.isActive !== undefined) color.isActive = data.isActive;

    await color.save();
    return color;
  }

  static async deleteColor(id: string): Promise<void> {
    const color = await this.getColorById(id);
    await Color.findByIdAndDelete(color._id);
  }
}
