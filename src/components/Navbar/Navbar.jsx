import { Link } from "react-router-dom";

import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">Guerra del Pacífico</Link>
      <Link to="/nosotros">Nosotros</Link>
    </nav>
  );
}

export default Navbar;