# Munay — Landing page desktop

Entregable **5.1 Landing Page Web – Desktop** del proyecto **Munay**, una plataforma de gestión de residuos plásticos y economía circular con recojo a domicilio en Lima, Perú.

La landing presenta los cinco módulos del producto (mapa de puntos de acopio, solicitud de recojo, recompensas, mercados aliados y educación ambiental) y permite recorrer los flujos principales de punta a punta con datos de demostración, sin backend.

---

## Cómo visualizar

No requiere instalación ni build. Es HTML, CSS y JavaScript vanilla.

**Opción 1 — abrir el archivo directamente**

Abre `index.html` con doble clic. Los scripts son clásicos (no usan módulos ES), por lo que la página funciona también desde `file://`.

**Opción 2 — servidor local (recomendado)**

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Luego abre <http://127.0.0.1:4173/>.

> El diseño está pensado para escritorio (**≥ 1024 px**). No incluye estilos responsivos para tablet ni móvil, tal como pide el entregable.

---

## Estructura del proyecto

```
Landing page - sin detalles - prueba/
├── index.html              Página completa: sprite de iconos, secciones, diálogos y toasts
├── README.md               Este documento
├── assets/
│   └── img/
│       └── favicon.svg     Favicon de marca
├── css/
│   ├── base.css            Variables de diseño, reset, tipografía, utilidades y layout base
│   ├── components.css      Header, botones, formularios, tarjetas, modales y toasts
│   └── sections.css        Estilos específicos de cada sección y del footer
└── js/
    ├── data.js             Datos demo (puntos, mercados, recompensas, plásticos, precios)
    ├── ui.js               Helpers compartidos, validación, diálogos, toasts y almacenamiento
    ├── map.js              Mapa SVG, filtros, búsqueda, agrupación y geolocalización
    ├── pickup.js           Asistente de recojo, seguimiento, reprogramación, cancelación e historial
    ├── rewards.js          Saldo, catálogo, canjes, movimientos, simulador y precios
    ├── markets.js          Mercados aliados, filtros y conexión con el mapa
    ├── education.js        Guía de plásticos 1–7 y navegación por teclado
    └── main.js             Pestañas, acordeón, avisos legales, contacto, contadores y navegación
```

Todos los módulos comparten el espacio de nombres global `window.Munay` y se cargan en el orden indicado al final de `index.html`.

---

## Contenido de la página

1. **Barra de anuncio y header sticky** con navegación por anclas y saldo de puntos visible.
2. **Hero** con propuesta de valor, buscador de puntos y accesos rápidos.
3. **Mapa de puntos limpios** (HU-001 a HU-007): mapa SVG estilizado de Lima, filtros por tipo, búsqueda por distrito o dirección, agrupación de puntos, detalle con horarios y materiales, distancia estimada, geolocalización con respaldo y enlace a Google Maps.
4. **Recojo a domicilio** (HU-011 a HU-018 y HU-021): asistente de 4 pasos con validación, resumen, código de seguimiento, consulta de estado, reprogramación, cancelación e historial.
5. **Recompensas** (HU-022 a HU-025, HU-027 a HU-029): saldo y nivel, catálogo canjeable, historial de movimientos, simulador de puntos, tabla de precios y registro de acopiadores.
6. **Mercados aliados** (HU-031, HU-032 y HU-034): tarjetas de mercados, filtros por distrito y tipo, beneficios y acción para ubicar cada mercado en el mapa.
7. **Educación ambiental** (HU-033 y HU-043): guía interactiva de los códigos de plástico 1 al 7, con estado de reciclabilidad y recomendaciones.
8. **Contacto** (HU-037): formulario validado con motivo de contacto y confirmación de envío.
9. **Cuenta y accesibilidad** (HU-038, HU-046 a HU-048): saldo y nivel en la sección de recompensas, navegación por teclado, foco visible, etiquetas claras, enlace «Saltar al contenido» y avisos legales de privacidad y tratamiento de datos.

---

## Datos de demostración

| Recurso | Cantidad | Notas |
| --- | --- | --- |
| Puntos de acopio | 15 | Mercados, parques y universidades de Lima |
| Mercados aliados | 6 | Con distrito, dirección y beneficios |
| Recompensas | 6 | Desde 400 hasta 1 500 pts |
| Códigos de plástico | 7 | Del 1 (PET) al 7 (otros) |
| Saldo inicial | 1 250 pts | Nivel inicial incluido |
| Código de seguimiento demo | `MUN-00123` | Disponible en la pestaña «Estado» |

