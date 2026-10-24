import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { pedirApi } from "../../services/api";
import logo from "../../assets/logo-guerra-pacifico.png";
import "./Menu.css";

const INTERVALO_MS = 3000;

async function obtenerPartidaLista(partidaId, usuarioId) {
  const { datos } = await pedirApi(`/games/${partidaId}`, { usuarioId });

  if (datos.yo) {
    return {
      partidaId: datos.partidaId,
      estado: datos.estado,
      numeroJugador: datos.yo.numeroJugador,
      oponente: datos.rival ? { id: datos.rival.jugadorId, username: datos.rival.username } : null,
    };
  }

  const yo = datos.jugadores.find((jugador) => jugador.id === usuarioId);
  const oponente = datos.jugadores.find((jugador) => jugador.id !== usuarioId) || null;

  return {
    partidaId: datos.partidaId,
    estado: datos.estado,
    numeroJugador: yo.numeroJugador,
    oponente,
  };
}

function Menu({ usuario, onLogout }) {
  const [vista, setVista] = useState("menu");
  const [partida, setPartida] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const partidaId = partida ? partida.partidaId : null;

  function volverAlMenu(mensaje = "") {
    setVista("menu");
    setPartida(null);
    setCodigo("");
    setError(mensaje);
  }

  useEffect(() => {
    if (vista !== "esperando" || partidaId === null) {
      return undefined;
    }

    let activo = true;

    const intervalo = setInterval(async () => {
      try {
        const lista = await obtenerPartidaLista(partidaId, usuario.id);

        if (activo && lista.estado !== "ESPERANDO_JUGADOR") {
          setPartida(lista);
          setVista("listo");
        }
      } catch (err) {
        if (activo && err.status === 404) {
          volverAlMenu("El lobby expiró: nadie se unió en 5 minutos.");
        }
      }
    }, INTERVALO_MS);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [vista, partidaId, usuario.id]);

  useEffect(() => {
    if (vista !== "buscando") {
      return undefined;
    }

    let activo = true;

    const intervalo = setInterval(async () => {
      try {
        const { status, datos } = await pedirApi("/games/matchmaking", {
          metodo: "POST",
          usuarioId: usuario.id,
        });

        if (!activo) {
          return;
        }

        if (status === 200) {
          const lista = await obtenerPartidaLista(datos.partidaId, usuario.id);

          if (activo) {
            setPartida(lista);
            setVista("listo");
          }
        } else {
          setPartida(datos);
        }
      } catch (err) {
        if (activo) {
          volverAlMenu(err.message);
        }
      }
    }, INTERVALO_MS);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [vista, usuario.id]);

  async function handleSalir() {
    if (vista === "menu") {
      onLogout();
      navigate("/login");
      return;
    }

    if ((vista === "esperando" || vista === "buscando") && partidaId !== null) {
      try {
        await pedirApi(`/games/${partidaId}`, { metodo: "DELETE", usuarioId: usuario.id });
      } catch {
        // Si el lobby ya expiró, no queda nada que cancelar.
      }
    }

    volverAlMenu();
  }

  async function handleCrearPartida() {
    setCargando(true);
    setError("");

    try {
      const { datos } = await pedirApi("/games", { metodo: "POST", usuarioId: usuario.id });
      setPartida(datos);
      setVista("esperando");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  function handleAbrirUnirse() {
    setError("");
    setVista("unirse");
  }

  async function handleUnirse(event) {
    event.preventDefault();

    const codigoLimpio = codigo.trim();

    if (codigoLimpio === "") {
      setError("Debes ingresar un código.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const { datos } = await pedirApi(`/games/${encodeURIComponent(codigoLimpio)}/join`, {
        metodo: "POST",
        usuarioId: usuario.id,
      });
      setPartida(await obtenerPartidaLista(datos.partidaId, usuario.id));
      setVista("listo");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleBuscarPartida() {
    setCargando(true);
    setError("");

    try {
      const { status, datos } = await pedirApi("/games/matchmaking", {
        metodo: "POST",
        usuarioId: usuario.id,
      });

      if (status === 200) {
        setPartida(await obtenerPartidaLista(datos.partidaId, usuario.id));
        setVista("listo");
      } else {
        setPartida(datos);
        setVista("buscando");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleEntrarAlTablero() {
    setCargando(true);
    setError("");

    try {
      if (partida.estado === "LISTO_PARA_INICIAR") {
        await pedirApi(`/games/${partida.partidaId}`, {
          metodo: "PATCH",
          usuarioId: usuario.id,
          cuerpo: { estado: "DESPLIEGUE" },
        });
      }
    } catch (err) {
      if (err.codigo !== "TRANSICION_INVALIDA") {
        setError(err.message);
        setCargando(false);
        return;
      }
    }

    navigate("/preparacion", { state: { partidaId: partida.partidaId } });
  }

  return (
    <main className="menu">
      <button className="menu-salir" type="button" onClick={handleSalir}>
        Salir
      </button>

      <img className="menu-logo" src={logo} alt="Logo Guerra del Pacífico" />

      {vista === "menu" && (
        <>
          <h1>Guerra del Pacífico</h1>

          <div className="menu-buttons">
            <button type="button" onClick={handleBuscarPartida} disabled={cargando}>
              Buscar Partida
            </button>

            <button type="button" onClick={handleAbrirUnirse} disabled={cargando}>
              Introducir Código de Partida
            </button>

            <button type="button" onClick={handleCrearPartida} disabled={cargando}>
              Crear Partida
            </button>
          </div>

          {error && <p className="menu-error">{error}</p>}
        </>
      )}

      {vista === "esperando" && (
        <section className="menu-panel">
          <h2>Esperando jugador...</h2>

          <p className="menu-estado">{partida.estado}</p>

          <p className="menu-label">Comparte este código para que se unan:</p>

          <p className="menu-codigo">{partida.codigoInvitacion}</p>

          <p className="menu-label">
            El lobby se cierra a las {new Date(partida.expiraEn).toLocaleTimeString()} si nadie se une.
          </p>
        </section>
      )}

      {vista === "unirse" && (
        <section className="menu-panel">
          <h2>Introducir código</h2>

          <form className="menu-form" onSubmit={handleUnirse}>
            <label htmlFor="codigo">Código de invitación</label>

            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
            />

            {error && <p className="menu-error">{error}</p>}

            <button type="submit" disabled={cargando}>Unirse</button>
          </form>
        </section>
      )}

      {vista === "buscando" && (
        <section className="menu-panel">
          <h2>Buscando rival...</h2>

          <p className="menu-estado">{partida.estado}</p>

          <p className="menu-label">
            Posición en la cola: {partida.posicionEnCola}
          </p>
        </section>
      )}

      {vista === "listo" && (
        <section className="menu-panel">
          <h2>Partida lista</h2>

          <p className="menu-estado">{partida.estado}</p>

          <p className="menu-label">Partida: {partida.partidaId}</p>

          {partida.oponente && (
            <p className="menu-label">Rival: {partida.oponente.username}</p>
          )}

          <p className="menu-label">
            Eres el jugador {partida.numeroJugador}: despliegas en las filas{" "}
            {partida.numeroJugador === 1 ? "1 a 4" : "7 a 10"}.
          </p>

          {error && <p className="menu-error">{error}</p>}

          <button type="button" onClick={handleEntrarAlTablero} disabled={cargando}>
            Desplegar flota
          </button>
        </section>
      )}
    </main>
  );
}

export default Menu;