import { RouterModule } from '@angular/router';
import { Component, Input } from '@angular/core';
import { VotoColorPipe } from '../../shared/pipes/voto-color.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-card',
  imports: [RouterModule, VotoColorPipe, CommonModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.css'
})
export class MovieCardComponent {
  @Input() movie: any;
}
