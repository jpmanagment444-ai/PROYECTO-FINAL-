import type { RespuestaPeliculas } from "../types/Pelicula";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://proyecto-final-programacion-creativa-production.up.railway.app/api/peliculas";

export async function obtenerPeliculas(): Promise<RespuestaPeliculas> {
  const respuesta = await fetch(API_URL);

  if (!respuesta.ok) {
    throw new Error(`La API respondió con el estado ${respuesta.status}.`);
  }

  const datos: unknown = await respuesta.json();
  if (!esObjeto(datos) || !Array.isArray(datos.recursos)) {
    throw new Error("La respuesta de la API no contiene una lista de películas válida.");
  }

  const recursos = datos.recursos.map((recurso, indice) => {
    if (
      !esObjeto(recurso) ||
      typeof recurso.id !== "number" ||
      typeof recurso.titulo !== "string" ||
      typeof recurso.genero !== "string" ||
      typeof recurso.anio !== "number" ||
      typeof recurso.duracionMinutos !== "number" ||
      typeof recurso.clasificacion !== "string" ||
      typeof recurso.precio !== "number"
    ) {
      throw new Error(`La película número ${indice + 1} tiene un formato inválido.`);
    }

    return {
      id: recurso.id,
      titulo: recurso.titulo,
      genero: recurso.genero,
      anio: recurso.anio,
      duracionMinutos: recurso.duracionMinutos,
      clasificacion: recurso.clasificacion,
      precio: recurso.precio,
    };
  });

  return {
    tematica: typeof datos.tematica === "string" ? datos.tematica : "Películas",
    cantidad: recursos.length,
    recursos,
  };
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}