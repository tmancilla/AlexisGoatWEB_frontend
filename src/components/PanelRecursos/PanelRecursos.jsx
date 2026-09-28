import "./PanelRecursos.css";

const ACCIONES_POR_TURNO = 3;

function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return `${minutos}:${String(resto).padStart(2, "0")}`;
}

function PanelRecursos({
  recursos,
  accionesRestantes,
  ronda,
  rondaMaxima,
  evento = null,
  esMiTurno = true,
  segundosRestantes = null,
  rival = null
}) {

  const items = [
    { id: "combustible", nombre: "Combustible", simbolo: "⛽", valor: recursos.combustible },
    { id: "municion", nombre: "Munición", simbolo: "📦", valor: recursos.municion },
    { id: "chatarra", nombre: "Chatarra", simbolo: "🔩", valor: recursos.chatarra }];

  const acciones = Array.from({ length: ACCIONES_POR_TURNO }, (_, i) => i < accionesRestantes);

  return (
    <aside className="panel">
      <section className="panel-bloque">
        <h2>Recursos</h2>

        <ul className="panel-recursos">
          {items.map((item) => (
            <li key={item.id} className="panel-recurso">
              <span className="panel-recurso-simbolo" aria-hidden="true">{item.simbolo}</span>
              <span className="panel-recurso-nombre">{item.nombre}</span>
              <span className="panel-recurso-valor">{item.valor}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel-bloque">
        <h2>Turno</h2>

        <p className={esMiTurno ? "panel-turno panel-turno--mio" : "panel-turno"}>
          {esMiTurno ? "Es tu turno" : "Turno del rival"}
        </p>

        <p className="panel-dato">
          Ronda {ronda} de {rondaMaxima}
        </p>

        {segundosRestantes !== null && (
          <p className="panel-dato">
            Tiempo restante: <span className="panel-reloj">{formatearTiempo(segundosRestantes)}</span>
          </p>
        )}

        <p className="panel-dato">Acciones</p>

        <ul className="panel-acciones">
          {acciones.map((disponible, indice) => (
            <li
              key={`accion-${indice}`}
              className={disponible ? "panel-accion panel-accion--libre" : "panel-accion"}
            >
              <span className="panel-accion-texto">
                {disponible ? "Disponible" : "Usada"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {evento && (
        <section className="panel-bloque">
          <h2>Evento de la ronda</h2>
          <p className="panel-evento">{evento.carta.replace("_", " ")}</p>
          <p className="panel-dato">{evento.efecto}</p>
        </section>
      )}

      {rival && (
        <section className="panel-bloque">
          <h2>Rival</h2>
          <p className="panel-dato">{rival.username}</p>
          <p className="panel-dato">Barcos a flote: {rival.barcosAFlote}</p>
          <p className="panel-dato">
            {rival.conectado ? "Conectado" : "Desconectado"}
          </p>
        </section>
      )}
    </aside>
  );
}

export default PanelRecursos;
