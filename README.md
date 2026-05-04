# 🐾 Sistema de Gestión Veterinaria - Frontend

> **Edición Premium** | Diseño Glassmorphism | Experiencia de Usuario Fluida

Este proyecto es una aplicación web moderna construida con **Angular**, diseñada para administrar integralmente una clínica veterinaria. Se distingue por su **interfaz visual de alto impacto**, seguridad robusta y flujos de trabajo optimizados para el personal médico y administrativo.

---
## ✨ Características Destacadas

### 🔐 1. Seguridad y Acceso

- **Login Glassmorphism**: Pantalla de acceso con diseño de cristal translúcido, gradientes dinámicos y validaciones en tiempo real.
- **Gestión de Sesión**: Autenticación segura vía JWT.
- **Control de Roles**: Interfaces adaptadas para Administradores 🛡️, Veterinarios 🩺 y Vendedores 🛒.

### 📅 2. Gestión de Citas (Agenda)

- **Calendario Visual**: Panel interactivo para visualizar la ocupación diaria (FullCalendar).
- **Control de Horarios**: Validación automática de horarios laborales (8:00 AM - 8:00 PM) y conflictos de citas.
- **Comprobantes PDF**: Generación y descarga automática de recordatorios de cita profesionales.
- **Reprogramación Inteligente**: Edición de citas con validación de disponibilidad en tiempo real.

### 🩺 3. Módulo Clínico (Consultas)

- **Historial Médico Centralizado**: Registro detallado de motivos, diagnósticos y tratamientos.
- **Búsqueda Rápida por DNI**: Localiza el historial completo de un cliente y sus mascotas escaneando o ingresando su DNI.
- **Integración con Farmacia**: Asocia medicamentos y dosis directamente desde la pantalla de consulta.

### 🛒 4. Punto de Venta (POS)

- **Facturación Flexible**: Emisión de **Boletas** y **Facturas** (con validación de RUC).
- **Carrito de Compras**: Interfaz ágil para agregar productos y servicios.
- **Control de Stock**: Verificación automática de existencias antes de la venta.

### 👥 5. Administración Integral

- **Usuarios**: Panel premium para crear, editar y gestionar accesos (incluyendo cambio de contraseñas).
- **Mascotas y Clientes**: Base de datos relacional con filtros avanzados por especie y propietario.
- **Veterinarios**: Gestión de especialidades y datos del personal.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: Angular 16+
- **Diseño**: SCSS (Sass) Avanzado, Bootstrap 5 (Personalizado)
- **Componentes UI**: SweetAlert2 (Alertas), FullCalendar (Agenda)
- **Arquitectura**: Basada en Servicios y Componentes Modulares

---

## 🚀 Instalación y Despliegue

1.  **Clonar el repositorio** (si aún no lo tienes):

    ```bash
    git clone <url-del-repo>
    ```

2.  **Instalar dependencias**:
    Asegurate de estar en la carpeta del proyecto y ejecuta:

    ```bash
    npm install
    ```

3.  **Iniciar Servidor de Desarrollo**:
    ```bash
    ng serve
    ```
    Visita `http://localhost:4200/` en tu navegador. ¡Disfruta de la experiencia!

---

Desarrollado con ❤️ para llevar la gestión veterinaria al siguiente nivel.
