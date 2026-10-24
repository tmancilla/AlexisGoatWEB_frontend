import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import Tablero from "../../components/Tablero/Tablero";
import PanelRecursos from "../../components/PanelRecursos/PanelRecursos";
import Bitacora from "../../components/Bitacora/Bitacora";
import { statsDe } from "../../mocks/flota";
import { pedirApi } from "../../services/api";
import "./Partida.css";

const TAMANO = 10;
const ACCIONES_POR_BARCO = 2;
const MILISEGUNDOS_CONSULTA = 2000;

const TEXTO_MOTIVO = {
  FLOTA_DESTRUIDA: "destrucción de la flota",
  LIMITE_RONDAS: "límite de rondas",
  ABANDONO: "abandono"
};

const NOMBRES_DETALLE = {
  barcosAFlote: "Barcos a flote",
  cascoRestante: "Casco restante",
  enemigosHundidos: "Enemigos hundidos",
  casillasRecurso: "Casillas de recurso",
  mejoras: "Mejoras"
};

function clave(casilla) {
  return `${casilla.x},${casilla.y}`;
}

function distancia(origen, destino) {
  return Math.abs(origen.x - destino.x) + Math.abs(origen.y - destino.y);
}

function nombreDe(tipo) {
  const stats = statsDe(tipo);
  return stats ? stats.nombre : tipo;
}

function destinosPosibles(barco, estado) {
  const stats = statsDe(barco.tipo);
  const ocupadas = new Set(
    estado.yo.flota
      .concat(estado.contactosEnemigos)
      .filter((otro) => otro.aFlote)
      .map((otro) => clave(otro.casilla)));

  const destinos = [];
  for (let y = 1; y <= TAMANO; y += 1) {
    for (let x = 1; x <= TAMANO; x += 1) {
      const pasos = distancia(barco.casilla, { x, y });
      if (pasos === 0 || pasos > barco.movimiento) continue;
      if (ocupadas.has(`${x},${y}`)) continue;
      if (pasos * stats.combustiblePorCasilla > estado.yo.recursos.combustible) continue;
      destinos.push({ x, y });
    }
  }
  return destinos;
}

function describirAccion(accion, nombres) {
  const barco = nombres[accion.barcoId] || "Un barco";
  const resultado = accion.resultado || {};
  const inicio = `Ronda ${accion.ronda}: `;

  if (accion.tipo === "MEJORAR") return `${inicio}${barco} compró ${resultado.mejora}.`;
  if (accion.tipo !== "MOVER") return `${inicio}${barco} usó ${accion.tipo}.`;

  const palabra = resultado.casillasRecorridas === 1 ? "casilla" : "casillas";
  let texto = `${inicio}${barco} se movió ${resultado.casillasRecorridas} ${palabra}`;
  texto += resultado.costos ? ` y gastó ${resultado.costos.combustible} de combustible.` : ".";
  if (resultado.chatarraRecogida) texto += ` Recogió ${resultado.chatarraRecogida} de chatarra.`;
  if (resultado.detenidoPor === "CORRIENTE_PELIGROSA") {
    texto += resultado.hundido
      ? " Una corriente peligrosa lo hundió."
      : " Una corriente peligrosa lo frenó y le quitó 1 de casco.";
  }
  if (resultado.detenidoPor === "BARCO_ENEMIGO") texto += " Se frenó junto a un barco enemigo que no veías.";
  return texto;
}

