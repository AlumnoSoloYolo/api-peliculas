import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './shared/guards/auth.guard';
import { SearchComponent } from './components/search-films/search-films.component';
import { CreditDetailComponent } from './components/credit-detail/credit-detail.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "peliculas", component: SearchComponent },
    { path: 'pelicula/:id', component: MovieDetailComponent },
    { path: 'login', component: LoginComponent },
    { path: 'persona/:id', component: CreditDetailComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];
