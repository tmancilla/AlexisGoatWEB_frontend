import "./Bitacora.css";

function Bitacora({ acciones }) {
  return (
    <section className="bitacora">
      <h2>Bitácora</h2>

      <ul>
        {acciones.map((accion, indice) => (
          <li key={indice}>{accion}</li>
        ))}
      </ul>
    </section>
  );
}

export default Bitacora;