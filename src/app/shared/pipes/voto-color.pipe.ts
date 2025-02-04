import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'votoColor',
  standalone: true
})
export class VotoColorPipe implements PipeTransform {
  transform(rating: number): string {
    const ratingNormalizado = Math.min(Math.max(rating, 0), 10);

    if (ratingNormalizado <= 5) {
      const rojo = Math.round(255);
      const verde = Math.round(255 * (ratingNormalizado / 5));
      return `rgb(${rojo}, ${verde}, 0)`;
    } else {
      const rojo = Math.round(255 * (1 - (ratingNormalizado - 5) / 5));
      const verde = Math.round(255);
      return `rgb(${rojo}, ${verde}, 0)`;
    }
  }
}