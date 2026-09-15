# Protocolo de Comunicación Cliente-Servidor


## 1. Decisiones de diseño


* El servidor arma dos objetos distintos, uno por jugador. Lo que un jugador no puede ver no existe en el mensaje.

* En la entrega 1 se enviaba las tres acciones del turno juntas. Se cambió a 1 mensaje por accion

## 2. REST + WebSocket

REST (HTTP): Se usa para registro, login, crear/unirse/buscar partida, consultar estado, y todas las acciones dentro de una partida activa (desplegar flota, jugar un turno, terminar turno, abandonar).

WebSocket: Se usa exclusivamente para dos mensajes: `CONECTAR` (cliente -> servidor, autentica el socket y lo asocia a la partida) y `ESTADO_PARTIDA` (servidor -> cliente, se reenvía a ambos jugadores cada vez que una acción REST cambia el estado).

Todas las peticiones REST autenticadas incluyen la cabecera:
```http
Authorization: Bearer <token>
```

## 3. Objeto Estado de Partida
Representa una partida activa desde el punto de vista de un jugador: todo lo que ese jugador no puede ver está ausente del mensaje. Es el `contenido` del mensaje `ESTADO_PARTIDA` (punto 5.2) y también lo que devuelve `GET /games/:id` (punto 4.6).

```json
{
  "tipo": "ESTADO_PARTIDA",
  "contenido": {
    "partidaId": "p-1",
    "estado": "EN_CURSO",
    "ronda": 4,
    "rondaMaxima": 20,
    "jugadorActivo": 1,
    "turnoExpiraEn": "2026-...",
    "eventoRonda": {
      "carta": "TORMENTA",
      "efecto": "Radio de detección -1 esta ronda"
    },

    "yo": {
      "jugadorId": 1,
      "username": "jugador1",
      "conectado": true,
      "recursos": { "combustible": 12, "municion": 8, "chatarra": 3 },
      "accionesRestantes": 2,
      "accionesPorBarco": { "b-1": 1, "b-2": 0, "b-3": 0, "b-4": 0 },
      "flota": [
        {
          "barcoId": "b-1",
          "tipo": "DESTRUCTOR",
          "casilla": { "x": 7, "y": 6 },
          "casco": 2,
          "cascoMaximo": 3,
          "movimiento": 2,
          "alcance": 4,
          "deteccion": 2,
          "dado": "d8",
          "mejoras": ["BLINDAJE"],
          "aFlote": true
        }
      ]
    },

    "rival": {
      "jugadorId": 2,
      "username": "jugador2",
      "conectado": true,
      "segundosParaAbandono": null,
      "barcosAFlote": 3
    },

    "casillasVisibles": [
      { "x": 5, "y": 6, "tipo": "POZO_PETROLERO", "ocupadaPor": null },
      { "x": 6, "y": 5, "tipo": "CORRIENTE_PELIGROSA", "reveladaEnRonda": 3 },
      { "x": 8, "y": 9, "tipo": "AGUA_ABIERTA" }
    ],

    "contactosEnemigos": [
      {
        "barcoId": "e-3",
        "tipo": "FRAGATA",
        "casilla": { "x": 8, "y": 5 },
        "casco": 1,
        "aFlote": true,
        "visible": true
      },
      {
        "barcoId": "e-1",
        "tipo": "LANCHA",
        "casilla": { "x": 4, "y": 7 },
        "casco": null,
        "aFlote": true,
        "visible": false,
        "vistoEnRonda": 2
      }
    ],

    "resultadoFinal": null
  }
}
```

`rival.segundosParaAbandono` solo tiene valor cuando `rival.conectado` es `false`. Si llega a 0 sin que el rival se reconecte, el servidor declara la partida terminada automáticamente: mismo efecto que si el rival hubiera llamado `POST /games/:id/abandonar` (punto 4.10), `estado: "TERMINADA"`, `resultadoFinal.motivo: "ABANDONO"`, `ganador` el jugador que quedó conectado, y retransmite el `ESTADO_PARTIDA` final a quien sigue conectado.

`resultadoFinal` es `null` mientras la partida no termina. Cuando `estado` pasa a `TERMINADA`, contiene el desglose de puntajes:

