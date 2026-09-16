const partida = {
  enCurso: {
    tipo: "ESTADO_PARTIDA",
    contenido: {
      partidaId: "p-1",
      estado: "EN_CURSO",
      ronda: 4,
      rondaMaxima: 20,
      jugadorActivo: 1,
      turnoExpiraEn: "2026-09-20T15:42:00Z",
      eventoRonda: {
        carta: "TORMENTA",
        efecto: "Radio de detección -1 esta ronda"
      },

      yo: {
        jugadorId: 1,
        username: "jugador1",
        conectado: true,
        recursos: { combustible: 9, municion: 6, chatarra: 4 },
        accionesRestantes: 1,
        accionesPorBarco: { "b-1": 1, "b-2": 0, "b-3": 1, "b-4": 0 },
        flota: [
          {
            barcoId: "b-1",
            tipo: "LANCHA",
            casilla: { x: 5, y: 4 },
            casco: 1,
            cascoMaximo: 1,
            movimiento: 3,
            alcance: 2,
            deteccion: 3,
            dado: "d4",
            mejoras: [],
            aFlote: true
          },
          {
            barcoId: "b-2",
            tipo: "FRAGATA",
            casilla: { x: 6, y: 6 },
            casco: 0,
            cascoMaximo: 2,
            movimiento: 2,
            alcance: 3,
            deteccion: 2,
            dado: "d6",
            mejoras: [],
            aFlote: false
          },
          {
            barcoId: "b-3",
            tipo: "DESTRUCTOR",
            casilla: { x: 7, y: 6 },
            casco: 3,
            cascoMaximo: 4,
            movimiento: 2,
            alcance: 4,
            deteccion: 2,
            dado: "d8",
            mejoras: ["BLINDAJE"],
            aFlote: true
          },
          {
            barcoId: "b-4",
            tipo: "ACORAZADO",
            casilla: { x: 4, y: 2 },
            casco: 4,
            cascoMaximo: 4,
            movimiento: 1,
            alcance: 5,
            deteccion: 1,
            dado: "d10",
            mejoras: [],
            aFlote: true
          }
        ]
      },

      rival: {
        jugadorId: 2,
        username: "jugador2",
        conectado: true,
        segundosParaAbandono: null,
        barcosAFlote: 3
      },

      casillasVisibles: [
        { x: 5, y: 6, tipo: "POZO_PETROLERO", ocupadaPor: null },
        { x: 6, y: 5, tipo: "CORRIENTE_PELIGROSA", reveladaEnRonda: 3 },
        { x: 8, y: 9, tipo: "AGUA_ABIERTA" },
        { x: 3, y: 6, tipo: "NAUFRAGIO" }
      ],

      contactosEnemigos: [
        {
          barcoId: "e-3",
          tipo: "FRAGATA",
          casilla: { x: 8, y: 5 },
          casco: 1,
          aFlote: true,
          visible: true
        },
        {
          barcoId: "e-1",
          tipo: "LANCHA",
          casilla: { x: 4, y: 7 },
          casco: null,
          aFlote: true,
          visible: false,
          vistoEnRonda: 2
        },
        {
          barcoId: "e-4",
          tipo: "ACORAZADO",
          casilla: { x: 9, y: 8 },
          casco: 0,
          aFlote: false,
          visible: true
        }
      ],

      resultadoFinal: null
    }
  },

  terminada: {
    tipo: "ESTADO_PARTIDA",
    contenido: {
      partidaId: "p-1",
      estado: "TERMINADA",
      ronda: 14,
      rondaMaxima: 20,
      jugadorActivo: 1,
      turnoExpiraEn: "2026-09-21T09:40:00Z",
      eventoRonda: {
        carta: "MAREA_ALTA",
        efecto: "El nivel del agua sube: las corrientes peligrosas quedan ocultas hasta sufrirlas"
      },

      yo: {
        jugadorId: 1,
        username: "jugador1",
        conectado: true,
        recursos: { combustible: 4, municion: 2, chatarra: 6 },
        accionesRestantes: 0,
        accionesPorBarco: { "b-1": 0, "b-2": 0, "b-3": 0, "b-4": 0 },
        flota: [
          {
            barcoId: "b-1",
            tipo: "LANCHA",
            casilla: { x: 5, y: 4 },
            casco: 1,
            cascoMaximo: 1,
            movimiento: 3,
            alcance: 2,
            deteccion: 3,
            dado: "d4",
            mejoras: [],
            aFlote: true
          },
          {
            barcoId: "b-2",
            tipo: "FRAGATA",
            casilla: { x: 6, y: 6 },
            casco: 0,
            cascoMaximo: 2,
            movimiento: 2,
            alcance: 3,
            deteccion: 2,
            dado: "d6",
            mejoras: [],
            aFlote: false
          },
          {
            barcoId: "b-3",
            tipo: "DESTRUCTOR",
            casilla: { x: 7, y: 6 },
            casco: 4,
            cascoMaximo: 4,
            movimiento: 2,
            alcance: 4,
            deteccion: 2,
            dado: "d8",
            mejoras: ["BLINDAJE"],
            aFlote: true
          },
          {
            barcoId: "b-4",
            tipo: "ACORAZADO",
            casilla: { x: 4, y: 2 },
            casco: 4,
            cascoMaximo: 4,
            movimiento: 1,
            alcance: 5,
            deteccion: 1,
            dado: "d10",
            mejoras: [],
            aFlote: true
          }
        ]
      },

      rival: {
        jugadorId: 2,
        username: "jugador2",
        conectado: true,
        segundosParaAbandono: null,
        barcosAFlote: 0
      },

      casillasVisibles: [
        { x: 5, y: 6, tipo: "POZO_PETROLERO", ocupadaPor: null },
        { x: 8, y: 9, tipo: "AGUA_ABIERTA" }
      ],

      contactosEnemigos: [
        {
          barcoId: "e-4",
          tipo: "ACORAZADO",
          casilla: { x: 9, y: 8 },
          casco: 0,
          aFlote: false,
          visible: true
        }
      ],

      resultadoFinal: {
        motivo: "FLOTA_DESTRUIDA",
        ganador: 1,
        puntajes: {
          "1": {
            total: 41,
            detalle: {
              barcosAFlote: 15,
              cascoRestante: 9,
              enemigosHundidos: 10,
              casillasRecurso: 3,
              mejoras: 4
            }
          },
          "2": {
            total: 8,
            detalle: {
              barcosAFlote: 0,
              cascoRestante: 0,
              enemigosHundidos: 0,
              casillasRecurso: 6,
              mejoras: 2
            }
          }
        }
      }
    }
  }
};

export default partida;