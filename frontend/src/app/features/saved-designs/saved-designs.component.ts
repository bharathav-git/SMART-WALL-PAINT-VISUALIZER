import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models';

@Component({
  selector: 'app-saved-designs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './saved-designs.component.html',
  styleUrls: ['./saved-designs.component.scss']
})
export class SavedDesignsComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  sortBy = 'newest';
  currentPage = 1;
  totalPages = 1;
  totalProjects = 0;

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.projectService
      .getProjects({
        page: this.currentPage,
        limit: 12,
        search: this.searchQuery,
        sortBy: this.sortBy
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success && res.data) {
            this.projects = res.data.projects;
            this.totalProjects = res.data.total;
            this.totalPages = res.data.totalPages;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Failed to load projects';
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProjects();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadProjects();
  }

  openProject(project: Project): void {
    this.router.navigate(['/studio'], { queryParams: { projectId: project._id } });
  }

  renameProject(project: Project): void {
    const newName = prompt('Enter new project name:', project.name);
    if (!newName || newName.trim() === '' || newName.trim() === project.name) return;

    this.projectService.updateProject(project._id, { name: newName.trim() }).subscribe({
      next: () => {
        project.name = newName.trim();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to rename project');
      }
    });
  }

  deleteProject(project: Project): void {
    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) return;

    this.projectService.deleteProject(project._id).subscribe({
      next: () => {
        this.projects = this.projects.filter((p) => p._id !== project._id);
        this.totalProjects = Math.max(0, this.totalProjects - 1);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete project');
      }
    });
  }

  downloadThumbnail(project: Project): void {
    const url = project.finalImageUrl || project.thumbnailUrl || project.originalImageUrl;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_design.jpg`;
    link.click();
  }
}