```json
"resultadoFinal": {
  "motivo": "LIMITE_RONDAS",
  "ganador": 1,
  "puntajes": {
    "1": {
      "total": 38,
      "detalle": {
        "barcosAFlote": 15,
        "cascoRestante": 6,
        "enemigosHundidos": 10,
        "casillasRecurso": 3,
        "mejoras": 4
      }
    },
    "2": {
      "total": 21,
      "detalle": {
        "barcosAFlote": 10,
        "cascoRestante": 3,
        "enemigosHundidos": 0,
        "casillasRecurso": 6,
        "mejoras": 2
      }
    }
  }
}
```

`motivo` puede ser: `FLOTA_DESTRUIDA` o `LIMITE_RONDAS` o `ABANDONO` o `EMPATE`

### 3.1 Valores posibles

| Campo | Valores |
|---|---|
| `estado` | `ESPERANDO_JUGADOR` , `LISTO_PARA_INICIAR` , `DESPLIEGUE` , `EN_CURSO` , `TERMINADA` |
| `eventoRonda.carta` | `TORMENTA` , `BOTIN_FLOTANTE` , `SABOTAJE` , `MAREA_ALTA` |
| `casillasVisibles[].tipo` | `AGUA_ABIERTA` , `POZO_PETROLERO` , `DEPOSITO_MUNICION` , `NAUFRAGIO` , `CORRIENTE_PELIGROSA` , `CHATARRA` |
| `flota[].tipo` | `LANCHA` , `FRAGATA` , `DESTRUCTOR` , `ACORAZADO` |
| `flota[].mejoras[]` | `BLINDAJE` , `MOTORES` , `ARTILLERIA` , `RADAR` |

### 3.2 Reglas de filtrado

| Campo | Qué se envía |
|---|---|
| `yo.flota` | Info de tu flota completa siempre. Un barco hundido **no se borra** del array: se queda con `aFlote: false`, `casco: 0` y su última `casilla`, para poder pintar el marcador de hundido |
| `yo.recursos` | Info completa de tus recursos siempre |
| `rival.recursos` | Nunca se envía. Solo `barcosAFlote` |
| `casillasVisibles` | Solo las que están dentro del radio de detección de algún barco propio |
| Corrientes peligrosas | Solo las que este jugador ya sufrió o descubrió con el Vigía |
| `contactosEnemigos[].casco` | El valor real si el barco está dentro del radio, `null` si no |
| `contactosEnemigos[].visible` | `false` indica contacto perdido: última posición conocida más la ronda en que se vio |
| `contactosEnemigos[].aFlote` | Igual que `yo.flota.aFlote`: cuando se hunde, no se borra del array, queda con `aFlote: false`, `casco: 0` y `visible: true` en su casilla final |

## 4. Endpoints REST

### 4.1 POST /auth/register: crear usuario

**Request**

```json
{
  "username": "jugador1",
  "email": "jugador@uc.cl",
  "password": "1234",
  "role": "Jugador"
}
```

`role` puede ser `Jugador` o `Administrador`. Si `role` es `Administrador`, el request debe incluir además `codigoAdmin`, validado por el servidor antes de crear la cuenta.

**Response `201 Created`**

```json
{
  "usuario": {
    "id": 1,
    "username": "jugador1",
    "email": "jugador@uc.cl",
    "role": "Jugador"
  },
  "token": "..."
}
```

**Errores**

| Codigo | `error` 
|---|---
| `400` | `EMAIL_INVALIDO`
| `400` | `CONTRASEÑA_DEBIL` 
| `409` | `EMAIL_YA_REGISTRADO`
| `403` | `CODIGO_ADMIN_INVALIDO`


### 4.2 POST /auth/login : autenticar sesion

**Request**

```json
{
  "username": "jugador1",
  "password": "1234"
}
```

**Response `200 OK`**, mismo cuerpo que el registro.

**Errores**

| Código | `error`
|---|---
| `401` | `CREDENCIALES_INVALIDAS`
| `403` | `USUARIO_BLOQUEADO` 


### 4.3 POST /games : crear partida

**Request:** cuerpo vacío. El dueño se identifica por el token.

**Response `201 Created`**