function Partida() {
  const location = useLocation();
  const navigate = useNavigate();
  const [parametros] = useSearchParams();

  const partidaId = (location.state && location.state.partidaId) || parametros.get("partidaId");
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const usuarioId = usuario ? usuario.id : null;

  const [estado, setEstado] = useState(() => (location.state && location.state.estadoPartida) || null);
  const [acciones, setAcciones] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [errorCarga, setErrorCarga] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ahora, setAhora] = useState(() => Date.now());

  const cargar = useCallback(async () => {
    if (!partidaId) {
      setErrorCarga("No se indicó qué partida quieres ver.");
      return;
    }

    try {
      const [{ datos: partida }, { datos: historial }] = await Promise.all([
        pedirApi(`/games/${partidaId}`, { usuarioId }),
        pedirApi(`/games/${partidaId}/acciones`, { usuarioId })]);

      if (partida.estado === "DESPLIEGUE") {
        navigate("/preparacion", { replace: true, state: { partidaId } });
        return;
      }
      if (!partida.yo) {
        setErrorCarga("La partida todavía no empieza.");
        return;
      }

      setEstado(partida);
      setAcciones(historial);
      setErrorCarga("");
    } catch (error) {
      setErrorCarga(error.message);
    }
  }, [partidaId, usuarioId, navigate]);

  useEffect(() => {
    cargar();
    const consulta = setInterval(cargar, MILISEGUNDOS_CONSULTA);
    return () => clearInterval(consulta);
  }, [cargar]);

  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(reloj);
  }, []);

  if (!estado) {
    return (
      <main className="partida">
        <p className="partida-mensaje">{errorCarga || "Cargando partida..."}</p>
        {errorCarga && (
          <div className="partida-botones">
            <button type="button" onClick={() => navigate("/menu")}>Volver al menú</button>
          </div>
        )}
      </main>
    );
  }

  const enCurso = estado.estado === "EN_CURSO";
  const esMiTurno = estado.jugadorActivo === estado.yo.jugadorId;
  const segundos = estado.turnoExpiraEn
    ? Math.max(0, Math.ceil((new Date(estado.turnoExpiraEn).getTime() - ahora) / 1000))
    : null;

  const barcoSeleccionado = estado.yo.flota.find(
    (barco) => barco.barcoId === seleccionado && barco.aFlote) || null;
  const usadasPorBarco = barcoSeleccionado ? estado.yo.accionesPorBarco[barcoSeleccionado.barcoId] || 0 : 0;

  const puedeMover =
    enCurso &&
    esMiTurno &&
    !enviando &&
    barcoSeleccionado !== null &&
    estado.yo.accionesRestantes > 0 &&
    usadasPorBarco < ACCIONES_POR_BARCO;

  const destinos = puedeMover ? destinosPosibles(barcoSeleccionado, estado) : [];
  const nombres = Object.fromEntries(estado.yo.flota.map((barco) => [barco.barcoId, nombreDe(barco.tipo)]));
  const bitacora = acciones.length > 0
    ? acciones.map((accion) => describirAccion(accion, nombres))
    : ["Todavía no hay acciones tuyas en esta partida."];

  async function mover(destino) {
    setEnviando(true);
    try {
      const { datos } = await pedirApi(`/games/${partidaId}/acciones`, {
        metodo: "POST",
        usuarioId,
        cuerpo: { tipoAccion: "MOVER", barcoId: barcoSeleccionado.barcoId, casillaDestino: destino }});

      setMensaje(describirAccion({
        tipo: "MOVER",
        ronda: estado.ronda,
        barcoId: datos.barcoId,
        resultado: { ...datos.resultado, costos: datos.costos }}, nombres));
      if (datos.resultado.hundido) setSeleccionado(null);
      await cargar();
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setEnviando(false);
    }
  }

  function handleCasilla(x, y) {
    if (!enCurso || enviando) return;

    if (!esMiTurno) {
      setMensaje("No es tu turno, espera a que el rival termine.");
      return;
    }

    const propio = estado.yo.flota.find(
      (barco) => barco.aFlote && barco.casilla.x === x && barco.casilla.y === y);

    if (propio) {
      setSeleccionado(propio.barcoId === seleccionado ? null : propio.barcoId);
      setMensaje("");
      return;
    }

    if (!barcoSeleccionado) {
      setMensaje("Selecciona primero uno de tus barcos.");
      return;
    }

    if (estado.yo.accionesRestantes === 0) {
      setMensaje("Ya usaste todas las acciones del turno.");
      return;
    }

    if (usadasPorBarco >= ACCIONES_POR_BARCO) {
      setMensaje("Ese barco ya usó sus 2 acciones de este turno.");
      return;
    }

    mover({ x, y });
  }

  const resultado = estado.resultadoFinal;

  return (
    <main className="partida">
      <header className="partida-header">
        <h1>Partida {estado.partidaId}</h1>
        <p className="partida-ayuda">
          Haz click en uno de tus barcos y después en una casilla verde para moverlo.
        </p>
      </header>

      <div className="partida-contenido">
        <section className="partida-tablero">
          <Tablero
            casillas={estado.casillasVisibles}
            flota={estado.yo.flota}
            contactos={estado.contactosEnemigos}
            disponibles={destinos}
            seleccion={barcoSeleccionado ? barcoSeleccionado.casilla : null}
            onSeleccionar={handleCasilla}
          />

          {(mensaje || errorCarga) && <p className="partida-mensaje">{mensaje || errorCarga}</p>}
          {estado.estado === "TERMINADA" && !resultado && (
            <p className="partida-mensaje">La partida terminó.</p>
          )}

          <div className="partida-botones">
            <button
              type="button"
              className="partida-turno"
              disabled
              title="Se habilita cuando esté el endpoint para terminar el turno"
            >
              Terminar turno
            </button>

            <button type="button" onClick={() => navigate("/menu")}>
              Volver al menú
            </button>
          </div>
        </section>

        <div className="partida-panel">
          <PanelRecursos
            recursos={estado.yo.recursos}
            accionesRestantes={estado.yo.accionesRestantes}
            ronda={estado.ronda}
            rondaMaxima={estado.rondaMaxima}
            evento={estado.eventoRonda}
            esMiTurno={esMiTurno}
            segundosRestantes={enCurso ? segundos : null}
            rival={estado.rival}
          />

          <Bitacora acciones={bitacora} />
        </div>
      </div>

      {resultado && (
        <section className="partida-resultado">
          <h2>Partida terminada</h2>

          <p className="partida-motivo">
            {resultado.motivo === "EMPATE"
              ? "La partida terminó en empate"
              : `${resultado.ganador === estado.yo.jugadorId ? "Ganaste" : "Perdiste"} por ${TEXTO_MOTIVO[resultado.motivo]}`}
          </p>

          <ul className="partida-puntajes">
            {Object.entries(resultado.puntajes).map(([jugadorId, puntaje]) => (
              <li key={jugadorId}>
                <div className="partida-puntaje-fila">
                  <span className="partida-puntaje-jugador">
                    Jugador {jugadorId}
                    {Number(jugadorId) === estado.yo.jugadorId ? " (tú)" : ""}
                  </span>
                  <span className="partida-puntaje-total">{puntaje.total} pts</span>
                </div>

                <ul className="partida-detalle">
                  {Object.entries(puntaje.detalle).map(([categoria, puntos]) => (
                    <li key={categoria}>
                      <span>{NOMBRES_DETALLE[categoria]}</span>
                      <span>{puntos}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <button type="button" onClick={() => navigate("/menu")}>
            Volver al menú
          </button>
        </section>
      )}
    </main>
  );
}

export default Partida;
