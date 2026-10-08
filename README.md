# CineVerse

Catálogo web para explorar películas, buscar por título, filtrar por género y guardar una lista personal de favoritas. La colección inicial viene de la API del proyecto; las películas que se agregan y las favoritas se guardan en el navegador.

## Problema y persona usuaria

- **Persona usuaria:** persona aficionada al cine que quiere descubrir opciones para ver y comparar información básica de películas.
- **Problema observado o supuesto:** se asume que una cartelera larga sin búsqueda ni filtros hace más lento encontrar una película adecuada.
- **Solución:** reunir películas en una cartelera con búsqueda, filtros, datos de cada título y una lista de favoritas persistente.

## Requisitos y alcance

### Incluye

- Carga inicial de la cartelera desde la API con estados de carga, error, reintento y lista vacía.
- Búsqueda por título combinable con filtro de género y vista de favoritas.
- Tarjetas reutilizables con año, género, duración, clasificación, precio y póster.
- Acción para agregar o quitar películas de favoritas.
- Formulario validado para agregar películas locales.
- Persistencia local de nuevas películas y favoritas después de recargar.
- Diseño adaptable a móvil y escritorio.

### Fuera del alcance

- Cuentas de usuario y sincronización entre dispositivos.
- Cambios o escrituras en la API, pagos y compra de entradas.
- Edición o eliminación de películas.

## Tecnologías y ejecución

- React y TypeScript
- Vite
- `fetch` para la consulta HTTP
- `localStorage` para cambios locales

Requiere Node.js y npm.

```bash
npm install
npm run dev
```

Para comprobar el proyecto antes de publicarlo:

```bash
npm run build
npm run lint
```

## API y modelo de datos

La aplicación hace una consulta `GET` a:

```text
https://proyecto-final-programacion-creativa-production.up.railway.app/api/peliculas
```

Puedes sobrescribir la dirección para desarrollo o despliegue definiendo `VITE_API_URL` en un archivo `.env.local`:

```text
VITE_API_URL=https://ejemplo.com/api/peliculas
```

La API responde con una envoltura que contiene `tematica`, `cantidad` y `recursos`. Cada elemento de `recursos` tiene este formato:

```json
{
  "id": 1,
  "titulo": "Interstellar",
  "genero": "Ciencia ficción",
  "anio": 2014,
  "duracionMinutos": 169,
  "clasificacion": "+12",
  "precio": 18000
}
```

`obtenerPeliculas` revisa el estado HTTP, lee el JSON como dato desconocido y comprueba la forma de la colección y los campos de cada película antes de usarlos. La aplicación usa el tipo `Pelicula` definido en `src/types/Pelicula.ts`.

## Persistencia

La API se usa solo para leer la cartelera inicial. No recibe cambios de la aplicación.

`src/services/AlmacenamientoLocal.ts` guarda bajo la clave `cineverse-datos-v1`:

- películas creadas desde el formulario;
- identificadores de las películas favoritas.

Los datos permanecen en el mismo navegador y perfil. No se sincronizan entre navegadores ni dispositivos. Si el almacenamiento está dañado o no se puede escribir, la interfaz informa el problema.

## Estructura del proyecto

```text
src/
├── components/
│   ├── ListaPeliculas.tsx
│   └── PeliculaCard.tsx
├── services/
│   ├── AlmacenamientoLocal.ts
│   └── PeliculasAPI.ts
├── types/
│   └── Pelicula.ts
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

## Comprobaciones de aceptación

1. Abrir la página y verificar que llegan al menos ocho películas de la API.
2. Buscar un título y elegir un género; ambos filtros deben aplicarse simultáneamente.
3. Marcar una película como favorita, activar “Solo favoritas” y recargar la página: debe seguir marcada.
4. Abrir “Agregar película”, enviar el formulario vacío y comprobar el mensaje de validación; luego crear una película válida y recargar: debe aparecer en la cartelera.
5. Probar la aplicación con una ventana angosta y comprobar que no hay desplazamiento horizontal.
6. Desconectar la API o usar una URL inválida y comprobar el mensaje y el botón para reintentar.
7. Con una respuesta válida que contenga cero películas, comprobar el estado vacío y que el formulario permite agregar la primera.

## Publicación

La aplicación aún no tiene una URL pública configurada. Para completar la entrega:

1. Publica el repositorio en GitHub.
2. Importa el repositorio desde Vercel y conserva el comando de build `npm run build` y el directorio de salida `dist`.
3. Si cambiaste la API, define `VITE_API_URL` en las variables de entorno del proyecto de Vercel y vuelve a desplegar.
4. Reemplaza este texto con el enlace público de la aplicación.

**Aplicación publicada:** pendiente de despliegue.

## Uso de IA

Se utilizó asistencia de IA para revisar requisitos e implementar partes de la interfaz y la persistencia. El código y las decisiones deben ser revisados y explicados por quien presenta el proyecto.
