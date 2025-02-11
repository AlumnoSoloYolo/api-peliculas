// src/app/services/genre-utils.service.ts
import { Injectable } from '@angular/core';
import { MovieService } from './movie.service';


@Injectable({
  providedIn: 'root'
})
export class GenreUtilsService {
  private genresMap = new Map<number, string>();

  constructor(private movieService: MovieService) {
    this.cargarGeneros();
  }

  private cargarGeneros() {
    this.movieService.getGeneros().subscribe(response => {
      response.genres.forEach((genre: any) => {
        this.genresMap.set(genre.id, genre.name);
      });
    });
  }

  getnombreGeneros(genreIds: number[]): string[] {
    return genreIds.map(id => this.genresMap.get(id) || 'Desconocido');
  }
}