```json
{
  "partidaId": "p-1",
  "codigoInvitacion": "I-1",
  "estado": "ESPERANDO_JUGADOR",
  "dueno": { "id": 1, "username": "jugador1" },
  "expiraEn": "2026-..."
}
```

`expiraEn` marca los 5 minutos tras los cuales un lobby sin invitado se cierra automáticamente.

`codigoInvitacion` solo sirve para `POST /games/:codigo/join` (4.4), es lo único que se le comparte al invitado. `partidaId` es el identificador real de la partida y es lo que se usa en todos los demás endpoints (4.6 a 4.10) y en el WebSocket (`CONECTAR`, punto 5.1).

**Errores**

| Código | `error` 
|---|---
| `401` | `TOKEN_INVALIDO`


### 4.4 POST /games/:codigo/join : unirse por código

**Response `200 OK`**

```json
{
  "partidaId": "p-1",
  "estado": "LISTO_PARA_INICIAR",
  "jugadores": [
    { "id": 1, "username": "jugador1", "rolPartida": "DUENO" },
    { "id": 2, "username": "jugador2", "rolPartida": "INVITADO" }
  ]
}
```
Existe el role fuera de la partida: Jugador o Administrador; y el rolPartida dentro de la partida: Dueño o Invitado

**Errores**

| Código | `error` 
|---|---
| `401` | `TOKEN_INVALIDO`
| `404` | `CODIGO_INVALIDO` 
| `409` | `PARTIDA_LLENA`
| `410` | `LOBBY_EXPIRADO`
| `409` | `YA_ESTAS_EN_PARTIDA` 


### 4.5 POST /games/matchmaking : emparejamiento automático

**Response `200 OK`**, se encontró rival:

```json
{
  "partidaId": "p-1",
  "estado": "DESPLIEGUE",
  "oponente": { "id": 2, "username": "jugador2" }
}
```

**Response `202 Accepted`**, queda en cola

```json
{
  "estado": "BUSCANDO",
  "posicionEnCola": 1
}
```

En las partidas por emparejamiento no hay lobby ni roles de dueño/invitado. Ambos jugadores entran directo a la fase de despliegue.

**Errores**

| Código | `error` 
|---|---
| `401` | `TOKEN_INVALIDO`


### 4.6 GET /games/:id  consultar estado

**Response `200 OK`**

Devuelve el Objeto Estado de Partida (ver en punto 3) ya filtrado para el jugador del token. Se usa al recargar la página, para reconstruir la vista antes de abrir el WebSocket.

**Errores**

| Código | `error` 
|---|---
| `401` | `TOKEN_INVALIDO`
| `403` | `NO_PERTENECES_A_LA_PARTIDA` 
| `404` | `PARTIDA_NO_EXISTE` 


### 4.7 POST /games/:id/desplegar : desplegar flota (fase de preparación)

**Request**

```json
{
  "barcos": [
    { "tipo": "LANCHA",     "casilla": { "x": 2, "y": 1 } },
    { "tipo": "FRAGATA",    "casilla": { "x": 3, "y": 2 } },
    { "tipo": "DESTRUCTOR", "casilla": { "x": 1, "y": 3 } },
    { "tipo": "ACORAZADO",  "casilla": { "x": 4, "y": 1 } }
  ]
}
```

**Validaciones:** exactamente cuatro barcos, uno de cada tipo, en casillas distintas, todas dentro de la zona de despliegue propia (filas 1–4 para el jugador 1, filas 7–10 para el jugador 2).

Si un jugador no despliega dentro de 2 minutos, el servidor le asigna posiciones válidas al azar y lo marca como listo.

**Response `200 OK`**: cuerpo vacío. El servidor retransmite el `ESTADO_PARTIDA` actualizado a ambos jugadores por WebSocket (ver punto 5). Cuando los dos terminan de desplegar, ese mismo mensaje trae `estado: "EN_CURSO"`.

**Errores:** ver punto 6. Principalmente `DESPLIEGUE_INVALIDO`.


### 4.8 POST /games/:id/acciones : jugar una acción del turno

Una acción por request. `tipoAccion` puede ser: `MOVER` o `DISPARAR` o `VIGIA` o `MEJORAR`.

