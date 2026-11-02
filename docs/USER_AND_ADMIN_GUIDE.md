# Smart Wall Paint Visualizer - User & Administrator Guide

## Part 1: User Guide

### 1. Register & Sign In
- Navigate to the application homepage.
- Click **"Get Started"** or **"Sign In"**.
- You can create your own account or click the **"Demo User"** autofill button for instant test access.

### 2. Starting a Visualization
- **Option A (Upload Own Photo):**
  1. Click **"Upload Photo"** from the navigation bar or dashboard.
  2. Enter a project title.
  3. Drag and drop your room photo (JPG, PNG, WEBP, max 10MB) or browse your device.
  4. Click **"Proceed to Wall Selection Editor"**.
- **Option B (Choose Architectural Template):**
  1. Click any starter room (Living Room, Master Bedroom, or Scandinavian Dining) on the Dashboard or Landing page.
  2. Opens instantly in the Paint Studio.

### 3. Wall Selection Tools
- **Polygon Tool (Point-to-Point):**
  1. Click corners around your wall perimeter.
  2. Once vertices enclose the wall, click **"Close Wall"** or click near the starting point.
- **Brush Tool (Freehand):**
  1. Set the brush size slider (10px to 80px).
  2. Draw over wall areas.
  3. Switch to **"Eraser"** to trim excess coverage around door frames or furniture.
- **Multiple Walls (Dual-Tone):**
  1. Click **"+ Add Wall"** on the left sidebar to add a second or third wall region.
  2. Each wall region retains its own independent color, finish, and opacity.

### 4. Color & Pattern Studio
- **Palette Tab:** Browse curated categories (Neutral, Warm, Cool, Earthy, Pastel, Dark & Moody) or type any HEX code.
- **Finishes Tab:** Choose between Matte, Eggshell, Satin, and Glossy sheens. Adjust coverage opacity and luminance sensitivity sliders.
- **Patterns Tab:** Click to apply geometric chevrons, vertical stripes, linen weave, or botanical textures clipped to your wall.

### 5. Compare & Export
- Click **"⚖️ Compare"** in the top toolbar to reveal the interactive before-and-after split comparison slider.
- Click **"📥 Export PNG"** to download the clean, high-resolution painted photograph without UI controls.
- Click **"💾 Save Design"** to persist your design to your cloud project library.

---

## Part 2: Administrator Guide

### 1. Accessing Admin Portal
- Admin accounts are provisioned via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
- Default development credentials:
  - **Email:** `admin@wallvisualizer.com`
  - **Password:** `Admin@123456`
- Once logged in as an administrator, an orange **"⚡ Admin"** link appears in the top navigation bar.

### 2. Overview Dashboard
- Inspect platform metrics: Total registered users, total projects, active paint colors, and pattern overlays.
- Review category breakdown charts and live system audit timeline.

### 3. Managing Paint Colors
- Click the **"Paint Colors"** tab.
- Click **"+ Add New Paint Color"**.
- Enter color name, HEX code (with native color picker preview), category, manufacturer, and optional description.
- To modify an existing shade, click **"Edit"**.
- To deactivate or remove a shade, click **"Delete"**.

### 4. Managing Patterns
- Click the **"Patterns"** tab.
- Click **"+ Add New Pattern"** to introduce new SVG vector patterns or textures into the studio catalog.
- Set default scale (0.1 to 5.0).
- Paste SVG vector paths.

### 5. User & Project Oversight
- View registered users, account creation timestamps, and project counts.
- Search users by name or email.
