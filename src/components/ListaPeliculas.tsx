import type { Pelicula } from "../types/Pelicula";
import PeliculaCard from "./PeliculaCard";

interface ListaPeliculasProps {
  peliculas: Pelicula[];
  favoritas: number[];
  onAlternarFavorita: (id: number) => void;
}

function ListaPeliculas({
  peliculas,
  favoritas,
  onAlternarFavorita,
}: ListaPeliculasProps) {
  return (
    <section className="lista-peliculas">
      {peliculas.map((pelicula) => (
        <PeliculaCard
          key={pelicula.id}
          pelicula={pelicula}
          esFavorita={favoritas.includes(pelicula.id)}
          onAlternarFavorita={onAlternarFavorita}
        />
      ))}
    </section>
  );
}

export default ListaPeliculas;