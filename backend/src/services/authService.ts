import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { config } from '../config/environment';
import { validateRegisterInput, validateLoginInput } from '../validators/authValidators';
import { AuthUserPayload } from '../types';

export class AuthService {
  static generateToken(user: IUser): string {
    const payload: AuthUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });
  }

  static async register(data: any, ipAddress?: string): Promise<{ user: any; token: string }> {
    const validation = validateRegisterInput(data);
    if (!validation.isValid) {
      const err: any = new Error('Validation failed');
      err.statusCode = 400;
      err.errors = validation.errors;
      throw err;
    }

    const email = data.email.trim().toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      const err: any = new Error('An account with this email already exists');
      err.statusCode = 409;
      err.errors = { email: 'Email is already registered' };
      throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Regular registration is always role 'user'. Admins can never be registered through public endpoint.
    const user = await User.create({
      name: data.name.trim(),
      email,
      passwordHash,
      role: 'user',
      favoriteColors: []
    });

    await ActivityLog.create({
      userId: user._id,
      action: 'USER_REGISTERED',
      metadata: { email: user.email },
      ipAddress
    });

    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token
    };
  }

  static async login(data: any, ipAddress?: string): Promise<{ user: any; token: string }> {
    const validation = validateLoginInput(data);
    if (!validation.isValid) {
      const err: any = new Error('Invalid input');
      err.statusCode = 400;
      err.errors = validation.errors;
      throw err;
    }

    const email = data.email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      const err: any = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      const err: any = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    await ActivityLog.create({
      userId: user._id,
      action: 'USER_LOGIN',
      metadata: { email: user.email },
      ipAddress
    });

    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token
    };
  }

  static async getCurrentUser(userId: string): Promise<any> {
    const user = await User.findById(userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user.toJSON();
  }

  static async toggleFavoriteColor(userId: string, hexColor: string): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) {
      const err: any = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const hexUpper = hexColor.toUpperCase();
    const index = user.favoriteColors.indexOf(hexUpper);
    if (index > -1) {
      user.favoriteColors.splice(index, 1);
    } else {
      user.favoriteColors.push(hexUpper);
    }

    await user.save();
    return user.favoriteColors;
  }
}
