import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ThemePalette {
  primary: string;
  primaryLight: string;
  accent: string;
  bg: string;
  text: string;
  textMuted: string;
}

export const DEFAULT_THEME: ThemePalette = {
  primary: '#0A3641',       // Logo: Deep Navy Blue
  primaryLight: '#E6EFF2',  // Very light tint of primary for backgrounds
  accent: '#00A896',        // Logo: Teal (Dog face)
  bg: '#F8FAFC',            // Clean light slate
  text: '#0A3641',          // Match primary
  textMuted: '#475569'      // Slate 600
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<ThemePalette>(DEFAULT_THEME);
  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadTheme();
  }

  loadTheme(): void {
    const savedTheme = localStorage.getItem('petyzoos_theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        this.applyTheme(parsed, false);
      } catch (e) {
        this.applyTheme(DEFAULT_THEME, false);
      }
    } else {
      this.applyTheme(DEFAULT_THEME, false);
    }
  }

  applyTheme(theme: ThemePalette, save: boolean = true): void {
    this.themeSubject.next(theme);
    
    // Set CSS variables on the root document
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-primary-light', theme.primaryLight);
    document.documentElement.style.setProperty('--color-accent', theme.accent);
    document.documentElement.style.setProperty('--color-bg', theme.bg);
    document.documentElement.style.setProperty('--color-text', theme.text);
    document.documentElement.style.setProperty('--color-text-muted', theme.textMuted);

    if (save) {
      localStorage.setItem('petyzoos_theme', JSON.stringify(theme));
    }
  }

  resetTheme(): void {
    this.applyTheme(DEFAULT_THEME, true);
  }
}
