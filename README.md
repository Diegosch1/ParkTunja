# ParkTunja

## Introducción

ParkTunja es un sistema diseñado para la gestión eficiente de estacionamientos, permitiendo a los administradores y usuarios gestionar espacios, usuarios y notificaciones de manera sencilla y efectiva.

## Requisitos del Sistema

### Requisitos de Hardware

- Procesador: Cualquier procesador moderno.
- Memoria RAM: 4 GB o más.
- Almacenamiento: 500 MB de espacio libre.

### Requisitos de Software

- Navegador recomendado: Google Chrome, Mozilla Firefox.
- Node.js y npm instalados.
- Base de datos MongoDB.

## Instalación

### Servidor

1. Clonar el repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```
2. Navegar a la carpeta del servidor:
   ```bash
   cd server
   ```
3. Instalar dependencias:
   ```bash
   npm install
   ```
4. Configurar el archivo `.env` con las variables necesarias (por ejemplo, conexión a MongoDB).
5. Iniciar el servidor:
   ```bash
   npm run dev
   ```

### Cliente

1. Navegar a la carpeta del cliente:
   ```bash
   cd client
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Iniciar el cliente:
   ```bash
   npm run dev
   ```

## Funcionalidades Principales

### Gestión de Estacionamientos

- **Crear un estacionamiento**:
  - Ruta: `/parking` (POST).
  - Campos requeridos: `name`, `location`, `totalCapacity`, `notificationThreshold`.
- **Actualizar un estacionamiento**:
  - Ruta: `/parking/:id` (PUT).
  - Campos requeridos y cómo editarlos.
- **Eliminar un estacionamiento**:
  - Ruta: `/parking/:id` (DELETE).
- **Consultar estacionamientos**:
  - Ruta: `/parking` (GET) para todos.
  - Ruta: `/parking/:id` (GET) para uno específico.

### Autenticación

- **Inicio de sesión**:
  - Ruta: `/login` (POST).
  - Campos requeridos: `email`, `password`.
- **Cerrar sesión**:
  - Ruta: `/logout` (POST).
- **Verificar token**:
  - Ruta: `/verify` (GET).

### Gestión de Usuarios (Admin)

- **Registrar usuarios**:
  - Ruta: `/register` (POST).
  - Campos requeridos: `name`, `email`, `password`, etc.
- **Consultar usuarios**:
  - Ruta: `/getAllUsers` (GET).
- **Actualizar usuarios**:
  - Ruta: `/updateUser/:id` (PUT).
- **Eliminar usuarios**:
  - Ruta: `/deleteUser/:id` (DELETE).

## Interfaz de Usuario

### Páginas Principales

- **Landing Page**:
  - Descripción de la página de inicio.
  - Elementos principales (botones, imágenes, etc.).
- **Login Page**:
  - Cómo iniciar sesión.
  - Mensajes de error comunes.
- **Dashboard**:
  - Funcionalidades disponibles para el usuario (gestión de estacionamientos, usuarios, etc.).

## Resolución de Problemas Comunes

- **Error de conexión a la base de datos**:
  - Verificar las credenciales en el archivo `.env`.
- **No carga la página**:
  - Asegurarse de que el servidor y el cliente estén corriendo.
- **Errores de validación**:
  - Revisar los campos requeridos en los formularios.
