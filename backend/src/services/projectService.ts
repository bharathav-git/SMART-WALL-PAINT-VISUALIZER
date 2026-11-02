import mongoose from 'mongoose';
import { Project, IProject } from '../models/Project';
import { ActivityLog } from '../models/ActivityLog';
import { validateCreateProjectInput, validateUpdateProjectInput } from '../validators/projectValidators';

export class ProjectService {
  static async getUserProjects(
    userId: string,
    options: { page?: number; limit?: number; search?: string; sortBy?: string } = {}
  ): Promise<{ projects: IProject[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(50, options.limit || 12));
    const skip = (page - 1) * limit;

    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (options.search && options.search.trim()) {
      query.name = { $regex: options.search.trim(), $options: 'i' };
    }

    let sort: any = { updatedAt: -1 };
    if (options.sortBy === 'name') {
      sort = { name: 1 };
    } else if (options.sortBy === 'oldest') {
      sort = { createdAt: 1 };
    } else if (options.sortBy === 'newest') {
      sort = { createdAt: -1 };
    }

    const [projects, total] = await Promise.all([
      Project.find(query).sort(sort).skip(skip).limit(limit),
      Project.countDocuments(query)
    ]);

    return {
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getProjectById(userId: string, projectId: string, userRole: string = 'user'): Promise<IProject> {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      const err: any = new Error('Invalid project ID format');
      err.statusCode = 400;
      throw err;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      const err: any = new Error('Project not found');
      err.statusCode = 404;
      throw err;
    }

    // Strict ownership verification: Only owner or admin can view
    if (project.userId.toString() !== userId && userRole !== 'admin') {
      const err: any = new Error('Access denied: You do not have permission to view this project');
      err.statusCode = 403;
      throw err;
    }

    return project;
  }

  static async createProject(userId: string, data: any): Promise<IProject> {
    const validation = validateCreateProjectInput(data);
    if (!validation.isValid) {
      const err: any = new Error('Validation failed');
      err.statusCode = 400;
      err.errors = validation.errors;
      throw err;
    }

    const project = await Project.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: data.name.trim(),
      originalImageUrl: data.originalImageUrl,
      thumbnailUrl: data.thumbnailUrl || data.originalImageUrl,
      finalImageUrl: data.finalImageUrl,
      wallSelections: data.wallSelections || [],
      appliedDesigns: data.appliedDesigns || []
    });

    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      projectId: project._id,
      action: 'PROJECT_CREATED',
      metadata: { projectName: project.name }
    });

    return project;
  }

  static async updateProject(userId: string, projectId: string, data: any, userRole: string = 'user'): Promise<IProject> {
    const project = await this.getProjectById(userId, projectId, userRole);

    const validation = validateUpdateProjectInput(data);
    if (!validation.isValid) {
      const err: any = new Error('Validation failed');
      err.statusCode = 400;
      err.errors = validation.errors;
      throw err;
    }

    if (data.name !== undefined) project.name = data.name.trim();
    if (data.originalImageUrl !== undefined) project.originalImageUrl = data.originalImageUrl;
    if (data.thumbnailUrl !== undefined) project.thumbnailUrl = data.thumbnailUrl;
    if (data.finalImageUrl !== undefined) project.finalImageUrl = data.finalImageUrl;
    if (data.wallSelections !== undefined) project.wallSelections = data.wallSelections;
    if (data.appliedDesigns !== undefined) project.appliedDesigns = data.appliedDesigns;

    await project.save();

    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      projectId: project._id,
      action: 'PROJECT_UPDATED',
      metadata: { projectName: project.name, wallSelectionsCount: project.wallSelections.length }
    });

    return project;
  }

  static async deleteProject(userId: string, projectId: string, userRole: string = 'user'): Promise<void> {
    const project = await this.getProjectById(userId, projectId, userRole);

    await Project.findByIdAndDelete(project._id);

    await ActivityLog.create({
      userId: new mongoose.Types.ObjectId(userId),
      projectId: project._id,
      action: 'PROJECT_DELETED',
      metadata: { projectName: project.name }
    });
  }
}
