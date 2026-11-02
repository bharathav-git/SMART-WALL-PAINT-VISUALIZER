import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminAnalytics } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) {}

  getAnalytics(): Observable<{ success: boolean; data: AdminAnalytics }> {
    return this.http.get<{ success: boolean; data: AdminAnalytics }>('/api/admin/analytics');
  }

  getUsers(options: { page?: number; limit?: number; search?: string } = {}): Observable<any> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);

    return this.http.get<any>('/api/admin/users', { params });
  }

  getAllProjects(options: { page?: number; limit?: number; search?: string } = {}): Observable<any> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page.toString());
    if (options.limit) params = params.set('limit', options.limit.toString());
    if (options.search) params = params.set('search', options.search);

    return this.http.get<any>('/api/admin/projects', { params });
  }
}
