/* ============================================================
   ui.js — Utilidades compartidas, validación y feedback
   ============================================================ */
(function () {
  'use strict';

  const M = window.Munay = window.Munay || {};
  const $ = (selector, context) => (context || document).querySelector(selector);
  const $$ = (selector, context) => Array.from((context || document).querySelectorAll(selector));

  M.$ = $;
  M.$$ = $$;

  M.icon = function (name, className) {
    return '<svg class="icon ' + (className || '') + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  };

  M.escapeHtml = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  M.formatNumber = function (value, decimals) {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 0
    }).format(Number(value) || 0);
  };

  /* ---------- Almacenamiento local seguro ---------- */
  const PREFIX = 'munay:';

  M.store = {
    get: function (key, fallback) {
      try {
        const raw = window.localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (error) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch (error) {
        return false;
      }
    }
  };

  M.emit = function (name, detail) {
    document.dispatchEvent(new CustomEvent('munay:' + name, { detail: detail || {} }));
  };

  M.on = function (name, handler) {
    document.addEventListener('munay:' + name, handler);
  };

  /* ---------- Fechas ---------- */
  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  M.todayISO = function (offsetDays) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + (offsetDays || 0));
    return toISODate(date);
  };

  M.formatDate = function (iso) {
    if (!iso) return '—';
    const parts = String(iso).split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return iso;
    const date = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    const text = new Intl.DateTimeFormat('es-PE', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    }).format(date);
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  M.slotLabel = function (slot) {
    return slot === 'tarde' ? 'Tarde · 14:00 a 18:00 h' : 'Mañana · 7:00 a 11:00 h';
  };

  M.slotShort = function (slot) {
    return slot === 'tarde' ? 'Tarde (14:00 a 18:00 h)' : 'Mañana (7:00 a 11:00 h)';
  };

  /* ---------- Validación ---------- */
  const patterns = {
    name: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]{3,80}$/,
    email: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
    phone: /^9\d{8}$/,
    dni: /^\d{8}$/,
    ruc: /^(10|15|17|20)\d{9}$/
  };

  M.validators = {
    name: function (value) {
      if (!value.trim()) return 'Ingresa tu nombre completo.';
      if (!patterns.name.test(value.trim())) return 'Usa solo letras y espacios (mínimo 3 caracteres).';
      return '';
    },
    email: function (value) {
      if (!value.trim()) return 'Ingresa tu correo electrónico.';
      if (!patterns.email.test(value.trim())) return 'Ingresa un correo válido, por ejemplo nombre@correo.com.';
      return '';
    },
    phone: function (value) {
      const digits = value.replace(/\D/g, '');
      if (!digits) return 'Ingresa tu número de celular.';
      if (!patterns.phone.test(digits)) return 'El celular debe tener 9 dígitos y empezar con 9.';
      return '';
    },
    dni: function (value) {
      const digits = value.replace(/\D/g, '');
      if (!digits) return 'Ingresa tu DNI.';
      if (!patterns.dni.test(digits)) return 'El DNI debe tener 8 dígitos.';
      return '';
    },
    ruc: function (value) {
      const digits = value.replace(/\D/g, '');
      if (!digits) return 'Ingresa el RUC de tu negocio.';
      if (!patterns.ruc.test(digits)) return 'El RUC debe tener 11 dígitos y empezar con 10, 15, 17 o 20.';
      return '';
    },
    address: function (value) {
      if (value.trim().length < 8) return 'Ingresa una dirección válida (calle, número y distrito).';
      return '';
    },
    district: function (value) {
      if (!value) return 'Selecciona tu distrito.';
      return '';
    },
    topic: function (value) {
      if (!value) return 'Selecciona el motivo de tu contacto.';
      return '';
    },
    message: function (value) {
      if (value.trim().length < 20) return 'Cuéntanos un poco más (mínimo 20 caracteres).';
      return '';
    },
    date: function (value) {
      if (!value) return 'Selecciona una fecha de recojo.';
      const today = new Date(M.todayISO() + 'T12:00:00');
      const selected = new Date(value + 'T12:00:00');
      if (isNaN(selected.getTime())) return 'Selecciona una fecha válida.';
      if (selected < today) return 'La fecha no puede ser anterior a hoy.';
      const max = new Date(today);
      max.setDate(max.getDate() + 21);
      if (selected > max) return 'Solo puedes agendar hasta 21 días de anticipación.';
      return '';
    },
    terms: function (value, input) {
      return input.checked ? '' : 'Debes aceptar la política de privacidad para continuar.';
    }
  };

  M.errorElementFor = function (input) {
    const key = input.id || input.name;
    return document.querySelector('[data-error-for="' + key + '"]');
  };

  M.setFieldError = function (input, message) {
    const key = input.id || input.name;
    const group = input.type === 'radio' || input.type === 'checkbox'
      ? Array.from(document.querySelectorAll('[name="' + input.name + '"]'))
      : [input];
    const errorEl = document.querySelector('[data-error-for="' + key + '"]');
    const errorId = 'err-' + key;

    group.forEach(function (field) {
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const describedBy = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
        if (describedBy.indexOf(errorId) === -1) describedBy.push(errorId);
        field.setAttribute('aria-describedby', describedBy.join(' '));
      } else {
        field.removeAttribute('aria-invalid');
        const describedBy = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (id) {
          return id && id !== errorId;
        });
        if (describedBy.length) field.setAttribute('aria-describedby', describedBy.join(' '));
        else field.removeAttribute('aria-describedby');
      }
    });

    if (errorEl) {
      errorEl.textContent = message || '';
      errorEl.hidden = !message;
      if (message) errorEl.id = errorId;
    }
  };

  M.validateField = function (input) {
    const rule = input.getAttribute('data-validate');
    if (!rule) return '';

    if (rule === 'terms') {
      const message = M.validators.terms(input.value, input);
      M.setFieldError(input, message);
      return message;
    }

    if (rule === 'district' || rule === 'topic') {
      const message = M.validators[rule](input.value);
      M.setFieldError(input, message);
      return message;
    }

    if (rule === 'date') {
      const message = M.validators.date(input.value);
      M.setFieldError(input, message);
      return message;
    }

    if (rule === 'slot' || rule === 'quantity' || rule === 'types') {
      let checked;
      if (rule === 'types') {
        checked = document.querySelectorAll('input[name="types"]:checked').length > 0;
        const message = checked ? '' : 'Selecciona al menos un tipo de plástico.';
        M.setFieldError(input, message);
        return message;
      }
      checked = document.querySelector('input[name="' + input.name + '"]:checked');
      const message = checked ? '' : (rule === 'slot' ? 'Selecciona una franja horaria.' : 'Selecciona una cantidad aproximada.');
      M.setFieldError(input, message);
      return message;
    }

    const validator = M.validators[rule];
    if (!validator) return '';
    const message = validator(input.value, input);
    M.setFieldError(input, message);
    return message;
  };

  M.clearFormErrors = function (form) {
    M.$$('[data-validate]', form).forEach(function (field) {
      M.setFieldError(field, '');
    });
    const status = form.querySelector('.form-status');
    if (status) {
      status.hidden = true;
      status.textContent = '';
    }
  };

  M.focusFirstError = function (container) {
    const invalid = container.querySelector('[aria-invalid="true"]');
    if (invalid) {
      invalid.focus({ preventScroll: false });
      return true;
    }
    return false;
  };

  /* ---------- Toasts ---------- */
  M.toast = function (message, type, duration) {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'success');
    const icon = type === 'error' ? 'alert' : type === 'info' ? 'info' : 'check';

    toast.innerHTML =
      '<span class="toast-icon">' + M.icon(icon) + '</span>' +
      '<div>' + M.escapeHtml(message) + '</div>';

    stack.appendChild(toast);

    window.setTimeout(function () {
      toast.style.transition = 'opacity .25s ease, transform .25s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      window.setTimeout(function () { toast.remove(); }, 260);
    }, duration || 4200);
  };

  M.setStatus = function (element, message) {
    if (!element) return;
    element.textContent = '';
    window.setTimeout(function () { element.textContent = message; }, 40);
  };

  /* ---------- Diálogos ---------- */
  let openDialogs = 0;

  M.openDialog = function (dialog) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    if (openDialogs === 0) document.body.classList.add('has-dialog');
    openDialogs += 1;
    dialog.showModal();
  };

  M.closeDialog = function (dialog) {
    if (!dialog || !dialog.open) return;
    dialog.close();
  };

  document.addEventListener('click', function (event) {
    const closer = event.target.closest('[data-close-dialog]');
    if (closer) {
      const dialog = closer.closest('dialog');
      if (dialog) M.closeDialog(dialog);
    }

    const dialog = event.target;
    if (dialog instanceof HTMLDialogElement && dialog.open) {
      const rect = dialog.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right &&
        event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) M.closeDialog(dialog);
    }
  });

  document.addEventListener('close', function (event) {
    if (event.target instanceof HTMLDialogElement) {
      openDialogs = Math.max(0, openDialogs - 1);
      if (openDialogs === 0) document.body.classList.remove('has-dialog');
    }
  }, true);

  M.debounce = function (fn, wait) {
    let timer;
    return function () {
      const args = arguments;
      const context = this;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { fn.apply(context, args); }, wait || 200);
    };
  };
})();
