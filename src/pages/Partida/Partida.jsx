import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Tablero from "../../components/Tablero/Tablero";
import PanelRecursos from "../../components/PanelRecursos/PanelRecursos";
import partida from "../../mocks/partida";
import { eventoAlAzar } from "../../mocks/eventos";
import { statsDe } from "../../mocks/flota";
import "./Partida.css";

const TAMANO = 10;
const ACCIONES_POR_TURNO = 3;
const ACCIONES_POR_BARCO = 2;

// el enunciado da 3 minutos por turno, al llegar a cero el turno se cierra solo
const SEGUNDOS_TURNO = 180;

function copiar(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

function clave(casilla) {
  return `${casilla.x},${casilla.y}`;
}

// distancia manhattan, es la que usa el juego para movimiento y alcance
function distancia(origen, destino) {
  return Math.abs(origen.x - destino.x) + Math.abs(origen.y - destino.y);
}

// si venimos de la pantalla de preparacion arrancamos con esa flota, si no con la del mock
function armarEstadoInicial(flotaDesplegada) {
  const base = copiar(partida.enCurso.contenido);
  if (!flotaDesplegada) return base;

  return {
    ...base,
    ronda: 1,
    jugadorActivo: base.yo.jugadorId,
    yo: {
      ...base.yo,
      flota: flotaDesplegada,
      recursos: { combustible: 12, municion: 8, chatarra: 0 },
      accionesRestantes: ACCIONES_POR_TURNO,
      accionesPorBarco: {}}};
}

// casillas a las que puede llegar el barco: dentro de su movimiento, sin otro barco encima
// y que alcancen a pagarse con el combustible que queda
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

function Partida() {
  const location = useLocation();
  const navigate = useNavigate();

  const [estado, setEstado] = useState(() =>
    armarEstadoInicial(location.state ? location.state.flota : null));
  const [seleccionado, setSeleccionado] = useState(null);
  const [segundos, setSegundos] = useState(SEGUNDOS_TURNO);
  const [mensaje, setMensaje] = useState("");

  const enCurso = estado.estado === "EN_CURSO";
  const esMiTurno = estado.jugadorActivo === estado.yo.jugadorId;

  const barcoSeleccionado = estado.yo.flota.find(
    (barco) => barco.barcoId === seleccionado && barco.aFlote) || null;

  const usadasPorBarco = barcoSeleccionado
    ? estado.yo.accionesPorBarco[barcoSeleccionado.barcoId] || 0
    : 0;

  const puedeMover =
    enCurso &&
    esMiTurno &&
    barcoSeleccionado !== null &&
    estado.yo.accionesRestantes > 0 &&
    usadasPorBarco < ACCIONES_POR_BARCO;

  const destinos = puedeMover ? destinosPosibles(barcoSeleccionado, estado) : [];

  // aca esta el cambio de turno: pasa el turno al otro jugador y, cuando vuelve al que parte,
  // sube la ronda, revela una carta nueva y devuelve las 3 acciones
  function terminarTurno() {
    setEstado((anterior) => {
      const siguiente =
        anterior.jugadorActivo === anterior.yo.jugadorId
          ? anterior.rival.jugadorId
          : anterior.yo.jugadorId;

      const meToca = siguiente === anterior.yo.jugadorId;
      const ronda = meToca ? anterior.ronda + 1 : anterior.ronda;

      // pasado el limite de rondas la partida termina y se muestra el puntaje final
      if (ronda > anterior.rondaMaxima) return copiar(partida.terminada.contenido);

      return {
        ...anterior,
        jugadorActivo: siguiente,
        ronda: ronda,
        eventoRonda: meToca ? eventoAlAzar() : anterior.eventoRonda,
        yo: meToca
          ? { ...anterior.yo, accionesRestantes: ACCIONES_POR_TURNO, accionesPorBarco: {} }
          : anterior.yo};
    });

    setSeleccionado(null);
    setSegundos(SEGUNDOS_TURNO);
  }

  useEffect(() => {
    if (!enCurso) return undefined;

    const reloj = setInterval(() => {
      setSegundos((anterior) => (anterior > 0 ? anterior - 1 : 0));
    }, 1000);

    return () => clearInterval(reloj);
  }, [enCurso]);

  useEffect(() => {
    if (segundos > 0 || !enCurso) return;
    setMensaje("Se acabó el tiempo, el turno se cerró automáticamente.");
    terminarTurno();
    // el turno se cierra solo al llegar a cero, igual que haria el servidor con el timeout
  }, [segundos, enCurso]);

  function mover(destino) {
    const stats = statsDe(barcoSeleccionado.tipo);
    const pasos = distancia(barcoSeleccionado.casilla, destino);
    const costo = pasos * stats.combustiblePorCasilla;

    setEstado((anterior) => ({
      ...anterior,
      yo: {
        ...anterior.yo,
        recursos: {
          ...anterior.yo.recursos,
          combustible: anterior.yo.recursos.combustible - costo},
        accionesRestantes: anterior.yo.accionesRestantes - 1,
        accionesPorBarco: {
          ...anterior.yo.accionesPorBarco,
          [barcoSeleccionado.barcoId]:
            (anterior.yo.accionesPorBarco[barcoSeleccionado.barcoId] || 0) + 1},
        flota: anterior.yo.flota.map((barco) =>
          barco.barcoId === barcoSeleccionado.barcoId
            ? { ...barco, casilla: destino }
            : barco)}}));

    const palabra = pasos === 1 ? "casilla" : "casillas";
    setMensaje(`${stats.nombre} se movió ${pasos} ${palabra} y gastó ${costo} de combustible.`);
  }

  function handleCasilla(x, y) {
    if (!enCurso) return;

    if (!esMiTurno) {
      setMensaje("No es tu turno, espera a que el rival termine.");
      return;
    }

    // si el click cae sobre un barco propio lo que hace es seleccionarlo, no moverlo
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
      setMensaje("Ya usaste las 3 acciones del turno.");
      return;
    }

    if (usadasPorBarco >= ACCIONES_POR_BARCO) {
      setMensaje("Ese barco ya usó sus 2 acciones de este turno.");
      return;
    }

    const alcanzable = destinos.some((destino) => destino.x === x && destino.y === y);

    if (!alcanzable) {
      setMensaje("Esa casilla queda fuera del movimiento del barco o no te alcanza el combustible.");
      return;
    }

    mover({ x, y });
  }

  function handleVolverAlMenu() {
    navigate("/menu");
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

          {mensaje && <p className="partida-mensaje">{mensaje}</p>}

          <div className="partida-botones">
            <button
              type="button"
              className="partida-turno"
              onClick={terminarTurno}
              disabled={!enCurso}
            >
              {esMiTurno ? "Terminar turno" : "Simular turno del rival"}
            </button>

            <button type="button" onClick={handleVolverAlMenu} disabled={!enCurso}>
              Abandonar
            </button>
          </div>
        </section>

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
      </div>

      {resultado && (
        <section className="partida-resultado">
          <h2>Partida terminada</h2>

          <p className="partida-motivo">
            {resultado.ganador === estado.yo.jugadorId ? "Ganaste" : "Perdiste"} por{" "}
            {resultado.motivo.replace("_", " ").toLowerCase()}
          </p>

          <ul className="partida-puntajes">
            {Object.entries(resultado.puntajes).map(([jugadorId, puntaje]) => (
              <li key={jugadorId}>
                <span className="partida-puntaje-jugador">
                  Jugador {jugadorId}
                  {Number(jugadorId) === estado.yo.jugadorId ? " (tú)" : ""}
                </span>
                <span className="partida-puntaje-total">{puntaje.total} pts</span>
              </li>
            ))}
          </ul>

          <button type="button" onClick={handleVolverAlMenu}>
            Volver al menú
          </button>
        </section>
      )}
    </main>
  );
}

export default Partida;
