import { Injectable } from '@angular/core';
import { Point, BrushStroke, WallSelection, FinishType } from '../models';

export interface RenderOptions {
  showSelectionsOutline?: boolean;
  activeSelectionId?: string | null;
  exportMode?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WallEditorService {
  /**
   * Helper to convert HEX to RGB components
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  /**
   * Generates a 2D binary/alpha mask for a given wall selection at full image resolution
   */
  createSelectionMask(
    selection: WallSelection,
    width: number,
    height: number
  ): ImageData {
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Could not create offscreen canvas context');
    }

    ctx.clearRect(0, 0, width, height);

    if (selection.type === 'polygon' && selection.points.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(selection.points[0].x, selection.points[0].y);
      for (let i = 1; i < selection.points.length; i++) {
        ctx.lineTo(selection.points[i].x, selection.points[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    } else if (selection.type === 'brush' && selection.brushStrokes) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (const stroke of selection.brushStrokes) {
        if (!stroke.points || stroke.points.length === 0) continue;

        ctx.globalCompositeOperation = stroke.isErase ? 'destination-out' : 'source-over';
        ctx.lineWidth = stroke.size;
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';

        if (stroke.points.length === 1) {
          ctx.beginPath();
          ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
      }
    }

    return ctx.getImageData(0, 0, width, height);
  }

  /**
   * Luminance-aware, texture-preserving wall paint blender.
   * Modulates paint color by underlying wall shading, lighting, and texture variations.
   */
  applyWallPaintToPixels(
    targetData: ImageData,
    originalData: ImageData,
    maskData: ImageData,
    hexColor: string,
    opacity: number,
    intensity: number = 1.0,
    finish: FinishType = 'matte'
  ): void {
    const rgb = this.hexToRgb(hexColor);
    const src = originalData.data;
    const dst = targetData.data;
    const mask = maskData.data;
    const totalPixels = mask.length;

    const clampedAlpha = Math.max(0.05, Math.min(1.0, opacity));
    const clampedIntensity = Math.max(0.2, Math.min(2.0, intensity));

    // Finish multipliers for specular and shadow curves
    let glossBoost = 0;
    if (finish === 'glossy') glossBoost = 0.25;
    else if (finish === 'satin') glossBoost = 0.12;
    else if (finish === 'eggshell') glossBoost = 0.06;

    for (let i = 0; i < totalPixels; i += 4) {
      const maskVal = mask[i + 3]; // Alpha channel of the selection mask (0 to 255)
      if (maskVal === 0) continue;

      const effectiveAlpha = (maskVal / 255.0) * clampedAlpha;

      const rOrig = src[i];
      const gOrig = src[i + 1];
      const bOrig = src[i + 2];

      // Perceptual standard luminance: Y = 0.299R + 0.587G + 0.114B
      const luminance = 0.299 * rOrig + 0.587 * gOrig + 0.114 * bOrig;

      // Luminance multiplier normalized around mid-grey (128)
      // Preserves wall textures, shadow recesses, and natural illumination gradients
      let lumFactor = (luminance / 128.0) * clampedIntensity;

      // Finish adjustment: Glossy/satin finishes boost highlights on bright wall areas
      if (glossBoost > 0 && luminance > 160) {
        const highlightFactor = ((luminance - 160) / 95.0) * glossBoost;
        lumFactor += highlightFactor;
      }

      // Shaded paint components
      const rTint = Math.min(255, Math.max(0, rgb.r * lumFactor));
      const gTint = Math.min(255, Math.max(0, rgb.g * lumFactor));
      const bTint = Math.min(255, Math.max(0, rgb.b * lumFactor));

      // Alpha blend: output = original * (1 - alpha) + tint * alpha
      dst[i] = Math.round(rOrig * (1 - effectiveAlpha) + rTint * effectiveAlpha);
      dst[i + 1] = Math.round(gOrig * (1 - effectiveAlpha) + gTint * effectiveAlpha);
      dst[i + 2] = Math.round(bOrig * (1 - effectiveAlpha) + bTint * effectiveAlpha);
      dst[i + 3] = 255;
    }
  }

  /**
   * Applies pattern overlay clipped to wall selection mask
   */
  applyPatternOverlay(
    ctx: CanvasRenderingContext2D,
    selection: WallSelection,
    patternImage: HTMLImageElement | HTMLCanvasElement,
    scale: number = 1.0,
    opacity: number = 0.35
  ): void {
    ctx.save();

    // Clip to polygon or mask
    ctx.beginPath();
    if (selection.type === 'polygon' && selection.points.length >= 3) {
      ctx.moveTo(selection.points[0].x, selection.points[0].y);
      for (let i = 1; i < selection.points.length; i++) {
        ctx.lineTo(selection.points[i].x, selection.points[i].y);
      }
      ctx.closePath();
      ctx.clip();
    }

    ctx.globalAlpha = Math.max(0.05, Math.min(1.0, opacity));
    const pattern = ctx.createPattern(patternImage, 'repeat');
    if (pattern) {
      if (scale !== 1.0 && (pattern as any).setTransform) {
        const matrix = new DOMMatrix().scale(scale);
        (pattern as any).setTransform(matrix);
      }
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    ctx.restore();
  }

  /**
   * Full composite render of original image + all wall selections + applied colors & patterns
   */
  renderProjectComposite(
    outputCanvas: HTMLCanvasElement,
    originalImage: HTMLImageElement | HTMLCanvasElement,
    wallSelections: WallSelection[],
    options: RenderOptions = {}
  ): void {
    const width = originalImage.width;
    const height = originalImage.height;

    if (outputCanvas.width !== width || outputCanvas.height !== height) {
      outputCanvas.width = width;
      outputCanvas.height = height;
    }

    const ctx = outputCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Draw original image pristine baseline
    ctx.drawImage(originalImage, 0, 0);

    // Read pristine original pixel data
    const originalImageData = ctx.getImageData(0, 0, width, height);
    const compositedImageData = ctx.getImageData(0, 0, width, height);

    // Apply color to each wall selection
    for (const selection of wallSelections) {
      if (!selection.paintSettings?.hex) continue;

      const maskImageData = this.createSelectionMask(selection, width, height);

      this.applyWallPaintToPixels(
        compositedImageData,
        originalImageData,
        maskImageData,
        selection.paintSettings.hex,
        selection.paintSettings.opacity ?? 0.7,
        selection.paintSettings.intensity ?? 1.0,
        selection.paintSettings.finish ?? 'matte'
      );
    }

    // Write blended pixels back onto canvas
    ctx.putImageData(compositedImageData, 0, 0);

    // If selections outline should be rendered (for active editor workspace)
    if (options.showSelectionsOutline && !options.exportMode) {
      this.drawSelectionOverlays(ctx, wallSelections, options.activeSelectionId);
    }
  }

  /**
   * Draws selection boundaries, anchor points, and active highlight in editor mode
   */
  drawSelectionOverlays(
    ctx: CanvasRenderingContext2D,
    selections: WallSelection[],
    activeId?: string | null
  ): void {
    ctx.save();

    for (const sel of selections) {
      const isActive = sel.id === activeId;
      ctx.strokeStyle = isActive ? '#3B82F6' : 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = isActive ? 3 : 1.5;
      ctx.setLineDash(isActive ? [6, 4] : [4, 4]);

      if (sel.type === 'polygon' && sel.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(sel.points[0].x, sel.points[0].y);
        for (let i = 1; i < sel.points.length; i++) {
          ctx.lineTo(sel.points[i].x, sel.points[i].y);
        }
        if (sel.points.length >= 3) {
          ctx.closePath();
          ctx.fillStyle = isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.08)';
          ctx.fill();
        }
        ctx.stroke();

        // Draw anchor handle circles for active polygon
        if (isActive) {
          ctx.setLineDash([]);
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = 2;
          for (const pt of sel.points) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }
      }
    }

    ctx.restore();
  }
}
