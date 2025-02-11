// app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MovieDetailComponent } from './components/movie-detail/movie-detail.component';
import { SearchComponent } from './components/search-films/search-films.component';
import { CreditDetailComponent } from './components/credit-detail/credit-detail.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { NoAuthGuard } from './shared/guards/auth.guard';
import { PerfilComponent } from './components/perfil/perfil.component';

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "registro",
        component: RegisterComponent,
        // canActivate: [NoAuthGuard]
    },
    {
        path: "login",
        component: LoginComponent,
        // canActivate: [NoAuthGuard]
    },
    {
        path: "perfil",
        component: PerfilComponent,
        canActivate: [AuthGuard]
    },
    {
        path: "peliculas",
        component: SearchComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'pelicula/:id',
        component: MovieDetailComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'persona/:id',
        component: CreditDetailComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'search',
        component: SearchComponent,
        canActivate: [AuthGuard]
    },
    {
        path: '**',
        redirectTo: 'registro'
    }
];