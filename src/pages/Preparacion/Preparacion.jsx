import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import Tablero from "../../components/Tablero/Tablero";
import tiposBarco from "../../mocks/flota";
import "./Preparacion.css";

const API_URL = import.meta.env.VITE_API_URL;

const TAMANO = 10;
const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const SEGUNDOS_DESPLIEGUE = 120;

function clave(casilla) {
  return `${casilla.x},${casilla.y}`;
}

function nombreCasilla(casilla) {
  return `${LETRAS[casilla.x - 1]}${casilla.y}`;
}

function libresEnZona(colocados, zona) {
  const ocupadas = new Set(
    Object.values(colocados).filter(Boolean).map(clave));

  const libres = [];
  for (let y = zona.desde; y <= zona.hasta; y += 1) {
    for (let x = 1; x <= TAMANO; x += 1) {
      if (!ocupadas.has(`${x},${y}`)) libres.push({ x, y });
    }
  }
  return libres;
}

function completarAlAzar(colocados, zona) {
  const resultado = { ...colocados };

  tiposBarco.forEach((barco) => {
    if (resultado[barco.tipo]) return;
    const libres = libresEnZona(resultado, zona);
    const elegida = libres[Math.floor(Math.random() * libres.length)];
    resultado[barco.tipo] = elegida;
  });

  return resultado;
}

function armarDespliegue(colocados) {
  return tiposBarco.map((barco) => ({
    tipo: barco.tipo,
    casilla: colocados[barco.tipo]}));
}

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
  const [partida, setPartida] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorConsulta, setErrorConsulta] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const [parametros] = useSearchParams();

  const partidaId = (location.state && location.state.partidaId)
    || parametros.get("partidaId");

  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const usuarioId = usuario ? usuario.id : null;

  const zona = partida && partida.yo.numeroJugador === 2
    ? { desde: 7, hasta: 10 }
    : { desde: 1, hasta: 4 };

  const listo = partida ? partida.yo.listo : false;
  const bloqueado = !partida || listo || enviando || segundos === 0;

  const listos = tiposBarco.filter((barco) => colocados[barco.tipo]).length;
  const flota = armarFlota(colocados).filter((barco) => barco.casilla);

  useEffect(() => {
    const reloj = setInterval(() => {
      setSegundos((anterior) => (anterior > 0 ? anterior - 1 : 0));
    }, 1000);

    return () => clearInterval(reloj);
  }, []);

  useEffect(() => {
    if (!partidaId) {
      setErrorConsulta("No se indicó qué partida debes preparar.");
      return;
    }

    let activo = true;

    async function consultarPartida() {
      try {
        const respuesta = await fetch(`${API_URL}/games/${partidaId}`, {
          headers: {
            "X-Usuario-Id": usuarioId,
          },
        });

        const datos = await respuesta.json();

        if (!activo) return;

        if (!respuesta.ok) {
          setErrorConsulta(datos.mensaje || "No se pudo consultar la partida.");
          setPartida(null);
          return;
        }

        if (datos.estado === "EN_CURSO") {
          navigate("/tablero", {
            replace: true,
            state: {
              partidaId: datos.partidaId,
              flota: datos.yo.flota,
              estadoPartida: datos,
            },
          });
          return;
        }

        if (datos.estado !== "DESPLIEGUE") {
          setErrorConsulta("La partida no está en la fase de despliegue.");
          setPartida(null);
          return;
        }

        setPartida(datos);
        setErrorConsulta("");
        setSegundos(Math.max(
          0,
          Math.ceil(
            (new Date(datos.despliegueExpiraEn).getTime() - Date.now()) / 1000
          )
        ));

        if (datos.yo.listo) {
          const guardados = {};

          datos.yo.flota.forEach((barco) => {
            guardados[barco.tipo] = barco.casilla;
          });

          setColocados(guardados);
        }
      } catch {
        if (activo) {
          setErrorConsulta("No se pudo conectar con el servidor.");
        }
      }
    }

    consultarPartida();
    const consulta = setInterval(consultarPartida, 2000);

    return () => {
      activo = false;
      clearInterval(consulta);
    };
  }, [partidaId, usuarioId, navigate]);

  function handleCasilla(x, y) {
    if (bloqueado) return;

    if (y < zona.desde || y > zona.hasta) {
      setError(`Solo puedes desplegar en tu zona, filas ${zona.desde} a ${zona.hasta}.`);
      return;
    }

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

    const siguiente = tiposBarco.find(
      (barco) => barco.tipo !== seleccionado && !colocados[barco.tipo]);

    if (siguiente) setSeleccionado(siguiente.tipo);
  }

  function handleAlAzar() {
    setColocados(completarAlAzar(colocados, zona));
    setError("");
  }

  function handleLimpiar() {
    setColocados({});
    setSeleccionado(tiposBarco[0].tipo);
    setError("");
  }

  async function handleConfirmar() {
    if (bloqueado) return;

    if (listos < tiposBarco.length) {
      setError("Debes colocar los cuatro barcos antes de confirmar.");
      return;
    }

    setEnviando(true);
    setError("");

    try {
      const respuesta = await fetch(`${API_URL}/games/${partidaId}/desplegar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Usuario-Id": usuarioId,
        },
        body: JSON.stringify({
          barcos: armarDespliegue(colocados),
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.mensaje || "No se pudo guardar el despliegue.");
        return;
      }

      setPartida((anterior) => ({
        ...anterior,
        yo: { ...anterior.yo, listo: true },
      }));
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  function handleAbandonar() {
    navigate("/menu");
  }

  if (!partida) {
    return (
      <main className="preparacion">
        <h1>Despliegue de la flota</h1>
        <p>{errorConsulta || "Cargando partida..."}</p>
        <button type="button" onClick={handleAbandonar}>Abandonar</button>
      </main>
    );
  }

  return (
    <main className="preparacion">
      <header className="preparacion-header">
        <h1>Despliegue de la flota</h1>
        <p className="preparacion-ayuda">
          Elige un barco y haz click en una casilla de tu zona
          (filas {zona.desde} a {zona.hasta}).
        </p>
        <p className="preparacion-reloj">
          Tiempo restante: {Math.floor(segundos / 60)}:
          {String(segundos % 60).padStart(2, "0")}
        </p>
      </header>

      <div className="preparacion-contenido">
        <Tablero
          flota={flota}
          zona={zona}
          seleccion={colocados[seleccionado] || null}
          onSeleccionar={bloqueado ? null : handleCasilla}
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
                  disabled={bloqueado}
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

          {listo && <p>Despliegue guardado. Esperando al rival...</p>}
          {!listo && segundos === 0 && (
            <p>Tiempo agotado. Esperando el despliegue automático del servidor...</p>
          )}

          {errorConsulta && <p className="preparacion-error">{errorConsulta}</p>}
          {error && <p className="preparacion-error">{error}</p>}

          <div className="preparacion-botones">
            <button type="button" onClick={handleAbandonar}>Abandonar</button>
            <button type="button" onClick={handleAlAzar} disabled={bloqueado}>
              Colocar al azar
            </button>
            <button type="button" onClick={handleLimpiar} disabled={bloqueado}>
              Limpiar
            </button>
            <button
              type="button"
              className="preparacion-confirmar"
              onClick={handleConfirmar}
              disabled={bloqueado || listos < tiposBarco.length}
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