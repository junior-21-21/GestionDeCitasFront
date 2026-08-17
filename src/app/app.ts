import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'] // ✅ corregido aquí
})
export class App {
  title = 'PetyZoos Frontend';

  constructor(private themeService: ThemeService) {
    // El servicio se inicializa automáticamente en su constructor (loadTheme)
  }
}
