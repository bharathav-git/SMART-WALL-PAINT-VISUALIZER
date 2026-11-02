import { TestBed } from '@angular/core/testing';
import { WallEditorService } from './wall-editor.service';
import { WallSelection } from '../models';

describe('WallEditorService', () => {
  let service: WallEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WallEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should parse 6-character and 3-character HEX codes into correct RGB numbers', () => {
    const blue = service.hexToRgb('#2563EB');
    expect(blue).toEqual({ r: 37, g: 99, b: 235 });

    const white = service.hexToRgb('#FFF');
    expect(white).toEqual({ r: 255, g: 255, b: 255 });

    const black = service.hexToRgb('#000000');
    expect(black).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('should create an accurate polygon mask rasterization', () => {
    const polygonWall: WallSelection = {
      id: 'test-wall-1',
      name: 'Test Wall',
      type: 'polygon',
      points: [
        { x: 10, y: 10 },
        { x: 50, y: 10 },
        { x: 50, y: 50 },
        { x: 10, y: 50 }
      ],
      paintSettings: {
        hex: '#FF0000',
        opacity: 0.8,
        intensity: 1.0,
        finish: 'matte'
      }
    };

    const mask = service.createSelectionMask(polygonWall, 100, 100);
    expect(mask.width).toBe(100);
    expect(mask.height).toBe(100);
    expect(mask.data.length).toBe(100 * 100 * 4);

    // Pixel at (30, 30) is inside the polygon - alpha should be 255
    const insideIdx = (30 * 100 + 30) * 4;
    expect(mask.data[insideIdx + 3]).toBe(255);

    // Pixel at (80, 80) is outside the polygon - alpha should be 0
    const outsideIdx = (80 * 100 + 80) * 4;
    expect(mask.data[outsideIdx + 3]).toBe(0);
  });

  it('should blend paint color into pixels preserving underlying luminance', () => {
    // Construct dummy 2x2 image
    const width = 2;
    const height = 2;
    const original = new ImageData(width, height);
    const target = new ImageData(width, height);
    const mask = new ImageData(width, height);

    // Pixel 0: Mid grey (128, 128, 128), masked
    original.data[0] = 128; original.data[1] = 128; original.data[2] = 128; original.data[3] = 255;
    target.data[0] = 128; target.data[1] = 128; target.data[2] = 128; target.data[3] = 255;
    mask.data[0] = 255; mask.data[1] = 255; mask.data[2] = 255; mask.data[3] = 255;

    // Apply bright blue paint (#0000FF) with 100% opacity
    service.applyWallPaintToPixels(target, original, mask, '#0000FF', 1.0, 1.0, 'matte');

    // Blue channel should be tinted towards 255
    expect(target.data[2]).toBeGreaterThan(128);
  });
});
