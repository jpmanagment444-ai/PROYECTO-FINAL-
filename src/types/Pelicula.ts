export interface Pelicula {
  id: number;
  titulo: string;
  genero: string;
  anio: number;
  duracionMinutos: number;
  clasificacion: string;
  precio: number;
}

export interface RespuestaPeliculas {
  tematica: string;
  cantidad: number;
  recursos: Pelicula[];
}

export interface DatosLocales {
  peliculas: Pelicula[];
  favoritas: number[];
}