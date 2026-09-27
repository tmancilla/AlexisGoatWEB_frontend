import { Link } from "react-router-dom";

import "./NoEncontrada.css";

function NoEncontrada() {
  return (
    <main className="no-encontrada">
      <p className="no-encontrada-codigo">404</p>
      <h1>Página no encontrada</h1>
      <p>Esta página recibió un impacto directo y se fue al fondo del mar.</p>
      <Link to="/">Volver al puerto</Link>
    </main>
  );
}

export default NoEncontrada;