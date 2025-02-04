import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VotoColorPipe } from '../../shared/pipes/voto-color.pipe';


@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, VotoColorPipe],
  templateUrl: './movie-detail.component.html',
  styleUrl: './movie-detail.component.css'
})
export class MovieDetailComponent implements OnInit {
  pelicula: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.cargarDetallesPelicula(id);
    })

  }

  cargarDetallesPelicula(id: string) {
    this.loading = true;
    this.movieService.getDetallesPelicula(id).subscribe({
      next: (data) => {
        this.pelicula = data;
        this.loading = false;
        console.log(this.pelicula)
      },
      error: (error) => {
        console.error('Error al cargar los detalles de la canción', error);
        this.loading = false;
      }
    })
  };

  getTrailerKey(videos: any[]): string {
    if (!videos || !videos.length) return '';

    // Buscamos primero un trailer oficial
    const trailer = videos.find(
      video => video.type === 'Trailer' &&
        video.site === 'YouTube' &&
        video.official === true
    );

    // Si no hay trailer oficial, buscamos cualquier trailer
    if (!trailer) {
      const anyTrailer = videos.find(
        video => video.type === 'Trailer' &&
          video.site === 'YouTube'
      );
      return anyTrailer ? anyTrailer.key : '';
    }
    console.log(trailer)
    return trailer.key;
  }

  getVideoUrl(key: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${key}`
    );
  }
}
