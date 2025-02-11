
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class UserMovieService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${token}`)
    };
  }

  addPelisPendientes(movieId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/user-movies/watchlist`,
      { movieId },
      this.getHeaders()
    );
  }

  addPelisVistas(movieId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/user-movies/watched`,
      { movieId },
      this.getHeaders()
    );
  }

  addReview(movieId: string, review: {
    rating: number,
    comment: string
  }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/movies/${movieId}/reviews`,
      review,
      this.getHeaders()
    );
  }

  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/user-movies/profile`, { headers });
  }
}