# Image Processing & Realistic Paint Blending Specification

## 1. Overview

The core image processing pipeline in Smart Wall Paint Visualizer avoids flat, artificial block overlays by combining **HTML5 Canvas vector mask rasterization**, **pixel-level perceptual luminance modulation**, and **sheen highlight simulation**.

---

## 2. Coordinate System Normalization

When an uploaded image is displayed inside the responsive browser workspace, the canvas CSS display width and height differ from the underlying image's native pixel resolution.

To preserve exact coordinate alignment across devices, zoom levels, and window resizing, all mouse events are converted from viewport coordinates to normalized intrinsic image coordinates:

$$X_{native} = (X_{client} - \text{rect.left}) \times \frac{\text{canvas.width}}{\text{rect.width}}$$

$$Y_{native} = (Y_{client} - \text{rect.top}) \times \frac{\text{canvas.height}}{\text{rect.height}}$$

All polygon anchor vertices and brush stroke centroids are persisted in native image pixel coordinates.

---

## 3. Mask Rasterization

### A. Polygon Selection
1. An offscreen 2D canvas is matched to the original image dimensions.
2. The user's ordered polygon vertices are connected via `ctx.beginPath()`, `ctx.moveTo()`, `ctx.lineTo()`, and `ctx.closePath()`.
3. The enclosed region is filled with `#FFFFFF` against a transparent background.
4. The resulting `ImageData` contains alpha channel values of `255` for interior pixels and `0` for exterior pixels.

### B. Brush Selection
1. The user paints strokes with adjustable radius ($R \in [10, 80]\text{ px}$).
2. Each stroke records points, size, and whether it operates in `paint` or `eraser` mode.
3. Eraser mode sets `ctx.globalCompositeOperation = 'destination-out'`.

---

## 4. Luminance-Aware Blending Algorithm

A naive alpha blend treats all pixels inside a wall identically, wiping out architectural moldings, lighting gradients, and wall texture:

$$\text{Naive: } C_{out} = C_{orig} \cdot (1 - \alpha) + C_{paint} \cdot \alpha$$

To maintain architectural realism, our algorithm calculates the **standard perceptual luminance** ($Y$) of each original pixel:

$$Y = 0.299 \cdot R_{orig} + 0.587 \cdot G_{orig} + 0.114 \cdot B_{orig}$$

Next, a shading factor $L_{factor}$ is computed relative to neutral mid-grey ($128$):

$$L_{factor} = \left(\frac{Y}{128.0}\right) \cdot \text{Intensity}$$

For each RGB channel ($C \in \{R, G, B\}$):

$$C_{tint} = \text{clamp}(C_{paint} \cdot L_{factor}, 0, 255)$$

$$C_{out} = \text{round}\left(C_{orig} \cdot (1 - \alpha_{eff}) + C_{tint} \cdot \alpha_{eff}\right)$$

Where $\alpha_{eff} = \left(\frac{\text{Mask}_{\alpha}}{255.0}\right) \cdot \alpha$.

---

## 5. Architectural Sheen & Finish Shaders

- **Matte:** Pure diffuse luminance modulation with zero specular highlight.
- **Eggshell:** Subtle specular sheen boost ($+6\%$) for mid-high luminance zones.
- **Satin:** Silky sheen curve ($+12\%$) for luminous highlights.
- **Glossy:** High reflectance boost ($+25\%$) active when original pixel $Y > 160$:

$$Highlight = \left(\frac{Y - 160}{95.0}\right) \cdot 0.25$$

---

## 6. Real-World Physical Limitations

1. **Severe Occlusion:** Wall areas hidden behind intricate indoor plants or slatted blinds require careful brush erasure.
2. **Deep Shadows & Blacks:** Surfaces receiving near-zero photons ($Y < 15$) will physically appear dark regardless of applied paint brightness unless supplemental ambient exposure is elevated.
3. **Substrate Texture Porosity:** The algorithm simulates wall paint over existing smooth or textured drywall, stucco, and wood. Highly patterned wallpaper may bleed through if opacity is set below 85%.
