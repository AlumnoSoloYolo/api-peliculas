import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MovieCardComponent } from '../movie-card/movie-card.component';

// Interfaz para tipar la respuesta de la API (opcional pero recomendado)
interface MovieResponse {
  results: any[];
  total_results: number;
  total_pages: number;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MovieCardComponent
  ],
  templateUrl: './search-films.component.html',
  styleUrls: ['./search-films.component.css']
})
export class SearchComponent implements OnInit {
  // Formulario reactivo con todas las validaciones necesarias
  searchForm = new FormGroup({
    query: new FormControl('', [
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    year: new FormControl('', [
      Validators.pattern(/^\d{4}$/),
      Validators.min(1900),
      Validators.max(new Date().getFullYear())
    ]),
    genres: new FormControl([]),
    sortBy: new FormControl('popularity.desc'),
    minRating: new FormControl('', [
      Validators.min(0),
      Validators.max(10)
    ]),
    maxRating: new FormControl('', [
      Validators.min(0),
      Validators.max(10)
    ])
  }, {
    validators: (control) => {
      const group = control as FormGroup;
      const min = group.get('minRating')?.value;
      const max = group.get('maxRating')?.value;
      return (min && max && Number(min) > Number(max)) ?
        { ratingRange: true } : null;
    }
  });

  // Variables para manejar el estado de los datos
  peliculas: any[] = [];
  generos: any[] = [];
  loading = false;
  currentPage = 1;
  hasMorePages = true;
  totalResults = 0;

  // Opciones para los selectores del formulario
  yearOptions = this.generateYearOptions();
  sortOptions = [
    { value: 'popularity.desc', label: 'Popularidad (Mayor a menor)' },
    { value: 'popularity.asc', label: 'Popularidad (Menor a mayor)' },
    { value: 'vote_average.desc', label: 'Valoración (Mayor a menor)' },
    { value: 'vote_average.asc', label: 'Valoración (Menor a mayor)' },
    { value: 'release_date.desc', label: 'Fecha (Más recientes)' },
    { value: 'release_date.asc', label: 'Fecha (Más antiguas)' },
    { value: 'title.asc', label: 'Título (A-Z)' },
    { value: 'title.desc', label: 'Título (Z-A)' }
  ];

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute
  ) { }

  // Getter para controlar la visibilidad del botón de scroll
  get showScrollTop(): boolean {
    return (document.documentElement.scrollTop || document.body.scrollTop) > 500;
  }

  ngOnInit() {
    this.loadMoreMovies();
    this.loadGenres();
    this.setupAutoSearch();
    this.handleUrlSearch();
  }

  // Event listener para el scroll
  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.loading &&
      this.hasMorePages &&
      this.isNearBottom()) {
      this.loadMoreMovies();
    }
  }

  // Carga inicial de géneros
  private loadGenres() {
    this.movieService.getGeneros().subscribe({
      next: (response) => this.generos = response.genres,
      error: (error) => console.error('Error cargando géneros:', error)
    });
  }

  // Configura la búsqueda automática con debounce
  private setupAutoSearch() {
    this.searchForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.searchForm.valid) {
        this.search();
      }
    });
  }

  // Maneja las búsquedas que vienen desde la URL
  private handleUrlSearch() {
    this.route.queryParams.subscribe(params => {
      if (params['query']) {
        this.searchForm.patchValue({ query: params['query'] });
        this.search();
      }
    });
  }

  // Verifica si estamos cerca del final de la página
  private isNearBottom(): boolean {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = 200;

    return (documentHeight - scrollPosition) < threshold;
  }

  // Realiza la búsqueda inicial
  search() {
    if (this.searchForm.invalid) return;

    this.loading = true;
    this.currentPage = 1;
    this.hasMorePages = true;
    this.peliculas = [];

    const searchParams = this.prepareSearchParams();

    this.movieService.busquedaAvanzadaPeliculas(searchParams).subscribe({
      next: (response: MovieResponse) => {
        this.peliculas = response.results;
        this.totalResults = response.total_results;
        this.hasMorePages = response.results.length > 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        this.peliculas = [];
        this.loading = false;
      }
    });
  }

  // Carga más películas para el scroll infinito
  private loadMoreMovies() {
    this.loading = true;
    this.currentPage++;

    const searchParams = this.prepareSearchParams();

    this.movieService.busquedaAvanzadaPeliculas(searchParams).subscribe({
      next: (response: MovieResponse) => {
        if (response.results.length === 0) {
          this.hasMorePages = false;
        } else {
          this.peliculas = [...this.peliculas, ...response.results];
          this.totalResults = response.total_results;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando más películas:', error);
        this.loading = false;
      }
    });
  }

  // Prepara los parámetros para la búsqueda
  private prepareSearchParams() {
    const formValue = this.searchForm.value;
    const searchParams: any = {
      page: this.currentPage,
      sortBy: formValue.sortBy || 'popularity.desc'
    };

    if (formValue.query?.trim()) {
      searchParams.query = formValue.query.trim();
    }

    if (formValue.year) {
      searchParams.year = formValue.year;
    }

    if (formValue.genres?.length) {
      searchParams.genreIds = formValue.genres.filter(Boolean);
    }

    if (formValue.minRating) {
      searchParams.minRating = formValue.minRating;
    }

    if (formValue.maxRating) {
      searchParams.maxRating = formValue.maxRating;
    }

    return searchParams;
  }

  // Maneja los errores del formulario
  getErrorMessage(controlName: string): string {
    const control = this.searchForm.get(controlName);
    if (!control?.errors) return '';

    // Manejamos cada tipo de error específicamente
    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['pattern']) {
      return 'Formato de año inválido';
    }
    if (control.errors['min']) {
      return `Valor mínimo: ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `Valor máximo: ${control.errors['max'].max}`;
    }

    return '';
  }

  // Verifica si un control tiene errores
  hasError(controlName: string): boolean {
    const control = this.searchForm.get(controlName);
    return !!(control && control.errors && (control.dirty || control.touched));
  }

  // Limpia todos los filtros
  clearFilters() {
    this.searchForm.reset({ sortBy: 'popularity.desc' });
    this.search();
  }

  // Método para volver arriba
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Genera las opciones de años para el selector
  private generateYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: currentYear - 1900 + 2 },
      (_, i) => currentYear + 1 - i
    );
  }
}