// person-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { MovieCardComponent } from '../movie-card/movie-card.component';
 
@Component({
  selector: 'app-detail-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCardComponent],
  templateUrl: './credit-detail.component.html',
  styleUrl: './credit-detail.component.css'
})
export class CreditDetailComponent implements OnInit {
  person: any = {}
  loading = true;
  moviesByDepartment: { [key: string]: any[] } = {};

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.cargarDetallesPersona(id);
    });
  }

  cargarDetallesPersona(id: string) {

    this.movieService.getPersonaCreditos(id).subscribe({
      next: (data) => {
        this.person = data;
        this.organizarPeliculas();
        this.loading = false;
        console.log('Detalles de la persona:', this.person);
      },
      error: (error) => {
        console.error('Error al cargar los detalles de la persona', error);
      }
    });
  }

  organizarPeliculas() {
    if (!this.person?.movie_credits) return;

    // Conjunto para rastrear IDs únicos de películas
    const uniqueMovieIds = new Set<number>();

    // Función auxiliar para filtrar y ordenar películas
    const filterAndSortMovies = (movies: any[]) => {
      return movies
        .filter((movie: any) => {
          // Log para depuración
          if (uniqueMovieIds.has(movie.id)) {
            console.log('Película duplicada detectada:', movie.title, movie.id);
            return false;
          }
          uniqueMovieIds.add(movie.id);
          return true;
        })
        .sort((a: any, b: any) =>
          new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        );
    };

    // Procesar películas de cast
    if (this.person.movie_credits.cast?.length) {
      this.moviesByDepartment['Acting'] = filterAndSortMovies(
        this.person.movie_credits.cast
      );
    }

    // Procesar películas de crew
    if (this.person.movie_credits.crew?.length) {
      const crewMovies = filterAndSortMovies(this.person.movie_credits.crew);

      // Agrupar por departamento
      crewMovies.forEach((movie: any) => {
        if (!this.moviesByDepartment[movie.department]) {
          this.moviesByDepartment[movie.department] = [];
        }
        this.moviesByDepartment[movie.department].push(movie);
      });

      // Ordenar cada departamento por fecha
      Object.keys(this.moviesByDepartment).forEach(dept => {
        if (dept !== 'Acting') {
          this.moviesByDepartment[dept].sort(
            (a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
          );
        }
      });
    }

    // Log adicional para depuración
    console.log('Películas agrupadas por departamento:', this.moviesByDepartment);
  }

  getGender(gender: number): string {
    switch (gender) {
      case 1: return 'Mujer';
      case 2: return 'Hombre';
      case 3: return 'No binario';
      default: return 'No especificado';
    }
  }

  getAge(birthDate: string, deathDate?: string | null): number {
    const birth = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    const ageDifMs = end.getTime() - birth.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  scrollSection(sectionId: string, direction: 'left' | 'right') {
    const container = document.getElementById(sectionId);
    if (!container) return;

    const scrollContent = container.querySelector('.movie-scroll-content') as HTMLElement;
    if (!scrollContent) return;

    const itemWidth = scrollContent.querySelector('.movie-scroll-item')?.clientWidth || 200;
    const scrollAmount = itemWidth + 15; // 15px de gap
    const currentScrollPosition = parseInt(scrollContent.style.transform?.replace('translateX(', '')?.replace('px)', '') || '0');

    let newPosition;
    if (direction === 'right') {
      newPosition = currentScrollPosition - scrollAmount;
      // Comprobar si llegamos al final
      const maxScroll = -(scrollContent.scrollWidth - container.clientWidth);
      if (newPosition < maxScroll) {
        newPosition = maxScroll;
      }
    } else {
      newPosition = currentScrollPosition + scrollAmount;
      // No permitir scroll más allá del inicio
      if (newPosition > 0) {
        newPosition = 0;
      }
    }

    scrollContent.style.transform = `translateX(${newPosition}px)`;
  }


  getRoleClass(job: string): string {
    if (!job) return 'role-other';

    // Normalizar el trabajo a minúsculas para comparación
    const normalizedJob = job.toLowerCase();

    // Retornar diferentes clases según el rol
    if (normalizedJob.includes('director')) return 'role-director';
    if (normalizedJob.includes('producer')) return 'role-producer';
    if (normalizedJob.includes('writer')) return 'role-writer';
    if (normalizedJob.includes('editor')) return 'role-editor';
    if (normalizedJob.includes('cinematographer')) return 'role-cinematographer';
    if (normalizedJob.includes('composer')) return 'role-composer';

    // Clase por defecto
    return 'role-other';
  }
}