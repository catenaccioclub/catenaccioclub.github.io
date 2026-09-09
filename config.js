// Pegá acá los dos datos que te da Supabase en Settings > API.
// Mientras digan TU-..., la página funciona en modo muestra y no guarda nada.

window.SUPABASE_URL = "TU-URL-DE-SUPABASE";
window.SUPABASE_ANON_KEY = "TU-CLAVE-ANON-PUBLICA";

// La clave "anon" es pública a propósito: va en el navegador de cada cliente.
// Lo que protege los datos son las reglas de la base (ver supabase.sql).
// La clave "service_role" NO va nunca acá.
