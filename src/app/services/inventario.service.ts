import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Categoria,
  Proveedor,
  Producto,
  Lote,
  KardexEntry,
  Cliente,
  Salida,
  SalidaRequest,
  Compra,
  CompraRequest,
  Vacuna,
  VacunaRequest,
  Especie
} from '../models/inventario.model';

/**
 * URL base del backend de Inventarios.
 * En desarrollo apunta al backend local en http://localhost:8080/api.
 * En producción usa el proxy Nginx /api.
 */
const API = environment.inventarioApiUrl;

// ─────────────────────────────────────────────────────────
// SERVICIOS DEL SISTEMA DE INVENTARIOS UNIFICADOS
// ─────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DashboardInventarioService {
  private http = inject(HttpClient);
  getDashboard(): Observable<any> { return this.http.get(`${API}/inventario/dashboard`); }
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  listar(): Observable<Categoria[]>                         { return this.http.get<Categoria[]>(`${API}/categorias`); }
  crear(cat: Partial<Categoria>): Observable<Categoria>     { return this.http.post<Categoria>(`${API}/categorias`, cat); }
  actualizar(id: number, cat: Partial<Categoria>): Observable<Categoria>
                                                            { return this.http.put<Categoria>(`${API}/categorias/${id}`, cat); }
  eliminar(id: number): Observable<void>                    { return this.http.delete<void>(`${API}/categorias/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private http = inject(HttpClient);
  listar(): Observable<Proveedor[]>                            { return this.http.get<Proveedor[]>(`${API}/proveedores`); }
  crear(prov: Proveedor): Observable<Proveedor>                { return this.http.post<Proveedor>(`${API}/proveedores`, prov); }
  actualizar(ruc: string, prov: Proveedor): Observable<Proveedor>
                                                               { return this.http.put<Proveedor>(`${API}/proveedores/${ruc}`, prov); }
  eliminar(ruc: string): Observable<void>                      { return this.http.delete<void>(`${API}/proveedores/${ruc}`); }
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  listar(): Observable<Producto[]>                             { return this.http.get<Producto[]>(`${API}/productos`); }
  obtener(codigo: string): Observable<Producto>                { return this.http.get<Producto>(`${API}/productos/${codigo}`); }
  stockCritico(): Observable<Producto[]>                       { return this.http.get<Producto[]>(`${API}/productos/stock-critico`); }
  buscar(nombre: string): Observable<Producto[]>               { return this.http.get<Producto[]>(`${API}/productos/buscar?nombre=${nombre}`); }
  porCategoria(idCategoria: number): Observable<Producto[]>    { return this.http.get<Producto[]>(`${API}/productos/categoria/${idCategoria}`); }
  verificarCodigo(codigo: string): Observable<{ existe: boolean }>
                                                               { return this.http.get<{ existe: boolean }>(`${API}/productos/verificar-codigo/${codigo}`); }
  crear(prod: Partial<Producto>): Observable<Producto>         { return this.http.post<Producto>(`${API}/productos`, prod); }
  actualizar(codigo: string, prod: Partial<Producto>): Observable<Producto>
                                                               { return this.http.put<Producto>(`${API}/productos/${codigo}`, prod); }
  eliminar(codigo: string): Observable<void>                   { return this.http.delete<void>(`${API}/productos/${codigo}`); }
}

@Injectable({ providedIn: 'root' })
export class CompraService {
  private http = inject(HttpClient);
  listar(): Observable<Compra[]>                      { return this.http.get<Compra[]>(`${API}/compras`); }
  registrar(compra: CompraRequest): Observable<Compra> { return this.http.post<Compra>(`${API}/compras`, compra); }
}

@Injectable({ providedIn: 'root' })
export class SalidaService {
  private http = inject(HttpClient);
  listar(): Observable<Salida[]>                        { return this.http.get<Salida[]>(`${API}/salidas`); }
  registrar(salida: SalidaRequest): Observable<Salida>  { return this.http.post<Salida>(`${API}/salidas`, salida); }
}

@Injectable({ providedIn: 'root' })
export class KardexService {
  private http = inject(HttpClient);
  listar(): Observable<KardexEntry[]>                                                         { return this.http.get<KardexEntry[]>(`${API}/kardex`); }
  porProducto(codigo: string): Observable<KardexEntry[]>                                      { return this.http.get<KardexEntry[]>(`${API}/kardex/producto/${codigo}`); }
  filtrar(desde?: string, hasta?: string, producto?: string): Observable<KardexEntry[]> {
    const params: string[] = [];
    if (desde)    params.push(`desde=${desde}`);
    if (hasta)    params.push(`hasta=${hasta}`);
    if (producto) params.push(`producto=${producto}`);
    const query = params.length > 0 ? '?' + params.join('&') : '';
    return this.http.get<KardexEntry[]>(`${API}/kardex/filtrar${query}`);
  }
}

@Injectable({ providedIn: 'root' })
export class LoteService {
  private http = inject(HttpClient);
  listar(): Observable<Lote[]>                     { return this.http.get<Lote[]>(`${API}/lotes`); }
  porProducto(codigo: string): Observable<Lote[]>  { return this.http.get<Lote[]>(`${API}/lotes/producto/${codigo}`); }
  eliminar(id: number): Observable<void>            { return this.http.delete<void>(`${API}/lotes/${id}`); }

  porVencer(dias: number = 30): Observable<Lote[]> { return this.http.get<Lote[]>(`${API}/lotes/por-vencer?dias=${dias}`); }
  vencidos(): Observable<Lote[]>                   { return this.http.get<Lote[]>(`${API}/lotes/vencidos`); }
  desactivarVencidos(): Observable<any>            { return this.http.post<any>(`${API}/lotes/desactivar-vencidos`, {}); }
  deadStock(dias: number = 90): Observable<Lote[]> { return this.http.get<Lote[]>(`${API}/lotes/dead-stock?dias=${dias}`); }
  trazabilidad(id: number): Observable<any>        { return this.http.get<any>(`${API}/lotes/${id}/trazabilidad`); }
  trazabilidadPorSalida(idSalida: number): Observable<any[]> { return this.http.get<any[]>(`${API}/lotes/salida/${idSalida}/trazabilidad`); }
  dashboardLotes(): Observable<any>                { return this.http.get<any>(`${API}/lotes/dashboard-lotes`); }
}

/**
 * ClienteService — CRUD de clientes del sistema de inventario (POS).
 * Apunta al backend de inventarios para manejar clientes del POS.
 */
@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  listar(): Observable<Cliente[]>                            { return this.http.get<Cliente[]>(`${API}/clientes`); }
  obtener(dni: string): Observable<Cliente>                  { return this.http.get<Cliente>(`${API}/clientes/${dni}`); }
  crear(cli: Partial<Cliente>): Observable<Cliente>          { return this.http.post<Cliente>(`${API}/clientes`, cli); }
  actualizar(dni: string, cli: Partial<Cliente>): Observable<Cliente>
                                                             { return this.http.put<Cliente>(`${API}/clientes/${dni}`, cli); }
  eliminar(dni: string): Observable<void>                    { return this.http.delete<void>(`${API}/clientes/${dni}`); }
}

/**
 * VacunaService — CRUD de vacunas con soporte al nuevo esquema ManyToMany
 * (especieIds en lugar del antiguo especieDestino String).
 */
@Injectable({ providedIn: 'root' })
export class VacunaInventarioService {
  private http = inject(HttpClient);
  listarTodas(): Observable<Vacuna[]>                        { return this.http.get<Vacuna[]>(`${API}/vacunas`); }
  listarActivas(): Observable<Vacuna[]>                      { return this.http.get<Vacuna[]>(`${API}/vacunas/activas`); }
  listarPorEspecie(especieId: number): Observable<Vacuna[]>  { return this.http.get<Vacuna[]>(`${API}/vacunas/por-especie/${especieId}`); }
  obtener(id: number): Observable<Vacuna>                    { return this.http.get<Vacuna>(`${API}/vacunas/${id}`); }
  crear(dto: VacunaRequest): Observable<Vacuna>              { return this.http.post<Vacuna>(`${API}/vacunas`, dto); }
  actualizar(id: number, dto: VacunaRequest): Observable<Vacuna>
                                                             { return this.http.put<Vacuna>(`${API}/vacunas/${id}`, dto); }
  cambiarEstado(id: number, activa: boolean): Observable<void>
                                                             { return this.http.put<void>(`${API}/vacunas/${id}/estado?activa=${activa}`, {}); }
}

/**
 * EspecieService — Consulta de especies para formularios de vacunas.
 */
@Injectable({ providedIn: 'root' })
export class EspecieService {
  private http = inject(HttpClient);
  listar(): Observable<Especie[]> { return this.http.get<Especie[]>(`${API}/especies`); }
}

/**
 * InventarioService — Servicio para el módulo de Estupefacientes de PetyZoos.
 * Apunta al backend PRINCIPAL de PetyZoos (no al de inventario).
 */
@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);

  obtenerLibroEstupefacientes(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/estupefacientes/libro`);
  }
}
