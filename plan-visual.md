# Plan visual — revisión UX/UI de homepadel.store

Revisión hecha entrando al sitio en producción (`www.homepadel.store`) como un usuario real, más lectura del código fuente para las pantallas que la inestabilidad actual del backend no dejó cargar de forma confiable. Fecha: 2026-09-09.

**Cómo leer esto:** primero los bloqueantes (nada de lo demás importa si el catálogo no carga), después el resto por página, con prioridad.

## P0 — Bloqueantes (antes que cualquier ajuste visual)

### 1. Backend inestable — 503 en ráfaga, intermitente
Cargando la misma página dos veces seguidas, unas veces trae productos y otras da `503` en *todos* los endpoints (`products`, `categories`, `brands`, `site-sections/*`, `instagram/posts`) al mismo tiempo. No es un endpoint puntual roto, es el proceso del backend cayéndose/reiniciándose. No tengo acceso a los logs de Railway para ver la causa (memoria, crash loop, etc.) — hay que revisarlo ahí directamente. Mientras esto no esté estable, ninguna otra mejora de UX se nota: la mitad de las visitas van a ver el catálogo vacío.

### 2. CORS mal configurado en producción → 500 real
Ya lo reporté y corregí por separado (rama `fix-cors-500-produccion`, pendiente de que se cargue `FRONTEND_URL=https://www.homepadel.store` en Railway). Lo repito acá porque es la explicación de buena parte de los "500 por todos lados" que se ven al navegar.

### 3. Precio $0 mostrado en vivo — YA CORREGIDO
`FeaturedProductCard.tsx` (el carrusel de "Productos destacados" del home) no validaba `salePrice > 0` antes de mostrarlo, a diferencia del resto de los componentes de producto. Un producto con `salePrice: 0` cargado en el backoffice se mostraba como **"$0"** con un badge de **"-100%"**, mientras el checkout (que sí valida esto) cobraba el precio de lista real. Es el bug detrás de "veo el producto en 0 y el carrito cobra 120.000".

Corregido de raíz: el backend ahora expone `effectivePrice` (un solo cálculo, reusado por checkout y por la API de productos) y los 10 lugares del frontend que reimplementaban esta cuenta por su cuenta —algunos bien, algunos mal— ahora usan ese campo. Ver commit en `fix-cors-500-produccion`.

### 4. "CYBER MONDAY TEST" en un banner de producción
El banner promocional debajo de "Productos destacados" dice literalmente **"CYBER MONDAY TEST"**. Es contenido de prueba cargado en el backoffice (`Banners`) que quedó publicado. Sacarlo o cambiarle el texto — a un cliente real esto le resta confianza inmediatamente.

### 5. Productos de prueba mezclados con catálogo real
Vi al menos un producto llamado **"Bolso Nox 6 Palas Test"** en la API de productos. Si es de prueba, desactivarlo (`active: false`) para que no aparezca en la tienda pública.

## Catálogo (`/catalogo`)

- **Estado vacío no distingue "no hay resultados" de "falló la carga".** `CatalogEmpty.tsx` muestra el mismo mensaje ("Sin resultados... no hay productos disponibles por el momento") tanto si de verdad no hay productos como si el fetch falló por el problema del punto P0.1. Con el backend tan inestable, un usuario ve "no hay productos" cuando en realidad es un error transitorio — debería distinguir el caso y ofrecer un botón "Reintentar".
- El ícono del estado vacío es un emoji (🔍 con un signo +) que en algunas fuentes/SO se ve como un cuadrado roto — usar un ícono de la librería (`lucide-react`, ya se usa en todo el resto del sitio) en vez de un emoji para consistencia visual.
- Sidebar de filtros: no pude verificarla en vivo (catálogo vacío en el momento de la revisión) — repetir esta parte del review cuando el backend esté estable. Por código se ve completa (categoría, marca, talle, color, peso, ordenar, grid/lista).

## Producto (`/producto/[slug]`)

- No pude cargar una ficha de producto en vivo por la inestabilidad (probé con un slug real tres veces, las tres dio "Producto no encontrado").
- **Ese mismo mensaje — "Producto no encontrado" — se muestra tanto si el slug realmente no existe como si la petición al backend falló.** Mismo problema que en el catálogo: el usuario no puede distinguir "este producto se descontinuó" de "hubo un error, probá de nuevo". Agregar un estado de error separado con botón de reintentar sería una mejora real de confianza, no solo estética.
- La página de "no encontrado" es muy pobre visualmente: fondo negro, un texto chico y un link. Sin ilustración, sin sugerencia de productos, sin buscador. Comparado con el resto del sitio (que tiene buena identidad visual) se siente como una pantalla default de Next.js. Vale la pena una versión con la estética real de la marca y, si se puede, una fila de "Productos que te pueden interesar".

## Carrito y Checkout

- Revisé el código (no pude generar un carrito con productos reales en vivo por la inestabilidad). La lógica de precio, envío y cupón ya está corregida en base al trabajo de P1/P2 de la sesión anterior — el número que ve el usuario en pantalla ahora es el mismo que se cobra.
- El ícono del carrito en el header ya muestra bien el contador ("1") — funciona incluso con la inestabilidad del catálogo, porque lee del carrito local (localStorage), no de la API. Buen dato: el carrito sobrevive a que el backend esté caído.
- Falta, a nivel UX (no bug): un mensaje visible quando `orderError` aparece que no sea solo texto rojo chico bajo el resumen — en un flujo de pago, un error debería ser más notorio (por ejemplo, con un ícono y fondo diferenciado), porque hoy compite visualmente con el resto de la info del resumen y es fácil que el usuario no lo vea y reintente sin entender qué pasó.

