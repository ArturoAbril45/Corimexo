# Corimexo — Sitio web y panel administrativo

Repositorio de respaldo completo del proyecto **Corimexo**: el sitio web público y el panel
administrativo de una empresa boliviana dedicada al diseño, fabricación y desarrollo integral
de mobiliario (más de 50 años de trayectoria, con proyectos residenciales, corporativos y
comerciales a nivel nacional).

Este repositorio se generó como respaldo íntegro del proyecto tal como existía en la máquina
local del autor, por lo que incluye absolutamente todos los archivos originales (código fuente,
dependencias instaladas, build de producción y datos de instalación), sin exclusiones.

## Tabla de contenidos

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Estructura general del repositorio](#estructura-general-del-repositorio)
3. [Requisitos previos](#requisitos-previos)
4. [Instalación — Backend](#instalación--backend)
5. [Instalación — Frontend](#instalación--frontend)
6. [Levantar el proyecto en modo desarrollo](#levantar-el-proyecto-en-modo-desarrollo)
7. [Compilar para producción](#compilar-para-producción)
8. [Configuración y variables relevantes](#configuración-y-variables-relevantes)
9. [Endpoints principales de la API](#endpoints-principales-de-la-api)
10. [Estructura de carpetas explicada](#estructura-de-carpetas-explicada)
11. [Aviso sobre credenciales incluidas en este respaldo](#aviso-sobre-credenciales-incluidas-en-este-respaldo)

## Descripción del proyecto

El proyecto está dividido en dos partes independientes que se comunican entre sí por HTTP:

- **`frontend/`**: una aplicación de una sola página (SPA) construida con **React 18** y
  **Vite 6**. Contiene el sitio público (inicio, catálogo de productos, detalle de producto,
  sección "Nosotros") y un panel administrativo protegido por login (resumen, chat en vivo con
  visitantes, gestión de productos y gestión de usuarios/agentes).
- **`backend/`**: una API en **PHP plano** (sin framework, sin Composer) que expone rutas en
  formato JSON para autenticación, chat, productos y usuarios, y que persiste los datos en
  **MySQL**.

Funcionalidades principales que ofrece el sistema:

- Catálogo público de productos (muebles) con imágenes, categoría, material y precio.
- Chat en vivo entre visitantes del sitio y agentes/administradores.
- Panel administrativo con autenticación por token:
  - Alta, edición, ocultamiento y eliminación de productos (con subida de hasta dos imágenes
    por producto).
  - Gestión de usuarios internos (roles `admin` y `agente`).
  - Bandeja de conversaciones de chat, con transferencia de conversaciones entre agentes.

## Estructura general del repositorio

```
Corimexo/
├── backend/     # API en PHP plano + MySQL
└── frontend/    # SPA en React + Vite
```

## Requisitos previos

Para levantar el proyecto localmente se necesita tener instalado:

- **PHP 7.4 o superior** (recomendado PHP 8.x), con la extensión **`pdo_mysql`** habilitada
  (el backend usa `PDO` para conectarse a la base de datos). No se usa Composer: el backend no
  tiene dependencias externas.
- **Servidor de base de datos MySQL o MariaDB** (el proyecto fue desarrollado contra MySQL,
  usando el charset `utf8mb4`).
- **Node.js 18 o superior y npm** (requerido por Vite 6 y React 18, usados en el frontend).
- **Git** para clonar el repositorio.

No se requiere Apache, Nginx ni ningún servidor web adicional para desarrollo local: el backend
se levanta con el servidor embebido de PHP (`php -S`).

## Instalación — Backend

1. Entrar a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Crear la base de datos y sus tablas ejecutando el script SQL de instalación
   (`install/schema.sql`) contra tu servidor MySQL/MariaDB. Por ejemplo, desde la línea de
   comandos de MySQL:
   ```bash
   mysql -u root -p < install/schema.sql
   ```
   Este script:
   - Crea la base de datos `corimexo` (si no existe) con charset `utf8mb4`.
   - Crea las tablas `usuarios`, `chat_conversaciones`, `chat_mensajes` y `productos`.
   - Inserta un usuario administrador de prueba (ver sección
     [Aviso sobre credenciales incluidas en este respaldo](#aviso-sobre-credenciales-incluidas-en-este-respaldo)).
3. (Opcional) Cargar productos de ejemplo ejecutando también:
   ```bash
   mysql -u root -p corimexo < install/seed_productos.sql
   ```
4. Revisar/ajustar los datos de conexión a la base de datos en
   `backend/config/database.php` (host, nombre de base de datos, usuario y contraseña) para que
   coincidan con tu entorno local. Este proyecto **no usa un archivo `.env`**: la configuración
   de conexión está escrita directamente en ese archivo PHP (ver detalle en la sección de
   [Configuración y variables relevantes](#configuración-y-variables-relevantes)).
5. Verificar que la carpeta `backend/uploads/` tenga permisos de escritura, ya que ahí se
   guardan las imágenes de productos que se suban desde el panel administrativo.

## Instalación — Frontend

1. Entrar a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instalar las dependencias de Node (esto reinstalará/actualizará la carpeta
   `node_modules`, que ya viene incluida en este respaldo):
   ```bash
   npm install
   ```
3. (Opcional) Si el backend va a correr en otro host/puerto distinto al de desarrollo
   (`http://127.0.0.1:8010`), ajustar el `target` del proxy en `frontend/vite.config.js`.

## Levantar el proyecto en modo desarrollo

Se necesitan **dos procesos corriendo en paralelo**, uno para el backend y otro para el
frontend:

**1. Backend** (desde la carpeta `backend/`), usando el servidor embebido de PHP con
`index.php` como router de todas las rutas:

```bash
php -S 127.0.0.1:8010 index.php
```

Esto deja la API disponible en `http://127.0.0.1:8010`.

**2. Frontend** (desde la carpeta `frontend/`):

```bash
npm run dev
```

Esto levanta Vite en `http://localhost:3010`. El archivo `vite.config.js` ya tiene configurado
un proxy para que cualquier petición que el frontend haga a `/backend/...` se reenvíe
automáticamente a `http://127.0.0.1:8010/...` (quitando el prefijo `/backend`), por lo que
ambos procesos deben estar corriendo al mismo tiempo para que la aplicación funcione
completa.

Luego, abrir `http://localhost:3010` en el navegador para ver el sitio público, y
`http://localhost:3010/login` para acceder al panel administrativo (con un usuario creado en la
base de datos, ver [Aviso sobre credenciales incluidas en este respaldo](#aviso-sobre-credenciales-incluidas-en-este-respaldo)).

## Compilar para producción

El build de producción solo aplica al **frontend** (el backend, al ser PHP plano, no requiere
paso de compilación, solo necesita un servidor con PHP y acceso a MySQL).

Desde `frontend/`:

```bash
npm run build
```

Esto genera la carpeta `frontend/dist/` con los archivos estáticos optimizados (HTML, JS y CSS)
listos para servir desde cualquier servidor web. Este respaldo ya incluye una build previa en
`frontend/dist/`.

Para previsualizar localmente el build de producción antes de desplegarlo:

```bash
npm run preview
```

Para un despliegue real:

- Publicar el contenido de `frontend/dist/` en el servidor web (Apache, Nginx, etc.).
- Publicar la carpeta `backend/` en un servidor con PHP y acceso a MySQL, asegurando que las
  rutas `/backend/...` lleguen a `backend/index.php` (por ejemplo, alojando el backend bajo una
  ruta `/backend` del mismo dominio, tal como asume `BASE = '/backend'` en
  `frontend/src/lib/api.js`, o bien ajustando esa constante si se usa otra ruta/dominio).
- Actualizar `backend/config/database.php` con las credenciales reales de la base de datos de
  producción.
- Revisar los encabezados CORS definidos en `backend/index.php`
  (`Access-Control-Allow-Origin: *`) y restringirlos según el dominio real en producción si se
  requiere mayor seguridad.

## Configuración y variables relevantes

Este proyecto **no utiliza archivos `.env`** en ninguna de sus dos partes (no existe
`.env.example` ni `.env` en el repositorio original). Toda la configuración relevante está
escrita directamente en el código fuente:

### Backend — `backend/config/database.php`

Este archivo define una función `getDB()` que crea la conexión PDO a MySQL con estos valores:

- `$host`: host del servidor de base de datos (por defecto `localhost`).
- `$db`: nombre de la base de datos a usar (por defecto `corimexo`, la misma que crea
  `install/schema.sql`).
- `$user`: usuario de MySQL con el que se conecta el backend (por defecto `root`).
- `$pass`: contraseña de ese usuario de MySQL (por defecto vacía, típico de un entorno XAMPP/
  WAMP/Laragon local).

Para un entorno distinto al de desarrollo original, estos cuatro valores deben editarse
directamente en ese archivo.

### Backend — CORS y cabeceras (`backend/index.php`)

El front-controller (`index.php`) define manualmente las cabeceras CORS
(`Access-Control-Allow-Origin`, `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`)
y el tipo de contenido de las respuestas (`application/json`). También es responsable de servir
manualmente los archivos de `backend/uploads/` (imágenes de productos), ya que el servidor
embebido de PHP no sirve archivos estáticos por sí solo cuando se le indica un script "router".

### Frontend — `frontend/vite.config.js`

- `server.port`: puerto en el que corre el servidor de desarrollo de Vite (**3010**).
- `server.proxy['/backend']`: redirige toda petición a `/backend/*` hacia
  `http://127.0.0.1:8010`, quitando el prefijo `/backend` antes de reenviarla. Debe apuntar al
  host/puerto real donde esté corriendo el backend.

### Frontend — `frontend/src/lib/api.js`

- `BASE`: constante fija con el valor `'/backend'`, usada como prefijo de todas las llamadas a
  la API desde el cliente. Si el backend se sirve desde otra ruta en producción, este valor debe
  actualizarse.
- El cliente usa `localStorage` para guardar el token de sesión del usuario logueado
  (`cxo_token`) y el token del visitante del chat (`cxo_visitor_token`), enviando el primero en
  la cabecera `X-Token` en cada petición autenticada.

## Endpoints principales de la API

Todas las rutas cuelgan de `/backend/<recurso>` y devuelven JSON. Resumen de los recursos
definidos en `backend/routes/`:

- **`auth.php`**
  - `POST /backend/auth/login` — inicia sesión con `email` y `password`, devuelve un token.
  - `GET /backend/auth/me` — devuelve el usuario autenticado (requiere cabecera `X-Token`).
  - `POST /backend/auth/logout` — invalida el token del usuario autenticado.
- **`productos.php`**
  - `GET /backend/productos` — lista pública de productos visibles (o todos con `?todos=1`
    para administradores).
  - `GET /backend/productos/{slug}` — detalle público de un producto.
  - `POST /backend/productos` — crea un producto (requiere autenticación, `multipart/form-data`
    con imágenes).
  - `POST /backend/productos/{id}?action=editar` — edita un producto existente.
  - `DELETE /backend/productos/{id}` — elimina un producto.
- **`usuarios.php`**
  - `GET /backend/usuarios` — lista de usuarios internos (requiere autenticación).
  - `POST /backend/usuarios` — crea un usuario/agente (requiere rol `admin`).
  - `POST /backend/usuarios/{id}?action=editar` — edita nombre, rol o contraseña.
  - `DELETE /backend/usuarios/{id}` — elimina un usuario (solo `admin`, no a sí mismo).
- **`chat.php`**
  - `POST /backend/chat/iniciar` — un visitante inicia o reanuda una conversación.
  - `GET /backend/chat/conversaciones` — lista de conversaciones (requiere autenticación).
  - `GET /backend/chat/conversaciones/{id}/mensajes` — mensajes de una conversación.
  - `POST /backend/chat/mensajes` — envía un mensaje (como visitante o como admin).
  - `POST /backend/chat/conversaciones/{id}/cerrar` — cierra una conversación.
  - `POST /backend/chat/conversaciones/{id}/transferir` — transfiere la conversación a otro
    agente.

## Estructura de carpetas explicada

```
backend/
├── index.php            # Front-controller: enruta /backend/<recurso> al archivo de rutas
│                         # correspondiente, maneja CORS y sirve las imágenes de uploads/
├── config/
│   └── database.php     # Conexión PDO a MySQL (host, base de datos, usuario, contraseña)
├── middleware/
│   └── auth.php         # requireAuth(): valida la cabecera X-Token contra la tabla usuarios
├── routes/
│   ├── auth.php          # Login / usuario actual / logout
│   ├── chat.php          # Conversaciones y mensajes de chat
│   ├── productos.php     # CRUD de productos (incluye subida de imágenes)
│   └── usuarios.php       # CRUD de usuarios/agentes
├── install/
│   ├── schema.sql        # Creación de la base de datos, tablas y usuario admin de prueba
│   └── seed_productos.sql # Datos de ejemplo para la tabla productos
└── uploads/              # Imágenes de productos subidas desde el panel (contenido dinámico)

frontend/
├── index.html            # HTML raíz de la SPA (monta <div id="root"> y carga src/main.jsx)
├── vite.config.js        # Configuración de Vite: puerto 3010 y proxy hacia el backend
├── package.json          # Scripts (dev/build/preview) y dependencias (React, Vite, etc.)
├── public/
│   └── assets/            # Archivos estáticos públicos (imágenes del catálogo, PDF, favicon)
├── dist/                  # Build de producción ya generado (HTML/JS/CSS optimizados)
└── src/
    ├── main.jsx            # Punto de entrada de React
    ├── App.jsx             # Definición de rutas (públicas, login y panel protegido)
    ├── style.css           # Estilos globales del sitio
    ├── context/
    │   └── AuthContext.jsx # Contexto de autenticación (usuario logueado, login/logout)
    ├── lib/
    │   └── api.js          # Cliente HTTP hacia el backend (fetch + manejo de token)
    ├── components/         # Header, Footer, ChatWidget, carruseles, iconos sociales, etc.
    └── pages/
        ├── Home.jsx           # Página de inicio
        ├── Productos.jsx      # Catálogo público de productos
        ├── ProductoDetalle.jsx# Detalle de un producto
        ├── Nosotros.jsx       # Página "Sobre Corimexo"
        ├── Login.jsx          # Formulario de acceso al panel
        └── panel/              # Páginas del panel administrativo protegido
            ├── Resumen.jsx
            ├── Chat.jsx
            ├── Productos.jsx
            └── Usuarios.jsx
```

## Aviso sobre credenciales incluidas en este respaldo

Este repositorio es un **respaldo íntegro** del proyecto tal como estaba en el equipo local, por
decisión explícita de su propietario, y por eso **no excluye ningún archivo** mediante
`.gitignore` (incluye `node_modules/`, el build `dist/`, y cualquier dato de instalación).

Se verificó específicamente que **no existen archivos `.env` ni `.env.example`** en el proyecto
(no hay secretos de ese tipo para resguardar). Sin embargo, sí se encontró lo siguiente, que
queda documentado aquí por transparencia:

- `backend/install/schema.sql` inserta un usuario administrador de prueba con correo
  `admin@corimexo.com` y deja comentada en el propio script la contraseña en texto plano que
  corresponde al hash insertado (`Corimexo2026`), pensada únicamente para desarrollo local.
- `backend/config/database.php` contiene credenciales de conexión a MySQL de desarrollo local
  (usuario `root` sin contraseña sobre `localhost`), no credenciales de un servidor en producción.

Dado que este repositorio es **público**, se recomienda **no reutilizar esa contraseña de
prueba ni esas credenciales de base de datos** en ningún entorno real, y rotarlas/cambiarlas
antes de usar este código como base de un despliegue en producción.
