import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  projectName = '';
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isDragging = false;
  isUploading = false;
  errorMessage = '';

  readonly maxFileSizeMb = 10;
  readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private router: Router
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    this.errorMessage = '';

    // Validate MIME type
    if (!this.allowedTypes.includes(file.type)) {
      this.errorMessage = `Invalid file format "${file.type}". Please upload a JPG, JPEG, PNG, or WEBP image.`;
      return;
    }

    // Validate size
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > this.maxFileSizeMb) {
      this.errorMessage = `File size (${sizeInMb.toFixed(1)}MB) exceeds the maximum allowed limit of ${this.maxFileSizeMb}MB.`;
      return;
    }

    this.selectedFile = file;

    // Default project name from filename
    if (!this.projectName) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      this.projectName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    }

    // Generate local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreviewUrl = null;
    this.errorMessage = '';
  }

  proceedToStudio(): void {
    if (!this.projectName || this.projectName.trim() === '') {
      this.errorMessage = 'Please provide a project name.';
      return;
    }

    if (!this.selectedFile && !this.imagePreviewUrl) {
      this.errorMessage = 'Please select a room image first.';
      return;
    }

    if (this.selectedFile) {
      this.isUploading = true;
      this.errorMessage = '';

      this.projectService.uploadRoomImage(this.selectedFile).subscribe({
        next: (res) => {
          this.isUploading = false;
          if (res.success && res.data?.url) {
            // Create project in MongoDB
            this.projectService.createProject({
              name: this.projectName.trim(),
              originalImageUrl: res.data.url,
              wallSelections: [],
              appliedDesigns: []
            }).subscribe({
              next: (projRes) => {
                this.router.navigate(['/studio'], { queryParams: { projectId: projRes.data._id } });
              },
              error: (err) => {
                this.errorMessage = err.error?.message || 'Failed to initialize project record.';
              }
            });
          }
        },
        error: (err) => {
          this.isUploading = false;
          this.errorMessage = err.error?.message || 'Image upload failed. Ensure server is reachable.';
        }
      });
    }
  }

  pickSample(roomPath: string, title: string): void {
    this.router.navigate(['/studio'], {
      queryParams: {
        sampleRoom: roomPath,
        sampleName: title
      }
    });
  }
}
