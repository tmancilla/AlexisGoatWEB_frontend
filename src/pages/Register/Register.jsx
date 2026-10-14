import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const API_URL = import.meta.env.VITE_API_URL;

function Register({ onLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [codigoadminInput, setcodigoadminInput] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      username === "" ||
      email === "" ||
      password === "" ||
      confirmPassword === "" ||
      role === ""
    ) {
      setError("Debes completar todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setError("");

    try {
      const respuesta = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          role: role,
          codigoAdmin: codigoadminInput,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.mensaje || "No se pudo registrar la cuenta.");
        return;
      }

      onLogin(datos.usuario);
      navigate("/menu");
    } catch {
      setError("No se pudo conectar con el servidor.");
    }
  }

  return (
    <main className="register">
      <h1>Registrarse</h1>

      <form className="register-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Nombre de usuario</label>

        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <label htmlFor="email">Correo electrónico</label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="password">Contraseña</label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <label htmlFor="confirm-password">Confirmar contraseña</label>

        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        <label htmlFor="role">Tipo de usuario</label>

        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="">Selecciona un tipo de usuario</option>
          <option value="Jugador">Jugador</option>
          <option value="Administrador">Administrador</option>
        </select>

        {role === "Administrador" && (
          <>
            <label htmlFor="admin-code">Código de administrador</label>

            <input
              id="admin-code"
              type="password"
              value={codigoadminInput}
              onChange={(event) => setcodigoadminInput(event.target.value)}
            />
          </>
        )}

        {error && <p className="register-error">{error}</p>}

        <button type="submit">Registrarse</button>
      </form>
    </main>
  );
}

export default Register;