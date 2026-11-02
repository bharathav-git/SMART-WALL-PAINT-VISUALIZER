import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ColorService } from '../../core/services/color.service';
import { PatternService } from '../../core/services/pattern.service';
import { AdminAnalytics, Color, Pattern, User, FinishType } from '../../core/models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  analytics: AdminAnalytics | null = null;
  colors: Color[] = [];
  filteredColors: Color[] = [];
  patterns: Pattern[] = [];
  users: User[] = [];
  isLoading = true;

  activeTab: 'overview' | 'colors' | 'patterns' | 'users' = 'overview';
  colorSearch = '';
  userSearch = '';

  // Color modal / form
  isColorModalOpen = false;
  colorForm: FormGroup;
  editingColorId: string | null = null;

  // Pattern modal / form
  isPatternModalOpen = false;
  patternForm: FormGroup;
  editingPatternId: string | null = null;

  readonly categories = ['Neutral', 'Warm', 'Cool', 'Earthy', 'Pastel', 'Dark & Moody', 'Accent'];
  readonly finishes: FinishType[] = ['matte', 'satin', 'eggshell', 'glossy'];
  readonly patternCategories = ['Geometric', 'Stripes', 'Dots', 'Textures', 'Floral'];

  constructor(
    private adminService: AdminService,
    private colorService: ColorService,
    private patternService: PatternService,
    private fb: FormBuilder
  ) {
    this.colorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      hex: ['#3A7BD5', [Validators.required, Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]],
      category: ['Neutral', Validators.required],
      manufacturer: ['Smart Palette Studio', Validators.required],
      description: ['']
    });

    this.patternForm = this.fb.group({
      name: ['', Validators.required],
      category: ['Geometric', Validators.required],
      description: [''],
      defaultScale: [1.0, [Validators.required, Validators.min(0.1), Validators.max(5.0)]],
      svgContent: ['']
    });
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.adminService.getAnalytics().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.analytics = res.data;
        }
      }
    });

    this.colorService.getColors({ all: true }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.colors = res.data;
          this.filterColors();
        }
      }
    });

    this.patternService.getPatterns({ all: true }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.patterns = res.data;
        }
      }
    });

    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data?.users) {
          this.users = res.data.users;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterColors(): void {
    if (!this.colorSearch.trim()) {
      this.filteredColors = [...this.colors];
    } else {
      const q = this.colorSearch.toLowerCase().trim();
      this.filteredColors = this.colors.filter(
        (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
      );
    }
  }

  // Color CRUD
  openAddColorModal(): void {
    this.editingColorId = null;
    this.colorForm.reset({
      name: '',
      hex: '#3A7BD5',
      category: 'Neutral',
      manufacturer: 'Smart Palette Studio',
      description: ''
    });
    this.isColorModalOpen = true;
  }

  openEditColorModal(color: Color): void {
    this.editingColorId = color._id;
    this.colorForm.patchValue({
      name: color.name,
      hex: color.hex,
      category: color.category,
      manufacturer: color.manufacturer,
      description: color.description || ''
    });
    this.isColorModalOpen = true;
  }

  closeColorModal(): void {
    this.isColorModalOpen = false;
    this.editingColorId = null;
  }

  saveColor(): void {
    if (this.colorForm.invalid) {
      this.colorForm.markAllAsTouched();
      return;
    }

    const payload = this.colorForm.value;

    if (this.editingColorId) {
      this.colorService.updateColor(this.editingColorId, payload).subscribe({
        next: (res) => {
          if (res.success) {
            const idx = this.colors.findIndex((c) => c._id === this.editingColorId);
            if (idx > -1) this.colors[idx] = res.data;
            this.filterColors();
            this.closeColorModal();
          }
        },
        error: (err) => alert(err.error?.message || 'Failed to update color')
      });
    } else {
      this.colorService.createColor(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.colors.unshift(res.data);
            this.filterColors();
            this.closeColorModal();
          }
        },
        error: (err) => alert(err.error?.message || 'Failed to add color')
      });
    }
  }

  deleteColor(id: string): void {
    if (!confirm('Are you sure you want to delete this paint color?')) return;
    this.colorService.deleteColor(id).subscribe({
      next: () => {
        this.colors = this.colors.filter((c) => c._id !== id);
        this.filterColors();
      },
      error: (err) => alert(err.error?.message || 'Failed to delete color')
    });
  }

  // Pattern CRUD
  openAddPatternModal(): void {
    this.editingPatternId = null;
    this.patternForm.reset({
      name: '',
      category: 'Geometric',
      description: '',
      defaultScale: 1.0,
      svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.3"/></svg>'
    });
    this.isPatternModalOpen = true;
  }

  closePatternModal(): void {
    this.isPatternModalOpen = false;
    this.editingPatternId = null;
  }

  savePattern(): void {
    if (this.patternForm.invalid) {
      this.patternForm.markAllAsTouched();
      return;
    }

    const payload = this.patternForm.value;

    this.patternService.createPattern(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.patterns.unshift(res.data);
          this.closePatternModal();
        }
      },
      error: (err) => alert(err.error?.message || 'Failed to add pattern')
    });
  }

  deletePattern(id: string): void {
    if (!confirm('Are you sure you want to delete this pattern?')) return;
    this.patternService.deletePattern(id).subscribe({
      next: () => {
        this.patterns = this.patterns.filter((p) => p._id !== id);
      },
      error: (err) => alert(err.error?.message || 'Failed to delete pattern')
    });
  }
}
