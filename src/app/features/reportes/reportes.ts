import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss']
})
export class ReportesComponent implements OnInit {

  public totalVentas: number = 0;
  
  public fechaInicio: string = '';
  public fechaFin: string = '';

  // Chart configuration for Sales
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [{ data: [], label: 'Ventas (S/.)' }],
    labels: []
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  public lineChartType: ChartType = 'line';

  // Chart configuration for Top Products
  public barChartData: ChartConfiguration['data'] = {
    datasets: [{ data: [], label: 'Cantidad Vendida' }],
    labels: []
  };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  public barChartType: ChartType = 'bar';

  // Chart configuration for Animal Species
  public pieChartData: ChartConfiguration['data'] = {
    datasets: [{ data: [] }],
    labels: []
  };
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };
  public pieChartType: ChartType = 'pie';

  constructor(private reporteService: ReporteService) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.fechaFin = today.toISOString().split('T')[0];
    this.fechaInicio = firstDay.toISOString().split('T')[0];

    this.cargarDatosGenerales();
    this.cargarVentasPorFecha();
  }

  cargarDatosGenerales() {
    this.reporteService.getTotalVentas().subscribe(total => {
      this.totalVentas = total || 0;
    });

    this.reporteService.getProductosMasVendidos().subscribe(data => {
      const labels = data.slice(0, 5).map(item => item.producto);
      const values = data.slice(0, 5).map(item => item.cantidad);
      this.barChartData = {
        labels: labels,
        datasets: [{ data: values, label: 'Top 5 Productos Vendidos', backgroundColor: '#3f51b5' }]
      };
    });

    this.reporteService.getEspeciesMasAtendidas().subscribe(data => {
      const labels = data.map(item => item.especie);
      const values = data.map(item => item.cantidad);
      this.pieChartData = {
        labels: labels,
        datasets: [{ data: values, backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0'] }]
      };
    });
  }

  cargarVentasPorFecha() {
    if (!this.fechaInicio || !this.fechaFin) return;
    
    this.reporteService.getVentasPorFecha(this.fechaInicio, this.fechaFin).subscribe(ventas => {
      const labels: string[] = [];
      const data: number[] = [];
      
      const salesMap = new Map<string, number>();
      
      ventas.forEach(v => {
        const fechaStr = Array.isArray(v.fecha) ? v.fecha.join('-') : v.fecha;
        const current = salesMap.get(fechaStr) || 0;
        salesMap.set(fechaStr, current + v.total);
      });

      const sortedDates = Array.from(salesMap.keys()).sort();
      sortedDates.forEach(date => {
        labels.push(date);
        data.push(salesMap.get(date)!);
      });

      this.lineChartData = {
        labels: labels,
        datasets: [{ data: data, label: 'Ventas x Día (S/.)', borderColor: '#4bc0c0', fill: false }]
      };
    });
  }
}
