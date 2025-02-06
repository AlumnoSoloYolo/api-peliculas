import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValue } from '@angular/common';
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
        console.error('Error al cargar los detalles de las películas', error);
        this.loading = false;
      }
    })
  };

  getTrailerKey(videos: any[]): string {
    if (!videos || !videos.length) return '';


    const trailer = videos.find(
      video => video.type === 'Trailer' &&
        video.site === 'YouTube' &&
        video.official === true
    );


    if (!trailer) {
      const anyTrailer = videos.find(
        video => video.type === 'Trailer' &&
          video.site === 'YouTube'
      );
      return anyTrailer ? anyTrailer.key : '';
    }

    return trailer.key;
  }

  getVideoUrl(key: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${key}`
    );
  }



  getCast(): any[] {
    return this.pelicula?.credits?.cast || [];
  }


  getKeyCrewMembers() {
    if (!this.pelicula?.credits?.crew) return [];

    const keyRoles = {
      'Dirección': ['Director'],
      'Guion': ['Screenplay', 'Writer', 'Story'],
      'Producción': ['Producer', 'Executive Producer'],
      'Fotografía': ['Director of Photography', 'Cinematographer'],
      'Música': ['Music Director', 'Original Music Composer'],
      'Arte': ['Production Design', 'Art Direction'],
      'Sonido': ['Sound Director', 'Sound Designer'],
      'Vestuario': ['Costume Design'],
      'Montaje': ['Editor'],
    };

    return Object.entries(keyRoles).map(([department, roles]) => ({
      department,
      members: this.pelicula.credits.crew.filter((person: any) =>
        roles.includes(person.job)
      )
    })).filter(dept => dept.members.length > 0);
  }

  getDirector(): any {
    return this.pelicula?.credits?.crew.find((person: any) => person.job === 'Director');
  }

  scrollSection(sectionId: string, direction: 'left' | 'right') {
    const container = document.getElementById(sectionId);
    if (!container) return;

    const scrollContent = container.querySelector('.scroll-content') as HTMLElement;
    if (!scrollContent) return;

    const scrollAmount = 400; // Puedes ajustar este valor
    const currentScroll = scrollContent.scrollLeft;

    const newScroll = direction === 'right'
      ? currentScroll + scrollAmount
      : currentScroll - scrollAmount;

    scrollContent.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  }
}
