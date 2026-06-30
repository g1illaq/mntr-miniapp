/* ============================================================
   Mentor Community — просмотрщик слайдов (фит в окно)
   Превращает вертикальную ленту .deck в презентацию:
   один слайд вписан в экран, листание ← → / клик / свайп,
   счётчик + точки. Печать (PDF) и «сеточный» режим для
   экспорта PNG не затрагиваются.

   Подключение:  <script src="../design-system/present.js" defer></script>
   Старт в режиме ленты (для экспорта): открыть с #grid в URL.
   ============================================================ */
(function () {
  "use strict";

  var STAGE_MARGIN = 64; // отступ слайда от краёв окна, px

  // ---------- Стили просмотрщика (только экран) ----------
  var css = ''
    + '@media screen {'
    + '  body.mc-present { overflow: hidden; height: 100vh; background: #08080a; }'
    + '  body.mc-present .deck { display: block; padding: 0; gap: 0; height: 100vh; }'
    + '  body.mc-present .slide {'
    + '    position: absolute; top: 50%; left: 50%;'
    + '    transform-origin: center center;'
    + '    transition: opacity .28s ease;'
    + '    box-shadow: 0 30px 90px rgba(0,0,0,.6);'
    + '  }'
    + '  body.mc-present .slide:not(.is-active) { opacity: 0; pointer-events: none; }'
    + '  .mc-ui { position: fixed; z-index: 9999; font-family: var(--mc-font-mono, ui-monospace, monospace); color: #f4f5f7; -webkit-user-select: none; user-select: none; }'
    + '  .mc-arrow { top: 50%; transform: translateY(-50%); width: 52px; height: 52px; display: grid; place-items: center;'
    + '    border-radius: 999px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14);'
    + '    color: #fff; font-size: 22px; line-height: 1; cursor: pointer; transition: background .15s; }'
    + '  .mc-arrow:hover { background: rgba(255,255,255,.14); }'
    + '  .mc-prev { left: 24px; } .mc-next { right: 24px; }'
    + '  .mc-counter { bottom: 26px; left: 50%; transform: translateX(-50%); font-size: 14px; letter-spacing: .12em; color: rgba(244,245,247,.65); }'
    + '  .mc-dots { bottom: 58px; left: 50%; transform: translateX(-50%); display: flex; gap: 9px; align-items: center; }'
    + '  .mc-dot { width: 9px; height: 9px; padding: 0; border: 0; border-radius: 50%; background: rgba(244,245,247,.24); cursor: pointer; transition: background .15s, transform .15s; }'
    + '  .mc-dot:hover { background: rgba(244,245,247,.5); }'
    + '  .mc-dot.is-active { background: #4f8bff; transform: scale(1.25); }'
    + '  .mc-toggle { top: 22px; right: 22px; display: inline-flex; align-items: center; gap: 8px;'
    + '    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14); color: #fff;'
    + '    border-radius: 999px; padding: 9px 15px; cursor: pointer; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; }'
    + '  .mc-toggle:hover { background: rgba(255,255,255,.14); }'
    + '  body:not(.mc-present) .mc-arrow, body:not(.mc-present) .mc-counter, body:not(.mc-present) .mc-dots { display: none; }'
    + '}'
    + '@media print { .mc-ui { display: none !important; } }';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.deck .slide'));
    if (!slides.length) return;

    var current = 0;
    var presenting = location.hash.toLowerCase() !== '#grid';

    // ---------- UI ----------
    var prev = mk('button', 'mc-ui mc-arrow mc-prev', '‹', 'Назад');
    var next = mk('button', 'mc-ui mc-arrow mc-next', '›', 'Вперёд');
    var counter = mk('div', 'mc-ui mc-counter', '');
    var dotsWrap = mk('div', 'mc-ui mc-dots', '');
    var toggle = mk('button', 'mc-ui mc-toggle', '', 'Режим');

    var dots = slides.map(function (_, i) {
      var d = mk('button', 'mc-dot', '', 'Слайд ' + (i + 1));
      d.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(d);
      return d;
    });

    [prev, next, counter, dotsWrap, toggle].forEach(function (el) { document.body.appendChild(el); });

    prev.addEventListener('click', function (e) { e.stopPropagation(); go(current - 1); });
    next.addEventListener('click', function (e) { e.stopPropagation(); go(current + 1); });
    toggle.addEventListener('click', function (e) { e.stopPropagation(); setMode(!presenting); });

    // Клик по правой/левой половине экрана — листание
    document.addEventListener('click', function (e) {
      if (!presenting) return;
      if (e.target.closest('.mc-ui')) return;
      if (e.clientX > window.innerWidth / 2) go(current + 1); else go(current - 1);
    });

    // Клавиатура
    document.addEventListener('keydown', function (e) {
      if (e.key === 'g' || e.key === 'G') { setMode(!presenting); return; }
      if (!presenting) return;
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': e.preventDefault(); go(current + 1); break;
        case 'ArrowLeft':  case 'ArrowUp':   case 'PageUp':   e.preventDefault(); go(current - 1); break;
        case 'Home': go(0); break;
        case 'End':  go(slides.length - 1); break;
        case 'Escape': setMode(false); break;
      }
    });

    // Свайп
    var sx = 0, sy = 0;
    document.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; sy = e.changedTouches[0].clientY; }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (!presenting) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    window.addEventListener('resize', scale);

    setMode(presenting);

    // ---------- логика ----------
    function go(i) {
      current = Math.max(0, Math.min(slides.length - 1, i));
      render();
    }

    function setMode(on) {
      presenting = on;
      document.body.classList.toggle('mc-present', on);
      toggle.textContent = on ? '⊞ Сетка' : '▶ Презентация';
      if (on) { scale(); render(); slides[current].scrollIntoView({ block: 'center' }); }
      else { slides.forEach(function (s) { s.style.transform = ''; s.classList.remove('is-active'); }); }
    }

    function scale() {
      if (!presenting) return;
      var s = Math.min(
        (window.innerWidth - STAGE_MARGIN) / 1080,
        (window.innerHeight - STAGE_MARGIN) / 1080
      );
      slides.forEach(function (sl) {
        sl.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
      });
    }

    function render() {
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === current); });
      counter.textContent = pad(current + 1) + ' / ' + pad(slides.length);
      prev.style.visibility = current === 0 ? 'hidden' : '';
      next.style.visibility = current === slides.length - 1 ? 'hidden' : '';
    }
  }

  function mk(tag, cls, text, label) {
    var el = document.createElement(tag);
    el.className = cls;
    if (text) el.textContent = text;
    if (label) el.setAttribute('aria-label', label);
    if (tag === 'button') el.type = 'button';
    return el;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
})();
