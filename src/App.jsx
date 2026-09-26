import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar/Navbar";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Menu from "./pages/Menu/Menu";
import Tutorial from "./pages/Tutorial/Tutorial";
import Nosotros from "./pages/Nosotros/Nosotros";
import Preparacion from "./pages/Preparacion/Preparacion";
import Partida from "./pages/Partida/Partida";

function App() {

  const [usuario, setUsuario] = useState(null);

  function handleLogout() {
    setUsuario(null);
  }

  return (
    <BrowserRouter>
      <Navbar usuario={usuario} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={setUsuario} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Menu onLogout={handleLogout} />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/preparacion" element={<Preparacion />} />
        <Route path="/tablero" element={<Partida />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;