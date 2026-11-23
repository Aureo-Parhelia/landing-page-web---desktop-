/* ============================================================
   education.js — Identificador de plásticos y detalle por código
   ============================================================ */
(function () {
  'use strict';

  const M = window.Munay;
  if (!M || !M.data) return;

  const grid = M.$('#plastic-grid');
  if (!grid) return;

  const els = {
    triangle: M.$('#plastic-detail .plastic-triangle') || M.$('.plastic-triangle'),
    code: M.$('#plastic-detail-code'),
    codeLabel: M.$('#plastic-detail-code-label'),
    name: M.$('#plastic-detail-name'),
    alias: M.$('#plastic-detail-alias'),
    status: M.$('#plastic-detail-status'),
    uses: M.$('#plastic-detail-uses'),
    tip: M.$('#plastic-detail-tip')
  };

  let activeCode = 1;

  function triangleSvg(code) {
    return '<svg class="plastic-svg" viewBox="0 0 44 40" aria-hidden="true" focusable="false">' +
      '<path class="tri-line" d="M22 2.5 42 37.5H2Z"/>' +
      '<text class="tri-num" x="22" y="30" text-anchor="middle">' + code + '</text>' +
    '</svg>';
  }

  function statusClass(status) {
    if (status === 'ok') return 'status-badge--ok';
    if (status === 'partial') return 'status-badge--partial';
    return 'status-badge--no';
  }

  function renderGrid() {
    grid.innerHTML = M.data.plasticCodes.map(function (item) {
      return '<button type="button" class="plastic-btn' + (item.code === activeCode ? ' is-active' : '') + '" ' +
        'data-code="' + item.code + '" aria-pressed="' + String(item.code === activeCode) + '">' +
        triangleSvg(item.code) + ' ' +
        '<small>' + M.escapeHtml(item.short) + '</small>' +
        '<span class="sr-only">. Código ' + item.code + ', ' + M.escapeHtml(item.name) + ', ' + M.escapeHtml(item.statusLabel) + '</span>' +
      '</button>';
    }).join('');
  }

  function selectCode(code) {
    const item = M.data.plasticCodes.find(function (entry) { return entry.code === Number(code); });
    if (!item) return;

    activeCode = item.code;

    M.$$('.plastic-btn', grid).forEach(function (button) {
      const isCurrent = Number(button.dataset.code) === activeCode;
      button.classList.toggle('is-active', isCurrent);
      button.setAttribute('aria-pressed', String(isCurrent));
    });

    if (els.triangle) {
      els.triangle.innerHTML = triangleSvg(item.code) +
        '<span class="sr-only" id="plastic-detail-code">' + item.code + '</span>';
    }
    if (els.codeLabel) els.codeLabel.textContent = String(item.code).padStart(2, '0');
    if (els.name) els.name.textContent = item.name;
    if (els.alias) els.alias.textContent = item.alias;

    if (els.status) {
      els.status.className = 'status-badge ' + statusClass(item.status);
      els.status.textContent = item.statusLabel;
    }

    if (els.uses) els.uses.textContent = item.uses;
    if (els.tip) els.tip.textContent = item.tip;
  }

  grid.addEventListener('click', function (event) {
    const button = event.target.closest('[data-code]');
    if (!button) return;
    selectCode(button.dataset.code);
  });

  grid.addEventListener('keydown', function (event) {
    const buttons = M.$$('.plastic-btn', grid);
    const index = buttons.indexOf(document.activeElement);
    if (index === -1) return;

    let nextIndex = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % buttons.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = buttons.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    buttons[nextIndex].focus();
    selectCode(buttons[nextIndex].dataset.code);
  });

  renderGrid();
  selectCode(activeCode);
})();
