import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { GenreUtilsService } from '../../../services/genre-utils.service';
import { VotoColorPipe } from '../../shared/pipes/voto-color.pipe';
import { MovieCardComponent } from '../movie-card/movie-card.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule, VotoColorPipe, MovieCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  peliculasPopulares: any[] = [];
  peliculasMasValoradas: any[] = [];
  peliculasCineAhora: any[] = [];
  peliculasEstreno: any[] = [];
  peliculasTendencia: any[] = [];
  generos: any[] = []


  constructor(private movieService: MovieService,
    private genreUtils: GenreUtilsService
  ) { }

  ngOnInit() {
    this.populares();
    this.masValoradas();
    this.cineAhora();
    this.proximosEstrenos();
    this.tendenciasSemanales();
    this.listarGeneros();
  }

  populares() {
    this.movieService.getPeliculasPopulares()
      .subscribe({
        next: (response) => {
          this.peliculasPopulares = response.results.slice(0, 5);
          console.log(this.peliculasPopulares);
        },
        error: (error) => {
          console.error('Error al consultar películas populares:', error);
        }
      });
  }

  masValoradas() {
    this.movieService.getPeliculasMasValoradas()
      .subscribe({
        next: (response) => {
          this.peliculasMasValoradas = response.results.slice(0, 10);
          console.log(this.peliculasMasValoradas);
        },
        error: (error) => {
          console.error('Error al consultar las peliculas más valoradas:', error);
        }
      });
  }

  cineAhora() {
    this.movieService.getPeliculasCineAhora()
      .subscribe({
        next: (response) => {
          this.peliculasCineAhora = response.results;
          console.log(this.peliculasCineAhora);
        },
        error: (error) => {
          console.error('Error al cargar las películas actuales en cine', error);
        }
      });
  }

  proximosEstrenos() {
    this.movieService.getProximosEstrenos()
      .subscribe({
        next: (response) => {
          // Filter movies with release date in 2025 or later
          this.peliculasEstreno = response.results.filter((pelicula: any) => {
            const releaseYear = new Date(pelicula.release_date).getFullYear();
            return releaseYear >= 2025;
          });
          console.log(this.peliculasEstreno);
        },
        error: (error) => {
          console.error('Error al cargar los próximos estrenos', error);
        }
      });
  }

  tendenciasSemanales() {
    this.movieService.getTendenciasSemanales()
      .subscribe({
        next: (response) => {
          this.peliculasTendencia = response.results;
          console.log(this.peliculasTendencia);
        },
        error: (error) => {
          console.error('Error al cargar las tendencias semanales', error);
        }
      });
  }

  listarGeneros() {
    this.movieService.getGeneros().subscribe({
      next: (response) => {
        console.log('Respuesta completa de géneros:', response);
        if (response && response.genres) {
          this.generos = response.genres;
          console.log('Géneros asignados:', this.generos);
        } else {
          console.error('Formato de respuesta incorrecto:', response);
        }
      },
      error: (error) => {
        console.error('Error al cargar géneros:', error);
      }
    });
  }

  getNombreGeneros(genreIds: number[]): string[] {
    return this.genreUtils.getnombreGeneros(genreIds);
  }

  getVotoColor(rating: number): string {
    const ratingNormalizado = Math.min(Math.max(rating, 0), 10);

    if (ratingNormalizado <= 5) {
      // De 0 a 5: Rojo a Amarillo
      const rojo = Math.round(255);
      const verde = Math.round(255 * (ratingNormalizado / 5));
      return `rgb(${rojo}, ${verde}, 0)`;
    } else {
      // De 5 a 10: Amarillo a Verde
      const rojo = Math.round(255 * (1 - (ratingNormalizado - 5) / 5));
      const verde = Math.round(255);
      return `rgb(${rojo}, ${verde}, 0)`;
    }
  }

  scrollSection(sectionId: string, direction: 'left' | 'right') {
    const container = document.getElementById(sectionId);
    if (!container) return;

    const scrollContent = container.querySelector('.movie-scroll-content') as HTMLElement;
    if (!scrollContent) return;

    const itemWidth = scrollContent.querySelector('.movie-scroll-item')?.clientWidth || 300;
    const scrollAmount = itemWidth;
    const currentScroll = scrollContent.scrollLeft;
    const totalWidth = scrollContent.scrollWidth;
    const visibleWidth = scrollContent.clientWidth;

    let newScroll = direction === 'right'
      ? currentScroll + scrollAmount
      : currentScroll - scrollAmount;

    if (direction === 'right' && newScroll + visibleWidth > totalWidth) {
      scrollContent.style.scrollBehavior = 'auto';
      scrollContent.scrollLeft = newScroll - totalWidth / 2;
      setTimeout(() => {
        scrollContent.style.scrollBehavior = 'smooth';
        scrollContent.scrollLeft = newScroll - visibleWidth;
      }, 0);
    } else if (direction === 'left' && newScroll < 0) {
      scrollContent.style.scrollBehavior = 'auto';
      scrollContent.scrollLeft = newScroll + totalWidth / 2;
      setTimeout(() => {
        scrollContent.style.scrollBehavior = 'smooth';
        scrollContent.scrollLeft = newScroll + visibleWidth;
      }, 0);
    } else {
      scrollContent.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  }
}
