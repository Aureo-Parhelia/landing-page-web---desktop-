/* ============================================================
   main.js — Navegación, pestañas, acordeón, legales y contacto
   ============================================================ */
(function () {
  'use strict';

  const M = window.Munay;
  if (!M) return;

  const reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Año del footer ---------- */
  const year = M.$('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Header con sombra al hacer scroll ---------- */
  const header = M.$('#site-header');
  if (header) {
    const syncHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 6);
    };
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
  }

  /* ---------- Pestañas accesibles ---------- */
  function setupTabs() {
    const tablists = M.$$('[role="tablist"]');

    function activateTab(tab, focus) {
      const list = tab.closest('[role="tablist"]');
      if (!list) return;

      const tabs = M.$$('[role="tab"]', list);

      tabs.forEach(function (item) {
        const selected = item === tab;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;

        const panel = document.getElementById(item.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });

      if (focus) tab.focus();
    }

    tablists.forEach(function (list) {
      const tabs = M.$$('[role="tab"]', list);

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          activateTab(tab, false);
        });

        tab.addEventListener('keydown', function (event) {
          const index = tabs.indexOf(tab);
          let nextIndex = null;

          if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
          else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
          else if (event.key === 'Home') nextIndex = 0;
          else if (event.key === 'End') nextIndex = tabs.length - 1;

          if (nextIndex === null) return;
          event.preventDefault();
          activateTab(tabs[nextIndex], true);
        });
      });
    });

    return {
      open: function (name) {
        const tab = document.getElementById('tab-' + String(name).replace(/^tab-/, ''));
        if (tab && tab.getAttribute('role') === 'tab') activateTab(tab, false);
      }
    };
  }

  M.tabs = setupTabs();

  /* ---------- Acordeón de consejos ---------- */
  M.$$('[data-accordion]').forEach(function (accordion) {
    const triggers = M.$$('.acc-trigger', accordion);

    function setOpen(trigger, open) {
      trigger.setAttribute('aria-expanded', String(open));
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) panel.hidden = !open;

      const item = trigger.closest('.acc-item');
      if (item) item.classList.toggle('is-open', open);
    }

    triggers.forEach(function (trigger) {
      setOpen(trigger, trigger.getAttribute('aria-expanded') === 'true');

      trigger.addEventListener('click', function () {
        setOpen(trigger, trigger.getAttribute('aria-expanded') !== 'true');
      });

      trigger.addEventListener('keydown', function (event) {
        const index = triggers.indexOf(trigger);
        let nextIndex = null;

        if (event.key === 'ArrowDown') nextIndex = (index + 1) % triggers.length;
        else if (event.key === 'ArrowUp') nextIndex = (index - 1 + triggers.length) % triggers.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = triggers.length - 1;

        if (nextIndex === null) return;
        event.preventDefault();
        triggers[nextIndex].focus();
      });
    });
  });

  /* ---------- Avisos legales (HU-048) ---------- */
  const legalContent = {
    privacidad: {
      title: 'Política de privacidad',
      body:
        '<h3>Quién trata tus datos</h3>' +
        '<p>Munay S.A.C., con domicilio en Av. La Mar 1234, San Miguel, Lima, es responsable de los datos personales que nos compartes a través de esta plataforma. Atendemos consultas en <strong>hola@munay.pe</strong>.</p>' +
        '<h3>Qué datos recopilamos</h3>' +
        '<ul>' +
          '<li>Datos de identificación y contacto: nombre, DNI, celular y correo electrónico.</li>' +
          '<li>Datos de recojo: dirección, referencia, distrito, vivienda, fecha y franja horaria.</li>' +
          '<li>Datos de actividad: materiales entregados, peso, puntos acumulados y canjes realizados.</li>' +
          '<li>Datos de ubicación aproximada, solo si activas el botón «Cerca de mí».</li>' +
        '</ul>' +
        '<h3>Para qué los usamos</h3>' +
        '<p>Usamos tus datos para coordinar el recojo, verificar la cobertura de tu distrito, acreditar puntos, gestionar canjes y responderte cuando nos escribes. No vendemos tus datos ni los cedemos a terceros ajenos al servicio.</p>' +
        '<h3>Tu ubicación</h3>' +
        '<p>La ubicación es opcional. Al pulsar «Cerca de mí» el navegador te pide permiso y las coordenadas se usan únicamente para ordenar los puntos de acopio por distancia. En este prototipo no se almacenan ni se envían a un servidor. Si rechazas el permiso, puedes buscar por distrito o dirección.</p>' +
        '<h3>Almacenamiento local</h3>' +
        '<p>El prototipo guarda en tu navegador (localStorage) tus solicitudes, puntos y preferencias para que puedas probar el flujo sin crear una cuenta. Puedes borrar esa información desde la configuración de tu navegador.</p>' +
        '<h3>Conservación y seguridad</h3>' +
        '<p>Conservamos los datos mientras exista una relación con el servicio y durante los plazos legales aplicables. Aplicamos medidas técnicas y organizativas razonables para protegerlos.</p>' +
        '<h3>Tus derechos</h3>' +
        '<p>Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (Ley N.º 29733) escribiendo a <strong>privacidad@munay.pe</strong>. Responderemos en un plazo máximo de 10 días hábiles.</p>' +
        '<h3>Cambios en esta política</h3>' +
        '<p>Si actualizamos esta política, publicaremos la nueva versión en esta página con su fecha de vigencia. El uso continuado del servicio implica la aceptación de los cambios.</p>'
    },
    terminos: {
      title: 'Términos de uso',
      body:
        '<h3>1. Aceptación</h3>' +
        '<p>Al usar la plataforma Munay aceptas estos términos. Si no estás de acuerdo, no utilices el servicio. El prototipo es una demostración académica y no constituye una oferta comercial vinculante.</p>' +
        '<h3>2. Servicio y cobertura</h3>' +
        '<p>Munay conecta a vecinos de Lima con puntos de acopio, recojos a domicilio y recompensas por reciclar plástico. La cobertura de recojo depende del distrito y puede cambiar sin previo aviso. El servicio es gratuito desde 2 kg de plásticos seleccionados.</p>' +
        '<h3>3. Cuenta y puntos</h3>' +
        '<p>Los puntos Munay son un beneficio del programa, no tienen valor monetario, no son transferibles y vencen a los 12 meses de su acreditación. Los canjes están sujetos a stock y disponibilidad. Los puntos se acreditan después de verificar el peso y la calidad del material entregado.</p>' +
        '<h3>4. Recojos y material aceptado</h3>' +
        '<p>Debes entregar plásticos limpios, secos y separados según la guía. No se aceptan residuos peligrosos, orgánicos ni materiales no listados. Si el material no cumple las condiciones, el acopiador puede rechazarlo o reprogramar la visita.</p>' +
        '<h3>5. Reprogramaciones y cancelaciones</h3>' +
        '<p>Puedes reprogramar o cancelar sin costo hasta 12 horas antes de la franja elegida. Las cancelaciones reiteradas o la entrega de material contaminado pueden suspender el acceso al programa.</p>' +
        '<h3>6. Mercados aliados</h3>' +
        '<p>Los beneficios de los mercados aliados son responsabilidad de cada comercio participante. Munay actúa como facilitador y no garantiza la disponibilidad permanente de cada promoción.</p>' +
        '<h3>7. Uso adecuado</h3>' +
        '<p>No está permitido usar la plataforma para fines ilícitos, suplantar a otra persona, manipular el sistema de puntos o intentar vulnerar su seguridad.</p>' +
        '<h3>8. Propiedad intelectual</h3>' +
        '<p>La marca, los textos, las ilustraciones y el código de Munay son de titularidad de sus autores. No se permite su reproducción comercial sin autorización previa.</p>' +
        '<h3>9. Responsabilidad</h3>' +
        '<p>Munay no se responsabiliza por daños indirectos derivados del uso del prototipo ni por la información de terceros enlazada desde esta página. El servicio se ofrece «tal cual» para fines demostrativos.</p>' +
        '<h3>10. Ley aplicable</h3>' +
        '<p>Estos términos se rigen por la legislación peruana. Cualquier controversia se resolverá en los tribunales competentes de Lima. Para consultas, escríbenos a <strong>hola@munay.pe</strong>.</p>'
    }
  };

  const legalDialog = M.$('#legal-dialog');
  const legalTitle = M.$('#legal-title');
  const legalBody = M.$('#legal-body');

  function openLegal(key) {
    const content = legalContent[key];
    if (!content || !legalDialog) return;

    if (legalTitle) legalTitle.textContent = content.title;
    if (legalBody) legalBody.innerHTML = content.body;
    M.openDialog(legalDialog);
  }

  document.addEventListener('click', function (event) {
    const trigger = event.target.closest('[data-legal]');
    if (trigger) openLegal(trigger.dataset.legal);
  });

  /* ---------- Formulario de contacto ---------- */
  const contactForm = M.$('#contact-form');
  if (contactForm) {
    const success = M.$('#contact-success');
    const successEmail = M.$('#contact-success-email');

    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      let valid = true;
      M.$$('[data-validate]', contactForm).forEach(function (field) {
        if (M.validateField(field)) valid = false;
      });

      if (!valid) {
        M.focusFirstError(contactForm);
        M.toast('Revisa los campos marcados antes de enviar tu mensaje.', 'error');
        return;
      }

      const data = {};
      new FormData(contactForm).forEach(function (value, key) {
        data[key] = typeof value === 'string' ? value.trim() : value;
      });

      const messages = M.store.get('messages', []);
      const list = Array.isArray(messages) ? messages : [];
      list.unshift(Object.assign({}, data, { date: M.todayISO(0) }));
      M.store.set('messages', list.slice(0, 20));

      if (successEmail) successEmail.textContent = data.email || 'tu correo';
      contactForm.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus({ preventScroll: true });
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      M.toast('Mensaje enviado. Te responderemos en un máximo de 24 horas hábiles.', 'success', 5200);
    });
  }

  /* ---------- Limpieza de errores al escribir ---------- */
  ['input', 'change'].forEach(function (eventName) {
    document.addEventListener(eventName, function (event) {
      const field = event.target.closest('[data-validate]');
      if (!field) return;
      if (field.getAttribute('aria-invalid') === 'true') M.validateField(field);
    });
  });

  /* ---------- Reinicio de formularios con éxito ---------- */
  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-reset-form]');
    if (!button) return;

    const form = document.getElementById(button.dataset.resetForm);
    if (!form) return;

    form.reset();
    form.hidden = false;
    M.clearFormErrors(form);

    const success = form.parentElement ? form.parentElement.querySelector('.form-success') : null;
    if (success) success.hidden = true;

    const firstField = form.querySelector('input:not([type="hidden"]), select, textarea');
    if (firstField) firstField.focus({ preventScroll: true });
  });

  /* ---------- Contadores animados ---------- */
  const counters = M.$$('[data-count]');

  function formatCounter(value, decimals) {
    return M.formatNumber(value, decimals);
  }

  function runCounter(element) {
    const target = parseFloat(element.dataset.count) || 0;
    const decimals = Number(element.dataset.decimals) || 0;
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';

    if (reduceMotion) {
      element.textContent = prefix + formatCounter(target, decimals) + suffix;
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;

      element.textContent = prefix + formatCounter(value, decimals) + suffix;

      if (progress < 1) {
        window.requestAnimationFrame(tick);
      } else {
        element.textContent = prefix + formatCounter(target, decimals) + suffix;
      }
    }

    window.requestAnimationFrame(tick);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const counterObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.4 });

      counters.forEach(function (counter) { counterObserver.observe(counter); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ---------- Aparición suave de bloques ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealTargets = M.$$('.stats-strip, .section-head, .market-perk, .legal-callout');

    revealTargets.forEach(function (target) { target.classList.add('reveal'); });

    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (target) { revealObserver.observe(target); });
  }

  /* ---------- Resaltado de la sección activa ---------- */
  const navLinks = M.$$('.main-nav .nav-link');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const sections = navLinks.map(function (link) {
      return document.getElementById(link.getAttribute('href').slice(1));
    }).filter(Boolean);

    function setActive(link) {
      navLinks.forEach(function (item) {
        item.classList.toggle('is-active', item === link);
        if (item === link) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
    }

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const link = navLinks.find(function (item) {
          return item.getAttribute('href') === '#' + entry.target.id;
        });
        if (link) setActive(link);
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }
})();
