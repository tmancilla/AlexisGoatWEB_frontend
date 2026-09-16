const lobby = {
  codigoValido: "I-1",

  crear: {
    partidaId: "p-1",
    codigoInvitacion: "I-1",
    estado: "ESPERANDO_JUGADOR",
    dueno: { id: 1, username: "jugador1" },
    expiraEn: "2026-09-16T18:05:00Z"
  },

  unirse: {
    partidaId: "p-1",
    estado: "LISTO_PARA_INICIAR",
    jugadores: [
      { id: 1, username: "jugador1", rolPartida: "DUENO" },
      { id: 2, username: "jugador2", rolPartida: "INVITADO" }
    ]
  },

  matchmaking: {
    enCola: {
      estado: "BUSCANDO",
      posicionEnCola: 1
    },

    encontrado: {
      partidaId: "p-2",
      estado: "DESPLIEGUE",
      oponente: { id: 5, username: "jugador5" }
    }
  }
};

export default lobby;
