import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { Project } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    public authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.projectService.getProjects({ limit: 8, sortBy: 'newest' }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.projects = res.data.projects;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load projects';
      }
    });
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
    if (!confirm(`Are you sure you want to delete project "${project.name}"?`)) return;

    this.projectService.deleteProject(project._id).subscribe({
      next: () => {
        this.projects = this.projects.filter((p) => p._id !== project._id);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete project');
      }
    });
  }

  startWithSample(roomPath: string, roomName: string): void {
    this.router.navigate(['/studio'], {
      queryParams: {
        sampleRoom: roomPath,
        sampleName: roomName
      }
    });
  }
}
