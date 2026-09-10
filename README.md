# Turnos — Catenaccio Barber Club

Sistema de turnos online para la barbería de Muñiz 908, CABA. Una sola página:
los clientes reservan solos y el barbero maneja la agenda desde el mismo link.

- **Reservar** — el cliente elige servicio, día y hora, y deja nombre y WhatsApp.
  Solo ve horarios realmente libres. Después puede cancelar y agregar el turno
  al calendario del celular.
- **Panel** — el barbero entra con su correo y contraseña. Ve la agenda del día
  con teléfonos y total a cobrar, cancela turnos, bloquea ratos y edita
  horarios, servicios, precios y barberos.

Todo cuesta cero pesos por mes: GitHub Pages y Supabase, los dos en plan gratuito.

---

## Estado

Ya está todo montado y andando. Este es el mapa de lo que existe:

| | |
| --- | --- |
| Sitio | https://catenaccioclub.github.io |
| Repositorio | `catenaccioclub/catenaccioclub.github.io` |
| Base de datos | Proyecto `catenaccio-turnos`, organización Catenaccio, región San Pablo |

Para actualizar el sitio: editás los archivos y hacés `git push`. GitHub Pages
republica solo en un par de minutos.

---

## Lo único que falta: las dos cuentas de acceso

El panel pide correo y contraseña, y todavía no hay ninguna cargada.

1. En Supabase, **Authentication → Users → Add user → Create new user**.
   Creá dos, marcando "Auto Confirm User" en las dos: una para el barbero y
   otra para vos.
2. En **Authentication → Sign In / Providers**, desactivá "Allow new users to
   sign up". Así nadie más se crea una cuenta.
3. Copiá el identificador de cada usuario y corré esto en el **SQL Editor**,
   cambiando los valores:

```sql
insert into public.perfiles (id, nombre, rol) values
  ('ID-DEL-BARBERO', 'Nombre del barbero', 'dueno'),
  ('TU-ID',          'Patricio',           'admin')
on conflict (id) do update set nombre = excluded.nombre, rol = excluded.rol;
```

Sin el paso 3 las dos cuentas entran igual, pero las dos como dueño, así que la
firma del pie no te va a aparecer.

---

## Primer uso

1. Abrí el link y entrá a **Panel** con cualquiera de las dos cuentas.
   Arriba a la derecha vas a ver con cuál entraste y con qué rol.
2. Cargá los horarios reales, los servicios con sus precios y los barberos.
   Apretá **Guardar ajustes**.
3. Listo. Ese mismo link es el que se pega en la bio de Instagram y se manda por
   WhatsApp. Los clientes entran a **Reservar**, no necesitan cuenta ni contraseña.

En el celular conviene abrirlo una vez y usar **Agregar a pantalla de inicio**.
Queda con ícono propio y se abre a pantalla completa, igual que una app de la tienda.

---

## Los dos accesos

| | Dueño (el barbero) | Administrador (vos) |
| --- | --- | --- |
| Agenda, cancelar, bloquear | sí | sí |
| Horarios, servicios, precios, barberos | sí | sí |
| Importe y vencimiento de la suscripción | sí | sí |
| Firma del pie de página | no la ve | edita |

Los dos entran por la misma pantalla. El rol sale de la tabla `perfiles`, así que
para cambiarlo se toca la base, no la app.

## La suscripción mensual

En el panel, dentro de Ajustes, hay una sección con el importe por mes, la fecha
del próximo vencimiento y un enlace de pago. Muestra cuántos días faltan, avisa
en el panel cinco días antes y sigue avisando cuando se pasó.

**El cobro no lo hace la app.** Generá una suscripción desde tu cuenta de
Mercado Pago (Tu negocio → Suscripciones → Crear), copiá el enlace y pegalo en
el campo "Enlace de pago". La app lleva la cuenta, Mercado Pago cobra. Cuando
entra un pago, apretás **Registrar el pago del mes** y el vencimiento se corre
treinta días.

Hay una casilla, **Pausar los turnos nuevos cuando el pago esté vencido**. Si la
dejás apagada, un vencimiento solo muestra el aviso y la barbería sigue
trabajando igual. Si la prendés, los clientes ven un cartel que los manda a
pedir turno por WhatsApp y no pueden reservar solos hasta que se regularice. La
agenda cargada nunca se toca ni se pierde.

## Tu firma

También en Ajustes, y solo visible para el administrador, cargás tu nombre, tu
WhatsApp y tu correo. Aparecen en letra chica al pie de la página, con el
teléfono enlazado a WhatsApp y el correo a un mail.

## Qué hay que saber

- **El repositorio es público y no hay problema.** GitHub Pages gratuito exige
  que lo sea. Lo único parecido a una clave que vive acá es la `anon` de
  Supabase, que es pública por diseño y viaja igual en el navegador de cada
  cliente. La clave `service_role` y las contraseñas de las cuentas nunca están
  en estos archivos.

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
| `config.js` | La dirección y la clave publicable de Supabase, ya cargadas |
| `supabase.sql` | Tablas y reglas de acceso de la base |
| `manifest.json` | Datos para que el celular la instale como app |
| `icon.svg` | Ícono de la pantalla de inicio |
