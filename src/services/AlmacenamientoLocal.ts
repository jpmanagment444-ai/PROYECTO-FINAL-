import type { DatosLocales, Pelicula } from "../types/Pelicula";

const CLAVE_ALMACENAMIENTO = "cineverse-datos-v1";

export function leerDatosLocales(): DatosLocales {
  const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);

  if (guardado === null) {
    return { peliculas: [], favoritas: [] };
  }

  let datos: unknown;
  try {
    datos = JSON.parse(guardado);
  } catch {
    throw new Error("Los datos guardados en este navegador están dañados.");
  }

  if (!esObjeto(datos) || !Array.isArray(datos.peliculas) || !Array.isArray(datos.favoritas)) {
    throw new Error("Los datos guardados en este navegador no tienen un formato válido.");
  }

  const peliculas = datos.peliculas.map((pelicula, indice) => {
    if (!esPelicula(pelicula)) {
      throw new Error(`La película guardada número ${indice + 1} no es válida.`);
    }

    return pelicula;
  });

  if (!datos.favoritas.every((id): id is number => Number.isInteger(id))) {
    throw new Error("La lista de películas favoritas guardada no es válida.");
  }

  return { peliculas, favoritas: datos.favoritas };
}

export function guardarDatosLocales(datos: DatosLocales): void {
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datos));
}

function esPelicula(valor: unknown): valor is Pelicula {
  if (!esObjeto(valor)) {
    return false;
  }

  return (
    Number.isInteger(valor.id) &&
    typeof valor.titulo === "string" &&
    typeof valor.genero === "string" &&
    Number.isInteger(valor.anio) &&
    Number.isInteger(valor.duracionMinutos) &&
    typeof valor.clasificacion === "string" &&
    Number.isInteger(valor.precio)
  );
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