**Mover**

```json
{
  "tipoAccion": "MOVER",
  "barcoId": "b-1",
  "casillaDestino": { "x": 5, "y": 4 }
}
```

**Disparar**

```json
{
  "tipoAccion": "DISPARAR",
  "barcoId": "b-2",
  "casillaObjetivo": { "x": 6, "y": 4 }
}
```

**Vigía**

```json
{
  "tipoAccion": "VIGIA",
  "barcoId": "b-3",
  "centroZona": { "x": 7, "y": 5 }
}
```

**Mejorar**

```json
{
  "tipoAccion": "MEJORAR",
  "barcoId": "b-4",
  "mejora": "BLINDAJE"
}
```

`mejora` puede ser: `BLINDAJE` (3 chatarra, +1 casco) o `MOTORES` (2, +1 movimiento) o `ARTILLERIA` (3, +1 alcance) o `RADAR` (2, +1 detección).

**Response `200 OK`** : Por ejemplo:

Movimiento detenido por una corriente peligrosa:

```json
{
  "tipoAccion": "MOVER",
  "barcoId": "b-1",
  "resultado": {
    "casillaFinal": { "x": 6, "y": 5 },
    "casillasRecorridas": 2,
    "detenidoPor": "CORRIENTE_PELIGROSA",
    "dano": 1
  },
  "costos": { "combustible": 2, "acciones": 1 },
  "accionesRestantes": 2
}
```

`detenidoPor` puede ser: `null` o `CORRIENTE_PELIGROSA` o `BARCO_ENEMIGO` o `DESTINO_ALCANZADO`

Disparo con impacto, objetivo dentro del radio de detección del atacante (impacto = true y se indica el cascoRestante):

```json
{
  "tipoAccion": "DISPARAR",
  "barcoId": "b-2",
  "resultado": {
    "impacto": true,
    "hundido": false,
    "cascoRestante": 1
  },
  "costos": { "municion": 1, "acciones": 1 },
  "accionesRestantes": 1
}
```

Disparo con impacto, objetivo fuera del radio de detección del atacante (impacto = True, pero no se le avisa cascoRestante al atacante):

```json
{
  "tipoAccion": "DISPARAR",
  "barcoId": "b-2",
  "resultado": {
    "impacto": true,
    "hundido": false,
    "cascoRestante": null
  },
  "costos": { "municion": 1, "acciones": 1 },
  "accionesRestantes": 1
}
```

Disparo que hunde al enemigo (hundido = True, cascoRestante = 0):

```json
{
  "tipoAccion": "DISPARAR",
  "barcoId": "b-2",
  "resultado": {
    "impacto": true,
    "hundido": true,
    "cascoRestante": 0
  },
  "costos": { "municion": 1, "acciones": 1 },
  "accionesRestantes": 1
}
```

En resumen, `impacto` y `hundido` siempre se informan, incluso si el objetivo estaba en la niebla. Lo único que se oculta es `cascoRestante` cuando el barco sigue a flote y está fuera del radio de detección del atacante (sale `null`). Si el disparo cae en agua, el resultado es `{ "impacto": false }` y nada más.

Si la acción desencadena un combate cuerpo a cuerpo, el response incluye además:

```json
"combate": {
  "tipoCombate": "CUERPO_A_CUERPO",
  "atacante": { "barcoId": "b-1", "tipo": "DESTRUCTOR", "dado": "d8", "tiradas": [7] },
  "defensor": { "barcoId": "e-5", "tipo": "LANCHA",     "dado": "d4", "tiradas": [3] },
  "ganador": "b-1",
  "hundido": "e-5",
  "chatarraGenerada": { "casilla": { "x": 8, "y": 5 }, "cantidad": 2 }
}
```

`tiradas` es un array porque en caso de empate se relanza hasta que haya un ganador. El combate cuerpo a cuerpo no considera el casco restante: un Acorazado intacto puede perder contra una Lancha.

Vigía (revela un área 3x3 centrada en `centroZona`):

