(function () {
  var currentScript = document.currentScript;

  if (!currentScript) {
    var scripts = document.querySelectorAll('script[data-widget-id]');
    currentScript = scripts[scripts.length - 1];
  }

  if (!currentScript) {
    console.error('[WebWidget] Aucune balise script avec data-widget-id trouvée.');
    return;
  }

  var widgetId = currentScript.getAttribute('data-widget-id');
  var scriptSrc = currentScript.getAttribute('src') || '';
  var baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/widget.js'));

  if (!widgetId) {
    console.error('[WebWidget] Attribut data-widget-id manquant.');
    return;
  }

  var container = document.getElementById('gw-widget');
  if (!container) {
    container = document.createElement('div');
    currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
  }

  container.innerHTML = '';
  var loader = document.createElement('div');
  loader.style.cssText = 'text-align:center;padding:20px;color:#888;font-family:system-ui,sans-serif';
  loader.textContent = 'Chargement des avis\u2026';
  container.appendChild(loader);

  fetch(baseUrl + '/widget/' + widgetId + '/reviews')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      if (data.error) { showError(container, 'Erreur : ' + data.error); return; }
      renderWidget(container, data);
    })
    .catch(function () {
      showError(container, 'Impossible de charger les avis.');
    });

  function showError(container, message) {
    container.innerHTML = '';
    var p = document.createElement('p');
    p.style.cssText = 'color:#dc2626;font-family:system-ui,sans-serif;padding:12px';
    p.textContent = message;
    container.appendChild(p);
  }

  function createElement(tag, styles, text) {
    var el = document.createElement(tag);
    if (styles) el.style.cssText = styles;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function renderStars(rating) {
    var wrapper = document.createElement('span');
    for (var i = 1; i <= 5; i++) {
      var star = createElement('span', 'font-size:16px;color:' + (i <= rating ? '#FBBF24' : '#D1D5DB'), '\u2605');
      wrapper.appendChild(star);
    }
    return wrapper;
  }

  function renderCardList(review, isDark) {
    var bg = isDark ? '#111827' : '#F9FAFB';
    var border = isDark ? '#374151' : '#E5E7EB';
    var textColor = isDark ? '#F9FAFB' : '#111827';
    var subColor = isDark ? '#9CA3AF' : '#6B7280';

    var card = createElement('div', [
      'padding:16px', 'background:' + bg, 'border-radius:8px',
      'border:1px solid ' + border, 'margin-bottom:12px',
    ].join(';'));

    var header = createElement('div', 'display:flex;align-items:center;gap:10px;margin-bottom:10px');
    if (review.profile_photo_url) {
      var img = document.createElement('img');
      img.src = review.profile_photo_url;
      img.style.cssText = 'width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0';
      img.onerror = function () { this.style.display = 'none'; };
      header.appendChild(img);
    }
    var authorInfo = createElement('div', '');
    var authorName = createElement('div', 'font-weight:600;font-size:14px;color:' + textColor);
    authorName.textContent = review.author_name;
    authorInfo.appendChild(authorName);
    authorInfo.appendChild(renderStars(review.rating));
    header.appendChild(authorInfo);
    card.appendChild(header);

    if (review.text) {
      var reviewText = createElement('p', 'color:' + subColor + ';margin:0;font-size:14px;line-height:1.6');
      reviewText.textContent = review.text;
      card.appendChild(reviewText);
    }
    if (review.relative_time_description) {
      var timeEl = createElement('div', 'color:' + subColor + ';font-size:12px;margin-top:8px');
      timeEl.textContent = review.relative_time_description;
      card.appendChild(timeEl);
    }
    return card;
  }

  function renderCardGrid(review, isDark) {
    var bg = isDark ? '#111827' : '#F9FAFB';
    var border = isDark ? '#374151' : '#E5E7EB';
    var textColor = isDark ? '#F9FAFB' : '#111827';
    var subColor = isDark ? '#9CA3AF' : '#6B7280';

    var card = createElement('div', [
      'padding:16px', 'background:' + bg, 'border-radius:8px',
      'border:1px solid ' + border, 'display:flex', 'flex-direction:column',
    ].join(';'));

    var header = createElement('div', 'display:flex;align-items:center;gap:10px;margin-bottom:10px');
    if (review.profile_photo_url) {
      var img = document.createElement('img');
      img.src = review.profile_photo_url;
      img.style.cssText = 'width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0';
      img.onerror = function () { this.style.display = 'none'; };
      header.appendChild(img);
    }
    var authorInfo = createElement('div', '');
    var authorName = createElement('div', 'font-weight:600;font-size:13px;color:' + textColor);
    authorName.textContent = review.author_name;
    authorInfo.appendChild(authorName);
    authorInfo.appendChild(renderStars(review.rating));
    header.appendChild(authorInfo);
    card.appendChild(header);

    if (review.text) {
      var reviewText = createElement('p', 'color:' + subColor + ';margin:0;font-size:13px;line-height:1.5;flex:1');
      reviewText.textContent = review.text;
      card.appendChild(reviewText);
    }
    if (review.relative_time_description) {
      var timeEl = createElement('div', 'color:' + subColor + ';font-size:11px;margin-top:8px');
      timeEl.textContent = review.relative_time_description;
      card.appendChild(timeEl);
    }
    return card;
  }

  function renderCardStars(review, isDark) {
    var border = isDark ? '#374151' : '#E5E7EB';
    var textColor = isDark ? '#F9FAFB' : '#111827';
    var subColor = isDark ? '#9CA3AF' : '#6B7280';

    var card = createElement('div', [
      'display:flex', 'align-items:center', 'gap:10px',
      'padding:10px 0', 'border-bottom:1px solid ' + border,
    ].join(';'));

    if (review.profile_photo_url) {
      var img = document.createElement('img');
      img.src = review.profile_photo_url;
      img.style.cssText = 'width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0';
      img.onerror = function () { this.style.display = 'none'; };
      card.appendChild(img);
    }
    var name = createElement('span', 'font-weight:600;font-size:14px;color:' + textColor + ';flex:1');
    name.textContent = review.author_name;
    card.appendChild(name);
    card.appendChild(renderStars(review.rating));
    if (review.relative_time_description) {
      var time = createElement('span', 'font-size:12px;color:' + subColor + ';white-space:nowrap');
      time.textContent = review.relative_time_description;
      card.appendChild(time);
    }
    return card;
  }

  function renderWidget(container, data) {
    var config = data.widget.config || {};
    var isDark = config.theme === 'dark';
    var accent = config.accentColor || '#4F46E5';
    var layout = config.layout || 'list';

    var bg = isDark ? '#1F2937' : '#FFFFFF';
    var border = isDark ? '#374151' : '#E5E7EB';
    var subColor = isDark ? '#9CA3AF' : '#6B7280';

    container.innerHTML = '';
    container.style.fontFamily = 'system-ui,-apple-system,sans-serif';

    var wrapper = createElement('div', [
      'background:' + bg, 'border-radius:12px',
      'padding:24px', 'border:1px solid ' + border,
    ].join(';'));

    var title = createElement('h3', 'color:' + accent + ';margin:0 0 20px;font-size:18px;font-weight:700');
    title.textContent = data.widget.name;
    wrapper.appendChild(title);

    if (!data.reviews || data.reviews.length === 0) {
      wrapper.appendChild(createElement('p', 'color:' + subColor, 'Aucun avis disponible.'));
    } else if (layout === 'grid') {
      var grid = createElement('div', 'display:grid;grid-template-columns:1fr 1fr;gap:12px');
      data.reviews.forEach(function (r) { grid.appendChild(renderCardGrid(r, isDark)); });
      wrapper.appendChild(grid);
    } else if (layout === 'stars') {
      var list = createElement('div', '');
      data.reviews.forEach(function (r) { list.appendChild(renderCardStars(r, isDark)); });
      wrapper.appendChild(list);
    } else {
      var list = createElement('div', '');
      data.reviews.forEach(function (r) { list.appendChild(renderCardList(r, isDark)); });
      wrapper.appendChild(list);
    }

    var footer = createElement('div', 'text-align:center;margin-top:16px;font-size:11px;color:' + subColor);
    footer.textContent = 'Powered by WebWidget';
    wrapper.appendChild(footer);

    container.appendChild(wrapper);
  }
})();
