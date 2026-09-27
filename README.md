# Guerra del Pacífico — Frontend

Estrategia naval por turnos para 2 jugadores. Mapa compartido de 10×10 casillas cubierto por niebla de guerra, recursos escasos (combustible, munición, chatarra), y combate táctico.

## Stack

- **React** (JavaScript, sin TypeScript) + **Vite**
- **React Router** para la navegación SPA
- **CSS modular, Flexbox y CSS Grid** sin recurrir a estilos inline o frameworks externos
- **ESLint** con las reglas que están en el repo del curso
- Datos mock simulando el backend


## Cómo levantar el proyecto en local

### Requisitos previos

- **Node.js** v22 o superior (se desarrolló con v24.14.0). Recomendado instalarlo vía [nvm](https://github.com/nvm-sh/nvm) para poder fijar la versión exacta.
- **Git**.
- Si usas Windows: **WSL2** + **Windows Terminal** (Microsoft Store). El proyecto debe clonarse dentro del sistema de archivos de Linux (`/home/usuario/...`), no en `/mnt/c/...` , si no, no se detecta los cambios de archivo correctamente.

### Instalación

```bash
git clone https://github.com/IIC2513/AlexisGoatWEB-Frontend-S2-26-2.git
cd AlexisGoatWEB-Frontend-S2-26-2
npm install
```

`npm install` instala automáticamente todo lo que el proyecto necesita (React, Vite, React Router, ESLint, etc.) a partir de `package.json` / `package-lock.json`.

### Levantar en modo desarrollo

```bash
npm run dev
```

### Otros comandos

```bash
npm run build     # compila la versión de producción en dist/
npm run preview   # sirve localmente esa versión de producción, para probarla antes de deployar
npm run lint      # corre ESLint sobre el proyecto
```

## Despliegue

URL de producción: PENDIENTE

## Tablero Kanban

https://github.com/users/vvialbarros/projects/1/views/1?filterQuery=assignee%3Atmancilla

## Supuestos y decisiones técnicas

- Datos mock: como todavía no hay backend, los datos mocks estan en src/mocks/ y siguen la estructura definida en el protocolo json, para que conectar el servidor después no cambie la forma de los datos.

- Datos para probar: usuarios `jugador1`  y `admin` ; password= `1234`; código de administrador para registrarse: `admin`; código de invitación  para unirse a una partida: `I-1`.

- Estado local: las páginas interactivas (Login, Registro, Menú, Preparación y Partida) guardan sus propios datos con `useState`. La excepción es el usuario con sesión iniciada: vive en `App.jsx` porque lo necesitan varios componentes, y se les pasa por props (el Navbar recibe el usuario, y Login y Menú reciben las funciones para iniciar y cerrar sesión).

- Perspectiva única: el usuario siempre juega como jugador 1 (zona de despliegue en las filas 1 a 4), y la niebla de guerra viene fija desde el mock, sin recalcularse al mover los barcos

- Durante el turno del rival en realidad no se hace nada, es solo para simular el cambio e turno.

- Vistas internas en el Menú: Crear partida, unirse por código y buscar partida son vistas dentro de `/menu` (controladas con estado) y no rutas separadas, porque son pasos de un mismo proceso y comparten los datos de la partida.

- Navbar siempre visible: Durante el despliegue y la partida se ocultan los links que sacarían al jugador del juego. Para salir, dentro de la partida, se debería usar el botón "Abandonar".

- Alcance: en el tablero está implementada la acción Mover. Disparar, Vigía y Mejorar quedan definidas en el protocolo para entregas siguientes.