import "./BoardCell.css";

// simbolo que se pinta segun lo que haya en la casilla
const simbolosCasilla = {
  POZO_PETROLERO: "⛽",
  DEPOSITO_MUNICION: "📦",
  NAUFRAGIO: "⚓",
  CORRIENTE_PELIGROSA: "🌀",
  CHATARRA: "🔩"
};

const nombresCasilla = {
  AGUA_ABIERTA: "agua abierta",
  POZO_PETROLERO: "pozo petrolero",
  DEPOSITO_MUNICION: "depósito de munición",
  NAUFRAGIO: "naufragio",
  CORRIENTE_PELIGROSA: "corriente peligrosa",
  CHATARRA: "chatarra"
};

// el texto del aria-label lo armamos aparte porque cambia harto segun el caso
function describir(x, y, tipo, barco, niebla) {
  const posicion = `casilla ${x}, ${y}`;
  if (barco) {
    const duenio = barco.propio ? "barco propio" : "barco enemigo";
    const estado = barco.aFlote ? "a flote" : "hundido";
    return `${posicion}, ${duenio} ${barco.tipo.toLowerCase()} ${estado}`;
  }
  if (niebla) return `${posicion}, sin explorar`;
  return `${posicion}, ${nombresCasilla[tipo] || "agua abierta"}`;
}

// el barco enemigo que perdimos de vista se pinta apagado, asi se nota que es la ultima
// posicion conocida y no donde esta ahora
function clasesBarco(barco) {
  const clases = ["celda-barco"];
  clases.push(barco.propio ? "celda-barco--propio" : "celda-barco--enemigo");
  if (!barco.propio && barco.visible === false) clases.push("celda-barco--perdido");
  return clases.join(" ");
}

function BoardCell({
  x,
  y,
  tipo = null,
  barco = null,
  niebla = false,
  seleccionada = false,
  disponible = false,
  enZona = false,
  onClick = null
}) {
  const clases = ["celda"];
  if (niebla && !barco) clases.push("celda--niebla");
  if (enZona) clases.push("celda--zona");
  if (disponible) clases.push("celda--disponible");
  if (seleccionada) clases.push("celda--seleccionada");

  // sin onClick la celda igual se renderiza pero queda muerta, sirve para tableros de solo lectura
  const manejarClick = () => {
    if (onClick) onClick(x, y);
  };

  return (
    <button
      type="button"
      className={clases.join(" ")}
      onClick={manejarClick}
      disabled={!onClick}
      aria-label={describir(x, y, tipo, barco, niebla)}
    >
      {!barco && !niebla && simbolosCasilla[tipo] && (
        <span className="celda-recurso">{simbolosCasilla[tipo]}</span>
      )}

      {barco && (
        <span className={clasesBarco(barco)}>{barco.letra}</span>
      )}

      {/* el casco viene null cuando el enemigo esta fuera del radio de deteccion */}
      {barco && barco.aFlote && barco.casco !== null && (
        <span className="celda-casco">{barco.casco}</span>
      )}

      {barco && !barco.aFlote && <span className="celda-hundido">✖</span>}

      {barco && barco.propio === false && barco.visible === false && (
        <span className="celda-contacto">?</span>
      )}
    </button>
  );
}

export default BoardCell;