```json
{
  "tipoAccion": "VIGIA",
  "barcoId": "b-3",
  "resultado": {
    "casillasReveladas": [
      { "x": 6, "y": 4, "tipo": "AGUA_ABIERTA" },
      { "x": 6, "y": 5, "tipo": "CORRIENTE_PELIGROSA" },
      { "x": 6, "y": 6, "tipo": "POZO_PETROLERO", "ocupadaPor": null }
    ]
  },
  "costos": { "combustible": 1, "acciones": 1 },
  "accionesRestantes": 2
}
```

Mejorar:

```json
{
  "tipoAccion": "MEJORAR",
  "barcoId": "b-4",
  "resultado": {
    "mejora": "BLINDAJE",
    "statMejorado": "casco",
    "valorNuevo": 4
  },
  "costos": { "chatarra": 3, "acciones": 1 },
  "accionesRestantes": 2
}
```

Después de cada acción, el servidor retransmite por WebSocket un `ESTADO_PARTIDA` actualizado a ambos jugadores, cada uno con su propio filtrado (ver punto 5). El evento de la carta de ronda (`TORMENTA`, `BOTIN_FLOTANTE`, etc.) no es un mensaje aparte: viaja dentro del campo `eventoRonda` de ese mismo `ESTADO_PARTIDA`.

**Errores:** ver punto 6.


### 4.9 POST /games/:id/terminar-turno

**Request:** cuerpo vacío.

Si el jugador activo no termina su turno antes de `turnoExpiraEn` (3 minutos), el servidor cierra el turno automáticamente con las acciones que se llegaron a realizar y las restantes se pierden.

**Response `200 OK`**: cuerpo vacío. El servidor retransmite el `ESTADO_PARTIDA` actualizado (con el nuevo `jugadorActivo` y `turnoExpiraEn`) a ambos jugadores por WebSocket. Esto ocurre igual cuando el cierre lo dispara el timeout, no una llamada del cliente.

**Errores:** `NO_ES_TU_TURNO`, `PARTIDA_NO_ACTIVA` , ver punto 6.


### 4.10 POST /games/:id/abandonar

**Request:** cuerpo vacío.

La partida termina de inmediato con victoria para el rival y queda registrada como terminada por abandono.

**Response `200 OK`**: cuerpo vacío. El servidor retransmite el `ESTADO_PARTIDA` final (`estado: "TERMINADA"`, con `resultadoFinal`) a ambos jugadores por WebSocket.

**Errores:** `PARTIDA_NO_ACTIVA` , ver punto 6.


## 5. WebSocket

```json
{
  "tipo": "NOMBRE_DEL_MENSAJE",
  "partidaId": "p-1042",
  "jugadorId": 2,
  "timestamp": "2026-09-14T18:12:03Z",
  "contenido": { }
}
```

### 5.1 `CONECTAR` : cliente -> servidor

Abre y autentica la conexión.

```json
{
  "tipo": "CONECTAR",
  "partidaId": "p-1",
  "jugadorId": 2,
  "token": "..."
}
```

El servidor valida el token, registra el socket como conectado a esa partida y responde con el `ESTADO_PARTIDA` actual.

### 5.2 `ESTADO_PARTIDA` : servidor -> cliente

Se retransmite a ambos jugadores (cada uno con su propio filtrado) en dos casos: (1) cada vez que una acción REST cambia el estado de la partida, y (2) cuando el servidor detecta que el socket de un jugador se cerró (evento `close`/`disconnect`), sin ninguna acción REST: ahí el servidor arranca la cuenta atrás de `rival.segundosParaAbandono` y retransmite de inmediato al jugador que queda conectado. Estructura completa está en el punto 3.

Como cada jugador recibe su propia copia filtrada, el `jugadorId` del mensaje de websocket es el del destinatario de esa copia (no un valor único compartido entre ambos): el mensaje que llega al socket del jugador 1 trae `jugadorId: 1`, y el que llega al del jugador 2 trae `jugadorId: 2`, aunque ambos describan la misma partida al mismo tiempo.

De este mismo objeto deriva de quién es el turno (`jugadorActivo`), si la partida terminó (`estado: "TERMINADA"` + `resultadoFinal`) y si el rival sigue conectado (`rival.conectado`).

## 6. Errores

Formato único para los errores de las acciones de juego (punto 4.7–4.10), devuelto como cuerpo de la respuesta REST junto al código HTTP de la tabla. Ejemplo:

