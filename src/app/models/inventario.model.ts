// ─────────────────────────────────────────────────────────────────────────────
// Modelos tipados para el módulo de Inventario
// Alineados con las entidades normalizadas del backend (Spring Boot)
// ─────────────────────────────────────────────────────────────────────────────

// ── Enums ──────────────────────────────────────────────────────────────────

export type TipoSalida = 'VENTA' | 'CONSUMO_INTERNO';
export type TipoOperacion = 'INGRESO' | 'EGRESO' | 'MERMA';
export type TipoDocumento = 'DNI' | 'RUC';
export type TipoVacuna = 'OBLIGATORIA' | 'OPCIONAL' | 'REFUERZO';
export type UnidadMedida = 'TABLETA' | 'CAPSULA' | 'ML' | 'MG' | 'AMPOLLA' | 'JERINGA' | 'FRASCO' | 'SOBRE' | 'UNIDAD' | 'OTRO';

// ── Categoria ─────────────────────────────────────────────────────────────

export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion?: string;
}

// ── Proveedor ─────────────────────────────────────────────────────────────

export interface Proveedor {
  ruc: string;
  nombre: string;
  telefono?: string;
  correo?: string;
  calle?: string;
  numero?: string;
  distrito?: string;
  provincia?: string;
}

// ── Producto ──────────────────────────────────────────────────────────────

export interface Producto {
  codigoBarras: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  precioCompra: number;
  precioVenta: number;
  requiereReceta: boolean;
  isControlado: boolean;
  unidadMedida: UnidadMedida;
  categoria: Categoria;
}

// ── Lote ──────────────────────────────────────────────────────────────────

export interface Lote {
  idLote: number;
  numeroLote: string;
  fechaVencimiento: string; // ISO: YYYY-MM-DD
  stockLote: number;
  activo: boolean;          // false = vencido o agotado
  producto: Producto;
}

// ── Kardex ────────────────────────────────────────────────────────────────

export interface KardexEntry {
  idKardex: number;
  fechaHora: string; // ISO datetime
  tipoOperacion: TipoOperacion;
  detalle?: string;
  cantidad: number;
  saldoResultante: number;
  producto: Producto;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
  };
}

// ── Cliente ───────────────────────────────────────────────────────────────

export interface Cliente {
  dni: string;
  tipoDocumento?: TipoDocumento;
  razonSocial?: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  calle?: string;
  numero?: string;
  distrito?: string;
  provincia?: string;
  telefonos?: { numero: string; tipo: string }[];
  email?: string;
  puntosFidelidad?: number;
}

// ── VeterinarioExterno (nuevo — normalizado) ──────────────────────────────

export interface VeterinarioExterno {
  id: number;
  nombre: string;
  numeroColegiatura: string;
}

// ── Receta ────────────────────────────────────────────────────────────────

export interface Receta {
  idReceta: number;
  esInterna: boolean;
  consulta?: {
    codigoConsulta: string;
  };
  veterinarioExterno?: VeterinarioExterno;
}

// ── DetalleSalida ─────────────────────────────────────────────────────────

export interface DetalleSalida {
  idDetalleS: number;
  cantidad: number;
  precioVenta: number;
  producto: Producto;
  lote?: Lote;
}

// ── Salida ────────────────────────────────────────────────────────────────

export interface Salida {
  idSalida: number;
  fechaSalida: string; // ISO: YYYY-MM-DD
  tipoSalida: TipoSalida;
  totalMonetario: number;
  descuentoAplicado?: number;
  puntosGanados?: number;
  puntosUtilizados?: number;
  cliente?: Cliente;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  detalles: DetalleSalida[];
}

// ── DTOs de Request ───────────────────────────────────────────────────────

export interface DetalleSalidaRequest {
  codigoBarras: string;
  cantidad: number;
  precioVenta: number;
  /** Solo para productos que requieren receta interna */
  codigoConsulta?: string;
  /** Solo para receta externa */
  nombreVeterinario?: string;
  numeroColegiatura?: string;
}

export interface SalidaRequest {
  tipoSalida: string; // 'Venta' | 'Consumo Interno' (el backend lo traduce al enum)
  dniCliente?: string;
  idUsuario: number;
  detalles: DetalleSalidaRequest[];
  puntosUtilizados?: number;
  descuentoAplicado?: number;
}

// ── Compra ────────────────────────────────────────────────────────────────

export interface DetalleCompraRequest {
  codigoBarras: string;
  envases: number;
  factorConversion: number;
  precioUnitario: number;
  numeroLote: string;
  fechaVencimiento: string; // ISO: YYYY-MM-DD
}

export interface CompraRequest {
  fechaEmision: string;
  numeroFactura: string;
  rucProveedor: string;
  idUsuario: number;
  detalles: DetalleCompraRequest[];
}

export interface Compra {
  idCompra: number;
  fechaEmision: string;
  numeroFactura: string;
  total: number;
  proveedor: Proveedor;
  detalles: {
    idDetalleC: number;
    cantidad: number;
    precioUnitario: number;
    numeroLote?: string;
    fechaVencimiento?: string;
    envases?: number;
    factorConversion?: number;
    producto: Producto;
  }[];
}

// ── Vacuna (nuevo esquema normalizado ManyToMany) ─────────────────────────

export interface Especie {
  id: number;
  nombre: string;
}

export interface Vacuna {
  id: number;
  nombre: string;
  fabricante?: string;
  tipo?: TipoVacuna;
  descripcion?: string;
  periodicidadMeses?: number;
  /** Lista de especies a las que aplica (nuevo — reemplaza especieDestino String) */
  especies: Especie[];
  activa: boolean;
}

export interface VacunaRequest {
  nombre: string;
  fabricante?: string;
  tipo?: TipoVacuna;
  descripcion?: string;
  periodicidadMeses?: number;
  /** IDs de las especies a las que aplica */
  especieIds: number[];
}
