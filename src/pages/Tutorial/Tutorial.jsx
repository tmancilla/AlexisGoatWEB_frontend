import "./Tutorial.css";

function Tutorial() {
  return (
    <main className="tutorial">
      <h1>Tutorial</h1>

      <section className="tutorial-section">
        <h2>Objetivo del juego</h2>

        <p>
          Guerra del Pacífico es un juego de estrategia naval por turnos
          para dos jugadores donde cada jugador controla 4 barcos y debe
          intentar destruir los 4 barcos del enemigo.
        </p>
      </section>

      <section className="tutorial-section">
        <h2>Preparación</h2>

        <p>
          El mapa es un tablero de 10x10 casillas donde cada jugador debe
          colocar sus 4 barcos dentro de su propia zona de despliegue antes
          de empezar la partida.
        </p>
      </section>

      <section className="tutorial-section">
        <h2>Turnos</h2>

        <p>
          Los jugadores juegan de forma alternada por turnos donde cada
          jugador puede hacer hasta 3 acciones durante su turno.
        </p>

        <ul>
          <li>Mover uno de sus barcos.</li>
          <li>Disparar a un objetivo.</li>
          <li>Usar el Vigía para explorar.</li>
          <li>Mejorar uno de sus barcos.</li>
        </ul>
      </section>

      <section className="tutorial-section">
        <h2>Casillas del mapa</h2>

        <ul>
          <li>Agua abierta: no tiene ningún efecto.</li>
          <li>Pozo petrolero: entrega combustible.</li>
          <li>Depósito de munición: entrega munición.</li>
          <li>Naufragio: entrega chatarra.</li>
          <li>Corriente peligrosa: causa daño al barco que entra en ella.</li>
        </ul>
      </section>

      <section className="tutorial-section">
        <h2>Niebla de guerra</h2>

        <p>
          Cada jugador solamente puede ver las casillas cercanas a sus
          propios barcos, esto significa que la posición de los barcos
          enemigos y partes del mapa no serán visibles para el jugador.
        </p>
      </section>

      <section className="tutorial-section">
        <h2>Fin de la partida</h2>

        <p>
          La partida termina cuando un jugador pierde sus 4 barcos, cuando
          un jugador abandona o cuando se completan 20 rondas.
        </p>

        <p>
          Si una flota es completamente destruida, gana el jugador que
          todavía tiene barcos. Si se llega al límite de rondas, el ganador
          se determina mediante el puntaje obtenido durante la partida.
        </p>
      </section>
    </main>
  );
}

export default Tutorial;