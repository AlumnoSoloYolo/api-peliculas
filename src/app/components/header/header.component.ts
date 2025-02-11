import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  searchForm = new FormGroup({
    query: new FormControl('')
  });

  constructor(private router: Router, private authService: AuthService) { }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  buscar(): void {
    if (this.searchForm.value.query?.trim()) {
      this.router.navigate(['/search'], {
        queryParams: { query: this.searchForm.value.query }
      });
      this.searchForm.reset();
    }
  }

  getUserAvatarPath(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const avatar = user.avatar || 'avatar1';
    return `/avatares/${avatar}.gif`;
  }

  getUsername(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.username || 'Usuario';
  }

  logout() {
    this.authService.logout();
    // Redirigir al login
    this.router.navigate(['/login']);
  }
}