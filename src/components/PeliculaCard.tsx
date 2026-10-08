import { useState } from "react";
import type { Pelicula } from "../types/Pelicula";

interface PeliculaCardProps {
  pelicula: Pelicula;
  esFavorita: boolean;
  onAlternarFavorita: (id: number) => void;
}

const postersPorPelicula: Record<number, string> = {
  1: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  2: "https://upload.wikimedia.org/wikipedia/en/1/1c/Godfather_ver1.jpg",
  3: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
  4: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  5: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
  6: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
  7: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
  8: "https://image.tmdb.org/t/p/w500/gCqnQaq8T4CfioP9uETLx9iMJF4.jpg",
  9: "https://image.tmdb.org/t/p/w500/7lyBcpYB0Qt8gYhXYaEZUNlNQAv.jpg",
  10: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  11: "https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
  12: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  13: "https://image.tmdb.org/t/p/w500/rplLJ2hPcOQmkFhTqUte0MkEaO2.jpg",
  14: "https://upload.wikimedia.org/wikipedia/en/5/53/Amelie_poster.jpg",
  15: "https://image.tmdb.org/t/p/w500/dtIIyQyALk57ko5bjac7hi01YQ.jpg",
};

function PeliculaCard({
  pelicula,
  esFavorita,
  onAlternarFavorita,
}: PeliculaCardProps) {
  const [posterFallido, setPosterFallido] = useState(false);
  const poster = postersPorPelicula[pelicula.id];

  return (
    <article className="pelicula-card">
      <div className="poster-contenedor">
        {poster && !posterFallido ? (
          <img
            className="poster"
            src={poster}
            alt={`Póster de ${pelicula.titulo}`}
            loading="lazy"
            onError={() => setPosterFallido(true)}
          />
        ) : (
          <div className="poster-respaldo" role="img" aria-label={`Póster de ${pelicula.titulo}`}>
            <span aria-hidden="true">C</span>
            <strong>{pelicula.titulo}</strong>
          </div>
        )}
        <span className="poster-clasificacion">{pelicula.clasificacion}</span>
      </div>

      <div className="pelicula-info">
        <p className="pelicula-genero">{pelicula.genero}</p>
        <h3>{pelicula.titulo}</h3>
        <div className="pelicula-detalles">
          <span>{pelicula.anio}</span>
          <span className="detalle-separador" aria-hidden="true">·</span>
          <span>{pelicula.duracionMinutos} min</span>
        </div>
        <div className="pelicula-precio">
          <span>Entrada desde</span>
          <strong>${pelicula.precio.toLocaleString("es-CO")}</strong>
        </div>
        <button
          className={`boton-favorita${esFavorita ? " activa" : ""}`}
          type="button"
          aria-pressed={esFavorita}
          onClick={() => onAlternarFavorita(pelicula.id)}
        >
          <span aria-hidden="true">{esFavorita ? "★" : "☆"}</span>
          {esFavorita ? "En favoritos" : "Agregar a favoritos"}
        </button>
      </div>
    </article>
  );
}

export default PeliculaCard;