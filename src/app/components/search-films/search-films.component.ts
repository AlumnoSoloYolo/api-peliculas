import { Component, OnInit } from '@angular/core';
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
  searchForm: UntypedFormGroup = new FormGroup({
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

  // Opciones de año y ordenamiento más limpias
  yearOptions = this.generateYearOptions();
  sortOptions = [
    { value: 'popularity.desc', label: 'Popularidad (Mayor a menor)' },
    { value: 'popularity.asc', label: 'Popularidad (Menor a mayor)' },
    { value: 'vote_average.desc', label: 'Valoración (Mayor a menor)' },
    { value: 'vote_average.asc', label: 'Valoración (Menor a mayor)' },
    { value: 'release_date.desc', label: 'Fecha (Más recientes)' },
    { value: 'release_date.asc', label: 'Fecha (Más antiguas)' }
  ];

  constructor(private movieService: MovieService) { }

  ngOnInit() {
    this.initForm();
    this.loadGenres();
    this.setupSearchSubscription();
    this.search(); // Búsqueda inicial
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

  // Validador estático para el rango de calificación
  static ratingRangeValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const minRating = group.get('minRating')?.value;
    const maxRating = group.get('maxRating')?.value;

    if (minRating && maxRating && Number(minRating) > Number(maxRating)) {
      return { ratingRange: true };  // Retorna un error cuando el mínimo es mayor que el máximo
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
        // Ignorar cambios en página
        const prevWithoutPage = { ...prev, page: undefined };
        const currWithoutPage = { ...curr, page: undefined };
        return JSON.stringify(prevWithoutPage) === JSON.stringify(currWithoutPage);
      })
    ).subscribe(() => {
      if (this.searchForm.valid) {
        this.currentPage = 1;
        this.search();
      }
    });
  }

  search() {
    this.submitted = true;  // Establece como true cuando se hace el envío
    if (this.searchForm.invalid) return;

    this.loading = true;
    const searchParams = this.prepareSearchParams();

    this.movieService.busquedaAvanzadaPeliculas(searchParams).subscribe({
      next: (response) => {
        this.peliculas = response.results;
        this.totalResults = response.total_results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en la búsqueda:', error);
        this.peliculas = [];
        this.loading = false;
      }
    });
  }


  private prepareSearchParams() {
    const formValue = this.searchForm.value;

    // Objeto base de parámetros siempre incluye la página y el ordenamiento
    const searchParams: any = {
      page: this.currentPage,
      sortBy: formValue.sortBy || 'popularity.desc'
    };

    // Manejar query de título de manera más robusta
    const trimmedQuery = formValue.query?.trim();
    if (trimmedQuery) {
      // Si hay query, usar endpoint de búsqueda
      searchParams.query = trimmedQuery;
    }

    // Resto de filtros se añaden independientemente de la query
    if (formValue.year) {
      searchParams.year = formValue.year;
    }

    const validGenres = formValue.genres?.filter((genre: number | null) => genre != null);
    if (validGenres && validGenres.length > 0) {
      searchParams.genreIds = validGenres;
    }

    // Filtros de calificación
    if (formValue.minRating) {
      searchParams.minRating = formValue.minRating;
    }

    if (formValue.maxRating) {
      searchParams.maxRating = formValue.maxRating;
    }

    return searchParams;
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.search();
  }

  clearFilters() {
    this.submitted = false;
    this.searchForm.reset({
      sortBy: 'popularity.desc'
    });
    this.search();
  }

  // Método para generar opciones de año
  private generateYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: currentYear - 1900 + 2 },
      (_, i) => currentYear + 1 - i
    );
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
  // Método para verificar si un control tiene error
  hasError(controlName: string): boolean {
    const control = this.searchForm.get(controlName);
    return !!(control && control.errors && (control.dirty || control.touched));
  }



}

