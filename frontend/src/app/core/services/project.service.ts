import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectListResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  constructor(private http: HttpClient) {}

  getProjects(options: { page?: number; limit?: number; search?: string; sortBy?: string } = {}): Observable<{ success: boolean; data: ProjectListResponse }> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);
    if (options.sortBy) params = params.set('sortBy', options.sortBy);

    return this.http.get<{ success: boolean; data: ProjectListResponse }>('/api/projects', { params });
  }

  getProject(id: string): Observable<{ success: boolean; data: Project }> {
    return this.http.get<{ success: boolean; data: Project }>(`/api/projects/${id}`);
  }

  createProject(payload: Partial<Project>): Observable<{ success: boolean; data: Project; message: string }> {
    return this.http.post<{ success: boolean; data: Project; message: string }>('/api/projects', payload);
  }

  updateProject(id: string, payload: Partial<Project>): Observable<{ success: boolean; data: Project; message: string }> {
    return this.http.patch<{ success: boolean; data: Project; message: string }>(`/api/projects/${id}`, payload);
  }

  deleteProject(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`/api/projects/${id}`);
  }

  uploadRoomImage(file: File): Observable<{ success: boolean; data: { url: string; filename: string; size: number } }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ success: boolean; data: { url: string; filename: string; size: number } }>('/api/uploads/room-image', formData);
  }
}
