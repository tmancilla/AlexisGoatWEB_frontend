import { useState } from "react";
import { useNavigate } from "react-router-dom";
import usuarios from "../../mocks/usuarios";
import codigoadmin from "../../mocks/codigoadmin";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [codigoadminInput, setcodigoadminInput] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function handleSubmit(event) {
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

    if (role === "Administrador" && codigoadminInput !== codigoadmin) {
      setError("El código de administrador es incorrecto.");
      return;
    }

    const usernameExistente = usuarios.find(
      (usuario) => usuario.username === username
    );

    if (usernameExistente) {
      setError("Ese nombre de usuario ya está registrado.");
      return;
    }

    const emailExistente = usuarios.find(
      (usuario) => usuario.email === email
    );

    if (emailExistente) {
      setError("Ese correo ya está registrado.");
      return;
    }

    usuarios.push({
      username: username,
      email: email,
      password: password,
      role: role
    });

    setError("");
    navigate("/login");
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