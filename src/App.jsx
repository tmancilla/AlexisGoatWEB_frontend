import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Menu from "./pages/Menu/Menu";
import Tutorial from "./pages/Tutorial/Tutorial";
import Nosotros from "./pages/Nosotros/Nosotros";
import Preparacion from "./pages/Preparacion/Preparacion";
import Partida from "./pages/Partida/Partida";
import NoEncontrada from "./pages/NoEncontrada/NoEncontrada";

function App() {
  const [usuario, setUsuario] = useState(() => {
    const guardado = sessionStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null;
  });

  function handleLogin(usuarioRecibido) {
    sessionStorage.setItem("usuario", JSON.stringify(usuarioRecibido));
    setUsuario(usuarioRecibido);
  }

  function handleLogout() {
    sessionStorage.removeItem("usuario");
    setUsuario(null);
  }

  return (
    <BrowserRouter>
      <Navbar usuario={usuario} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="/menu" element={usuario ? <Menu usuario={usuario} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/preparacion" element={usuario ? <Preparacion /> : <Navigate to="/login" replace />} />
        <Route path="/tablero" element={usuario ? <Partida /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;