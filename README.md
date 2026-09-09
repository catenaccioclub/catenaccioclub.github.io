# Turnos — Catenaccio Barber Club

Sistema de turnos online para la barbería de Muñiz 908, CABA. Una sola página:
los clientes reservan solos y el barbero maneja la agenda desde el mismo link.

- **Reservar** — el cliente elige servicio, día y hora, y deja nombre y WhatsApp.
  Solo ve horarios realmente libres. Después puede cancelar y agregar el turno
  al calendario del celular.
- **Panel** — el barbero entra con su correo y contraseña. Ve la agenda del día
  con teléfonos y total a cobrar, cancela turnos, bloquea ratos y edita
  horarios, servicios, precios y barberos.

Todo cuesta cero pesos por mes. Lo único opcional que se paga es un dominio propio.

---

## Puesta en marcha

Son tres pasos y se hace en una tarde. No hace falta saber programar.

### 1. La base de datos (Supabase)

1. Creá una cuenta gratis en [supabase.com](https://supabase.com) y un proyecto
   nuevo. Elegí la región **South America (São Paulo)**, que es la más cercana.
2. Entrá a **SQL Editor → New query**, pegá todo el contenido de
   [`supabase.sql`](supabase.sql) y apretá **Run**. Eso crea las tablas y las
   reglas de acceso.
3. Andá a **Authentication → Users → Add user** y creá **un solo usuario**, con
   el correo y la contraseña del barbero. Marcá "Auto Confirm User". Ese es el
   login del panel.
4. En **Authentication → Providers**, desactivá el registro público
   ("Allow new users to sign up"). Así nadie más puede crearse una cuenta.
5. Entrá a **Settings → API** y copiá dos cosas: la **Project URL** y la clave
   **anon public**.

### 2. Los datos de conexión

Abrí `config.js` con cualquier editor de texto y reemplazá los dos valores por
los que copiaste:

```js
window.SUPABASE_URL = "https://xxxxxxxx.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOi...";
```

La clave `anon` es pública a propósito, viaja en el navegador de cada cliente.
Lo que protege los datos son las reglas del paso 1. La clave `service_role`
nunca va acá.

### 3. Publicar la página

La opción más simple, sin instalar nada:

1. Entrá a [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arrastrá la carpeta entera del proyecto a la ventana.
3. En un minuto te da una dirección tipo `catenaccio.netlify.app`.
   Desde **Site settings → Change site name** le podés poner el nombre que quieras.

Sirven igual Vercel, Cloudflare Pages o GitHub Pages. Los cuatro tienen plan
gratis de por vida para un sitio de este tamaño.

Para actualizar más adelante, volvés a arrastrar la carpeta.

---

## Primer uso

1. Abrí el link y entrá a **Panel** con el correo y la contraseña del paso 1.3.
2. Cargá los horarios reales, los servicios con sus precios y los barberos.
   Apretá **Guardar ajustes**.
3. Listo. Ese mismo link es el que se pega en la bio de Instagram y se manda por
   WhatsApp. Los clientes entran a **Reservar**, no necesitan cuenta ni contraseña.

En el celular conviene abrirlo una vez y usar **Agregar a pantalla de inicio**.
Queda con ícono propio y se abre a pantalla completa, igual que una app de la tienda.

---

## Qué hay que saber

- **La agenda es visible.** Cualquiera que abra el link ve qué horarios están
  ocupados, igual que en cualquier turnera. Los nombres y teléfonos solo se ven
  desde el panel, que pide contraseña.
- **Un cliente puede cancelar un turno si sabe su identificador.** Las reglas de
  la base solo permiten cancelar, nunca reescribir ni borrar. Un turno cancelado
  queda registrado.
- **No manda recordatorios solo.** El barbero ve el teléfono en la agenda y
  escribe él. Automatizar el WhatsApp requiere una cuenta de WhatsApp Business
  API, que sí tiene costo.
- **El plan gratis de Supabase pausa el proyecto si pasa una semana entera sin
  uso.** Con una barbería trabajando eso no ocurre; si igual pasara, se
  reactiva con un clic desde el panel de Supabase.

---

## Archivos

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | La aplicación entera: pantalla, lógica y estilos |
| `config.js` | Las dos claves de Supabase. Es el único archivo que hay que tocar |
| `supabase.sql` | Tablas y reglas de acceso de la base |
| `manifest.json` | Datos para que el celular la instale como app |
| `icon.svg` | Ícono de la pantalla de inicio |
