import { useEffect, useState, type FormEvent } from "react";
import "./App.css";

import type { DatosLocales, Pelicula } from "./types/Pelicula";
import { guardarDatosLocales, leerDatosLocales } from "./services/AlmacenamientoLocal";
import { obtenerPeliculas } from "./services/PeliculasAPI";
import ListaPeliculas from "./components/ListaPeliculas";

interface CamposFormulario {
  titulo: string;
  genero: string;
  anio: string;
  duracionMinutos: string;
  clasificacion: string;
  precio: string;
}

const FORMULARIO_VACIO: CamposFormulario = {
  titulo: "",
  genero: "",
  anio: "",
  duracionMinutos: "",
  clasificacion: "",
  precio: "",
};

function iniciarAlmacenamiento(): { datos: DatosLocales; error: string } {
  try {
    return { datos: leerDatosLocales(), error: "" };
  } catch (err) {
    console.error(err);
    return {
      datos: { peliculas: [], favoritas: [] },
      error: err instanceof Error
        ? err.message
        : "No se pudieron leer los datos guardados en este navegador.",
    };
  }
}

function App() {
  const [datosLocales, setDatosLocales] = useState(iniciarAlmacenamiento);
  const [peliculasApi, setPeliculasApi] = useState<Pelicula[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorApi, setErrorApi] = useState("");
  const [errorAlmacenamiento, setErrorAlmacenamiento] = useState(datosLocales.error);
  const [busqueda, setBusqueda] = useState("");
  const [generoSeleccionado, setGeneroSeleccionado] = useState("Todos");
  const [soloFavoritas, setSoloFavoritas] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [camposFormulario, setCamposFormulario] = useState(FORMULARIO_VACIO);
  const [errorFormulario, setErrorFormulario] = useState("");

  const peliculas = [...peliculasApi, ...datosLocales.datos.peliculas];

  async function cargarPeliculas() {
    try {
      setCargando(true);
      setErrorApi("");
      const respuesta = await obtenerPeliculas();
      setPeliculasApi(respuesta.recursos);
    } catch (err) {
      console.error(err);
      setErrorApi(err instanceof Error ? err.message : "No se pudieron cargar las películas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let solicitudActiva = true;

    obtenerPeliculas()
      .then((respuesta) => {
        if (solicitudActiva) {
          setPeliculasApi(respuesta.recursos);
        }
      })
      .catch((err: unknown) => {
        if (solicitudActiva) {
          console.error(err);
          setErrorApi(err instanceof Error ? err.message : "No se pudieron cargar las películas.");
        }
      })
      .finally(() => {
        if (solicitudActiva) {
          setCargando(false);
        }
      });

    return () => {
      solicitudActiva = false;
    };
  }, []);

  function guardarCambiosLocales(nuevosDatos: DatosLocales): boolean {
    try {
      guardarDatosLocales(nuevosDatos);
      setDatosLocales({ datos: nuevosDatos, error: "" });
      setErrorAlmacenamiento("");
      return true;
    } catch (err) {
      console.error(err);
      setErrorAlmacenamiento(
        err instanceof Error
          ? `No se pudo guardar el cambio: ${err.message}`
          : "No se pudo guardar el cambio en este navegador.",
      );
      return false;
    }
  }

  function alternarFavorita(id: number) {
    const favoritasActuales = datosLocales.datos.favoritas;
    const nuevasFavoritas = favoritasActuales.includes(id)
      ? favoritasActuales.filter((favorito) => favorito !== id)
      : [...favoritasActuales, id];

    guardarCambiosLocales({ ...datosLocales.datos, favoritas: nuevasFavoritas });
  }

  function crearPelicula(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorFormulario("");

    const titulo = camposFormulario.titulo.trim();
    const genero = camposFormulario.genero.trim();
    const anio = Number(camposFormulario.anio);
    const duracionMinutos = Number(camposFormulario.duracionMinutos);
    const precio = Number(camposFormulario.precio);
    const clasificacion = camposFormulario.clasificacion;

    if (
      !titulo ||
      !genero ||
      !camposFormulario.anio ||
      !camposFormulario.duracionMinutos ||
      !clasificacion ||
      !camposFormulario.precio
    ) {
      setErrorFormulario("Completa todos los campos obligatorios antes de guardar.");
      return;
    }

    if (!Number.isInteger(anio) || anio < 1888 || anio > new Date().getFullYear() + 5) {
      setErrorFormulario("Escribe un año válido entre 1888 y los próximos cinco años.");
      return;
    }

    if (!Number.isInteger(duracionMinutos) || duracionMinutos < 1 || duracionMinutos > 600) {
      setErrorFormulario("La duración debe ser un número entero entre 1 y 600 minutos.");
      return;
    }

    if (!Number.isInteger(precio) || precio < 1) {
      setErrorFormulario("El precio debe ser un número entero mayor que cero.");
      return;
    }

    const id = Math.min(
      0,
      ...datosLocales.datos.peliculas.map((pelicula) => pelicula.id),
    ) - 1;
    const pelicula: Pelicula = {
      id,
      titulo,
      genero,
      anio,
      duracionMinutos,
      clasificacion,
      precio,
    };

    if (guardarCambiosLocales({
      ...datosLocales.datos,
      peliculas: [...datosLocales.datos.peliculas, pelicula],
    })) {
      setCamposFormulario(FORMULARIO_VACIO);
      setFormularioAbierto(false);
      setBusqueda("");
      setGeneroSeleccionado("Todos");
      setSoloFavoritas(false);
    }
  }

  if (cargando && peliculas.length === 0) {
    return (
      <main className="estado-pagina">
        <div className="estado-contenido">
          <span className="marca-icono" aria-hidden="true">C</span>
          <p className="ceja">CINEVERSE · CARTELERA</p>
          <h1>Preparando la función</h1>
          <p>Cargando las películas para ti...</p>
        </div>
      </main>
    );
  }

  const generos = [
    "Todos",
    ...new Set(peliculas.map((pelicula) => pelicula.genero)),
  ];

  const peliculasFiltradas = peliculas.filter((pelicula) => {
    const coincideBusqueda = pelicula.titulo
      .toLocaleLowerCase("es")
      .includes(busqueda.trim().toLocaleLowerCase("es"));
    const coincideGenero =
      generoSeleccionado === "Todos" || pelicula.genero === generoSeleccionado;
    const coincideFavoritas =
      !soloFavoritas || datosLocales.datos.favoritas.includes(pelicula.id);

    return coincideBusqueda && coincideGenero && coincideFavoritas;
  });

  return (
    <main className="contenedor">
      <header className="barra-superior">
        <a className="marca" href="#" aria-label="CineVerse, inicio">
          <span className="marca-icono" aria-hidden="true">C</span>
          <span>CINE<span>VERSE</span></span>
        </a>
        <span className="barra-etiqueta">EL CINE, A TU MANERA</span>
      </header>

      <section className="portada">
        <div className="portada-contenido">
          <p className="ceja"><span /> TU PRÓXIMA HISTORIA COMIENZA AQUÍ</p>
          <h1>Una buena película<br />lo <span>cambia todo.</span></h1>
          <p className="portada-descripcion">
            Encuentra tu próxima favorita entre historias que se quedan contigo.
          </p>
          <a className="boton-portada" href="#cartelera">
            Explorar cartelera <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="portada-arte" aria-hidden="true">
          <div className="halo halo-externo" />
          <div className="halo halo-interno" />
          <span className="portada-claqueta">✳</span>
          <span className="portada-sello">EST. 2024<br />CINEVERSE</span>
        </div>
      </section>

      <section className="cartelera" id="cartelera">
        <div className="encabezado-seccion">
          <div>
            <p className="ceja">SELECCIÓN PARA TI</p>
            <h2>La cartelera</h2>
          </div>
          <p className="resumen">
            <strong>{peliculasFiltradas.length}</strong> de {peliculas.length} películas
            <span className="resumen-favoritas">
              · {datosLocales.datos.favoritas.length} favoritas
            </span>
          </p>
        </div>

        <div className="acciones-cartelera">
          <p>Tu próxima película favorita está más cerca.</p>
          <button
            type="button"
            className="boton-agregar"
            aria-expanded={formularioAbierto}
            aria-controls="formulario-pelicula"
            onClick={() => {
              setFormularioAbierto(!formularioAbierto);
              setErrorFormulario("");
            }}
          >
            <span aria-hidden="true">{formularioAbierto ? "−" : "+"}</span>
            {formularioAbierto ? "Cerrar formulario" : "Agregar película"}
          </button>
        </div>

        {formularioAbierto && (
          <section className="formulario-panel" id="formulario-pelicula">
            <div className="formulario-encabezado">
              <div>
                <p className="ceja">AMPLÍA TU COLECCIÓN</p>
                <h3>Nueva película</h3>
              </div>
              <p>Se guardará solo en este navegador.</p>
            </div>
            <form className="formulario-pelicula" onSubmit={crearPelicula} noValidate>
              <div className="campo-formulario">
                <label htmlFor="titulo-pelicula">Título *</label>
                <input
                  id="titulo-pelicula"
                  required
                  maxLength={100}
                  value={camposFormulario.titulo}
                  onChange={(evento) => setCamposFormulario({
                    ...camposFormulario,
                    titulo: evento.target.value,
                  })}
                  placeholder="Ej. La llegada"
                />
              </div>
              <div className="campo-formulario">
                <label htmlFor="genero-pelicula">Género *</label>
                <input
                  id="genero-pelicula"
                  required
                  maxLength={40}
                  value={camposFormulario.genero}
                  onChange={(evento) => setCamposFormulario({
                    ...camposFormulario,
                    genero: evento.target.value,
                  })}
                  placeholder="Ej. Ciencia ficción"
                />
              </div>
              <div className="campo-formulario">
                <label htmlFor="anio-pelicula">Año *</label>
                <input
                  id="anio-pelicula"
                  type="number"
                  required
                  min="1888"
                  max={new Date().getFullYear() + 5}
                  step="1"
                  value={camposFormulario.anio}
                  onChange={(evento) => setCamposFormulario({
                    ...camposFormulario,
                    anio: evento.target.value,
                  })}
                  placeholder="2024"
                />
              </div>
              <div className="campo-formulario">
                <label htmlFor="duracion-pelicula">Duración (min) *</label>
                <input
                  id="duracion-pelicula"
                  type="number"
                  required
                  min="1"
                  max="600"
                  step="1"
                  value={camposFormulario.duracionMinutos}
                  onChange={(evento) => setCamposFormulario({
                    ...camposFormulario,
                    duracionMinutos: evento.target.value,
                  })}
                  placeholder="120"
                />
              </div>
              <div className="campo-formulario">
                <label htmlFor="clasificacion-pelicula">Clasificación *</label>
                <select
                  id="clasificacion-pelicula"
                  required
                  value={camposFormulario.clasificacion}
                  onChange={(evento) => setCamposFormulario({
                    ...camposFormulario,
                    clasificacion: evento.target.value,
                  })}
                >
                  <option value="">Selecciona una clasificación</option>
                  <option value="Todo público">Todo público</option>
                  <option value="+12">+12</option>
                  <option value="+15">+15</option>
                  <option value="+18">+18</option>
                </select>
              </div>
              <div className="campo-formulario">
                <label htmlFor="precio-pelicula">Precio de entrada (COP) *</label>
                <input
                  id="precio-pelicula"
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={camposFormulario.precio}
                  onChange={(evento) => setCamposFormulario({
                    ...camposFormulario,
                    precio: evento.target.value,
                  })}
                  placeholder="18000"
                />
              </div>
              {errorFormulario && (
                <p className="error-formulario" role="alert">{errorFormulario}</p>
              )}
              <div className="acciones-formulario">
                <button className="boton-agregar" type="submit">Guardar película</button>
                <span>* Campos obligatorios</span>
              </div>
            </form>
          </section>
        )}

        {errorAlmacenamiento && (
          <p className="aviso-persistencia" role="alert">{errorAlmacenamiento}</p>
        )}
        {errorApi && (
          <div className="aviso-api" role="alert">
            <p>No se pudo actualizar la cartelera: {errorApi}</p>
            <button type="button" className="btn-reintentar" onClick={cargarPeliculas}>
              Reintentar
            </button>
          </div>
        )}

        <div className="controles">
          <div className="control-grupo control-busqueda">
            <label htmlFor="busqueda">Buscar película</label>
            <span className="icono-busqueda" aria-hidden="true">⌕</span>
            <input
              id="busqueda"
              type="search"
              placeholder="¿Qué te gustaría ver?"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          </div>
          <div className="control-grupo">
            <label htmlFor="genero">Género</label>
            <select
              id="genero"
              value={generoSeleccionado}
              onChange={(evento) => setGeneroSeleccionado(evento.target.value)}
            >
              {generos.map((genero) => (
                <option key={genero} value={genero}>{genero}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={`filtro-favoritas${soloFavoritas ? " activo" : ""}`}
            aria-pressed={soloFavoritas}
            onClick={() => setSoloFavoritas(!soloFavoritas)}
          >
            <span aria-hidden="true">★</span>
            {soloFavoritas ? "Ver toda la cartelera" : "Solo favoritas"}
          </button>
        </div>

        {peliculasFiltradas.length === 0 ? (
          <div className="sin-resultados">
            <p>
              {peliculas.length === 0
                ? "Todavía no hay películas en la cartelera. Puedes agregar la primera."
                : soloFavoritas && datosLocales.datos.favoritas.length === 0
                  ? "Aún no tienes favoritas. Usa el botón de una película para guardarla aquí."
                  : "No encontramos películas con esos criterios. Prueba con otra búsqueda."}
            </p>
          </div>
        ) : (
          <ListaPeliculas
            peliculas={peliculasFiltradas}
            favoritas={datosLocales.datos.favoritas}
            onAlternarFavorita={alternarFavorita}
          />
        )}
      </section>

      <footer className="pie-pagina">
        <a className="marca marca-pie" href="#" aria-label="CineVerse, inicio">
          <span className="marca-icono" aria-hidden="true">C</span>
          <span>CINE<span>VERSE</span></span>
        </a>
        <p>Hecho para quienes aman las buenas historias.</p>
        <span>© 2026 CINEVERSE</span>
      </footer>
    </main>
  );
}

export default App;
