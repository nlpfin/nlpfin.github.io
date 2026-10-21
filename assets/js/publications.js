// ============================================================
// nlpfin.github.io — publications live search & filter
// Renders the complete list in the original section order:
// Latest, Book, Conference (grouped by year), Journal,
// Preprint, Overview, Workshop.
// Requires: assets/js/publications-data.js (const PUBLICATIONS)
// ============================================================
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof PUBLICATIONS === 'undefined') return;

    var listEl = document.getElementById('pub-list');
    var emptyEl = document.getElementById('pub-empty');
    var searchEl = document.getElementById('pub-search-input');
    var typeRow = document.getElementById('filter-types');

    var state = { q: '', type: 'All' };

    var SECTION_ORDER = ['Latest', 'Book', 'Conference', 'Journal', 'Preprint', 'Overview', 'Workshop'];
    var SECTION_LABEL = {
      Latest: 'Latest',
      Book: 'Book',
      Conference: 'Peer-Reviewed Conference Papers',
      Journal: 'Journal Articles',
      Preprint: 'Preprints',
      Overview: 'Research Agenda / Tutorial / Shared Task Overview Papers',
      Workshop: 'Workshop Papers'
    };
    var TYPE_ORDER = ['All'].concat(SECTION_ORDER);
    var TYPE_LABEL = {
      All: 'All', Latest: 'Latest', Conference: 'Conference', Journal: 'Journal',
      Book: 'Book', Overview: 'Agenda & Overview', Workshop: 'Workshop', Preprint: 'Preprint'
    };

    TYPE_ORDER.forEach(function (t, idx) {
      var b = document.createElement('button');
      b.className = 'chip' + (idx === 0 ? ' on' : '');
      b.type = 'button';
      b.textContent = TYPE_LABEL[t];
      b.addEventListener('click', function () {
        state.type = t;
        typeRow.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); });
        b.classList.add('on');
        render();
      });
      typeRow.appendChild(b);
    });

    var debounce;
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        clearTimeout(debounce);
        debounce = setTimeout(function () {
          state.q = searchEl.value.trim().toLowerCase();
          render();
        }, 120);
      });
    }

    function matches(p) {
      if (state.type !== 'All' && p.s !== state.type) return false;
      if (state.q) {
        var hay = p.x.toLowerCase();
        var terms = state.q.split(/\s+/);
        for (var i = 0; i < terms.length; i++) {
          if (hay.indexOf(terms[i]) === -1) return false;
        }
      }
      return true;
    }

    function esc(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function fmt(p) {
      var t = esc(p.x).replace(/Chung-Chi Chen/g, '<strong>Chung-Chi Chen</strong>');
      // trim trailing bare link words (the links themselves are shown below)
      t = t.replace(/\s+(pdf|dataset|website|site|code|Open Access|Proceedings|slides)(\s+(pdf|dataset|website|site|code|Open Access|Proceedings|slides))*\s*$/i, '');
      return t;
    }

    function itemNode(p) {
      var d = document.createElement('article');
      d.className = 'pub-item';
      var linksHtml = '';
      Object.keys(p.l || {}).forEach(function (k) {
        var url = p.l[k];
        if (!url) return;
        linksHtml += '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(k) + ' ↗</a>';
      });
      d.innerHTML =
        '<p class="pub-title" style="font-weight: 500; font-family: var(--font-body); font-size: .98rem;">' + fmt(p) + '</p>' +
        (linksHtml ? '<div class="pub-links">' + linksHtml + '</div>' : '');
      return d;
    }

    function render() {
      var filtered = PUBLICATIONS.filter(matches);
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = filtered.length ? 'none' : 'block';

      SECTION_ORDER.forEach(function (sec) {
        var items = filtered.filter(function (p) { return p.s === sec; });
        if (!items.length) return;

        var h = document.createElement('h2');
        h.className = 'pub-year-header';
        h.textContent = SECTION_LABEL[sec];
        listEl.appendChild(h);

        if (sec === 'Conference') {
          // group by year, descending, preserving order within each year
          var years = [];
          items.forEach(function (p) {
            var y = p.y || 'Other';
            if (years.indexOf(y) === -1) years.push(y);
          });
          years.sort(function (a, b) {
            if (a === 'Other') return 1; if (b === 'Other') return -1;
            return b.localeCompare(a);
          });
          years.forEach(function (y) {
            var yh = document.createElement('h3');
            yh.style.cssText = 'font-family: var(--font-head); font-size: 1.15rem; font-weight: 700; color: var(--primary-deep); margin: 1.3rem 0 .8rem;';
            yh.textContent = y;
            listEl.appendChild(yh);
            items.forEach(function (p) {
              if ((p.y || 'Other') === y) listEl.appendChild(itemNode(p));
            });
          });
        } else {
          items.forEach(function (p) { listEl.appendChild(itemNode(p)); });
        }
      });
    }

    render();
  });
})();
