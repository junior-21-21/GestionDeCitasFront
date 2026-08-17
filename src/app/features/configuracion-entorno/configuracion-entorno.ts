import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ThemePalette, DEFAULT_THEME } from '../../services/theme.service';

@Component({
  selector: 'app-configuracion-entorno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-entorno.html',
  styleUrls: ['./configuracion-entorno.scss']
})
export class ConfiguracionEntornoComponent implements OnInit {
  currentTheme: ThemePalette;

  constructor(private themeService: ThemeService) {
    // Inicializar con la paleta actual para que los color pickers tengan los valores
    this.currentTheme = { ...DEFAULT_THEME }; 
  }

  ngOnInit(): void {
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = { ...theme };
    });
  }

  updateColor(key: keyof ThemePalette, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentTheme[key] = input.value;
    // Aplicar inmediatamente
    this.themeService.applyTheme(this.currentTheme);
  }

  resetToDefault(): void {
    this.themeService.resetTheme();
  }
}