```json
{
  "codigo": "COMBUSTIBLE_INSUFICIENTE",
  "mensaje": "Necesitas 4 de combustible y tienes 2.",
  "accionDescartada": true,
  "estadoSinCambios": true
}
```

| `codigo` | HTTP | Cuando se produce |
|---|---|---|
| `TOKEN_INVALIDO` | 401 | Sesión expirada o token manipulado |
| `NO_ES_TU_TURNO` | 403 | Se intenta actuar fuera del turno propio |
| `PARTIDA_NO_ACTIVA` | 409 | La partida terminó o sigue en despliegue |
| `BARCO_NO_EXISTE` | 404 | El `barcoId` no corresponde a ningún barco |
| `BARCO_NO_ES_TUYO` | 403 | Se intenta operar un barco del rival |
| `BARCO_HUNDIDO` | 409 | El barco ya no está a flote |
| `SIN_ACCIONES` | 409 | Ya se usaron las 3 acciones del turno |
| `LIMITE_ACCIONES_BARCO` | 409 | Ese barco ya usó sus 2 acciones |
| `COMBUSTIBLE_INSUFICIENTE` | 409 | No alcanza para recorrer la distancia pedida |
| `MUNICION_INSUFICIENTE` | 409 | No alcanza para disparar |
| `CHATARRA_INSUFICIENTE` | 409 | No alcanza para pagar la mejora |
| `FUERA_DE_MOVIMIENTO` | 400 | El destino excede el valor de movimiento del barco |
| `FUERA_DE_ALCANCE` | 400 | El objetivo excede el alcance (distancia Manhattan) |
| `CASILLA_OCUPADA` | 409 | El destino ya tiene un barco |
| `RUTA_BLOQUEADA` | 409 | Hay un barco en el camino |
| `FUERA_DEL_TABLERO` | 400 | Coordenada fuera del rango 1–10 |
| `VIGIA_FUERA_DE_RANGO` | 400 | El centro está a más de 4 casillas de un barco propio |
| `MEJORA_DUPLICADA` | 409 | El barco ya tiene esa mejora |
| `LIMITE_MEJORAS` | 409 | El barco ya alcanzó el máximo de 2 mejoras |
| `DESPLIEGUE_INVALIDO` | 400 | Barcos fuera de zona, repetidos o en casillas iguales |
| `ERROR_INTERNO` | 500 | Falla inesperada del servidor |

## 7. Orden de validación del servidor

Al recibir una acción de juego por REST (punto 4.7–4.10), el servidor evalúa en este orden y se detiene en la primera falla, devolviendo el error correspondiente (punto 6) sin tocar el estado de la partida.

Validaciones, en orden:

1. Token válido -> `TOKEN_INVALIDO`
2. Partida activa -> `PARTIDA_NO_ACTIVA`
3. Es el turno del emisor -> `NO_ES_TU_TURNO`
4. El barco existe, es suyo y está a flote -> `BARCO_NO_EXISTE` , `BARCO_NO_ES_TUYO` , `BARCO_HUNDIDO`
5. Quedan acciones (3 por turno, máximo 2 por barco) -> `SIN_ACCIONES` , `LIMITE_ACCIONES_BARCO`
6. Recursos suficientes -> `COMBUSTIBLE_INSUFICIENTE` , `MUNICION_INSUFICIENTE` , `CHATARRA_INSUFICIENTE`
7. Casilla de destino u objetivo válida -> `FUERA_DE_MOVIMIENTO` , `FUERA_DE_ALCANCE` , `CASILLA_OCUPADA` , `RUTA_BLOQUEADA` , `FUERA_DEL_TABLERO` , `VIGIA_FUERA_DE_RANGO`

Si todo pasa, el servidor:

8. Aplica el cambio de estado
9. Resuelve combates desencadenados
10. Recalcula la visibilidad de ambos jugadores
11. Responde `200 OK` al emisor (con el `resultado` de la acción en 4.8; cuerpo vacío en 4.7, 4.9 y 4.10)
12. Retransmite un `ESTADO_PARTIDA` filtrado a cada jugador por WebSocket (punto 5.2)
13. Persiste el estado en la base de datos
