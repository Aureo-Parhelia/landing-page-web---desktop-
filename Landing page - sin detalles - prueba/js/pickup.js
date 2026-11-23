/* ============================================================
   pickup.js — Solicitud, seguimiento e historial de recojos
   ============================================================ */
(function () {
  'use strict';

  const M = window.Munay;
  if (!M || !M.data) return;

  const form = M.$('#pickup-form');
  if (!form) return;

  const els = {
    stepper: M.$('#wizard-stepper'),
    progress: M.$('#wizard-progress'),
    current: M.$('#wizard-current'),
    back: M.$('#wizard-back'),
    next: M.$('#wizard-next'),
    nextLabel: M.$('#wizard-next-label'),
    formStatus: M.$('#pickup-form-status'),
    name: M.$('#pk-name'),
    dni: M.$('#pk-dni'),
    phone: M.$('#pk-phone'),
    email: M.$('#pk-email'),
    district: M.$('#pk-district'),
    housing: M.$('#pk-housing'),
    address: M.$('#pk-address'),
    reference: M.$('#pk-ref'),
    coverage: M.$('#coverage-note'),
    date: M.$('#pk-date'),
    estimate: M.$('#pickup-estimate'),
    terms: M.$('#pk-terms'),
    success: M.$('#pickup-success'),
    successName: M.$('#success-name'),
    successCode: M.$('#success-code'),
    successDate: M.$('#success-date'),
    successSlot: M.$('#success-slot'),
    successAddress: M.$('#success-address'),
    successPoints: M.$('#success-points'),
    copy: M.$('#success-copy'),
    track: M.$('#success-track'),
    again: M.$('#success-new'),
    tracks: M.$('#track-form'),
    trackInput: M.$('#track-code'),
    trackError: M.$('#track-error'),
    trackResult: M.$('#track-result'),
    trackCode: M.$('#track-code-value'),
    trackStatus: M.$('#track-status'),
    trackEta: M.$('#track-eta'),
    trackTimeline: M.$('#track-timeline'),
    trackMeta: M.$('#track-meta'),
    trackActions: M.$('#track-actions'),
    trackCancelled: M.$('#track-cancelled-note'),
    history: M.$('#history-body'),
    historyEmpty: M.$('#history-empty'),
    historyKg: M.$('#history-kg'),
    historyPoints: M.$('#history-points'),
    coverageChips: M.$('#coverage-chips'),
    reprogramBtn: M.$('#reprogram-btn'),
    cancelBtn: M.$('#cancel-btn'),
    reprogramDialog: M.$('#reprogram-dialog'),
    reprogramForm: M.$('#reprogram-form'),
    reprogramDate: M.$('#reprogram-date'),
    reprogramCode: M.$('#reprogram-code'),
    cancelDialog: M.$('#cancel-dialog'),
    cancelForm: M.$('#cancel-form'),
    cancelReason: M.$('#cancel-reason')
  };

  const statusMap = {
    pending: { label: 'Solicitado', className: 'status-badge--pending', index: 0 },
    scheduled: { label: 'Confirmado', className: 'status-badge--transit', index: 1 },
    transit: { label: 'En ruta', className: 'status-badge--transit', index: 2 },
    done: { label: 'Recogido', className: 'status-badge--ok', index: 3 },
    cancelled: { label: 'Cancelado', className: 'status-badge--no', index: 0 }
  };

  const historySeed = [
    { code: 'MUN-00119', date: '2026-10-12', materials: 'Botellas PET, Envases rígidos', kg: 4.5, points: 240, status: 'done' },
    { code: 'MUN-00114', date: '2026-10-05', materials: 'Envases rígidos', kg: 3, points: 150, status: 'done' },
    { code: 'MUN-00108', date: '2026-09-18', materials: 'Botellas PET', kg: 5, points: 300, status: 'done' },
    { code: 'MUN-00101', date: '2026-09-02', materials: 'Bolsas y film', kg: 2, points: 50, status: 'cancelled' }
  ];

  const demoRequest = {
    code: 'MUN-00123',
    name: 'Ana Torres',
    district: 'Miraflores',
    address: 'Av. Larco 456, dpto. 302',
    date: M.todayISO(0),
    slot: 'tarde',
    materials: 'Botellas PET, Envases rígidos',
    kg: 4.5,
    points: 240,
    status: 'transit',
    createdAt: M.todayISO(-2),
    isDemo: true
  };

  let step = 1;
  let currentRequest = null;
  let currentReward = null;

  /* ---------- Utilidades de datos ---------- */
  function getPickups() {
    const value = M.store.get('pickups', []);
    return Array.isArray(value) ? value : [];
  }

  function savePickups(list) {
    M.store.set('pickups', list);
  }

  function findRequest(code) {
    const normalized = String(code || '').trim().toUpperCase();
    const found = getPickups().find(function (item) { return item.code === normalized; });
    if (found) return found;
    if (normalized === 'MUN-00123') {
      const override = M.store.get('demoTrack', null);
      return override ? Object.assign({}, demoRequest, override, { isDemo: true }) : demoRequest;
    }
    return null;
  }

  function persistRequest(request) {
    const pickups = getPickups();
    const index = pickups.findIndex(function (item) { return item.code === request.code; });
    if (index >= 0) pickups[index] = request;
    else pickups.unshift(request);
    savePickups(pickups);

    if (request.isDemo) {
      M.store.set('demoTrack', {
        date: request.date,
        slot: request.slot,
        status: request.status
      });
    }
  }

  function statusInfo(status) {
    return statusMap[status] || statusMap.pending;
  }

  function statusBadge(status) {
    const info = statusInfo(status);
    return '<span class="status-badge ' + info.className + '">' + info.label + '</span>';
  }

  /* ---------- Distritos y cobertura ---------- */
  function fillDistricts() {
    const options = M.data.coverage.map(function (district) {
      return '<option value="' + M.escapeHtml(district) + '">' + M.escapeHtml(district) + '</option>';
    }).join('');
    els.district.insertAdjacentHTML('beforeend', options + '<option value="Otro">Otro distrito (sin cobertura)</option>');

    const acopiadorDistrict = M.$('#ac-district');
    if (acopiadorDistrict) {
      acopiadorDistrict.insertAdjacentHTML('beforeend', M.data.coverage.map(function (district) {
        return '<option value="' + M.escapeHtml(district) + '">' + M.escapeHtml(district) + '</option>';
      }).join('') + '<option value="Otro">Otro distrito</option>');
    }

    if (els.coverageChips) {
      els.coverageChips.innerHTML = M.data.coverage.map(function (district) {
        return '<li>' + M.escapeHtml(district) + '</li>';
      }).join('');
    }
  }

  function coveredDistrict(value) {
    return M.data.coverage.indexOf(value) !== -1;
  }

  function updateCoverage(announce) {
    const value = els.district.value;
    els.coverage.classList.remove('is-ok', 'is-warn');
    const icon = '<span class="coverage-icon">' + M.icon('pin') + '</span>';

    if (!value) {
      els.coverage.innerHTML = icon + '<p>Selecciona tu distrito para verificar si tenemos cobertura de recojo.</p>';
      M.setFieldError(els.district, '');
      return;
    }

    if (coveredDistrict(value)) {
      els.coverage.classList.add('is-ok');
      els.coverage.innerHTML = icon + '<p><strong>¡Buenas noticias!</strong> Tenemos cobertura de recojo en ' +
        M.escapeHtml(value) + '. El servicio es gratuito desde 2 kg de plásticos seleccionados.</p>';
      M.setFieldError(els.district, '');
      if (announce) M.toast('Cobertura confirmada para ' + value + '.', 'success');
    } else {
      els.coverage.classList.add('is-warn');
      els.coverage.innerHTML = icon + '<p><strong>Aún no llegamos a este distrito.</strong> Puedes llevarlo a un punto de acopio cercano o escribirnos para sumarlo a la lista de espera.</p>';
      M.setFieldError(els.district, 'Aún no tenemos cobertura de recojo en este distrito.');
      if (announce) M.toast('Aún no tenemos cobertura en este distrito.', 'error');
    }
  }

  /* ---------- Estimación ---------- */
  function selectedTypes() {
    return M.$$('input[name="types"]:checked', form).map(function (input) {
      return {
        key: input.value,
        label: input.closest('.type-option').querySelector('strong').textContent,
        factor: Number(input.dataset.factor),
        price: Number(input.dataset.price)
      };
    });
  }

  function selectedQuantity() {
    const input = form.querySelector('input[name="quantity"]:checked');
    if (!input) return null;
    const label = input.closest('.option-card').querySelector('strong').textContent;
    return { key: input.value, label: label, kg: Number(input.dataset.kg) };
  }

  function calculateEstimate() {
    const types = selectedTypes();
    const quantity = selectedQuantity();
    if (!types.length || !quantity) return null;

    const averageFactor = types.reduce(function (sum, type) { return sum + type.factor; }, 0) / types.length;
    const averagePrice = types.reduce(function (sum, type) { return sum + type.price; }, 0) / types.length;
    return {
      points: Math.round(averageFactor * quantity.kg),
      soles: averagePrice * quantity.kg
    };
  }

  function updateEstimate() {
    const estimate = calculateEstimate();
    if (!estimate) {
      els.estimate.innerHTML = '— <span>pts</span>';
      return;
    }
    els.estimate.innerHTML = M.formatNumber(estimate.points) + ' <span>pts</span>';
  }

  /* ---------- Navegación del wizard ---------- */
  function updateStepper() {
    M.$$('.step', els.stepper).forEach(function (item) {
      const itemStep = Number(item.dataset.stepInd);
      item.classList.toggle('is-active', itemStep === step);
      item.classList.toggle('is-done', itemStep < step);
      if (itemStep === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });

    els.progress.style.width = (step * 25) + '%';
    els.current.textContent = step;
    els.back.hidden = step === 1 || !els.success.hidden;
    els.nextLabel.textContent = step === 4 ? 'Confirmar solicitud' : 'Continuar';
    els.next.querySelector('.icon use').setAttribute('href', step === 4 ? '#i-check' : '#i-arrow-right');
  }

  function goToStep(nextStep) {
    const panel = M.$('.form-step[data-step="' + nextStep + '"]', form);
    if (!panel) return;

    step = nextStep;
    M.$$('.form-step', form).forEach(function (item) {
      item.hidden = Number(item.dataset.step) !== step;
    });

    updateStepper();

    if (step === 4) fillSummary();

    const heading = panel.querySelector('h3');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: false });
    }

    M.setStatus(els.formStatus, '');
    els.formStatus.hidden = true;
  }

  function check(input) {
    const message = M.validateField(input);
    return !message;
  }

  function validateStep(currentStep) {
    let valid = true;

    if (currentStep === 1) {
      [els.name, els.dni, els.phone, els.email].forEach(function (field) {
        if (!check(field)) valid = false;
      });
    }

    if (currentStep === 2) {
      if (!check(els.district)) valid = false;
      if (els.district.value && !coveredDistrict(els.district.value)) {
        M.setFieldError(els.district, 'Aún no tenemos cobertura de recojo en este distrito.');
        valid = false;
      }
      if (!check(els.address)) valid = false;
    }

    if (currentStep === 3) {
      if (!check(els.date)) valid = false;
      const slot = form.querySelector('input[name="slot"]');
      const types = form.querySelector('input[name="types"]');
      const quantity = form.querySelector('input[name="quantity"]');
      if (slot && !check(slot)) valid = false;
      if (types && !check(types)) valid = false;
      if (quantity && !check(quantity)) valid = false;
    }

    if (currentStep === 4) {
      if (!check(els.terms)) valid = false;
    }

    if (!valid) {
      const panel = M.$('.form-step[data-step="' + currentStep + '"]', form);
      M.focusFirstError(panel);
    }

    return valid;
  }

  function fillSummary() {
    const types = selectedTypes();
    const quantity = selectedQuantity();
    const estimate = calculateEstimate();

    M.$('#sum-name').textContent = els.name.value.trim();
    M.$('#sum-contact').textContent = els.phone.value.trim() + ' · ' + els.email.value.trim();
    M.$('#sum-address').textContent = els.address.value.trim() + ', ' + els.district.value +
      (els.reference.value.trim() ? ' (Ref. ' + els.reference.value.trim() + ')' : '');
    M.$('#sum-schedule').textContent = M.formatDate(els.date.value) + ' · ' + M.slotShort(form.querySelector('input[name="slot"]:checked').value);
    M.$('#sum-types').textContent = types.map(function (type) { return type.label; }).join(', ');
    M.$('#sum-quantity').textContent = quantity.label;
    M.$('#sum-points').textContent = estimate ? M.formatNumber(estimate.points) + ' pts aprox.' : '—';
  }

  /* ---------- Envío ---------- */
  function generateCode() {
    const existing = getPickups().map(function (item) { return item.code; });
    let code;
    do {
      code = 'MUN-' + String(Math.floor(Math.random() * 90000) + 10000);
    } while (existing.indexOf(code) !== -1 || code === 'MUN-00123');
    return code;
  }

  function showSuccess(request) {
    M.$$('.form-step', form).forEach(function (item) { item.hidden = true; });
    form.querySelector('.wizard-actions').hidden = true;
    form.hidden = true;

    M.$$('.step', els.stepper).forEach(function (item) {
      item.classList.remove('is-active');
      item.classList.add('is-done');
      item.removeAttribute('aria-current');
    });
    els.progress.style.width = '100%';
    els.back.hidden = true;

    els.successName.textContent = request.name.split(' ')[0] || 'vecino';
    els.successCode.textContent = request.code;
    els.successDate.textContent = M.formatDate(request.date);
    els.successSlot.textContent = M.slotShort(request.slot);
    els.successAddress.textContent = request.address + ', ' + request.district;
    els.successPoints.textContent = M.formatNumber(request.points) + ' pts aprox.';

    els.success.hidden = false;
    els.success.focus({ preventScroll: true });
    els.success.scrollIntoView({ behavior: 'smooth', block: 'center' });

    els.trackInput.value = request.code;
    renderHistory();
    M.toast('Solicitud ' + request.code + ' registrada correctamente.', 'success', 5200);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!validateStep(step)) {
      els.formStatus.hidden = false;
      els.formStatus.textContent = 'Revisa los campos marcados en rojo antes de continuar.';
      return;
    }

    if (step < 4) {
      goToStep(step + 1);
      return;
    }

    const types = selectedTypes();
    const quantity = selectedQuantity();
    const estimate = calculateEstimate();
    const slot = form.querySelector('input[name="slot"]:checked').value;
    const request = {
      code: generateCode(),
      name: els.name.value.trim(),
      dni: els.dni.value.trim(),
      phone: els.phone.value.trim(),
      email: els.email.value.trim(),
      district: els.district.value,
      address: els.address.value.trim(),
      reference: els.reference.value.trim(),
      housing: els.housing.value,
      date: els.date.value,
      slot: slot,
      materials: types.map(function (type) { return type.label; }).join(', '),
      quantity: quantity.label,
      kg: quantity.kg,
      points: estimate ? estimate.points : 0,
      status: 'pending',
      createdAt: M.todayISO(0)
    };

    persistRequest(request);
    showSuccess(request);
    M.emit('pickup:created', { request: request });
  });

  els.back.addEventListener('click', function () {
    if (step > 1) goToStep(step - 1);
  });

  els.again.addEventListener('click', function () {
    resetWizard();
  });

  function resetWizard() {
    form.reset();
    form.hidden = false;
    form.querySelector('.wizard-actions').hidden = false;
    els.success.hidden = true;
    step = 1;
    M.$$('.form-step', form).forEach(function (item) { item.hidden = Number(item.dataset.step) !== 1; });
    M.clearFormErrors(form);
    M.$$('.step', els.stepper).forEach(function (item) {
      item.classList.remove('is-done', 'is-active');
      item.removeAttribute('aria-current');
    });
    updateStepper();
    els.coverage.classList.remove('is-ok', 'is-warn');
    els.coverage.innerHTML = '<span class="coverage-icon">' + M.icon('pin') + '</span><p>Selecciona tu distrito para verificar si tenemos cobertura de recojo.</p>';
    els.estimate.innerHTML = '— <span>pts</span>';
    els.date.value = '';
    els.formStatus.hidden = true;
    els.name.focus();
  }

  /* ---------- Interacciones del formulario ---------- */
  els.date.min = M.todayISO(0);
  els.date.max = M.todayISO(21);

  els.district.addEventListener('change', function () {
    updateCoverage(true);
    updateEstimate();
  });

  [els.phone, els.dni].forEach(function (input) {
    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '');
    });
  });

  form.addEventListener('change', function (event) {
    const target = event.target;
    if (target.matches('[data-validate]') && target.getAttribute('aria-invalid') === 'true') {
      M.validateField(target);
    }
    if (target.name === 'types' || target.name === 'quantity') updateEstimate();
    if (target === els.district) updateCoverage(false);
    if (target.name === 'slot' || target.name === 'quantity' || target.name === 'types') {
      els.formStatus.hidden = true;
    }
  });

  form.addEventListener('input', function (event) {
    const target = event.target;
    if (target.matches('[data-validate]') && target.getAttribute('aria-invalid') === 'true') {
      M.validateField(target);
    }
  });

  M.$$('[data-goto-step]', form).forEach(function (button) {
    button.addEventListener('click', function () {
      goToStep(Number(button.dataset.gotoStep));
    });
  });

  els.copy.addEventListener('click', function () {
    const code = els.successCode.textContent.trim();
    const done = function () { M.toast('Código ' + code + ' copiado al portapapeles.', 'success'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(function () {
        M.toast('No se pudo copiar automáticamente. Código: ' + code, 'info');
      });
    } else {
      M.toast('Código de seguimiento: ' + code, 'info');
    }
  });

  els.track.addEventListener('click', function () {
    if (M.tabs) M.tabs.open('estado');
    document.getElementById('recojo').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(function () {
      els.trackInput.value = els.successCode.textContent.trim();
      els.tracks.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 350);
  });

  /* ---------- Seguimiento ---------- */
  const timelineLabels = ['Solicitado', 'Confirmado', 'En ruta', 'Recogido'];

  function etaText(request) {
    if (request.status === 'cancelled') return 'Esta solicitud fue cancelada. Puedes agendar un nuevo recojo cuando quieras.';
    if (request.status === 'done') return 'Recojo completado. Tus puntos fueron acreditados en tu cuenta Munay.';
    if (request.status === 'transit') return 'El acopiador llegará hoy en la franja de ' + request.slot.replace('manana', 'la mañana').replace('tarde', 'la tarde') + ' (7:00 a 11:00 h o 14:00 a 18:00 h).';
    return 'Tu recojo está confirmado para el ' + M.formatDate(request.date) + ', ' + M.slotShort(request.slot) + '.';
  }

  function renderTracking(request) {
    const info = statusInfo(request.status);
    currentRequest = request;

    els.trackResult.hidden = false;
    els.trackCode.textContent = request.code;
    els.trackStatus.className = 'status-badge ' + info.className;
    els.trackStatus.textContent = info.label;
    els.trackEta.textContent = etaText(request);

    const doneUntil = info.index;
    els.trackTimeline.innerHTML = timelineLabels.map(function (label, index) {
      const isDone = index < doneUntil;
      const isCurrent = index === doneUntil && request.status !== 'done' && request.status !== 'cancelled';
      const dateLabel = index === 0
        ? M.formatDate(request.createdAt || request.date)
        : index === 1
          ? M.formatDate(request.date)
          : index === 2
            ? 'Hoy'
            : 'Pendiente';
      const mark = isDone || (request.status === 'done' && index <= 3) ? M.icon('check') : String(index + 1);
      return '<li class="' + (isDone || request.status === 'done' ? 'is-done' : '') + (isCurrent ? ' is-current' : '') + '">' +
        '<span class="timeline-dot">' + mark + '</span>' +
        '<span class="timeline-label">' + label + '</span>' +
        '<span class="timeline-date">' + (request.status === 'cancelled' && index > 0 ? 'Cancelado' : dateLabel) + '</span>' +
        '</li>';
    }).join('');

    els.trackMeta.innerHTML =
      '<div><dt>Fecha</dt><dd>' + M.formatDate(request.date) + '</dd></div>' +
      '<div><dt>Franja</dt><dd>' + M.slotShort(request.slot) + '</dd></div>' +
      '<div><dt>Dirección</dt><dd>' + M.escapeHtml(request.address) + ', ' + M.escapeHtml(request.district) + '</dd></div>' +
      '<div><dt>Materiales</dt><dd>' + M.escapeHtml(request.materials) + '</dd></div>' +
      '<div><dt>Cantidad</dt><dd>' + M.escapeHtml(request.quantity || (M.formatNumber(request.kg, 1) + ' kg')) + '</dd></div>' +
      '<div><dt>Puntos</dt><dd>' + M.formatNumber(request.points) + ' pts</dd></div>';

    const closed = request.status === 'done' || request.status === 'cancelled';
    els.trackActions.hidden = closed;
    els.trackCancelled.hidden = request.status !== 'cancelled';
    els.trackResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  els.tracks.addEventListener('submit', function (event) {
    event.preventDefault();
    const code = els.trackInput.value.trim().toUpperCase();
    els.trackError.hidden = true;
    els.trackError.textContent = '';

    if (!code) {
      els.trackError.textContent = 'Ingresa tu código de seguimiento.';
      els.trackError.hidden = false;
      els.trackInput.focus();
      return;
    }

    if (!/^MUN-\d{3,5}$/.test(code)) {
      els.trackError.textContent = 'El formato del código es MUN-00123. Revísalo e inténtalo otra vez.';
      els.trackError.hidden = false;
      els.trackInput.focus();
      return;
    }

    const request = findRequest(code);
    if (!request) {
      els.trackError.textContent = 'No encontramos una solicitud con el código ' + code + '. Verifica el código o escríbenos.';
      els.trackError.hidden = false;
      els.trackResult.hidden = true;
      return;
    }

    els.trackInput.value = code;
    renderTracking(request);
  });

  M.$$('[data-fill-code]').forEach(function (button) {
    button.addEventListener('click', function () {
      els.trackInput.value = button.dataset.fillCode;
      els.tracks.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  });

  /* ---------- Reprogramar ---------- */
  els.reprogramBtn.addEventListener('click', function () {
    if (!currentRequest) return;
    els.reprogramForm.reset();
    M.clearFormErrors(els.reprogramForm);
    els.reprogramDate.min = M.todayISO(0);
    els.reprogramDate.max = M.todayISO(21);
    els.reprogramDate.value = currentRequest.date;
    els.reprogramCode.textContent = currentRequest.code;
    const slot = els.reprogramForm.querySelector('input[name="reprogram-slot"][value="' + currentRequest.slot + '"]');
    if (slot) slot.checked = true;
    M.openDialog(els.reprogramDialog);
  });

  els.reprogramForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const dateInput = els.reprogramDate;
    const slotInput = els.reprogramForm.querySelector('input[name="reprogram-slot"]:checked');
    let valid = true;

    if (!check(dateInput)) valid = false;
    const slotError = M.$('[data-error-for="reprogram-slot"]', els.reprogramForm);
    if (!slotInput) {
      valid = false;
      if (slotError) {
        slotError.textContent = 'Selecciona una franja horaria.';
        slotError.hidden = false;
      }
    } else if (slotError) {
      slotError.textContent = '';
      slotError.hidden = true;
    }

    if (!valid) return;

    currentRequest.date = dateInput.value;
    currentRequest.slot = slotInput.value;
    currentRequest.status = 'scheduled';
    persistRequest(currentRequest);
    renderTracking(currentRequest);
    renderHistory();
    M.closeDialog(els.reprogramDialog);
    M.toast('Recojo ' + currentRequest.code + ' reprogramado para el ' + M.formatDate(currentRequest.date) + '.', 'success', 5000);
  });

  /* ---------- Cancelar ---------- */
  els.cancelBtn.addEventListener('click', function () {
    if (!currentRequest) return;
    els.cancelForm.reset();
    M.clearFormErrors(els.cancelForm);
    M.openDialog(els.cancelDialog);
  });

  els.cancelForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!els.cancelReason.value) {
      M.setFieldError(els.cancelReason, 'Selecciona un motivo para continuar.');
      els.cancelReason.focus();
      return;
    }

    currentRequest.status = 'cancelled';
    currentRequest.cancelReason = els.cancelReason.value;
    persistRequest(currentRequest);
    renderTracking(currentRequest);
    renderHistory();
    M.closeDialog(els.cancelDialog);
    M.toast('El recojo ' + currentRequest.code + ' fue cancelado.', 'info', 5000);
  });

  /* ---------- Historial ---------- */
  function combinedHistory() {
    const user = getPickups().map(function (item) {
      return {
        code: item.code,
        date: item.date,
        materials: item.materials,
        kg: item.kg,
        points: item.points,
        status: item.status
      };
    });
    return user.concat(historySeed).sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });
  }

  function renderHistory() {
    const rows = combinedHistory();
    els.history.innerHTML = rows.map(function (row) {
      return '<tr>' +
        '<td class="history-code">' + M.escapeHtml(row.code) + '</td>' +
        '<td>' + M.formatDate(row.date) + '</td>' +
        '<td>' + M.escapeHtml(row.materials) + '</td>' +
        '<td>' + M.formatNumber(row.kg, 1) + ' kg</td>' +
        '<td class="history-points">' + (row.status === 'cancelled' ? '—' : M.formatNumber(row.points) + ' pts') + '</td>' +
        '<td>' + statusBadge(row.status) + '</td>' +
        '</tr>';
    }).join('');

    els.historyEmpty.hidden = rows.length > 0;

    const totalKg = rows.reduce(function (sum, row) {
      return sum + (row.status === 'cancelled' ? 0 : Number(row.kg) || 0);
    }, 0);
    const totalPoints = rows.reduce(function (sum, row) {
      return sum + (row.status === 'cancelled' ? 0 : Number(row.points) || 0);
    }, 0);

    els.historyKg.textContent = M.formatNumber(totalKg, 1) + ' kg';
    els.historyPoints.textContent = M.formatNumber(totalPoints) + ' pts';
  }

  /* ---------- Integración con el mapa ---------- */
  M.on('pickup:open', function (event) {
    const district = event.detail && event.detail.district;
    if (M.tabs) M.tabs.open('solicitar');

    if (district) {
      if (coveredDistrict(district)) {
        els.district.value = district;
        updateCoverage(false);
        if (step === 2) M.setFieldError(els.district, '');
      } else {
        els.district.value = '';
        updateCoverage(false);
        M.toast('El punto está en ' + district + ', donde aún no tenemos recojo a domicilio.', 'info', 4800);
      }
    }

    document.getElementById('recojo').scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(function () {
      const target = els.name.value ? els.address : els.name;
      target.focus({ preventScroll: true });
    }, 500);
  });

  /* ---------- Inicialización ---------- */
  fillDistricts();
  updateStepper();
  renderHistory();
  updateEstimate();

  const storedCode = getPickups()[0];
  if (storedCode) els.trackInput.value = storedCode.code;
})();
