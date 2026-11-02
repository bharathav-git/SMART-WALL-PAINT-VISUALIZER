# RESTful API Documentation

Base URL: `http://localhost:5000/api`

All mutating endpoints and private project queries require a valid JWT header:
`Authorization: Bearer <TOKEN>`

---

## 1. Authentication Endpoints

### Register User
- **Route:** `POST /api/auth/register`
- **Access:** Public
- **Body:**
```json
{
  "name": "Eleanor Vance",
  "email": "eleanor@example.com",
  "password": "Password@123",
  "confirmPassword": "Password@123"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "_id": "...", "name": "Eleanor Vance", "email": "eleanor@example.com", "role": "user" },
    "token": "eyJhbGciOi..."
  }
}
```

### User Login
- **Route:** `POST /api/auth/login`
- **Access:** Public (Rate limited to 30 req / 15 min)
- **Body:**
```json
{
  "email": "eleanor@example.com",
  "password": "Password@123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "Eleanor Vance", "email": "eleanor@example.com", "role": "user" },
    "token": "eyJhbGciOi..."
  }
}
```

### Current User Profile
- **Route:** `GET /api/auth/me`
- **Access:** Authenticated

---

## 2. Project Endpoints

### List User's Projects
- **Route:** `GET /api/projects?page=1&limit=12&search=Living&sortBy=newest`
- **Access:** Authenticated (Owner only)

### Create Project
- **Route:** `POST /api/projects`
- **Access:** Authenticated
- **Body:**
```json
{
  "name": "Master Bedroom Renovation",
  "originalImageUrl": "/uploads/room_173000000.jpg",
  "thumbnailUrl": "data:image/jpeg;base64,...",
  "wallSelections": [
    {
      "id": "wall-1",
      "name": "Accent Wall",
      "type": "polygon",
      "points": [{ "x": 100, "y": 80 }, { "x": 500, "y": 80 }, { "x": 500, "y": 400 }, { "x": 100, "y": 400 }],
      "paintSettings": {
        "hex": "#2A7B88",
        "colorName": "Aegean Teal",
        "opacity": 0.75,
        "intensity": 1.0,
        "finish": "matte"
      }
    }
  ],
  "appliedDesigns": [
    {
      "wallSelectionId": "wall-1",
      "hex": "#2A7B88",
      "opacity": 0.75,
      "finish": "matte"
    }
  ]
}
```

### Get Project By ID
- **Route:** `GET /api/projects/:id`
- **Access:** Authenticated (Enforces project ownership; returns 403 Forbidden for non-owners)

### Update Project
- **Route:** `PATCH /api/projects/:id`
- **Access:** Authenticated (Owner only)

### Delete Project
- **Route:** `DELETE /api/projects/:id`
- **Access:** Authenticated (Owner only)

---

## 3. Image Uploads

### Upload Room Photograph
- **Route:** `POST /api/uploads/room-image`
- **Access:** Authenticated
- **Content-Type:** `multipart/form-data`
- **Form field:** `image` (JPEG, PNG, WEBP, max 10MB)
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "/uploads/living_room_173000000_abc123.jpg",
    "filename": "living_room_173000000_abc123.jpg",
    "size": 2450123,
    "mimetype": "image/jpeg"
  }
}
```

---

## 4. Paint Colors Catalog

- `GET /api/colors` (Public, supports `?category=Cool&search=teal&finish=matte`)
- `GET /api/colors/:id` (Public)
- `POST /api/colors` (Admin Only)
- `PATCH /api/colors/:id` (Admin Only)
- `DELETE /api/colors/:id` (Admin Only)

---

## 5. Patterns & Textures Catalog

- `GET /api/patterns` (Public)
- `GET /api/patterns/:id` (Public)
- `POST /api/patterns` (Admin Only)
- `PATCH /api/patterns/:id` (Admin Only)
- `DELETE /api/patterns/:id` (Admin Only)

---

## 6. Administrative Analytics & Oversight

- `GET /api/admin/analytics` (Admin Only)
- `GET /api/admin/users` (Admin Only, supports pagination and search)
- `GET /api/admin/projects` (Admin Only, cross-user project oversight)
