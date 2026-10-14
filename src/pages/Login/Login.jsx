import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (username === "" || password === "") {
      setError("Debes completar todos los campos.");
      return;
    }

    setError("");

    try {
      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.mensaje || "No se pudo iniciar sesión.");
        return;
      }

      onLogin(datos.usuario);
      navigate("/menu");
    } catch {
      setError("No se pudo conectar con el servidor.");
    }
  }

  return (
    <main className="login">
      <h1>Iniciar sesión</h1>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Nombre de usuario</label>

        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <label htmlFor="password">Contraseña</label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit">Iniciar sesión</button>
      </form>
    </main>
  );
}

export default Login;