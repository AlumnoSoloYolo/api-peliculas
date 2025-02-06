import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  UntypedFormGroup
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MovieCardComponent } from '../movie-card/movie-card.component';

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


  searchForm: FormGroup = new FormGroup({
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
  }, { validators: SearchComponent.ratingRangeValidator });

  peliculas: any[] = [];
  generos: any[] = [];
  loading = false;
  totalResults = 0;
  currentPage = 1;
  submitted = false;
  showScrollTop = false;
  private hasMorePages = true;
  private isLoading = false;
  private scrollThreshold = 200;

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

  constructor(private movieService: MovieService) { }

  @HostListener('window:scroll')
  onWindowScroll() {
  
    // Verificar scroll para cargar más películas
    if (this.shouldLoadMore()) {
      this.loadMoreMovies();
    }
  }

  ngOnInit() {
    this.initForm();
    this.loadGenres();
    this.setupSearchSubscription();
    this.search();
  }

  private initForm() {
    this.searchForm = new FormGroup({
      query: new FormControl('', [
        Validators.minLength(2),
        Validators.maxLength(50)
      ]),
      year: new FormControl('', [
        Validators.min(1900),
        Validators.max(new Date().getFullYear() + 1)
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
    }, { validators: SearchComponent.ratingRangeValidator });
  }

  static ratingRangeValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const minRating = group.get('minRating')?.value;
    const maxRating = group.get('maxRating')?.value;

    if (minRating && maxRating && Number(minRating) > Number(maxRating)) {
      return { ratingRange: true };
    }
    return null;
  }

  private loadGenres() {
    this.movieService.getGeneros().subscribe({
      next: (response) => {
        this.generos = response.genres;
      },
      error: (error) => console.error('Error cargando géneros:', error)
    });
  }

  private setupSearchSubscription() {
    this.searchForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => {
        const prevWithoutPage = { ...prev, page: undefined };
        const currWithoutPage = { ...curr, page: undefined };
        return JSON.stringify(prevWithoutPage) === JSON.stringify(currWithoutPage);
      })
    ).subscribe(() => {
      if (this.searchForm.valid) {
        this.currentPage = 1;
        this.hasMorePages = true;
        this.search();
      }
    });
  }

  private shouldLoadMore(): boolean {
    if (this.isLoading || !this.hasMorePages) return false;

    const scrollPosition = window.pageYOffset + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    return (documentHeight - scrollPosition) < this.scrollThreshold;
  }

  private loadMoreMovies() {
    if (this.isLoading || !this.hasMorePages) return;

    this.isLoading = true;
    this.loading = true;
    this.currentPage++;

    const searchParams = this.prepareSearchParams();

    this.movieService.busquedaAvanzadaPeliculas(searchParams).subscribe({
      next: (response) => {
        if (response.results.length === 0) {
          this.hasMorePages = false;
        } else {
          this.peliculas = [...this.peliculas, ...response.results];
          this.totalResults = response.total_results;
        }
        this.loading = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando más películas:', error);
        this.loading = false;
        this.isLoading = false;
      }
    });
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  search() {
    this.submitted = true;
    if (this.searchForm.invalid) return;

    // Reiniciar estados
    this.currentPage = 1;
    this.hasMorePages = true;
    this.loading = true;
    const searchParams = this.prepareSearchParams();

    this.movieService.busquedaAvanzadaPeliculas(searchParams).subscribe({
      next: (response) => {
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

  clearFilters() {
    this.submitted = false;
    this.searchForm.reset({
      sortBy: 'popularity.desc'
    });
    this.currentPage = 1;
    this.hasMorePages = true;
    this.search();
  }

  private generateYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: currentYear - 1900 + 2 },
      (_, i) => currentYear + 1 - i
    );
  }

  private prepareSearchParams() {
    const formValue = this.searchForm.value;

    const searchParams: any = {
      page: this.currentPage,
      sortBy: formValue.sortBy || 'popularity.desc'
    };

    const trimmedQuery = formValue.query?.trim();
    if (trimmedQuery) {
      searchParams.query = trimmedQuery;
    }

    if (formValue.year) {
      searchParams.year = formValue.year;
    }

    const validGenres = formValue.genres?.filter((genre: number | null) => genre != null);
    if (validGenres && validGenres.length > 0) {
      searchParams.genreIds = validGenres;
    }

    if (formValue.minRating) {
      searchParams.minRating = formValue.minRating;
    }

    if (formValue.maxRating) {
      searchParams.maxRating = formValue.maxRating;
    }

    return searchParams;
  }

  getErrorMessage(controlName: string): string {
    const control = this.searchForm.get(controlName);

    if (control && control.errors) {
      if (control.errors['required']) {
        return 'Este campo es obligatorio';
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `Debe tener al menos ${requiredLength} caracteres`;
      }
      if (control.errors['maxlength']) {
        const requiredLength = control.errors['maxlength'].requiredLength;
        return `No debe exceder los ${requiredLength} caracteres`;
      }
      if (control.errors['pattern']) {
        return 'Formato de año inválido';
      }
      if (control.errors['min']) {
        const minValue = control.errors['min'].min;
        return `El valor mínimo es ${minValue}`;
      }
      if (control.errors['max']) {
        const maxValue = control.errors['max'].max;
        return `El valor máximo es ${maxValue}`;
      }
    }

    return '';
  }

  hasError(controlName: string): boolean {
    const control = this.searchForm.get(controlName);
    return !!(control && control.errors && (control.dirty || control.touched));
  }
}