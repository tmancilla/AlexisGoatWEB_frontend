import { useState } from "react";
import { useNavigate } from "react-router-dom";
import usuarios from "../../mocks/usuarios";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    if (username === "" || password === "") {
      setError("Debes completar todos los campos.");
      return;
    }

    const usuario = usuarios.find(
      (usuario) =>
        usuario.username === username && usuario.password === password
    );

    if (!usuario) {
      setError("Nombre de usuario o contraseña incorrectos.");
      return;
    }

    setError("");
    navigate("/menu");
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