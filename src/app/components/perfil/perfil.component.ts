import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserMovieService } from '../../services/user.service';
import { MovieService } from '../../services/movie.service';
import { VotoColorPipe } from '../../shared/pipes/voto-color.pipe';
import { MovieCardComponent } from '../movie-card/movie-card.component';

interface UserProfile {
  username: string;
  email: string;
  avatar: string;
  createdAt: Date;
  pelisPendientes: Array<{ movieId: string, addedAt: Date }>;
  pelisVistas: Array<{ movieId: string, watchedAt: Date }>;
  reviews: Array<{
    movieId: string,
    rating: number,
    comment: string,
    createdAt: Date
  }>;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, VotoColorPipe, MovieCardComponent],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  userProfile: UserProfile | null = null;
  peliculasPendientes: any[] = [];
  peliculasVistas: any[] = [];

  constructor(
    private authService: AuthService,
    private userMovieService: UserMovieService,
    private movieService: MovieService
  ) { }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    console.log('Cargando perfil de usuario...');

    this.userMovieService.getUserProfile().subscribe({
      next: (userData) => {
        console.log('Datos recibidos del servidor:', userData);

        // Crear el objeto userProfile con los datos del servidor
        this.userProfile = {
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar || 'avatar1',
          createdAt: new Date(userData.createdAt),
          pelisPendientes: userData.pelisPendientes || [],
          pelisVistas: userData.pelisVistas || [],
          reviews: userData.reviews || []
        };

        console.log('UserProfile creado con datos del servidor:', this.userProfile);

        // Actualizar localStorage con los datos más recientes
        localStorage.setItem('user', JSON.stringify(userData));

        // Cargar los detalles de las películas si existen
        if (this.userProfile.pelisPendientes.length > 0) {
          console.log('Cargando detalles de películas pendientes...');
          this.loadPeliculasPendientes();
        } else {
          console.log('No hay películas pendientes para cargar');
        }

        if (this.userProfile.pelisVistas.length > 0) {
          console.log('Cargando detalles de películas vistas...');
          this.loadPeliculasVistas();
        } else {
          console.log('No hay películas vistas para cargar');
        }
      },
      error: (error) => {
        console.error('Error al cargar datos del servidor:', error);

        // Fallback a datos locales si hay error
        console.log('Intentando cargar datos desde localStorage...');
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Datos encontrados en localStorage:', parsedUser);

          this.userProfile = {
            username: parsedUser.username,
            email: parsedUser.email,
            avatar: parsedUser.avatar || 'avatar1',
            createdAt: parsedUser.createdAt ? new Date(parsedUser.createdAt) : new Date(),
            pelisPendientes: parsedUser.pelisPendientes || [],
            pelisVistas: parsedUser.pelisVistas || [],
            reviews: parsedUser.reviews || []
          };

          console.log('UserProfile creado desde localStorage:', this.userProfile);

          // Cargar los detalles de las películas si existen
          if (this.userProfile.pelisPendientes.length > 0) {
            console.log('Cargando detalles de películas pendientes desde localStorage...');
            this.loadPeliculasPendientes();
          }

          if (this.userProfile.pelisVistas.length > 0) {
            console.log('Cargando detalles de películas vistas desde localStorage...');
            this.loadPeliculasVistas();
          }
        } else {
          console.log('No se encontraron datos en localStorage');
        }
      }
    });
  }

  loadPeliculasPendientes() {
    console.log('Iniciando carga de películas pendientes');
    console.log('pelisPendientes actual:', this.userProfile?.pelisPendientes);

    this.peliculasPendientes = [];
    this.userProfile?.pelisPendientes.forEach(peli => {
      console.log('Intentando cargar película con ID:', peli.movieId);
      this.movieService.getDetallesPelicula(peli.movieId).subscribe({
        next: (movie) => {
          console.log('Detalles de película recibidos:', movie);
          this.peliculasPendientes.push(movie);
          console.log('Array peliculasPendientes actualizado:', this.peliculasPendientes);
        },
        error: (error) => {
          console.error('Error al cargar detalles de película pendiente:', error);
        }
      });
    });
  }

  loadPeliculasVistas() {
    // this.peliculasVistas = []; // Limpiar el array antes de cargar
    this.userProfile?.pelisVistas.forEach(peli => {
      this.movieService.getDetallesPelicula(peli.movieId).subscribe({
        next: (movie) => {
          this.peliculasVistas.push(movie);
        },
        error: (error) => {
          console.error('Error al cargar detalles de película vista:', error);
        }
      });
    });
  }

  getAvatarPath(): string {
    return `/avatares/${this.userProfile?.avatar}.gif`;
  }

  getPendientesCount(): number {
    return this.userProfile?.pelisPendientes.length || 0;
  }

  getVistasCount(): number {
    return this.userProfile?.pelisVistas.length || 0;
  }

  getReviewsCount(): number {
    return this.userProfile?.reviews.length || 0;
  }

  addToPendientes(movieId: string) {
    this.userMovieService.addPelisPendientes(movieId).subscribe({
      next: (response) => {
        if (this.userProfile) {
          this.userProfile.pelisPendientes.push({
            movieId: movieId,
            addedAt: new Date()
          });
          localStorage.setItem('user', JSON.stringify(this.userProfile));
          // Recargar los detalles de las películas
          this.loadPeliculasPendientes();
        }
      },
      error: (error) => {
        console.error('Error al añadir película pendiente:', error);
      }
    });
  }

  addToVistas(movieId: string) {
    this.userMovieService.addPelisVistas(movieId).subscribe({
      next: (response) => {
        if (this.userProfile) {
          this.userProfile.pelisVistas.push({
            movieId: movieId,
            watchedAt: new Date()
          });
          localStorage.setItem('user', JSON.stringify(this.userProfile));
          // Recargar los detalles de las películas
          this.loadPeliculasVistas();
        }
      },
      error: (error) => {
        console.error('Error al añadir película vista:', error);
      }
    });
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