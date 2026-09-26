import { Link, useNavigate, useLocation } from "react-router-dom";

import "./Navbar.css";

const RUTAS_PARTIDA = ["/preparacion", "/tablero"];

function Navbar({ usuario, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const enPartida = RUTAS_PARTIDA.includes(location.pathname);

  function handleCerrarSesion() {
    onLogout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/">Guerra del Pacífico</Link>

      <div className="navbar-links">
        {!enPartida && (
          <>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/tutorial">Tutorial</Link>
          </>
        )}

        {usuario ? (
          <>
            <Link to="/menu">Menú</Link>
            <span className="navbar-usuario">{usuario.username}</span>
            {!enPartida && (
              <button type="button" className="navbar-salir" onClick=
                {handleCerrarSesion}>
                Cerrar sesión
              </button>
            )}
          </>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;