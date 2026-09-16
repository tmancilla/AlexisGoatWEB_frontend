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

## Uso de Inteligencia Artificial

Se utilizó Claude (Anthropic) como asistente durante el desarrollo, principalmente para:

- Configuración inicial del entorno de desarrollo (Node, Vite, React Router, ESLint) y resolución de problemas de WSL/permisos durante el setup.
- Diseñar nuestras ideas para los mockups de landing page, registro de usuario y pantallas de juego.
- Apoyo para que la pagina sea responsiva
