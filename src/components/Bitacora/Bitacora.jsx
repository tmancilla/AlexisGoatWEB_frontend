import "./Bitacora.css";

function Bitacora({ acciones }) {
  return (
    <section className="bitacora">
      <h2>Bitácora</h2>

      <ul className="bitacora-lista">
        {[...acciones].reverse().map((accion, indice) => (
          <li key={acciones.length - 1 - indice}>{accion}</li>
        ))}
      </ul>
    </section>
  );
}

export default Bitacora;