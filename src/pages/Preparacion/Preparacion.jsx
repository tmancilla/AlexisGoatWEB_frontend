import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Tablero from "../../components/Tablero/Tablero";
import tiposBarco from "../../mocks/flota";
import "./Preparacion.css";

const TAMANO = 10;
const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

// zona de despliegue del jugador 1, el jugador 2 usaria las filas 7 a 10
const ZONA = { desde: 1, hasta: 4 };

// el enunciado da 2 minutos para desplegar, si se acaban el servidor coloca la flota al azar
const SEGUNDOS_DESPLIEGUE = 120;

function clave(casilla) {
  return `${casilla.x},${casilla.y}`;
}

function nombreCasilla(casilla) {
  return `${LETRAS[casilla.x - 1]}${casilla.y}`;
}

// casillas de la zona propia que todavia no tienen barco encima
function libresEnZona(colocados) {
  const ocupadas = new Set(
    Object.values(colocados).filter(Boolean).map(clave));

  const libres = [];
  for (let y = ZONA.desde; y <= ZONA.hasta; y += 1) {
    for (let x = 1; x <= TAMANO; x += 1) {
      if (!ocupadas.has(`${x},${y}`)) libres.push({ x, y });
    }
  }
  return libres;
}

// rellena los barcos que falten en casillas libres al azar, es lo mismo que hace el servidor
// cuando se vence el tiempo de despliegue
function completarAlAzar(colocados) {
  const resultado = { ...colocados };

  tiposBarco.forEach((barco) => {
    if (resultado[barco.tipo]) return;
    const libres = libresEnZona(resultado);
    const elegida = libres[Math.floor(Math.random() * libres.length)];
    resultado[barco.tipo] = elegida;
  });

  return resultado;
}

// pasa el objeto de posiciones al array de barcos que espera el endpoint POST /games/:id/desplegar
function armarDespliegue(colocados) {
  return tiposBarco.map((barco) => ({
    tipo: barco.tipo,
    casilla: colocados[barco.tipo]}));
}

// lo mismo pero con la forma de "yo.flota" del estado de partida, para poder pintar el tablero
function armarFlota(colocados) {
  return tiposBarco.map((barco, indice) => ({
    barcoId: `b-${indice + 1}`,
    tipo: barco.tipo,
    casilla: colocados[barco.tipo],
    casco: barco.casco,
    cascoMaximo: barco.casco,
    movimiento: barco.movimiento,
    alcance: barco.alcance,
    deteccion: barco.deteccion,
    dado: barco.dado,
    mejoras: [],
    aFlote: true}));
}

function Preparacion() {
  const [colocados, setColocados] = useState({});
  const [seleccionado, setSeleccionado] = useState(tiposBarco[0].tipo);
  const [segundos, setSegundos] = useState(SEGUNDOS_DESPLIEGUE);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const listos = tiposBarco.filter((barco) => colocados[barco.tipo]).length;
  const flota = armarFlota(colocados).filter((barco) => barco.casilla);

  useEffect(() => {
    const reloj = setInterval(() => {
      setSegundos((anterior) => (anterior > 0 ? anterior - 1 : 0));
    }, 1000);

    return () => clearInterval(reloj);
  }, []);

  useEffect(() => {
    if (segundos > 0) return;
    const completo = completarAlAzar(colocados);
    navigate("/tablero", {
      state: { despliegue: { barcos: armarDespliegue(completo) }, flota: armarFlota(completo) }});
  }, [segundos, colocados, navigate]);

  function handleCasilla(x, y) {
    if (y < ZONA.desde || y > ZONA.hasta) {
      setError("Solo puedes desplegar en tu zona, filas 1 a 4.");
      return;
    }

    // si la casilla ya tiene un barco, el click lo selecciona en vez de apilar otro encima
    const ocupante = tiposBarco.find(
      (barco) =>
        colocados[barco.tipo] &&
        colocados[barco.tipo].x === x &&
        colocados[barco.tipo].y === y);

    if (ocupante) {
      setSeleccionado(ocupante.tipo);
      setError("");
      return;
    }

    setColocados({ ...colocados, [seleccionado]: { x, y } });
    setError("");

    // pasamos solo al siguiente barco que siga sin colocar, asi se despliega de corrido
    const siguiente = tiposBarco.find(
      (barco) => barco.tipo !== seleccionado && !colocados[barco.tipo]);

    if (siguiente) setSeleccionado(siguiente.tipo);
  }

  function handleAlAzar() {
    setColocados(completarAlAzar(colocados));
    setError("");
  }

  function handleLimpiar() {
    setColocados({});
    setSeleccionado(tiposBarco[0].tipo);
    setError("");
  }

  function handleConfirmar() {
    if (listos < tiposBarco.length) {
      setError("Debes colocar los cuatro barcos antes de confirmar.");
      return;
    }

    navigate("/tablero", {
      state: { despliegue: { barcos: armarDespliegue(colocados) }, flota: armarFlota(colocados) }});
  }

  return (
    <main className="preparacion">
      <header className="preparacion-header">
        <h1>Despliegue de la flota</h1>
        <p className="preparacion-ayuda">
          Elige un barco y haz click en una casilla de tu zona (filas 1 a 4).
        </p>
        <p className="preparacion-reloj">
          Tiempo restante: {Math.floor(segundos / 60)}:
          {String(segundos % 60).padStart(2, "0")}
        </p>
      </header>

      <div className="preparacion-contenido">
        <Tablero
          flota={flota}
          zona={ZONA}
          seleccion={colocados[seleccionado] || null}
          onSeleccionar={handleCasilla}
        />

        <section className="preparacion-flota">
          <h2>Tu flota</h2>

          <ul className="preparacion-lista">
            {tiposBarco.map((barco) => (
              <li key={barco.tipo}>
                <button
                  type="button"
                  className={
                    barco.tipo === seleccionado
                      ? "preparacion-barco preparacion-barco--activo"
                      : "preparacion-barco"
                  }
                  onClick={() => setSeleccionado(barco.tipo)}
                >
                  <span className="preparacion-barco-letra">{barco.letra}</span>

                  <span className="preparacion-barco-datos">
                    <span className="preparacion-barco-nombre">{barco.nombre}</span>
                    <span className="preparacion-barco-stats">
                      Casco {barco.casco} · Mov {barco.movimiento} · Alc {barco.alcance} ·
                      Det {barco.deteccion} · {barco.dado}
                    </span>
                  </span>

                  <span className="preparacion-barco-posicion">
                    {colocados[barco.tipo] ? nombreCasilla(colocados[barco.tipo]) : "—"}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="preparacion-progreso">
            {listos} de {tiposBarco.length} barcos desplegados
          </p>

          {error && <p className="preparacion-error">{error}</p>}

          <div className="preparacion-botones">
            <button type="button" onClick={handleAlAzar}>Colocar al azar</button>
            <button type="button" onClick={handleLimpiar}>Limpiar</button>
            <button
              type="button"
              className="preparacion-confirmar"
              onClick={handleConfirmar}
              disabled={listos < tiposBarco.length}
            >
              Confirmar despliegue
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Preparacion;
