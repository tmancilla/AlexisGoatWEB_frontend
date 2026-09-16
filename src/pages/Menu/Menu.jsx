import { useState } from "react";
import { useNavigate } from "react-router-dom";

import lobby from "../../mocks/lobby";
import logo from "../../assets/logo-guerra-pacifico.png";
import "./Menu.css";

function Menu() {
  const [vista, setVista] = useState("menu");
  const [partida, setPartida] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function handleSalir() {
    if (vista === "menu") {
      navigate("/login");
      return;
    }

    setVista("menu");
    setPartida(null);
    setCodigo("");
    setError("");
  }

  function handleCrearPartida() {
    setPartida(lobby.crear);
    setVista("esperando");
  }

  function handleSimularJugadorSeUnio() {
    setPartida({ ...partida, estado: "LISTO_PARA_INICIAR" });
    setVista("listo");
  }

  function handleAbrirUnirse() {
    setVista("unirse");
  }

  function handleUnirse(event) {
    event.preventDefault();

    if (codigo === "") {
      setError("Debes ingresar un código.");
      return;
    }

    if (codigo !== lobby.codigoValido) {
      setError("Ese código no corresponde a ninguna partida.");
      return;
    }

    setError("");
    setPartida(lobby.unirse);
    setVista("listo");
  }

  function handleBuscarPartida() {
    setPartida(lobby.matchmaking.enCola);
    setVista("buscando");
  }

  function handleSimularRivalEncontrado() {
    setPartida(lobby.matchmaking.encontrado);
    setVista("listo");
  }

  function handleEntrarAlTablero() {
    navigate("/tablero");
  }

  return (
    <main className="menu">
      <button className="menu-salir" type="button" onClick={handleSalir}>
        Salir
      </button>

      <img className="menu-logo" src={logo} alt="Logo Guerra del Pacífico" />

      {vista === "menu" && (
        <>
          <h1>Guerra del Pacífico</h1>

          <div className="menu-buttons">
            <button type="button" onClick={handleBuscarPartida}>
              Buscar Partida
            </button>

            <button type="button" onClick={handleAbrirUnirse}>
              Introducir Código de Partida
            </button>

            <button type="button" onClick={handleCrearPartida}>
              Crear Partida
            </button>
          </div>
        </>
      )}

      {vista === "esperando" && (
        <section className="menu-panel">
          <h2>Esperando jugador...</h2>

          <p className="menu-estado">{partida.estado}</p>

          <p className="menu-label">Comparte este código para que se unan:</p>

          <p className="menu-codigo">{partida.codigoInvitacion}</p>

          <button type="button" onClick={handleSimularJugadorSeUnio}>
            Simular que se unió un jugador
          </button>
        </section>
      )}

      {vista === "unirse" && (
        <section className="menu-panel">
          <h2>Introducir código</h2>

          <form className="menu-form" onSubmit={handleUnirse}>
            <label htmlFor="codigo">Código de invitación</label>

            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(event) => setCodigo(event.target.value)}
            />

            {error && <p className="menu-error">{error}</p>}

            <button type="submit">Unirse</button>
          </form>
        </section>
      )}

      {vista === "buscando" && (
        <section className="menu-panel">
          <h2>Buscando rival...</h2>

          <p className="menu-estado">{partida.estado}</p>

          <p className="menu-label">
            Posición en la cola: {partida.posicionEnCola}
          </p>

          <button type="button" onClick={handleSimularRivalEncontrado}>
            Simular que se encontró rival
          </button>
        </section>
      )}

      {vista === "listo" && (
        <section className="menu-panel">
          <h2>Partida lista</h2>

          <p className="menu-estado">{partida.estado}</p>

          <p className="menu-label">Partida: {partida.partidaId}</p>

          {partida.oponente && (
            <p className="menu-label">Rival: {partida.oponente.username}</p>
          )}

          <button type="button" onClick={handleEntrarAlTablero}>
            Entrar al tablero
          </button>
        </section>
      )}
    </main>
  );
}

export default Menu;
