import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioService } from '../../services/inventario.service';
import { MovimientoInventarioResponseDTO } from '../../models/movimiento-inventario.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-estupefacientes',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './estupefacientes.html'
})
export class EstupefacientesComponent implements OnInit {
  movimientos: MovimientoInventarioResponseDTO[] = [];

  constructor(private inventarioService: InventarioService) {}

  ngOnInit() {
    this.cargarLibro();
  }

  cargarLibro() {
    this.inventarioService.obtenerLibroEstupefacientes().subscribe(data => {
      this.movimientos = data;
    });
  }

  imprimir() {
    window.print();
  }
}
