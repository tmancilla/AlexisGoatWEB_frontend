const API_URL = import.meta.env.VITE_API_URL;

export async function pedirApi(ruta, { metodo = "GET", usuarioId, cuerpo } = {}) {
  const headers = {};

  if (usuarioId !== undefined) {
    headers["X-Usuario-Id"] = String(usuarioId);
  }

  if (cuerpo !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;

  if (!respuesta.ok) {
    const error = new Error(datos?.mensaje || "Ocurrió un error en el servidor.");
    error.status = respuesta.status;
    error.codigo = datos?.codigo;
    throw error;
  }

  return { status: respuesta.status, datos };
}