/* ============================================================
   markets.js — Directorio de mercados aliados, filtros y consejos
   ============================================================ */
(function () {
  'use strict';

  const M = window.Munay;
  if (!M || !M.data) return;

  const grid = M.$('#markets-grid');
  if (!grid) return;

  const els = {
    filters: M.$('#market-filters'),
    district: M.$('#market-district'),
    count: M.$('#markets-count'),
    empty: M.$('#markets-empty'),
    mapSearch: M.$('#map-search')
  };

  let filter = 'all';
  let district = 'all';

  function visibleMarkets() {
    return M.data.markets.filter(function (market) {
      const matchesFilter = filter === 'all' ||
        (filter === 'acopio' && market.acopio) ||
        (filter === 'bolsa' && market.bolsa);
      const matchesDistrict = district === 'all' || market.district === district;
      return matchesFilter && matchesDistrict;
    });
  }

  function marketCard(market) {
    const badges = [];
    if (market.acopio) badges.push('<span class="market-badge">Punto de acopio</span>');
    if (market.bolsa) badges.push('<span class="market-badge market-badge--reward">+50 pts con bolsa</span>');

    const materials = market.materials.map(function (material) {
      return '<span class="market-mat">' + M.escapeHtml(material) + '</span>';
    }).join('');

    const reward = market.reward
      ? '<p class="market-reward">' + M.icon('gift') + '<span>' + M.escapeHtml(market.reward) + '</span></p>'
      : '';

    return '<article class="market-card" aria-labelledby="market-' + market.id + '-title">' +
      '<div class="market-art">' +
        M.icon('store') +
        '<div class="market-badges">' + badges.join('') + '</div>' +
      '</div>' +
      '<div class="market-body">' +
        '<h3 id="market-' + market.id + '-title">' + M.escapeHtml(market.name) + '</h3>' +
        '<p class="market-district">' + M.icon('pin') + M.escapeHtml(market.district) + '</p>' +
        '<div class="market-info">' +
          '<div>' + M.icon('pin') + '<span>' + M.escapeHtml(market.address) + '</span></div>' +
          '<div>' + M.icon('clock') + '<span>' + M.escapeHtml(market.schedule) + '</span></div>' +
        '</div>' +
        '<div class="market-materials">' + materials + '</div>' +
        reward +
        '<div class="market-foot">' +
          '<span>' + (market.acopio ? 'Acopio disponible' : 'Bolsa de tela') + '</span>' +
          '<a href="#mapa" class="link-arrow" data-market-locate="' + market.id + '">' +
            'Ubicar en el mapa ' + M.icon('arrow-right') +
          '</a>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function render() {
    const list = visibleMarkets();

    grid.innerHTML = list.map(marketCard).join('');
    grid.hidden = list.length === 0;

    if (els.empty) els.empty.hidden = list.length !== 0;

    if (els.count) {
      els.count.textContent = list.length === M.data.markets.length
        ? list.length + (list.length === 1 ? ' mercado' : ' mercados')
        : list.length + ' de ' + M.data.markets.length + ' mercados';
    }
  }

  /* ---------- Filtros ---------- */
  if (els.filters) {
    M.$$('.chip', els.filters).forEach(function (chip) {
      chip.addEventListener('click', function () {
        filter = chip.dataset.marketFilter || 'all';
        M.$$('.chip', els.filters).forEach(function (item) {
          const isCurrent = item === chip;
          item.classList.toggle('is-active', isCurrent);
          item.setAttribute('aria-pressed', String(isCurrent));
        });
        render();
      });
    });
  }

  if (els.district) {
    els.district.addEventListener('change', function () {
      district = els.district.value || 'all';
      render();
    });
  }

  /* ---------- Ubicar mercado en el mapa ---------- */
  grid.addEventListener('click', function (event) {
    const link = event.target.closest('[data-market-locate]');
    if (!link) return;

    event.preventDefault();
    const market = M.data.markets.find(function (item) { return item.id === link.dataset.marketLocate; });
    if (!market) return;

    if (M.map) M.map.search(market.name);

    const mapSection = M.$('#mapa');
    if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    window.setTimeout(function () {
      if (els.mapSearch) els.mapSearch.focus({ preventScroll: true });
    }, 550);
  });

  render();
})();
