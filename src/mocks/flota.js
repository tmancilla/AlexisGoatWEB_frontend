
const tiposBarco = [
  {
    tipo: "LANCHA",
    nombre: "Lancha",
    letra: "L",
    casco: 1,
    movimiento: 3,
    alcance: 2,
    deteccion: 3,
    dado: "d4",
    combustiblePorCasilla: 1,
    municionPorDisparo: 1
  },
  {
    tipo: "FRAGATA",
    nombre: "Fragata",
    letra: "F",
    casco: 2,
    movimiento: 2,
    alcance: 3,
    deteccion: 2,
    dado: "d6",
    combustiblePorCasilla: 1,
    municionPorDisparo: 1
  },
  {
    tipo: "DESTRUCTOR",
    nombre: "Destructor",
    letra: "D",
    casco: 3,
    movimiento: 2,
    alcance: 4,
    deteccion: 2,
    dado: "d8",
    combustiblePorCasilla: 2,
    municionPorDisparo: 1
  },
  {
    tipo: "ACORAZADO",
    nombre: "Acorazado",
    letra: "A",
    casco: 4,
    movimiento: 1,
    alcance: 5,
    deteccion: 1,
    dado: "d10",
    combustiblePorCasilla: 2,
    municionPorDisparo: 2
  }
];

export function statsDe(tipo) {
  return tiposBarco.find((barco) => barco.tipo === tipo);
}

export default tiposBarco;
