import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders }
  from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environments';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private baseUrl = 'https://api.themoviedb.org/3';
  private headers = new HttpHeaders().set('Authorization', `Bearer ${environment.tmdbToken}`)
    .set('accept', 'application/json')


  constructor(private http: HttpClient) { }


  getPeliculasPopulares(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/popular`, { headers: this.headers })
  };

  getPeliculasMasValoradas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/top_rated`, { headers: this.headers })
  };

  getProximosEstrenos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/upcoming`, { headers: this.headers })
  };

  getPeliculasCineAhora(): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/now_playing`, { headers: this.headers })
  };

  getTendenciasSemanales(): Observable<any> {
    return this.http.get(`${this.baseUrl}/trending/movie/week`, {
      headers: this.headers
    });
  }


  getGeneros(): Observable<any> {
    return this.http.get(`${this.baseUrl}/genre/movie/list`, {
      headers: this.headers
    });
  }


  getDetallesPelicula(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/movie/${id}`, {
      headers: this.headers,
      params: {
        append_to_response: 'credits,similar,reviews,actors,videos'
      }
    });
  };

  getPersonaCreditos(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/person/${id}`, {
      headers: this.headers,
      params: {
        append_to_response: 'movie_credits,images'
      }
    });
  }


  busquedaAvanzadaPeliculas(params: {
    query?: string,
    year?: number,
    genreIds?: number[],
    sortBy?: string,
    minRating?: number,
    maxRating?: number,
    page?: number
  }): Observable<any> {
    const searchParams: any = {
      include_adult: false,
      page: params.page || 1
    };

    const endpoint = '/discover/movie';

    if (params.query) {
      searchParams.with_text_query = params.query;
    }

    if (params.year) {
      searchParams.primary_release_year = params.year;
    }

    if (params.genreIds && params.genreIds.length > 0) {
      searchParams.with_genres = params.genreIds.join(',');
    }

    if (params.sortBy) {
      searchParams.sort_by = params.sortBy;
    }

    if (params.minRating !== undefined) {
      searchParams['vote_average.gte'] = params.minRating;
    }

    if (params.maxRating !== undefined) {
      searchParams['vote_average.lte'] = params.maxRating;
    }

    return this.http.get(`${this.baseUrl}${endpoint}`, {
      headers: this.headers,
      params: searchParams
    });
  }

}
