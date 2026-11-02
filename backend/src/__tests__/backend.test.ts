import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../app';
import { seedDatabase } from '../utils/seedData';
import { User } from '../models/User';
import { Project } from '../models/Project';

let mongoServer: MongoMemoryServer;
let app: any;
let userToken: string;
let adminToken: string;
let userId: string;
let adminId: string;
let testProjectId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await seedDatabase();
  app = createApp();

  // Log in demo user to obtain token
  const userRes = await request(app).post('/api/auth/login').send({
    email: 'demo@wallvisualizer.com',
    password: 'Demo@123456'
  });
  userToken = userRes.body.data.token;
  userId = userRes.body.data.user._id;

  // Log in admin to obtain token
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@wallvisualizer.com',
    password: 'Admin@123456'
  });
  adminToken = adminRes.body.data.token;
  adminId = adminRes.body.data.user._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('1. Health Check Endpoint', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('2. Authentication & Authorization Flow', () => {
  it('POST /api/auth/register should register a new regular user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Artist',
      email: 'artist@example.com',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('artist@example.com');
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.token).toBeDefined();
  });

  it('POST /api/auth/register should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate Artist',
      email: 'artist@example.com',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'artist@example.com',
      password: 'WrongPassword'
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should return current user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('demo@wallvisualizer.com');
  });

  it('GET /api/auth/me should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('3. Paint Colours & Patterns Catalog API', () => {
  it('GET /api/colors should return active paint colours', async () => {
    const res = await request(app).get('/api/colors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(20);
  });

  it('GET /api/colors?category=Cool should filter by category', async () => {
    const res = await request(app).get('/api/colors?category=Cool');
    expect(res.status).toBe(200);
    expect(res.body.data.every((c: any) => c.category === 'Cool')).toBe(true);
  });

  it('POST /api/colors should reject regular user (requires admin)', async () => {
    const res = await request(app)
      .post('/api/colors')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Unauthorized Blue',
        hex: '#0055FF',
        category: 'Cool'
      });

    expect(res.status).toBe(403);
  });

  it('POST /api/colors should allow admin to create a new colour', async () => {
    const res = await request(app)
      .post('/api/colors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Royal Velvet',
        hex: '#3B1F4F',
        category: 'Dark & Moody',
        manufacturer: 'Custom Studio',
        finishOptions: ['matte', 'satin']
      });

    expect(res.status).toBe(201);
    expect(res.body.data.hex).toBe('#3B1F4F');
  });

  it('GET /api/patterns should return available pattern overlays', async () => {
    const res = await request(app).get('/api/patterns');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);
  });
});

describe('4. Projects API & Strict Ownership Enforcement', () => {
  it('POST /api/projects should create a project for authenticated user', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Master Bedroom Redesign',
        originalImageUrl: '/uploads/sample_room_1.jpg',
        wallSelections: [
          {
            id: 'sel-1',
            name: 'Bed Head Wall',
            type: 'polygon',
            points: [{ x: 50, y: 50 }, { x: 200, y: 50 }, { x: 200, y: 200 }, { x: 50, y: 200 }],
            paintSettings: {
              hex: '#9CAF88',
              colorName: 'Sage Sanctuary',
              opacity: 0.8,
              intensity: 1.0,
              finish: 'matte'
            }
          }
        ],
        appliedDesigns: [
          {
            wallSelectionId: 'sel-1',
            hex: '#9CAF88',
            opacity: 0.8,
            finish: 'matte'
          }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Master Bedroom Redesign');
    expect(res.body.data.wallSelections.length).toBe(1);
    testProjectId = res.body.data._id;
  });

  it('GET /api/projects should return user projects only', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.projects)).toBe(true);
    expect(res.body.data.projects.some((p: any) => p._id === testProjectId)).toBe(true);
  });

  it('GET /api/projects/:id should return the project to its owner', async () => {
    const res = await request(app)
      .get(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(testProjectId);
  });

  it('GET /api/projects/:id should block unauthorized user from accessing another user project', async () => {
    // Register another user
    const otherRes = await request(app).post('/api/auth/register').send({
      name: 'Other User',
      email: 'other@example.com',
      password: 'Password@123',
      confirmPassword: 'Password@123'
    });
    const otherToken = otherRes.body.data.token;

    // Attempt to access userToken's project
    const res = await request(app)
      .get(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/projects/:id should allow owner to update project', async () => {
    const res = await request(app)
      .patch(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Master Bedroom - Updated Palette'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Master Bedroom - Updated Palette');
  });

  it('DELETE /api/projects/:id should delete project for owner', async () => {
    const res = await request(app)
      .delete(`/api/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('5. Admin Analytics and Oversight', () => {
  it('GET /api/admin/analytics should reject regular users', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /api/admin/analytics should return platform statistics to admin', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.totalColors).toBeGreaterThanOrEqual(20);
    expect(res.body.data.summary.totalPatterns).toBeGreaterThanOrEqual(5);
  });

  it('GET /api/admin/users should list registered users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.users)).toBe(true);
  });
});
