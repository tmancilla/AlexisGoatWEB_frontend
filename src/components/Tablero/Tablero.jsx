import { Fragment } from "react";

import BoardCell from "../BoardCell/BoardCell";
import { statsDe } from "../../mocks/flota";
import "./Tablero.css";

const TAMANO = 10;
const LETRAS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

// 1..10, lo usamos para las dos vueltas del map que arman la grilla
const coordenadas = Array.from({ length: TAMANO }, (_, i) => i + 1);

function clave(x, y) {
  return `${x},${y}`;
}

// deja los barcos propios y los contactos enemigos en un solo mapa por casilla
// asi cada celda pregunta una vez y no recorremos los arrays 100 veces
function indexarBarcos(flota, contactos) {
  const mapa = new Map();

  flota.forEach((barco) => {
    const stats = statsDe(barco.tipo);
    mapa.set(clave(barco.casilla.x, barco.casilla.y), {
      ...barco,
      letra: stats ? stats.letra : "?",
      propio: true,
      visible: true});
  });

  contactos.forEach((contacto) => {
    const stats = statsDe(contacto.tipo);
    mapa.set(clave(contacto.casilla.x, contacto.casilla.y), {
      ...contacto,
      letra: stats ? stats.letra : "?",
      propio: false});
  });

  return mapa;
}

function Tablero({
  casillas = [],
  flota = [],
  contactos = [],
  seleccion = null,
  disponibles = [],
  zona = null,
  onSeleccionar = null
}) {
  const mapaCasillas = new Map(casillas.map((casilla) => [clave(casilla.x, casilla.y), casilla]));
  const mapaBarcos = indexarBarcos(flota, contactos);
  const setDisponibles = new Set(disponibles.map((casilla) => clave(casilla.x, casilla.y)));

  return (
    <div className="tablero" role="grid" aria-label="Tablero de la partida">
      <span className="tablero-esquina" aria-hidden="true" />

      {coordenadas.map((x) => (
        <span key={`columna-${x}`} className="tablero-label" aria-hidden="true">
          {LETRAS[x - 1]}
        </span>
      ))}

      {coordenadas.map((y) => (
        <Fragment key={`fila-${y}`}>
          <span className="tablero-label" aria-hidden="true">{y}</span>

          {coordenadas.map((x) => {
            const casilla = mapaCasillas.get(clave(x, y));
            const barco = mapaBarcos.get(clave(x, y));
            // si no llego la casilla en el estado es porque esta fuera del radio de deteccion
            const niebla = !casilla && !barco;
            const enZona = zona ? y >= zona.desde && y <= zona.hasta : false;

            return (
              <BoardCell
                key={clave(x, y)}
                x={x}
                y={y}
                tipo={casilla ? casilla.tipo : null}
                barco={barco || null}
                niebla={niebla}
                enZona={enZona}
                disponible={setDisponibles.has(clave(x, y))}
                seleccionada={
                  seleccion !== null && seleccion.x === x && seleccion.y === y
                }
                onClick={onSeleccionar}
              />
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

export default Tablero;
