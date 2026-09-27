import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Tablero from "../../components/Tablero/Tablero";
import PanelRecursos from "../../components/PanelRecursos/PanelRecursos";
import Bitacora from "../../components/Bitacora/Bitacora";
import partida from "../../mocks/partida";
import { eventoAlAzar } from "../../mocks/eventos";
import { statsDe } from "../../mocks/flota";
import "./Partida.css";

const TAMANO = 10;
const ACCIONES_POR_TURNO = 3;
const ACCIONES_POR_BARCO = 2;

const SEGUNDOS_TURNO = 180;

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

function copiar(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

function clave(casilla) {
  return `${casilla.x},${casilla.y}`;
}


function distancia(origen, destino) {
  return Math.abs(origen.x - destino.x) + Math.abs(origen.y - destino.y);
}


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
  const [bitacora, setBitacora] = useState(["Comenzó la partida."]);

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

  function agregarBitacora(texto) {
    setBitacora((anterior) => [...anterior, texto]);
  }


  function terminarTurno(textoBitacora = "") {
    if (textoBitacora !== "") agregarBitacora(textoBitacora);

    setEstado((anterior) => {
      const siguiente =
        anterior.jugadorActivo === anterior.yo.jugadorId
          ? anterior.rival.jugadorId
          : anterior.yo.jugadorId;

      const meToca = siguiente === anterior.yo.jugadorId;
      const ronda = meToca ? anterior.ronda + 1 : anterior.ronda;


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
    terminarTurno("Se acabó el tiempo del turno.");

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
    const texto = `${stats.nombre} se movió ${pasos} ${palabra} y gastó ${costo} de combustible.`;
    setMensaje(texto);
    agregarBitacora(texto);
  }

  function handleCasilla(x, y) {
    if (!enCurso) return;

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

  function handleAbandonar() {
    agregarBitacora("Abandonaste la partida.");

    setEstado((anterior) => ({
      ...anterior,
      estado: "TERMINADA",
      resultadoFinal: {
        ...copiar(partida.terminada.contenido.resultadoFinal),
        motivo: "ABANDONO",
        ganador: anterior.rival.jugadorId
      }
    }));
    setSeleccionado(null);
    setMensaje("");
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
              onClick={() =>
                terminarTurno(
                  esMiTurno ? "Terminaste tu turno." : "Terminó el turno del rival."
                )
              }
              disabled={!enCurso}
            >
              {esMiTurno ? "Terminar turno" : "Simular turno del rival"}
            </button>

            <button type="button" onClick={handleAbandonar} disabled={!enCurso}>
              Abandonar
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

          <button type="button" onClick={handleVolverAlMenu}>
            Volver al menú
          </button>
        </section>
      )}
    </main>
  );
}

export default Partida;