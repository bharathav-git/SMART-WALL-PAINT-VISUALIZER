# 🎨 Smart Wall Paint Visualizer

> A production-minded full-stack web application built on the **MEAN stack** (MongoDB, Express.js, Angular 19, Node.js) that enables homeowners, architects, and interior designers to upload room photographs, segment wall boundaries with precision polygon and brush tools, simulate realistic paint colours and finishes with luminance-preserving detail, compare before-and-after designs, and persist creations to the cloud.

---

## 🌟 Key Capabilities

- **Interactive Room Wall Segmentation:**
  - **Polygon Selection Tool:** Point-by-point geometric perimeter tracing with visual anchor handles.
  - **Brush Selection Tool:** Freehand drawing mask with adjustable radius and erase mode.
  - **Multi-Wall Architecture:** Independently isolate, name, and color multiple distinct walls (e.g. "Main Accent Wall", "Side Wall") in the same photograph for dual-tone design exploration.
- **Realistic Paint Simulation Engine:**
  - **Luminance-Aware Blending:** Modulates applied paint colors by underlying surface luminance ($Y = 0.299R + 0.587G + 0.114B$), preserving wall shadows, molding contours, and lighting gradients.
  - **Architectural Sheens:** Matte, Eggshell, Satin, and Glossy finish shaders.
  - **Decorative Patterns & Textures:** Apply geometric chevrons, vertical stripes, diamond trellises, linen weave, or botanical vector textures clipped directly to selected wall boundaries.
  - **Opacity & Intensity Controls:** Continuous sliders for coverage opacity and surface texture preservation.
- **Live Before & After Comparison:**
  - Interactive split-slider modal allowing side-by-side or sliding comparison of original photography vs. painted result.
- **Full Resolution Export:**
  - Download high-resolution PNG or JPEG images free of UI controls or selection outlines.
- **Project Persistence & Cloud Library:**
  - Save room projects with wall coordinates and color metadata to MongoDB.
  - Reopen saved projects at any time with wall regions and paint parameters intact.
- **Role-Based Authentication & Admin Management:**
  - Secure registration, JWT session management, bcrypt password hashing, and brute-force rate limiting.
  - Strict ownership enforcement prevents users from accessing or modifying another user's projects.
  - Comprehensive Admin Portal with platform analytics, paint palette CRUD, pattern management, and registered user oversight.

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Angular 19 (Standalone Components, Signals, Reactive Forms, Router, RxJS), SCSS, HTML5 Canvas API |
| **Backend** | Node.js, Express.js, TypeScript, RESTful API architecture, Multer, Helmet, CORS, Express-Rate-Limit |
| **Database** | MongoDB, Mongoose ODM (with automatic in-memory MongoDB fallback for zero-configuration testing) |
| **Security** | JWT (JSON Web Tokens), bcryptjs password hashing, role-based authorization guards |
| **Testing** | Jest, Supertest, ts-jest, Jasmine, Karma, ChromeHeadless |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer; v20+ recommended)
- `npm` (v9 or newer)

### 1. Clone & Setup
```bash
git clone https://github.com/your-username/smart-wall-paint-visualizer.git
cd smart-wall-paint-visualizer
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Environment Configuration
The backend comes pre-configured with a development `.env`. To customize credentials:
```bash
cp backend/.env.example backend/.env
```

*Note: If no external MongoDB URI is provided, the backend automatically boots an in-memory MongoDB instance for instant, zero-setup local development!*

### 4. Run the Development Servers
In two separate terminals:

**Terminal 1 (Backend API - Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend Client - Port 4200):**
```bash
cd frontend
npm start
```

Open your browser at `http://localhost:4200`.

---

## 🔑 Pre-Seeded Development Accounts

The database seed automatically initializes the catalog with 22 paint colors across 7 categories, 6 pattern overlays, sample room projects, and the following accounts:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Regular User** | `demo@wallvisualizer.com` | `Demo@123456` | Dashboard, room uploads, wall studio, save/reopen projects |
| **Administrator** | `admin@wallvisualizer.com` | `Admin@123456` | Admin dashboard, analytics, color/pattern management, user table |

*(Quick autofill buttons for both accounts are also provided directly on the Login page for rapid demonstration).*

---

## 🧪 Running Automated Tests

### Backend Test Suite (20 Integration Tests)
Verifies authentication, JWT generation, project CRUD, strict ownership isolation, admin permissions, and catalog filtering:
```bash
cd backend
npm test
```

### Frontend Test Suite (18 Unit Tests)
Verifies Angular services, WallEditorService canvas blending algorithms, hex conversions, polygon masks, reactive form validation, and components:
```bash
cd frontend
npm test -- --watch=false
```

---

## 📁 Repository Structure

```
smart_wall_paint_visualizer/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & MongoDB connection
│   │   ├── controllers/     # Express route handlers
│   │   ├── middleware/      # JWT auth, admin authorization, Multer file upload, error handler
│   │   ├── models/          # Mongoose schemas (User, Project, Color, Pattern, ActivityLog)
│   │   ├── routes/          # RESTful endpoint routers
│   │   ├── services/        # Business logic and database operations
│   │   ├── types/           # Shared TypeScript interfaces
│   │   ├── utils/           # Database seed script & sample palettes
│   │   ├── validators/      # Request validation schemas
│   │   ├── __tests__/       # Comprehensive Jest & Supertest integration suite
│   │   ├── app.ts           # Express application setup
│   │   └── server.ts        # Server entrypoint
│   ├── uploads/             # Safe local media storage directory
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/        # AuthService, ProjectService, ColorService, WallEditorService, Guards
│   │   │   ├── features/    # Landing, Auth (Login/Register), Dashboard, Upload, Studio, Saved Designs, Admin
│   │   │   ├── shared/      # Navbar, Footer
│   │   │   ├── app.component.ts
│   │   │   └── app.routes.ts
│   │   ├── assets/          # Curated architectural SVG rooms & patterns
│   │   └── styles.scss      # Global design system & typography
│   ├── karma.conf.js        # Karma headless testing configuration
│   └── package.json
│
├── docs/                    # In-depth architectural & API documentation
│   ├── ARCHITECTURE.md      # System architecture & Mermaid sequence diagrams
│   ├── API_DOCUMENTATION.md # Complete REST API documentation
│   ├── DATABASE_SCHEMAS.md  # MongoDB schemas, ER diagram, and indexes
│   ├── IMAGE_PROCESSING.md  # Canvas pixel blend & luminance math formulas
│   ├── USER_AND_ADMIN_GUIDE.md # User guide and admin manual
│   └── DEPLOYMENT_AND_TESTING.md # Production deployment to Vercel/Render/Atlas
│
└── package.json             # Root orchestrator scripts
```

---

## 📚 Detailed Documentation Deliverables

For in-depth technical documentation, refer to the following guides:
- [System Architecture](file:///docs/ARCHITECTURE.md)
- [Image Processing & Blending Formulas](file:///docs/IMAGE_PROCESSING.md)
- [REST API Reference](file:///docs/API_DOCUMENTATION.md)
- [Database Schemas & ER Diagram](file:///docs/DATABASE_SCHEMAS.md)
- [User & Administrator Guide](file:///docs/USER_AND_ADMIN_GUIDE.md)
- [Deployment, Testing & Troubleshooting Guide](file:///docs/DEPLOYMENT_AND_TESTING.md)

---

## 📄 License
This project is licensed under the MIT License.
"# SMART-WALL-PAINT-VISUALIZER" 
