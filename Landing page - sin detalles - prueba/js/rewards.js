/* ============================================================
   rewards.js — Saldo, movimientos, canjes, simulador y acopiadores
   ============================================================ */
(function () {
  'use strict';

  const M = window.Munay;
  if (!M || !M.data) return;

  const grid = M.$('#rewards-grid');
  if (!grid) return;

  const els = {
    headerPoints: M.$('#header-points'),
    pointsPill: M.$('.points-pill'),
    floatPoints: M.$('.float-points'),
    balance: M.$('#rewards-balance'),
    levelBadge: M.$('.balance-level'),
    progress: M.$('#level-progress'),
    progressFill: M.$('#level-progress-fill'),
    pointsToNext: M.$('#points-to-next'),
    moves: M.$('#moves-list'),

    simType: M.$('#sim-type'),
    simRange: M.$('#sim-range'),
    simKg: M.$('#sim-kg'),
    simPoints: M.$('#sim-points'),
    simSoles: M.$('#sim-soles'),
    simBreakdown: M.$('#sim-breakdown'),

    priceBody: M.$('#price-body'),

    acForm: M.$('#acopiador-form'),
    acSuccess: M.$('#acopiador-success'),
    acSuccessEmail: M.$('#ac-success-email'),
    acDistrict: M.$('#ac-district'),

    rewardDialog: M.$('#reward-dialog'),
    rewardDialogName: M.$('#reward-dialog-name'),
    rewardDialogDesc: M.$('#reward-dialog-desc'),
    rewardDialogPoints: M.$('#reward-dialog-points'),
    rewardDialogBalance: M.$('#reward-dialog-balance'),
    rewardDialogAfter: M.$('#reward-dialog-after'),
    rewardDialogNote: M.$('#reward-dialog-note'),
    rewardDialogIcon: M.$('#reward-dialog-icon'),
    rewardConfirm: M.$('#reward-confirm-btn')
  };

  const DEFAULT_POINTS = 1250;
  const LEVELS = [
    { min: 0, name: 'Semilla' },
    { min: 500, name: 'Brote' },
    { min: 1000, name: 'Guardián verde' },
    { min: 1500, name: 'Embajador Munay' },
    { min: 3000, name: 'Leyenda circular' }
  ];

  let balance = getPoints();
  let movements = getMovements();
  let pendingReward = null;

  function getPoints() {
    const stored = Number(M.store.get('points', DEFAULT_POINTS));
    return Number.isFinite(stored) && stored >= 0 ? stored : DEFAULT_POINTS;
  }

  function getMovements() {
    const stored = M.store.get('movements', null);
    if (Array.isArray(stored)) return stored;
    return M.data.movements.map(function (item) {
      return Object.assign({}, item);
    });
  }

  function saveMovements() {
    M.store.set('movements', movements);
  }

  function shortDate() {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(new Date()).replace(/\./g, '');
  }

  function formatSoles(value) {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(Number(value) || 0);
  }

  function formatKg(value) {
    return String(value).replace('.', ',');
  }

  function levelFor(points) {
    let current = LEVELS[0];
    let next = null;
    LEVELS.forEach(function (level, index) {
      if (points >= level.min) {
        current = level;
        next = LEVELS[index + 1] || null;
      }
    });
    return { current: current, next: next };
  }

  /* ---------- Saldo y nivel ---------- */
  function renderBalance() {
    const formatted = M.formatNumber(balance);
    const info = levelFor(balance);

    if (els.headerPoints) els.headerPoints.textContent = formatted;
    if (els.pointsPill) {
      els.pointsPill.setAttribute('aria-label', 'Ver mis puntos: ' + formatted + ' pts');
    }
    if (els.floatPoints) {
      els.floatPoints.innerHTML = formatted + ' <span>pts</span>';
    }
    if (els.balance) els.balance.textContent = formatted;

    if (els.levelBadge) {
      els.levelBadge.innerHTML = M.icon('leaf') + ' ' + M.escapeHtml(info.current.name);
    }

    if (!els.progress || !els.progressFill) return;

    if (info.next) {
      const remaining = Math.max(0, info.next.min - balance);
      const percent = Math.min(100, (balance / info.next.min) * 100);
      els.progress.setAttribute('aria-valuemax', String(info.next.min));
      els.progress.setAttribute('aria-valuenow', String(balance));
      els.progressFill.style.width = percent.toFixed(1) + '%';

      if (els.pointsToNext) {
        els.pointsToNext.textContent = M.formatNumber(remaining) + ' pts';
        const nextName = els.pointsToNext.nextElementSibling;
        if (nextName) nextName.textContent = info.next.name;
      }
    } else {
      els.progress.setAttribute('aria-valuemax', String(LEVELS[LEVELS.length - 1].min));
      els.progress.setAttribute('aria-valuenow', String(balance));
      els.progressFill.style.width = '100%';
      if (els.pointsToNext) {
        els.pointsToNext.textContent = 'nivel máximo';
        const nextName = els.pointsToNext.nextElementSibling;
        if (nextName) nextName.textContent = 'Leyenda circular';
      }
    }
  }

  /* ---------- Movimientos ---------- */
  function renderMovements() {
    if (!els.moves) return;

    els.moves.innerHTML = movements.slice(0, 6).map(function (move) {
      const amount = Number(move.amount) || 0;
      const positive = amount >= 0;
      return '<li>' +
        '<span class="move-icon">' + M.icon(move.icon || 'recycle') + '</span>' +
        '<span class="move-text">' +
          '<strong>' + M.escapeHtml(move.title) + '</strong>' +
          '<span>' + M.escapeHtml(move.date) + '</span>' +
        '</span>' +
        '<span class="move-amount' + (positive ? '' : ' is-negative') + '">' +
          (positive ? '+' : '−') + M.formatNumber(Math.abs(amount)) +
        '</span>' +
      '</li>';
    }).join('');
  }

  /* ---------- Catálogo ---------- */
  function renderCatalog() {
    grid.innerHTML = M.data.rewards.map(function (reward) {
      const affordable = balance >= reward.points;
      const missing = Math.max(0, reward.points - balance);
      const artClass = reward.art && reward.art !== 'green' ? ' reward-art--' + reward.art : '';

      return '<article class="reward-card" aria-labelledby="reward-' + reward.id + '-title">' +
        '<div class="reward-art' + artClass + '">' +
          '<span class="reward-tag">' + M.escapeHtml(reward.category) + '</span>' +
          M.icon(reward.icon || 'gift') +
          '<span class="reward-stock">' + M.escapeHtml(reward.stock) + '</span>' +
        '</div>' +
        '<div class="reward-body">' +
          '<h4 id="reward-' + reward.id + '-title">' + M.escapeHtml(reward.name) + '</h4>' +
          '<p>' + M.escapeHtml(reward.desc) + '</p>' +
          '<div class="reward-foot">' +
            '<p class="reward-price">' + M.formatNumber(reward.points) + ' <span>pts</span>' +
              (affordable ? '' : '<span class="reward-missing">Te faltan ' + M.formatNumber(missing) + ' pts</span>') +
            '</p>' +
            '<button type="button" class="btn ' + (affordable ? 'btn-primary' : 'btn-outline') + ' btn-sm" ' +
              'data-reward="' + reward.id + '"' + (affordable ? '' : ' disabled') + '>' +
              (affordable ? 'Canjear' : 'Faltan pts') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function openRewardDialog(reward) {
    if (!reward) return;

    if (balance < reward.points) {
      M.toast('Te faltan ' + M.formatNumber(reward.points - balance) + ' pts para canjear esta recompensa.', 'error');
      return;
    }

    pendingReward = reward;
    if (els.rewardDialogName) els.rewardDialogName.textContent = reward.name;
    if (els.rewardDialogDesc) els.rewardDialogDesc.textContent = reward.desc;
    if (els.rewardDialogPoints) els.rewardDialogPoints.textContent = M.formatNumber(reward.points);
    if (els.rewardDialogBalance) els.rewardDialogBalance.textContent = M.formatNumber(balance);
    if (els.rewardDialogAfter) els.rewardDialogAfter.textContent = M.formatNumber(balance - reward.points);

    if (els.rewardDialogIcon) {
      els.rewardDialogIcon.innerHTML = M.icon(reward.icon || 'gift');
    }
    if (els.rewardDialogNote) {
      const note = reward.category === 'Impacto'
        ? 'La donación se registra de inmediato y recibirás el certificado de impacto por correo.'
        : 'Los canjes son definitivos. Los productos físicos se entregan en el siguiente recojo.';
      els.rewardDialogNote.innerHTML = M.icon('info') + ' ' + M.escapeHtml(note);
    }

    M.openDialog(els.rewardDialog);
  }

  function confirmRedemption() {
    if (!pendingReward) return;

    if (balance < pendingReward.points) {
      M.toast('Tu saldo cambió y ya no alcanza para este canje.', 'error');
      M.closeDialog(els.rewardDialog);
      return;
    }

    const reward = pendingReward;
    const rewardId = reward.id;
    balance -= reward.points;
    movements.unshift({
      icon: 'gift',
      title: 'Canje · ' + reward.name,
      date: shortDate(),
      amount: -reward.points
    });

    M.store.set('points', balance);
    saveMovements();
    pendingReward = null;

    M.closeDialog(els.rewardDialog);
    renderBalance();
    renderMovements();
    renderCatalog();
    M.toast('Canje confirmado: ' + reward.name + '. Te quedan ' + M.formatNumber(balance) + ' pts.', 'success', 5200);
    M.emit('points:change', { points: balance, reward: rewardId });

    window.setTimeout(function () {
      const nextButton = grid.querySelector('[data-reward="' + rewardId + '"]:not(:disabled)');
      const fallback = M.$('#catalogo-title');
      if (nextButton) nextButton.focus();
      else if (fallback) {
        fallback.setAttribute('tabindex', '-1');
        fallback.focus();
      }
    }, 120);
  }

  grid.addEventListener('click', function (event) {
    const button = event.target.closest('[data-reward]');
    if (!button) return;
    const reward = M.data.rewards.find(function (item) { return item.id === button.dataset.reward; });
    openRewardDialog(reward);
  });

  if (els.rewardConfirm) els.rewardConfirm.addEventListener('click', confirmRedemption);

  /* ---------- Simulador ---------- */
  function selectedPrice() {
    const key = els.simType ? els.simType.value : 'pet';
    return M.data.prices.find(function (price) { return price.key === key; }) || M.data.prices[0];
  }

  function clampKg(value) {
    if (!Number.isFinite(value)) return 3;
    return Math.min(20, Math.max(0.5, Math.round(value * 2) / 2));
  }

  function renderSimulator(kg) {
    if (!els.simPoints || !els.simSoles) return;

    const amount = clampKg(kg);
    const price = selectedPrice();
    const points = Math.round(amount * price.points);
    const soles = amount * price.price;

    if (els.simRange) els.simRange.value = String(amount);
    if (els.simKg) els.simKg.value = formatKg(amount);

    els.simPoints.textContent = M.formatNumber(points);
    els.simSoles.textContent = formatSoles(soles);

    if (els.simBreakdown) {
      els.simBreakdown.innerHTML =
        '<div><span>' + formatKg(amount) + ' kg × ' + price.points + ' pts/kg</span>' +
          '<strong>' + M.formatNumber(points) + ' pts</strong></div>' +
        '<div><span>Precio referencial del material</span>' +
          '<strong>S/ ' + formatSoles(soles) + '</strong></div>';
    }
  }

  if (els.simRange) {
    els.simRange.addEventListener('input', function () {
      renderSimulator(Number(els.simRange.value));
    });
  }

  if (els.simKg) {
    els.simKg.addEventListener('input', function () {
      if (els.simKg.value === '') return;
      renderSimulator(Number(els.simKg.value.replace(',', '.')));
    });
    els.simKg.addEventListener('change', function () {
      renderSimulator(Number(els.simKg.value.replace(',', '.')));
    });
  }

  if (els.simType) {
    els.simType.addEventListener('change', function () {
      renderSimulator(Number(els.simKg ? els.simKg.value.replace(',', '.') : 3));
    });
  }

  /* ---------- Tabla de precios ---------- */
  function renderPrices() {
    if (!els.priceBody) return;
    els.priceBody.innerHTML = M.data.prices.map(function (price) {
      return '<tr>' +
        '<td><span class="price-material"><i></i>' + M.escapeHtml(price.material) + '</span></td>' +
        '<td>' + M.escapeHtml(price.code) + '</td>' +
        '<td><strong>S/ ' + M.formatNumber(price.price, 2) + '</strong></td>' +
        '<td class="price-points">' + M.formatNumber(price.points) + ' pts</td>' +
      '</tr>';
    }).join('');
  }

  /* ---------- Postulación de acopiadores ---------- */
  function fillAcopiadorDistricts() {
    if (!els.acDistrict || els.acDistrict.options.length > 1) return;
    els.acDistrict.insertAdjacentHTML('beforeend', M.data.coverage.map(function (district) {
      return '<option value="' + M.escapeHtml(district) + '">' + M.escapeHtml(district) + '</option>';
    }).join('') + '<option value="Otro">Otro distrito</option>');
  }

  function bindFieldClearing(form) {
    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, function (event) {
        const field = event.target.closest('[data-validate]');
        if (field && field.getAttribute('aria-invalid') === 'true') {
          M.validateField(field);
        }
      });
    });
  }

  if (els.acForm) {
    bindFieldClearing(els.acForm);

    els.acForm.addEventListener('submit', function (event) {
      event.preventDefault();

      let valid = true;
      M.$$('[data-validate]', els.acForm).forEach(function (field) {
        if (M.validateField(field)) valid = false;
      });

      if (!valid) {
        M.focusFirstError(els.acForm);
        M.toast('Revisa los campos marcados antes de enviar tu postulación.', 'error');
        return;
      }

      const data = {};
      new FormData(els.acForm).forEach(function (value, key) {
        data[key] = typeof value === 'string' ? value.trim() : value;
      });

      const applications = M.store.get('acopiadores', []);
      const list = Array.isArray(applications) ? applications : [];
      list.unshift(Object.assign({}, data, { date: M.todayISO(0) }));
      M.store.set('acopiadores', list.slice(0, 20));

      if (els.acSuccessEmail) els.acSuccessEmail.textContent = data.email || 'tu correo';
      els.acForm.hidden = true;
      if (els.acSuccess) {
        els.acSuccess.hidden = false;
        els.acSuccess.focus({ preventScroll: true });
        els.acSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      M.toast('Postulación enviada. Te escribiremos en un máximo de 3 días hábiles.', 'success', 5200);
    });
  }

  /* ---------- Inicialización ---------- */
  function renderAll() {
    renderBalance();
    renderMovements();
    renderCatalog();
  }

  renderAll();
  renderSimulator(3);
  renderPrices();
  fillAcopiadorDistricts();

  M.rewards = {
    getPoints: function () { return balance; },
    refresh: renderAll
  };
})();