Los importes y puntos usan formato peruano (`1,250`, `18.4`, `S/ 5.40`). Las distancias del mapa son referenciales y se calculan con la fórmula de Haversine a partir de una ubicación de referencia en Lima.

> Todos los datos son ficticios y tienen fines académicos. No representan precios, horarios ni ubicaciones oficiales.

---

## Persistencia local y reinicio de la demo

La aplicación guarda el progreso en `localStorage` con el prefijo `munay:`:

| Clave | Contenido |
| --- | --- |
| `munay:points` | Saldo actual de puntos |
| `munay:movements` | Movimientos de puntos (ganados y canjeados) |
| `munay:pickups` | Solicitudes de recojo creadas |
| `munay:demoTrack` | Estado de la solicitud demo `MUN-00123` |
| `munay:messages` | Mensajes enviados desde el formulario de contacto |
| `munay:acopiadores` | Postulaciones de acopiadores |

**Para reiniciar la demo** abre la consola del navegador y ejecuta:

```js
localStorage.clear();
location.reload();
```

---

## Accesibilidad (HU-046 a HU-048)

- HTML semántico con landmarks (`header`, `nav`, `main`, `section`, `footer`), jerarquía de encabezados y textos alternativos.
- Enlace «Saltar al contenido principal» como primer elemento enfocable.
- Foco visible en todos los controles interactivos y navegación completa por teclado (pestañas con flechas, Inicio/Fin; guía de plásticos con flechas).
- Etiquetas explícitas en formularios, mensajes de error asociados, `aria-invalid`, `aria-expanded`, `aria-selected`, `aria-pressed` y regiones `aria-live`.
- Contraste de texto conforme a WCAG 2.1 AA (mínimo 4.5:1).
- Diálogos nativos con manejo de foco y cierre por teclado.
- Respeto por `prefers-reduced-motion` para desactivar animaciones.
- Avisos de privacidad y tratamiento de datos y ubicación en los formularios, más diálogos de política de privacidad y términos de uso.

**Auditoría Lighthouse:** accesibilidad, buenas prácticas y SEO con puntaje **100** y cero auditorías fallidas.

---

## Decisiones técnicas

- **Sin frameworks ni dependencias externas.** Solo HTML5 semántico, CSS3 con variables y JavaScript ES6+.
- **Sin imágenes de fotografías.** La ilustración del hero y el mapa de Lima son SVG creados a medida, lo que mantiene el peso bajo y la nitidez en cualquier pantalla.
- **Un solo breakpoint de accesibilidad** (`prefers-reduced-motion`). No hay media queries de tablet ni móvil por decisión del entregable.
- **Tipografía Inter** con respaldo del sistema.
- **Paleta de marca:** verde bosque `#064E3B`, verde azulado `#0F766E`, esmeralda `#34D399` y menta `#ECFDF5`.
- **Navegación por anclas** con desplazamiento suave y estado activo según la sección visible.
- **Componentes nativos** como `<dialog>` para modales y una pila de *toasts* para retroalimentación.

---

## Pruebas realizadas

- Asistente de recojo completo: validación por paso, resumen, generación de código, persistencia, seguimiento, reprogramación y cancelación.
- Canje de recompensas: descuento de saldo, bloqueo de recompensas sin puntos suficientes, movimientos y simulador.
- Mapa: filtros, búsqueda con *debounce*, conteo de resultados, detalle de punto, enlace a Google Maps, agrupación y geolocalización con respaldo.
- Mercados: filtros, conteos, estado vacío e integración «Ubicar en el mapa».
- Educación: los 7 códigos, actualización de detalle y navegación por teclado.
- Formularios de contacto y de acopiadores: errores, envío válido y reinicio.
- Header y layout a 1024 px sin desbordamiento horizontal.

---

## Notas académicas

- Proyecto de la carrera de Ingeniería de Sistemas de Información, curso **HCI for UX Design**, semestre IV.
- La landing es un prototipo de alta fidelidad: no procesa pagos, no envía correos reales y no se conecta a servicios externos.
- Los flujos de geolocalización y de ruta usan el navegador y Google Maps únicamente como demostración.
