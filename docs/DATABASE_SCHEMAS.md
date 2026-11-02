# MongoDB Schema Design & Relationships

Mongoose schemas are configured with strict type definitions, timestamps, validation constraints, and indexes.

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : "creates and owns"
    USERS ||--o{ ACTIVITY_LOGS : "triggers actions"
    PROJECTS ||--o{ ACTIVITY_LOGS : "generates project events"
    COLORS ||--o{ PROJECTS : "applied to wall selections"
    PATTERNS ||--o{ PROJECTS : "overlaid on wall selections"

    USERS {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "user | admin"
        string[] favoriteColors
        date createdAt
        date updatedAt
    }

    PROJECTS {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string originalImageUrl
        string thumbnailUrl
        string finalImageUrl
        WallSelection[] wallSelections
        AppliedDesign[] appliedDesigns
        date createdAt
        date updatedAt
    }

    COLORS {
        ObjectId _id PK
        string name
        string hex UK
        string manufacturer
        string[] finishOptions
        string category
        string description
        boolean isActive
        date createdAt
        date updatedAt
    }

    PATTERNS {
        ObjectId _id PK
        string name UK
        string description
        string category
        string imageUrl
        string svgContent
        number defaultScale
        boolean isActive
        date createdAt
        date updatedAt
    }

    ACTIVITY_LOGS {
        ObjectId _id PK
        ObjectId userId FK
        string action
        ObjectId projectId FK
        object metadata
        string ipAddress
        date createdAt
    }
```

---

## Indexing Strategy

1. **`User` Collection:**
   - `{ email: 1 }` (Unique, case-insensitive, primary user identifier)
   - `{ role: 1 }` (Quick filtering for administrator queries)

2. **`Project` Collection:**
   - `{ userId: 1, createdAt: -1 }` (Compound index for fetching user projects in reverse chronological order)
   - `{ userId: 1, name: 1 }` (Compound index for user project search)

3. **`Color` Collection:**
   - `{ hex: 1 }` (Indexed for color deduplication)
   - `{ category: 1, isActive: 1 }` (Catalog browsing)
   - Full-text index on `{ name: "text", category: "text", manufacturer: "text" }`

4. **`ActivityLog` Collection:**
   - `{ createdAt: -1 }` (Time-series audit trail)
   - `{ userId: 1, createdAt: -1 }` (User activity tracking)
