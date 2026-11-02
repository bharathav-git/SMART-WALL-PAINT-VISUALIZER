import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Color } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  constructor(private http: HttpClient) {}

  getColors(options: { category?: string; search?: string; finish?: string; all?: boolean } = {}): Observable<{ success: boolean; data: Color[] }> {
    let params = new HttpParams();
    if (options.category) params = params.set('category', options.category);
    if (options.search) params = params.set('search', options.search);
    if (options.finish) params = params.set('finish', options.finish);
    if (options.all) params = params.set('all', 'true');

    return this.http.get<{ success: boolean; data: Color[] }>('/api/colors', { params });
  }

  getColor(id: string): Observable<{ success: boolean; data: Color }> {
    return this.http.get<{ success: boolean; data: Color }>(`/api/colors/${id}`);
  }

  createColor(payload: Partial<Color>): Observable<{ success: boolean; data: Color; message: string }> {
    return this.http.post<{ success: boolean; data: Color; message: string }>('/api/colors', payload);
  }

  updateColor(id: string, payload: Partial<Color>): Observable<{ success: boolean; data: Color; message: string }> {
    return this.http.patch<{ success: boolean; data: Color; message: string }>(`/api/colors/${id}`, payload);
  }

  deleteColor(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`/api/colors/${id}`);
  }
}
