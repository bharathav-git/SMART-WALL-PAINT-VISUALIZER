# Smart Wall Paint Visualizer - System Architecture

## 1. High-Level Architecture Overview

Smart Wall Paint Visualizer is engineered on the **MEAN Stack** (MongoDB, Express.js, Angular 19, Node.js), adhering to clean separation of concerns, modular software design, and strict security isolation.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Angular 19 Standalone)"]
        UI["Landing / Dashboard / Studio UI"]
        CanvasEngine["WallEditorService (HTML5 Canvas Engine)"]
        AuthInterceptor["AuthInterceptor (JWT Bearer Injection)"]
        Guards["AuthGuard & AdminGuard"]
        AngularServices["Project, Color, Pattern & Admin Services"]
        UI --> CanvasEngine
        UI --> AngularServices
        AngularServices --> AuthInterceptor
    end

    subgraph Server["Backend REST API (Node.js & Express & TypeScript)"]
        ExpressApp["Express App & Middleware (Helmet, CORS, RateLimit)"]
        AuthMid["JWT Authentication & Role Authorization Middleware"]
        Controllers["Auth, Project, Color, Pattern, Admin Controllers"]
        Services["Business Logic Services Layer"]
        UploadStorage["Multer Disk Storage (/uploads)"]
        
        AuthInterceptor --> ExpressApp
        ExpressApp --> AuthMid
        AuthMid --> Controllers
        Controllers --> Services
        Controllers --> UploadStorage
    end

    subgraph Database["Data Persistence Layer"]
        MongoDB[(MongoDB Atlas / Local / In-Memory)]
        MongooseODM["Mongoose ODM Schemas & Indexes"]
        Services --> MongooseODM
        MongooseODM --> MongoDB
    end
```

---

## 2. Wall Visualization & Canvas Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant EditorUI as Wall Editor Studio UI
    participant Canvas as HTML5 Canvas Workspace
    participant Engine as WallEditorService
    participant Backend as Express REST API
    participant DB as MongoDB

    User->>EditorUI: Uploads room photograph or selects template
    EditorUI->>Backend: POST /api/uploads/room-image (Multer multipart)
    Backend-->>EditorUI: 201 Created { url: "/uploads/room_123.jpg" }
    EditorUI->>Canvas: Loads original image (Pristine Immutable Baseline)
    
    User->>Canvas: Draws polygon points around wall
    User->>EditorUI: Chooses Paint Color (#2A7B88) and Finish (Matte)
    EditorUI->>Engine: renderProjectComposite(canvas, originalImg, selections)
    
    Engine->>Engine: Rasterize polygon to binary selection mask
    Engine->>Engine: Read original pixel RGB & calculate luminance Y
    Engine->>Engine: Modulate paint color by luminance & apply alpha blend
    Engine->>Canvas: Write composited pixel buffer to display
    
    User->>EditorUI: Clicks "Save Design"
    EditorUI->>Backend: POST /api/projects (wall coordinates + paint settings)
    Backend->>DB: Stores project document & logs activity
    Backend-->>EditorUI: 201 Created { projectId: "..." }
```

---

## 3. Security & Access Control Model

1. **Authentication:**
   - Stateless JSON Web Tokens (JWT) signed with HS256 algorithm and environment secret.
   - Passwords hashed using `bcryptjs` with salt work factor 10.
   - Plaintext passwords and hash are excluded from serialization and JSON API outputs.

2. **Role-Based Authorization:**
   - Two strict roles: `user` and `admin`.
   - Public registration strictly assigns role `user`.
   - Admin accounts are provisioned via documented seed or environment configuration.
   - Administrative endpoints (`/api/admin/*`, `POST/PATCH/DELETE /api/colors`, etc.) reject regular users with HTTP 403 Forbidden.

3. **Ownership Verification:**
   - Endpoints `/api/projects/:id` strictly evaluate `project.userId === req.user.userId`.
   - Prevents unauthorized ID spoofing or horizontal privilege escalation.

4. **Media Validation:**
   - Uploaded files are checked for both permitted file extensions (`.jpg`, `.jpeg`, `.png`, `.webp`) and MIME types (`image/jpeg`, `image/png`, `image/webp`).
   - File size enforced by multer (default 10MB limit).