## Home (`/`)

Lo que se ve bien, para no perderlo de vista en el rediseño:
- Hero con carrusel, mensaje claro, botón de CTA visible.
- Barra de beneficios (envíos, garantía, cuotas, atención) justo debajo del hero — buena práctica de ecommerce.
- Sección "Sobre Home Pádel" con los tres pilares (pasión, atención, experiencia) — bien resuelta.
- Testimonios con nombre, iniciales y comentario — genera confianza.
- Marcas que trabajamos — logos reconocibles (Babolat, Adidas, Wilson, Bullpadel, etc.), refuerza legitimidad.

Para mejorar:
- **Categorías**: las tres cards (Accesorios, Zapatillas, Indumentaria) tienen buen tratamiento visual, pero solo se ven 3 — el catálogo tiene más categorías (Paletas, Bolsos, etc. según la data que vi en la API). Confirmar si es intencional mostrar solo 3 o si es un límite hardcodeado que convendría revisar.
- **Sección Instagram** ("Seguinos y viví Home Pádel"): cuando `instagram/posts` falla (que en este momento pasa seguido, ver P0.1), la sección se ve con placeholders vacíos sin texto ni fallback visual — mismo patrón de "no distingue error de vacío" que el resto del sitio.
- El badge de descuento ahora que está arreglado (punto P0.3) hay que volver a mirar en vivo una vez el backend esté estable, para confirmar visualmente que los `-19.9%`, `-14.9%` reales se ven bien y ya no aparece ningún `-100%` espurio.

## Contacto (`/contacto`)

- El formulario ("Envianos tu mensaje") usa **solo placeholder como label** en los 5 campos (Nombre, Email, Teléfono, Asunto, Mensaje) — no hay `<label>` visible ni asociado. Esto es un problema de accesibilidad real (un lector de pantalla no anuncia qué campo es cuál una vez que el usuario empieza a tipear y el placeholder desaparece) y también de UX (en formularios largos, placeholders que desaparecen hacen que el usuario pierda de referencia qué campo es cuál). Agregar labels visibles arriba de cada input, aunque sea chicos.
- **"No hay canales disponibles."** — texto crudo que se ve en la sección de canales de contacto cuando `contact-channels` falla o vuelve vacío (lo vi en vivo). Es un mensaje de debug, no de producto. Si la sección no tiene datos, ocultarla en vez de mostrar un texto que parece un error interno filtrado a producción.
- El resto de la página (hero "Contactanos", info de horarios, FAQ debajo si carga) tiene buena jerarquía visual.

## Footer (global, todas las páginas)

- Buena estructura: categorías, ayuda, contacto con horario, medios de pago, medios de envío, newsletter.
- **Medios de envío muestra CA/OCA/Andreani como si los tres estuvieran activos**, pero según la config de `payment_methods` que consulté por API, OCA y Andreani están con `active: false`. Si el footer no filtra por ese flag, un cliente puede pensar que envía por OCA/Andreani cuando en realidad la tienda solo tiene integrado Correo Argentino. Confirmar y, si corresponde, ocultar los logos de los medios inactivos.
- Newsletter al final del footer: correcto visualmente, sin poder probar el submit en vivo por la inestabilidad.

## Accesibilidad — patrón general a revisar

Encontrado en Contacto, probablemente se repite en Checkout y Cuenta (no pude confirmar en vivo por P0.1, pero el patrón de placeholder-sin-label es el mismo en varios formularios del código):
- Inputs sin `<label>` asociado, solo `placeholder`.
- Ningún `aria-live` visible para mensajes de error de formulario (el error se inserta en el DOM pero un lector de pantalla no lo anuncia automáticamente al aparecer).

## Mobile

No pude tomar capturas reales en mobile en esta sesión (la herramienta de resize de ventana no aplicó al viewport de captura). Por código sí confirmé que existe un menú hamburguesa propio para `lg:hidden` (breakpoint 1024px) con panel desplegable — la estructura está resuelta. Pendiente: repetir el review completo en un dispositivo o emulador real para juzgar espaciados, tamaños de tap-target y el carrito/checkout en mobile, que es donde más ecommerce pierden ventas y no se pudo auditar acá.

## Resumen de prioridad

| Prioridad | Ítem |
|---|---|
| 🔴 Crítico | Backend inestable (503 en ráfaga) — bloquea todo lo demás |
| 🔴 Crítico | CORS (`FRONTEND_URL` en Railway) — ya con fix de código, falta la variable |
| 🔴 Crítico | Precio $0 — **ya corregido**, falta deploy |
| 🟠 Alto | Sacar "CYBER MONDAY TEST" y productos de prueba de producción |
| 🟠 Alto | Distinguir "sin resultados" de "error al cargar" en catálogo y producto, con reintentar |
| 🟠 Alto | Labels reales en formularios (Contacto, y revisar Checkout/Cuenta) |
| 🟡 Medio | Página "Producto no encontrado" — rediseñar con la identidad de marca |
| 🟡 Medio | "No hay canales disponibles" y placeholders de Instagram — ocultar en vez de mostrar texto de error |
| 🟡 Medio | Confirmar medios de envío inactivos (OCA/Andreani) no se muestren en el footer |
| 🟢 Bajo | Ícono del estado vacío del catálogo (cambiar emoji por ícono de la librería) |
| ⚪ Pendiente de re-revisión | Mobile completo, carrito/checkout en vivo, ficha de producto en vivo — una vez el backend esté estable |
