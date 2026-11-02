# Deployment, Testing & Production Guide

## 1. Automated Test Suites

### Backend Integration Tests (Jest & Supertest & In-Memory MongoDB)
The backend tests cover authentication, project CRUD, role-based authorization, ownership protection, and color catalog APIs:
```bash
cd backend
npm test
```
To run with coverage:
```bash
npm test -- --coverage
```

### Frontend Unit & Component Tests (Karma & Jasmine & ChromeHeadless)
The frontend tests verify services, reactive form validation, canvas blending engine, and route guards:
```bash
cd frontend
npm test -- --watch=false
```

---

## 2. Production Build Commands

### Frontend Production Build
```bash
cd frontend
npm run build
```
Build output is generated in `frontend/dist/frontend/browser`.

### Backend Production Build
```bash
cd backend
npm run build
```
Compiled JavaScript files are generated in `backend/dist/`.

---

## 3. Production Deployment Guide

### A. Database (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 cluster or dedicated instance.
3. In **Database Access**, create a database user with read/write privileges.
4. In **Network Access**, whitelist your backend IP or allow `0.0.0.0/0` (with strong user credentials).
5. Copy your connection string:
   `mongodb+srv://<USER>:<PASSWORD>@cluster.mongodb.net/smart_wall_paint_visualizer?retryWrites=true&w=majority`

### B. Backend Deployment (Render / Railway / DigitalOcean)
1. Push your repository to GitHub.
2. In Render, create a new **Web Service** pointing to the repository root.
3. Configure settings:
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Set Environment Variables:
   - `PORT`: `5000` (or assigned by host)
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://...` (your Atlas URI)
   - `JWT_SECRET`: Generate a strong 64-character secret
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
   - `UPLOAD_DIR`: `uploads` (For permanent multi-instance hosting, configure an S3/Cloudinary/GCS adapter)
   - `ADMIN_NAME`: `System Administrator`
   - `ADMIN_EMAIL`: `admin@yourdomain.com`
   - `ADMIN_PASSWORD`: `<STRONG_PASSWORD>`
5. Deploy and verify health check:
   `GET https://your-backend-service.onrender.com/api/health`

### C. Frontend Deployment (Vercel / Netlify)
1. In Vercel, import your GitHub repository.
2. Configure settings:
   - **Framework Preset:** Angular
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/frontend/browser`
3. Configure API Proxy or environment URL:
   Create `frontend/src/environments/environment.prod.ts` pointing `apiUrl` to your backend URL, or configure rewrite in `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend.onrender.com/api/$1" },
    { "source": "/uploads/(.*)", "destination": "https://your-backend.onrender.com/uploads/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 4. Production Troubleshooting Guide

| Issue | Likely Cause | Resolution |
| :--- | :--- | :--- |
| `CORS Error` in browser console | `CLIENT_URL` on backend does not match the frontend domain | Update `CLIENT_URL` in backend environment variables to match exact frontend URL (including https:// and no trailing slash). |
| `EPERM: operation not permitted` on upload | Node process lacks write access to `uploads/` directory | Ensure the upload directory exists and has write permissions, or use a managed persistent volume. |
| `Invalid token / 401 Unauthorized` | Expired session or mismatched `JWT_SECRET` | Log out and log in again. Ensure `JWT_SECRET` was not modified between restarts. |
| `Cannot connect to MongoDB Atlas` | Atlas network access whitelist blocked the server IP | Add the backend's outbound IP addresses to MongoDB Atlas Network Access whitelist. |
| Canvas tainted by cross-origin data | Image loaded from external origin without CORS headers | The backend serves `/uploads` with `Cross-Origin-Resource-Policy: cross-origin`. Ensure all uploaded assets pass through the application API or CORS-enabled storage. |
