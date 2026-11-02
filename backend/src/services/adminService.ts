import { User } from '../models/User';
import { Project } from '../models/Project';
import { Color } from '../models/Color';
import { Pattern } from '../models/Pattern';
import { ActivityLog } from '../models/ActivityLog';

export class AdminService {
  static async getAnalytics(): Promise<any> {
    const [
      totalUsers,
      totalProjects,
      totalColors,
      totalPatterns,
      recentLogs,
      colorsByCategory,
      recentProjects
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Project.countDocuments(),
      Color.countDocuments(),
      Pattern.countDocuments(),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name email'),
      Color.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Project.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email')
    ]);

    // Calculate uploaded images (distinct originalImageUrl) and saved designs (projects with applied designs)
    const [uploadedImagesCount, savedDesignsCount] = await Promise.all([
      Project.distinct('originalImageUrl').then(urls => urls.length),
      Project.countDocuments({ 'appliedDesigns.0': { $exists: true } })
    ]);

    return {
      summary: {
        totalUsers,
        totalProjects,
        totalUploadedImages: uploadedImagesCount || totalProjects,
        totalSavedDesigns: savedDesignsCount || totalProjects,
        totalColors,
        totalPatterns
      },
      colorsByCategory,
      recentActivity: recentLogs,
      recentProjects
    };
  }

  static async getUsers(options: { page?: number; limit?: number; search?: string } = {}): Promise<any> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(50, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.search && options.search.trim()) {
      query.$or = [
        { name: { $regex: options.search.trim(), $options: 'i' } },
        { email: { $regex: options.search.trim(), $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query)
    ]);

    // Attach project count for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const projectCount = await Project.countDocuments({ userId: u._id });
        return {
          ...u.toJSON(),
          projectCount
        };
      })
    );

    return {
      users: usersWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getAllProjects(options: { page?: number; limit?: number; search?: string } = {}): Promise<any> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(50, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (options.search && options.search.trim()) {
      query.name = { $regex: options.search.trim(), $options: 'i' };
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email'),
      Project.countDocuments(query)
    ]);

    return {
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}
