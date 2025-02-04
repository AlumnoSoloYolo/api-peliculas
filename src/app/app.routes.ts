import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MoviesComponent } from './components/movies/movies.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './shared/guards/auth.guard';
import { SearchComponent } from './components/search-films/search-films.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "peliculas", component: SearchComponent },
    { path: 'pelicula/:id', component: MovieDetailComponent },
    { path: 'login', component: LoginComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
