import { Component, ElementRef, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WallEditorService } from '../../core/services/wall-editor.service';
import { ProjectService } from '../../core/services/project.service';
import { ColorService } from '../../core/services/color.service';
import { PatternService } from '../../core/services/pattern.service';
import { AuthService } from '../../core/services/auth.service';
import { Point, WallSelection, Color, Pattern, FinishType, SelectionType, Project } from '../../core/models';

type EditorTool = 'polygon' | 'brush' | 'select';

interface HistoryState {
  selections: string; // JSON stringified selections for fast deep copy
}

@Component({
  selector: 'app-wall-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './wall-editor.component.html',
  styleUrls: ['./wall-editor.component.scss']
})
export class WallEditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('comparisonCanvas', { static: false }) compCanvasRef!: ElementRef<HTMLCanvasElement>;

  // Project data
  currentProject: Project | null = null;
  projectId: string | null = null;
  projectName: string = 'Untitled Room Visualization';
  imageUrl: string = '/assets/sample-rooms/modern_living_room.svg';

  // Room Image Cache
  originalImage: HTMLImageElement | null = null;
  isImageLoaded: boolean = false;

  // Active Tooling State
  activeTool: EditorTool = 'polygon';
  brushSize: number = 30;
  isBrushErasing: boolean = false;
  zoomLevel: number = 1.0;

  // Wall Selections State
  wallSelections: WallSelection[] = [];
  activeSelectionId: string | null = null;
  inProgressPoints: Point[] = [];
  isMouseDown: boolean = false;

  // Active Wall Paint Configuration
  activeHex: string = '#2A7B88';
  activeColorName: string = 'Aegean Teal';
  activeOpacity: number = 0.75;
  activeIntensity: number = 1.0;
  activeFinish: FinishType = 'matte';
  activePatternId: string | undefined = undefined;
  activePatternScale: number = 1.0;
  activePatternOpacity: number = 0.35;

  // Catalog Data
  colors: Color[] = [];
  filteredColors: Color[] = [];
  colorCategories: string[] = ['All', 'Neutral', 'Warm', 'Cool', 'Earthy', 'Pastel', 'Dark & Moody'];
  selectedCategory: string = 'All';
  searchQuery: string = '';
  patterns: Pattern[] = [];
  activeSidebarTab: 'colors' | 'patterns' | 'walls' = 'colors';

  // History for Undo / Redo
  undoStack: HistoryState[] = [];
  redoStack: HistoryState[] = [];

  // Live Before-and-After Comparison Modal
  isComparisonOpen: boolean = false;
  comparisonSliderPos: number = 50; // percentage 0 - 100
  comparisonViewMode: 'split' | 'side-by-side' = 'split';

  // Saving & Exporting Status
  isSaving: boolean = false;
  saveMessage: string = '';
  saveMessageType: 'success' | 'error' = 'success';

  // Mouse hover coordinate for cursor overlay
  mousePos: Point = { x: 0, y: 0 };
  isHoveringCanvas: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wallEditorService: WallEditorService,
    private projectService: ProjectService,
    private colorService: ColorService,
    private patternService: PatternService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCatalog();

    this.route.queryParams.subscribe((params) => {
      if (params['projectId']) {
        this.projectId = params['projectId'];
        this.loadProject(this.projectId!);
      } else if (params['sampleRoom']) {
        this.imageUrl = params['sampleRoom'];
        this.projectName = params['sampleName'] || 'Sample Room Design';
        this.initializeDefaultSelections(params['sampleRoom']);
        this.loadImage(this.imageUrl);
      } else {
        // Default to modern living room sample
        this.imageUrl = '/assets/sample-rooms/modern_living_room.svg';
        this.projectName = 'Living Room Concept';
        this.initializeDefaultSelections(this.imageUrl);
        this.loadImage(this.imageUrl);
      }
    });
  }

  ngOnDestroy(): void {}

  private loadCatalog(): void {
    this.colorService.getColors().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.colors = res.data;
          this.filterColors();
        }
      }
    });

    this.patternService.getPatterns().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patterns = res.data;
        }
      }
    });
  }

  private loadProject(id: string): void {
    this.projectService.getProject(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.currentProject = res.data;
          this.projectName = res.data.name;
          this.imageUrl = res.data.originalImageUrl;
          this.wallSelections = res.data.wallSelections || [];
          if (this.wallSelections.length > 0) {
            this.selectWall(this.wallSelections[0].id);
          }
          this.loadImage(this.imageUrl);
        }
      },
      error: () => {
        // Fallback to sample if project not found
        this.loadImage(this.imageUrl);
      }
    });
  }

  private initializeDefaultSelections(roomPath: string): void {
    if (this.wallSelections.length > 0) return;

    // Provide friendly starting walls for the default SVG templates
    if (roomPath.includes('modern_living_room')) {
      this.wallSelections = [
        {
          id: 'wall-' + Date.now(),
          name: 'Main Center Wall',
          type: 'polygon',
          points: [
            { x: 150, y: 90 },
            { x: 850, y: 90 },
            { x: 850, y: 500 },
            { x: 150, y: 500 }
          ],
          paintSettings: {
            hex: '#2A7B88',
            colorName: 'Aegean Teal',
            opacity: 0.75,
            intensity: 1.0,
            finish: 'matte'
          }
        },
        {
          id: 'wall-' + (Date.now() + 1),
          name: 'Left Wall (Daylight)',
          type: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: 150, y: 90 },
            { x: 150, y: 510 },
            { x: 0, y: 642 }
          ],
          paintSettings: {
            hex: '#F4F1EA',
            colorName: 'Alabaster Whisper',
            opacity: 0.7,
            intensity: 1.0,
            finish: 'satin'
          }
        }
      ];
      this.activeSelectionId = this.wallSelections[0].id;
      this.syncActiveSettings();
    } else if (roomPath.includes('master_bedroom')) {
      this.wallSelections = [
        {
          id: 'wall-' + Date.now(),
          name: 'Headboard Feature Wall',
          type: 'polygon',
          points: [
            { x: 120, y: 80 },
            { x: 880, y: 80 },
            { x: 880, y: 522 },
            { x: 120, y: 522 }
          ],
          paintSettings: {
            hex: '#9CAF88',
            colorName: 'Sage Sanctuary',
            opacity: 0.75,
            intensity: 1.0,
            finish: 'matte'
          }
        }
      ];
      this.activeSelectionId = this.wallSelections[0].id;
      this.syncActiveSettings();
    }
    this.saveStateToHistory();
  }

  private loadImage(src: string): void {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.originalImage = img;
      this.isImageLoaded = true;
      this.render();
    };
    img.onerror = () => {
      console.warn('Failed to load image:', src);
    };
    img.src = src;
  }

  filterColors(): void {
    let result = [...this.colors];
    if (this.selectedCategory !== 'All') {
      result = result.filter((c) => c.category === this.selectedCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q) || c.manufacturer?.toLowerCase().includes(q)
      );
    }
    this.filteredColors = result;
  }

  // Wall Management Actions
  addNewWall(type: SelectionType = 'polygon'): void {
    this.saveStateToHistory();
    const newId = 'wall-' + Date.now();
    const newIndex = this.wallSelections.length + 1;
    const newWall: WallSelection = {
      id: newId,
      name: `Wall Region ${newIndex}`,
      type,
      points: [],
      brushStrokes: [],
      paintSettings: {
        hex: this.activeHex,
        colorName: this.activeColorName,
        opacity: this.activeOpacity,
        intensity: this.activeIntensity,
        finish: this.activeFinish,
        patternId: this.activePatternId,
        patternScale: this.activePatternScale,
        patternOpacity: this.activePatternOpacity
      }
    };
    this.wallSelections.push(newWall);
    this.selectWall(newId);
    this.activeTool = type === 'polygon' ? 'polygon' : 'brush';
    this.inProgressPoints = [];
    this.render();
  }

  selectWall(id: string): void {
    this.activeSelectionId = id;
    this.syncActiveSettings();
    const sel = this.getActiveSelection();
    if (sel) {
      this.activeTool = sel.type === 'brush' ? 'brush' : 'polygon';
    }
    this.render();
  }

  renameWall(sel: WallSelection): void {
    const name = prompt('Rename Wall Region:', sel.name);
    if (name && name.trim()) {
      this.saveStateToHistory();
      sel.name = name.trim();
    }
  }

  deleteWall(id: string): void {
    if (!confirm('Are you sure you want to delete this wall region?')) return;
    this.saveStateToHistory();
    this.wallSelections = this.wallSelections.filter((w) => w.id !== id);
    if (this.activeSelectionId === id) {
      this.activeSelectionId = this.wallSelections.length > 0 ? this.wallSelections[0].id : null;
      this.syncActiveSettings();
    }
    this.render();
  }

  clearAllSelections(): void {
    if (!confirm('Clear all wall selections?')) return;
    this.saveStateToHistory();
    this.wallSelections = [];
    this.activeSelectionId = null;
    this.inProgressPoints = [];
    this.render();
  }

  getActiveSelection(): WallSelection | undefined {
    return this.wallSelections.find((w) => w.id === this.activeSelectionId);
  }

  syncActiveSettings(): void {
    const sel = this.getActiveSelection();
    if (sel && sel.paintSettings) {
      this.activeHex = sel.paintSettings.hex;
      this.activeColorName = sel.paintSettings.colorName || 'Custom Shade';
      this.activeOpacity = sel.paintSettings.opacity ?? 0.75;
      this.activeIntensity = sel.paintSettings.intensity ?? 1.0;
      this.activeFinish = sel.paintSettings.finish ?? 'matte';
      this.activePatternId = sel.paintSettings.patternId;
      this.activePatternScale = sel.paintSettings.patternScale ?? 1.0;
      this.activePatternOpacity = sel.paintSettings.patternOpacity ?? 0.35;
    }
  }

  applyActiveColorToSelectedWall(color: Color): void {
    this.saveStateToHistory();
    this.activeHex = color.hex;
    this.activeColorName = color.name;

    const sel = this.getActiveSelection();
    if (sel) {
      sel.paintSettings.hex = color.hex;
      sel.paintSettings.colorName = color.name;
      sel.paintSettings.colorId = color._id;
    }
    this.render();
  }

  updateCustomColor(hex: string): void {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(hex)) return;

    this.saveStateToHistory();
    this.activeHex = hex.toUpperCase();
    this.activeColorName = 'Custom Shade ' + this.activeHex;

    const sel = this.getActiveSelection();
    if (sel) {
      sel.paintSettings.hex = this.activeHex;
      sel.paintSettings.colorName = this.activeColorName;
    }
    this.render();
  }

  onOpacityChange(): void {
    const sel = this.getActiveSelection();
    if (sel) {
      sel.paintSettings.opacity = this.activeOpacity;
      this.render();
    }
  }

  onIntensityChange(): void {
    const sel = this.getActiveSelection();
    if (sel) {
      sel.paintSettings.intensity = this.activeIntensity;
      this.render();
    }
  }

  setFinish(finish: FinishType): void {
    this.saveStateToHistory();
    this.activeFinish = finish;
    const sel = this.getActiveSelection();
    if (sel) {
      sel.paintSettings.finish = finish;
      this.render();
    }
  }

  applyPattern(pattern: Pattern | null): void {
    this.saveStateToHistory();
    const sel = this.getActiveSelection();
    if (pattern) {
      this.activePatternId = pattern._id;
      if (sel) {
        sel.paintSettings.patternId = pattern._id;
        sel.paintSettings.patternName = pattern.name;
        sel.paintSettings.patternScale = this.activePatternScale;
        sel.paintSettings.patternOpacity = this.activePatternOpacity;
      }
    } else {
      this.activePatternId = undefined;
      if (sel) {
        sel.paintSettings.patternId = undefined;
        sel.paintSettings.patternName = undefined;
      }
    }
    this.render();
  }

  onPatternParamsChange(): void {
    const sel = this.getActiveSelection();
    if (sel && this.activePatternId) {
      sel.paintSettings.patternScale = this.activePatternScale;
      sel.paintSettings.patternOpacity = this.activePatternOpacity;
      this.render();
    }
  }

  resetSelectedWall(): void {
    const sel = this.getActiveSelection();
    if (!sel) return;
    this.saveStateToHistory();
    sel.paintSettings.opacity = 0;
    this.activeOpacity = 0;
    this.render();
  }

  // Canvas Mouse & Interaction Events
  private getCanvasCoordinates(event: MouseEvent): Point {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((event.clientX - rect.left) * scaleX),
      y: Math.round((event.clientY - rect.top) * scaleY)
    };
  }

  onCanvasMouseDown(event: MouseEvent): void {
    if (!this.isImageLoaded) return;
    const pt = this.getCanvasCoordinates(event);
    this.isMouseDown = true;

    let sel = this.getActiveSelection();
    if (!sel) {
      this.addNewWall(this.activeTool === 'brush' ? 'brush' : 'polygon');
      sel = this.getActiveSelection();
    }

    if (this.activeTool === 'polygon') {
      this.saveStateToHistory();
      if (!sel!.points) sel!.points = [];
      sel!.points.push(pt);
      this.render();
    } else if (this.activeTool === 'brush') {
      this.saveStateToHistory();
      if (!sel!.brushStrokes) sel!.brushStrokes = [];
      sel!.brushStrokes.push({
        points: [pt],
        size: this.brushSize,
        isErase: this.isBrushErasing
      });
      this.render();
    }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    const pt = this.getCanvasCoordinates(event);
    this.mousePos = pt;

    if (this.isMouseDown && this.activeTool === 'brush') {
      const sel = this.getActiveSelection();
      if (sel && sel.brushStrokes && sel.brushStrokes.length > 0) {
        const currentStroke = sel.brushStrokes[sel.brushStrokes.length - 1];
        currentStroke.points.push(pt);
        this.render();
      }
    }
  }

  onCanvasMouseUp(): void {
    this.isMouseDown = false;
  }

  closePolygon(): void {
    const sel = this.getActiveSelection();
    if (sel && sel.type === 'polygon' && sel.points.length >= 3) {
      // Completed polygon
      this.render();
    }
  }

  resetCurrentPolygon(): void {
    const sel = this.getActiveSelection();
    if (sel && sel.type === 'polygon') {
      this.saveStateToHistory();
      sel.points = [];
      this.render();
    }
  }

  // Zooming
  zoomIn(): void {
    this.zoomLevel = Math.min(2.5, this.zoomLevel + 0.15);
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(0.4, this.zoomLevel - 0.15);
  }

  resetZoom(): void {
    this.zoomLevel = 1.0;
  }

  // Undo / Redo
  saveStateToHistory(): void {
    this.undoStack.push({
      selections: JSON.stringify(this.wallSelections)
    });
    this.redoStack = [];
    if (this.undoStack.length > 30) {
      this.undoStack.shift();
    }
  }

  undo(): void {
    if (this.undoStack.length === 0) return;
    const currentState = JSON.stringify(this.wallSelections);
    this.redoStack.push({ selections: currentState });

    const prevState = this.undoStack.pop()!;
    this.wallSelections = JSON.parse(prevState.selections);
    if (!this.getActiveSelection() && this.wallSelections.length > 0) {
      this.activeSelectionId = this.wallSelections[0].id;
    }
    this.syncActiveSettings();
    this.render();
  }

  redo(): void {
    if (this.redoStack.length === 0) return;
    const currentState = JSON.stringify(this.wallSelections);
    this.undoStack.push({ selections: currentState });

    const nextState = this.redoStack.pop()!;
    this.wallSelections = JSON.parse(nextState.selections);
    if (!this.getActiveSelection() && this.wallSelections.length > 0) {
      this.activeSelectionId = this.wallSelections[0].id;
    }
    this.syncActiveSettings();
    this.render();
  }

  // Master Render Engine
  render(): void {
    if (!this.canvasRef || !this.originalImage) return;
    const canvas = this.canvasRef.nativeElement;

    this.wallEditorService.renderProjectComposite(
      canvas,
      this.originalImage,
      this.wallSelections,
      {
        showSelectionsOutline: true,
        activeSelectionId: this.activeSelectionId,
        exportMode: false
      }
    );
  }

  // Comparison Slider
  openComparison(): void {
    this.isComparisonOpen = true;
    setTimeout(() => {
      this.renderComparison();
    }, 50);
  }

  closeComparison(): void {
    this.isComparisonOpen = false;
  }

  onComparisonSliderChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.comparisonSliderPos = parseInt(input.value, 10);
    this.renderComparison();
  }

  renderComparison(): void {
    if (!this.compCanvasRef || !this.originalImage) return;
    const canvas = this.compCanvasRef.nativeElement;
    const width = this.originalImage.width;
    const height = this.originalImage.height;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render painted composite onto temporary offscreen canvas
    const paintedCanvas = document.createElement('canvas');
    this.wallEditorService.renderProjectComposite(
      paintedCanvas,
      this.originalImage,
      this.wallSelections,
      { exportMode: true }
    );

    if (this.comparisonViewMode === 'split') {
      // Draw fully painted image first
      ctx.drawImage(paintedCanvas, 0, 0);

      // Clip original pristine image on the left up to split point
      const splitX = (width * this.comparisonSliderPos) / 100;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, height);
      ctx.clip();
      ctx.drawImage(this.originalImage, 0, 0);
      ctx.restore();

      // Draw vertical divider bar
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();

      // Draw slider handle circle
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(splitX, height / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  // Save Project to MongoDB
  saveProject(): void {
    if (!this.authService.isLoggedIn()) {
      alert('Please sign in or create an account to save your designs to your cloud library.');
      this.router.navigate(['/login']);
      return;
    }

    this.isSaving = true;
    this.saveMessage = '';

    // Render clean export thumbnail
    const thumbCanvas = document.createElement('canvas');
    if (this.originalImage) {
      this.wallEditorService.renderProjectComposite(
        thumbCanvas,
        this.originalImage,
        this.wallSelections,
        { exportMode: true }
      );
    }
    const finalImageThumbnail = thumbCanvas.toDataURL('image/jpeg', 0.85);

    const appliedDesigns = this.wallSelections.map((w) => ({
      wallSelectionId: w.id,
      colorId: w.paintSettings.colorId,
      hex: w.paintSettings.hex,
      opacity: w.paintSettings.opacity,
      intensity: w.paintSettings.intensity,
      finish: w.paintSettings.finish,
      patternId: w.paintSettings.patternId,
      patternScale: w.paintSettings.patternScale,
      patternOpacity: w.paintSettings.patternOpacity
    }));

    const projectData = {
      name: this.projectName.trim(),
      originalImageUrl: this.imageUrl,
      thumbnailUrl: finalImageThumbnail,
      finalImageUrl: finalImageThumbnail,
      wallSelections: this.wallSelections,
      appliedDesigns
    };

    if (this.projectId) {
      this.projectService.updateProject(this.projectId, projectData).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.saveMessageType = 'success';
          this.saveMessage = 'Project updated successfully!';
          setTimeout(() => (this.saveMessage = ''), 3000);
        },
        error: (err) => {
          this.isSaving = false;
          this.saveMessageType = 'error';
          this.saveMessage = err.error?.message || 'Failed to save project.';
        }
      });
    } else {
      this.projectService.createProject(projectData).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.projectId = res.data._id;
          this.saveMessageType = 'success';
          this.saveMessage = 'Project saved to your account!';
          setTimeout(() => (this.saveMessage = ''), 3000);
        },
        error: (err) => {
          this.isSaving = false;
          this.saveMessageType = 'error';
          this.saveMessage = err.error?.message || 'Failed to save project.';
        }
      });
    }
  }

  // Export Painted Image as High-Res PNG or JPEG
  exportImage(format: 'png' | 'jpeg'): void {
    if (!this.originalImage) return;

    const exportCanvas = document.createElement('canvas');
    this.wallEditorService.renderProjectComposite(
      exportCanvas,
      this.originalImage,
      this.wallSelections,
      { exportMode: true }
    );

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = exportCanvas.toDataURL(mime, 0.95);

    const link = document.createElement('a');
    const safeName = this.projectName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `${safeName}_painted.${format}`;
    link.href = dataUrl;
    link.click();
  }
}
