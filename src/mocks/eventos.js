// las cuatro cartas de evento, el servidor revela una al inicio de cada ronda
// aca la elegimos en el cliente solo para que el mock se vea vivo al cambiar de ronda
const eventos = [
  {
    carta: "TORMENTA",
    efecto: "Radio de detección -1 para todos los barcos esta ronda"
  },
  {
    carta: "BOTIN_FLOTANTE",
    efecto: "Aparece un bono de 2 recursos en una casilla vacía al azar"
  },
  {
    carta: "SABOTAJE",
    efecto: "Un jugador elegido al azar pierde 1 de munición"
  },
  {
    carta: "MAREA_ALTA",
    efecto: "Las corrientes peligrosas no hacen daño esta ronda"
  }
];

export function eventoAlAzar() {
  return eventos[Math.floor(Math.random() * eventos.length)];
}

export default eventos;
