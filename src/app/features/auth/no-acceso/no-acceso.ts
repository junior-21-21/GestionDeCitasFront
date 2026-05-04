import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-no-acceso',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="no-acceso-container">
      <mat-card class="no-acceso-card">
        <mat-icon class="error-icon">lock</mat-icon>
        <mat-card-header style="justify-content: center; margin-bottom: 15px;">
          <mat-card-title style="font-size: 28px; font-weight: bold; color: #d32f2f;">
            Acceso Restringido
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p style="font-size: 16px; color: #555; margin-bottom: 10px; line-height: 1.5;">
            Lo sentimos, tu rol actual no cuenta con los permisos necesarios para visualizar este módulo.
          </p>
        </mat-card-content>
        <mat-card-actions style="justify-content: center;">
          <button mat-raised-button color="primary" class="volver-btn" routerLink="/home">
            <mat-icon style="margin-right: 5px;">arrow_back</mat-icon> 
            Volver al Inicio
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .no-acceso-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
    }
    .no-acceso-card {
      max-width: 450px;
      text-align: center;
      padding: 50px 30px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
    }
    .error-icon {
      font-size: 90px;
      height: 90px;
      width: 90px;
      color: #d32f2f;
      margin-bottom: 20px;
    }
    .volver-btn {
      margin-top: 25px;
      padding: 5px 25px;
      border-radius: 25px;
      font-size: 16px;
    }
  `]
})
export class NoAccesoComponent {}
