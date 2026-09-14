import { Link } from "react-router-dom";

import "./Landing.css";
import logo from "../../assets/logo-guerra-pacifico.png";

function Landing() {
  return (
    <main className="landing">
      <img src={logo} alt="Logo Guerra del Pacífico" />

      <h1>Guerra del Pacífico</h1>

      <p className="landing-subtitle">
        Juego de estrategia naval para dos jugadores.
      </p>

      <div className="landing-buttons">
        <Link to="/login">Iniciar sesión</Link>
        <Link to="/register">Registrarse</Link>
        <Link to="/tutorial">Tutorial</Link>
      </div>
    </main>
  );
}

export default Landing;