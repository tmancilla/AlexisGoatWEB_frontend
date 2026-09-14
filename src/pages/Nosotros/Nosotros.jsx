import "./Nosotros.css";

function Nosotros() {
  return (
    <main className="nosotros">
      <h1>Nosotros</h1>

      <section className="nosotros-proyecto">
        <h2>Sobre el proyecto</h2>

        <p>
          Guerra del Pacífico es un juego de estrategia naval por turnos
          para dos jugadores, donde el combate se combina con la gestión
          de recursos y la exploración del mapa.
        </p>

        <p>
          El juego está inspirado en Battleship, agregando movimiento de
          barcos, administración de recursos y niebla de guerra para crear
          una experiencia más estratégica.
        </p>
      </section>

      <section className="nosotros-equipo">
        <h2>Equipo de desarrollo</h2>

        <div className="equipo">
          <article className="integrante">
            <h3>Vicente Vial</h3>
            <p>
              Desarrollo de interfaces y menús como la Landing Page,
              Menú Principal e Inicio de Sesión.
            </p>
          </article>

          <article className="integrante">
            <h3>Tomás Mancilla</h3>
            <p>
              Configuración de React y desarrollo de la lógica del juego.
            </p>
          </article>

          <article className="integrante">
            <h3>Miguel Mujica</h3>
            <p>
              Desarrollo de la lógica del juego.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Nosotros;