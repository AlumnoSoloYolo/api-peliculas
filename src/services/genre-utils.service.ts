// src/app/services/genre-utils.service.ts
import { Injectable } from '@angular/core';
import { MovieService } from './movie.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenreUtilsService {
  private genresMap = new Map<number, string>();
  private loaded = new BehaviorSubject<boolean>(false);

  constructor(private movieService: MovieService) {
    this.cargarGeneros();
  }

  private cargarGeneros() {
    this.movieService.getGeneros().subscribe({
      next: (response) => {
        response.genres.forEach((genre: any) => {
          this.genresMap.set(genre.id, genre.name);
        });
        this.loaded.next(true);
      },
      error: (error) => {
        console.error('Error loading genres:', error);
        this.loaded.next(true);
      }
    });
  }

  getnombreGeneros(genreIds: number[]): string[] {
    return genreIds.map(id => this.genresMap.get(id) || 'Desconocido');
  }

  cargado(): Observable<boolean> {
    return this.loaded.asObservable();
  }
}