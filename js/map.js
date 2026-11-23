/* ============================================================
   map.js — Mapa interactivo, filtros, búsqueda y geolocalización
   ============================================================ */
(function () {
  'use strict';

  const M = window.Munay;
  if (!M || !M.data) return;

  const points = M.data.points;
  const els = {
    search: M.$('#map-search'),
    clear: M.$('#map-search-clear'),
    filters: M.$('#map-filters'),
    markers: M.$('#map-markers'),
    stage: M.$('#map-stage'),
    results: M.$('#results-list'),
    count: M.$('#results-count'),
    status: M.$('#map-status'),
    card: M.$('#point-card'),
    cardClose: M.$('#point-card-close'),
    cardType: M.$('#point-card-type'),
    cardTitle: M.$('#point-card-title'),
    cardAddress: M.$('#point-card-address'),
    cardHours: M.$('#point-card-hours'),
    cardMaterials: M.$('#point-card-materials'),
    cardDistance: M.$('#point-card-distance'),
    directions: M.$('#point-directions'),
    schedule: M.$('#point-card-track'),
    geo: M.$('#geo-btn'),
    reset: M.$('#map-reset'),
    user: M.$('#user-marker'),
    heroForm: M.$('#hero-search'),
    heroInput: M.$('#hero-search-input')
  };

  if (!els.search || !els.markers) return;

  let filter = 'all';
  let query = '';
  let activeCluster = null;
  let selectedId = null;
  let distances = null;
  let userLabelText = 'Tu ubicación (aprox.)';

  const normalize = function (value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = function (deg) { return deg * Math.PI / 180; };
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(km) {
    if (km == null) return '';
    if (km < 1) return Math.round(km * 1000) + ' m';
    return km.toFixed(1).replace('.', ',') + ' km';
  }

  function visiblePoints() {
    return points.filter(function (point) {
      const matchesType = filter === 'all' || point.type === filter;
      const haystack = normalize([
        point.name, point.district, point.address, point.materials.join(' '),
        M.data.typeLabels[point.type]
      ].join(' '));
      const matchesQuery = !query || haystack.indexOf(normalize(query)) !== -1;
      const matchesCluster = !activeCluster || activeCluster.indexOf(point.id) !== -1;
      return matchesType && matchesQuery && matchesCluster;
    });
  }

  function buildClusters(list) {
    const remaining = list.slice();
    const groups = [];

    while (remaining.length) {
      const group = [remaining.shift()];
      let added = true;
      while (added) {
        added = false;
        for (let i = remaining.length - 1; i >= 0; i -= 1) {
          const candidate = remaining[i];
          const near = group.some(function (member) {
            return Math.hypot(member.x - candidate.x, member.y - candidate.y) <= 11;
          });
          if (near) {
            group.push(candidate);
            remaining.splice(i, 1);
            added = true;
          }
        }
      }
      groups.push(group);
    }
    return groups;
  }

  function makeMarker(point) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'marker marker--' + point.type + (selectedId === point.id ? ' is-active' : '');
    button.style.left = point.x + '%';
    button.style.top = point.y + '%';
    button.dataset.point = point.id;
    button.setAttribute('aria-label',
      point.name + ', ' + point.district + '. ' + M.data.typeLabels[point.type] + '. Ver detalle del punto.');
    button.innerHTML =
      '<span class="marker-pin">' + M.icon(M.data.typeIcons[point.type]) + '</span>' +
      '<span class="marker-label">' + M.escapeHtml(point.name) + '</span>';
    button.addEventListener('click', function () { selectPoint(point.id); });
    return button;
  }

  function makeCluster(group) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cluster';
    const x = group.reduce(function (sum, point) { return sum + point.x; }, 0) / group.length;
    const y = group.reduce(function (sum, point) { return sum + point.y; }, 0) / group.length;
    button.style.left = x + '%';
    button.style.top = y + '%';
    button.textContent = String(group.length);
    button.setAttribute('aria-label',
      group.length + ' puntos de acopio en esta zona. Acercar para ver cada punto.');
    button.addEventListener('click', function () {
      activeCluster = group.map(function (point) { return point.id; });
      selectedId = null;
      hideCard();
      render();
      M.setStatus(els.status, 'Vista ampliada: ' + group.length + ' puntos en esta zona.');
    });
    return button;
  }

  function renderMarkers(list) {
    els.markers.innerHTML = '';
    els.stage.classList.toggle('is-focused', Boolean(activeCluster));
    els.reset.hidden = !activeCluster;

    if (activeCluster) {
      list.forEach(function (point) {
        els.markers.appendChild(makeMarker(point));
      });
      return;
    }

    buildClusters(list).forEach(function (group) {
      if (group.length === 1) els.markers.appendChild(makeMarker(group[0]));
      else els.markers.appendChild(makeCluster(group));
    });
  }

  function sortedList(list) {
    if (!distances) return list;
    return list.slice().sort(function (a, b) {
      return (distances[a.id] || 0) - (distances[b.id] || 0);
    });
  }

  function renderResults(list) {
    const ordered = sortedList(list);
    els.results.innerHTML = '';

    els.count.textContent = ordered.length + (ordered.length === 1 ? ' lugar disponible' : ' lugares disponibles');

    if (!ordered.length) {
      els.results.innerHTML =
        '<div class="results-empty"><strong>Sin resultados</strong>' +
        'No encontramos puntos para esta búsqueda. Prueba con otro distrito o limpia los filtros.' +
        '</div>';
      return;
    }

    ordered.forEach(function (point) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'result-item' + (selectedId === point.id ? ' is-active' : '');
      item.dataset.point = point.id;

      const tags = point.materials.slice(0, 3).map(function (material) {
        return '<span class="result-tag">' + M.escapeHtml(material) + '</span>';
      }).join('');

      const distance = distances && distances[point.id] != null
        ? '<span class="result-distance">' + formatDistance(distances[point.id]) + '</span>'
        : '';

      item.innerHTML =
        '<span class="result-icon">' + M.icon(M.data.typeIcons[point.type]) + '</span>' +
        '<span class="result-body">' +
          '<strong>' + M.escapeHtml(point.name) + '</strong>' +
          '<span>' + M.escapeHtml(point.district) + ' · ' + M.escapeHtml(point.address) + '</span>' +
          '<span class="result-tags">' + tags + '</span>' +
        '</span>' + distance;

      item.addEventListener('click', function () { selectPoint(point.id); });
      els.results.appendChild(item);
    });
  }

  function syncSelection() {
    M.$$('.result-item', els.results).forEach(function (item) {
      item.classList.toggle('is-active', item.dataset.point === selectedId);
    });
    M.$$('.marker', els.markers).forEach(function (marker) {
      marker.classList.toggle('is-active', marker.dataset.point === selectedId);
    });
  }

  function selectPoint(id) {
    const point = points.find(function (entry) { return entry.id === id; });
    if (!point) return;

    selectedId = id;
    els.card.hidden = false;
    els.cardType.textContent = M.data.typeLabels[point.type];
    els.cardTitle.textContent = point.name;
    els.cardAddress.textContent = point.address + ', ' + point.district;
    els.cardHours.textContent = point.hours;

    els.cardMaterials.innerHTML = point.materials.map(function (material) {
      return '<span class="point-mat">' + M.escapeHtml(material) + '</span>';
    }).join('');

    if (distances && distances[point.id] != null) {
      els.cardDistance.hidden = false;
      els.cardDistance.innerHTML = M.icon('pin') + 'A ' + formatDistance(distances[point.id]) + ' de tu ubicación';
    } else {
      els.cardDistance.hidden = true;
      els.cardDistance.textContent = '';
    }

    els.directions.href = 'https://www.google.com/maps/dir/?api=1&destination=' +
      point.lat + ',' + point.lng;

    els.card.dataset.point = point.id;
    syncSelection();
    M.setStatus(els.status, 'Detalle de ' + point.name + ', ' + point.district + '.');
  }

  function hideCard() {
    els.card.hidden = true;
    els.card.removeAttribute('data-point');
    if (selectedId) {
      const trigger = els.markers.querySelector('[data-point="' + selectedId + '"]');
      selectedId = null;
      syncSelection();
      if (trigger) trigger.focus();
      else els.search.focus();
    }
  }

  function render() {
    const list = visiblePoints();
    renderMarkers(list);
    renderResults(list);
    if (selectedId && !list.some(function (point) { return point.id === selectedId; })) {
      els.card.hidden = true;
      selectedId = null;
    }
  }

  /* ---------- Filtros ---------- */
  M.$$('.chip', els.filters).forEach(function (chip) {
    chip.addEventListener('click', function () {
      filter = chip.dataset.filter;
      activeCluster = null;
      M.$$('.chip', els.filters).forEach(function (item) {
        const isCurrent = item === chip;
        item.classList.toggle('is-active', isCurrent);
        item.setAttribute('aria-pressed', String(isCurrent));
      });
      render();
      els.card.hidden = true;
      selectedId = null;
      const plural = { mercado: 'mercados', parque: 'parques', universidad: 'universidades' };
      M.setStatus(els.status,
        filter === 'all' ? 'Mostrando todos los puntos de acopio.' : 'Mostrando ' + plural[filter] + '.');
    });
  });

  M.$$('[data-count-for]').forEach(function (counter) {
    const type = counter.dataset.countFor;
    counter.textContent = type === 'all'
      ? points.length
      : points.filter(function (point) { return point.type === type; }).length;
  });

  /* ---------- Búsqueda ---------- */
  function applySearch(value) {
    query = value.trim();
    activeCluster = null;
    els.reset.hidden = true;
    els.clear.hidden = !query;
    els.card.hidden = true;
    selectedId = null;
    render();
    if (query) {
      const total = visiblePoints().length;
      M.setStatus(els.status, total + ' resultados para ' + query + '.');
    } else {
      M.setStatus(els.status, 'Búsqueda limpia. Mostrando todos los puntos.');
    }
  }

  const applySearchDebounced = M.debounce(function (value) { applySearch(value); }, 220);

  els.search.addEventListener('input', function () {
    applySearchDebounced(els.search.value);
    els.clear.hidden = !els.search.value;
  });

  els.clear.addEventListener('click', function () {
    els.search.value = '';
    applySearch('');
    els.search.focus();
  });

  /* ---------- Geolocalización ---------- */
  function applyLocation(lat, lng, label, fallback) {
    distances = {};
    points.forEach(function (point) {
      distances[point.id] = haversine(lat, lng, point.lat, point.lng);
    });

  /* Tratar debe visualizar mejor el entorno del programa */
    userLabelText = label;
    els.user.hidden = false;
    els.user.querySelector('.user-label').textContent = label;
    activeCluster = null;
    render();

    const nearest = points.slice().sort(function (a, b) {
      return distances[a.id] - distances[b.id];
    })[0];

    selectPoint(nearest.id);
    M.toast(
      'Punto más cercano: ' + nearest.name + ' a ' + formatDistance(distances[nearest.id]) +
      (fallback ? ' (ubicación referencial).' : '.'),
      fallback ? 'info' : 'success'
    );

    els.geo.disabled = false;
    els.geo.innerHTML = M.icon('crosshair') + 'Actualizar ubicación';
    M.setStatus(els.status,
      'Puntos ordenados por distancia. El más cercano es ' + nearest.name + ' a ' + formatDistance(distances[nearest.id]) + '.');
  }

  function useReferenceLocation(reason) {
    const reference = { lat: -12.0777, lng: -77.0826 };
    applyLocation(reference.lat, reference.lng, 'Plaza San Miguel (referencial)', true);
    if (reason) M.toast(reason, 'info', 5200);
  }

  els.geo.addEventListener('click', function () {
    if (!('geolocation' in navigator)) {
      useReferenceLocation('Tu navegador no permite geolocalización. Usamos una ubicación referencial.');
      return;
    }

    els.geo.disabled = true;
    els.geo.innerHTML = M.icon('crosshair') + 'Ubicando…';

    navigator.geolocation.getCurrentPosition(
      function (position) {
        applyLocation(position.coords.latitude, position.coords.longitude, 'Tu ubicación (GPS)', false);
      },
      function () {
        useReferenceLocation('No pudimos acceder a tu GPS. Usamos una ubicación referencial para el prototipo.');
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 600000 }
    );
  });

  /* ---------- Reset de cluster ---------- */
  els.reset.addEventListener('click', function () {
    activeCluster = null;
    els.reset.hidden = true;
    els.card.hidden = true;
    selectedId = null;
    render();
    els.search.focus();
    M.setStatus(els.status, 'Vista general del mapa.');
  });

  els.cardClose.addEventListener('click', hideCard);

  els.schedule.addEventListener('click', function () {
    const point = points.find(function (entry) { return entry.id === els.card.dataset.point; });
    M.emit('pickup:open', { district: point ? point.district : '' });
  });

  /* ---------- Búsqueda del hero ---------- */
  if (els.heroForm) {
    els.heroForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const value = els.heroInput.value.trim();
      els.search.value = value;
      applySearch(value);
  /* Mejorar la parte de filtrado del mapa */
      document.getElementById('mapa').scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(function () { els.search.focus({ preventScroll: true }); }, 550);
    });

    M.$$('[data-hero-query]').forEach(function (button) {
      button.addEventListener('click', function () {
        els.heroInput.value = button.dataset.heroQuery;
        els.heroForm.dispatchEvent(new Event('submit', { cancelable: true }));
      });
    });
  }

  /* ---------- Estado inicial ---------- */
  els.reset.hidden = true;
  render();

  M.map = {
    search: function (value) {
      els.search.value = value;
      applySearch(value);
    },
    reset: function () {
      els.search.value = '';
      applySearch('');
    }
  };
})();
