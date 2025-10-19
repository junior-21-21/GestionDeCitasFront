import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioDTO } from '../../models/usuario-dto.model';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.scss']
})
export class ConfiguracionComponent {
  vendedor: UsuarioDTO = {
    username: '',
    password: '',
    nombres: ''
  };

  mensaje = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

 registrarVendedor() {
   this.authService.registrarVendedor(this.vendedor).subscribe({
     next: () => {
       this.mensaje = 'Vendedor registrado exitosamente';
       this.error = '';
     },
     error: (err) => {
       console.error('Error backend:', err);
       if (err.error?.message) {
         this.error = err.error.message;
       } else if (typeof err.error === 'string') {
         this.error = err.error;
       } else {
         this.error = 'Error al registrar vendedor';
       }
       this.mensaje = '';
     }
   });
 }
}
