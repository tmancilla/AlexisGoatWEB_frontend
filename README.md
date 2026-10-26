# Guerra del Pacífico — Frontend

Estrategia naval por turnos para 2 jugadores. Mapa compartido de 10×10 casillas cubierto por niebla de guerra, recursos escasos (combustible, munición, chatarra), y combate táctico.

## Stack

- **React** (JavaScript, sin TypeScript) + **Vite**
- **React Router** para la navegación SPA
- **CSS modular, Flexbox y CSS Grid** sin recurrir a estilos inline o frameworks externos
- **ESLint** con las reglas que están en el repo del curso
- Datos reales desde el backend en Koa ([AlexisGoatWEB-Backend-S2-26-2](https://github.com/IIC2513/AlexisGoatWEB-Backend-S2-26-2)) mediante `fetch`


## Cómo levantar el proyecto en local

### Requisitos previos

- **Node.js** v22 o superior (se desarrolló con v24.14.0).
- **Git**.
- Si usas Windows: **WSL2** + **Windows Terminal** (Microsoft Store). El proyecto debe clonarse dentro del sistema de archivos de Linux (`/home/usuario/...`), no en `/mnt/c/...` , si no, no se detecta los cambios de archivo correctamente.

### Instalación

```bash
git clone https://github.com/IIC2513/AlexisGoatWEB-Frontend-S2-26-2.git
cd AlexisGoatWEB-Frontend-S2-26-2
npm install
```

`npm install` instala automáticamente todo lo que el proyecto necesita (React, Vite, React Router, ESLint, etc.) a partir de `package.json` / `package-lock.json`.

Después se crea el archivo de configuración local, que indica dónde está el backend:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000
```

### Levantar en modo desarrollo

El backend tiene que estar corriendo, con su base de datos creada y los datos de prueba cargados (ver el README del backend). Luego:

```bash
npm run dev
```

y entrar a `http://localhost:5173`.

### Otros comandos

```bash
npm run build     # compila la versión de producción en dist/
npm run preview   # sirve localmente esa versión de producción, para probarla antes de deployar
npm run lint      # corre ESLint sobre el proyecto
```

## Despliegue

URL de producción: https://guerradelpacificofront.netlify.app/

## Tablero Kanban

https://github.com/users/vvialbarros/projects/1/views/1

## Supuestos y decisiones técnicas

- Datos del backend: el registro, el inicio de sesión, el menú (crear partida, unirse por código y buscar rival), el despliegue y la partida consumen el backend. Lo único que queda en `src/mocks/` es `flota.js`, con las stats fijas de cada tipo de barco (nombre, letra y costos) que se usan para dibujar el tablero y resaltar los movimientos posibles.

- Datos para probar (después de `npm run db:reset` en el backend): usuarios `demo_*` con la contraseña `123456`; la partida en curso de `demo_karla` contra `demo_diego` se abre en `/tablero?partidaId=3`; el lobby `PRAT22` permite unirse por código con `demo_libre1`; el código de administrador para registrarse es el `CODIGO_ADMIN` del backend (por defecto `admin`).

- Estado local: las páginas interactivas (Login, Registro, Menú, Preparación y Partida) guardan sus propios datos con `useState`. La excepción es el usuario con sesión iniciada: vive en `App.jsx` porque lo necesitan varios componentes, y se les pasa por props (el Navbar recibe el usuario, y Login y Menú reciben las funciones para iniciar y cerrar sesión).

- Perspectiva del jugador: el despliegue usa la zona del `numeroJugador` que asigna el servidor (filas 1 a 4 para el jugador 1, 7 a 10 para el 2). En la pantalla de partida la niebla de guerra la calcula el servidor, que solo manda las casillas y los barcos enemigos dentro del radio de detección del jugador.

- Turnos: como en esta entrega no hay WebSocket, la pantalla de partida consulta el estado cada 2 segundos. Así, cuando el rival termina su turno, la pantalla se actualiza sola y el jugador puede mover. Los botones "Terminar turno" y "Abandonar" usan los endpoints del backend.

- Vistas internas en el Menú: Crear partida, unirse por código y buscar partida son vistas dentro de `/menu` (controladas con estado) y no rutas separadas, porque son pasos de un mismo proceso y comparten los datos de la partida.

- Navbar siempre visible: Durante el despliegue y la partida se ocultan los links que sacarían al jugador del juego. Para salir, dentro de la partida, se debe usar el botón "Abandonar".

- Alcance: en el tablero está implementada la acción Mover, junto con terminar turno y abandonar. Disparar, Vigía y Mejorar quedan definidas en el protocolo para entregas siguientes.