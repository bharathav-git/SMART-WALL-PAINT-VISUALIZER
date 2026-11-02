import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pattern } from '../models';

@Injectable({
  providedIn: 'root'
})
export class PatternService {
  constructor(private http: HttpClient) {}

  getPatterns(options: { category?: string; all?: boolean } = {}): Observable<{ success: boolean; data: Pattern[] }> {
    let params = new HttpParams();
    if (options.category) params = params.set('category', options.category);
    if (options.all) params = params.set('all', 'true');

    return this.http.get<{ success: boolean; data: Pattern[] }>('/api/patterns', { params });
  }

  getPattern(id: string): Observable<{ success: boolean; data: Pattern }> {
    return this.http.get<{ success: boolean; data: Pattern }>(`/api/patterns/${id}`);
  }

  createPattern(payload: Partial<Pattern>): Observable<{ success: boolean; data: Pattern; message: string }> {
    return this.http.post<{ success: boolean; data: Pattern; message: string }>('/api/patterns', payload);
  }

  updatePattern(id: string, payload: Partial<Pattern>): Observable<{ success: boolean; data: Pattern; message: string }> {
    return this.http.patch<{ success: boolean; data: Pattern; message: string }>(`/api/patterns/${id}`, payload);
  }

  deletePattern(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`/api/patterns/${id}`);
  }
}
