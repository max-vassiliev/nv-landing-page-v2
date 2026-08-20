/* Наталья Васильева — интерактив, версия 2
   Всё, что здесь есть, — прогрессивное улучшение:
   без JS страница остаётся полностью читаемой. */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Год в подвале ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Липкая шапка ---------- */
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    header.classList.toggle('is-stuck', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  var setMenu = function (open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });

  // Закрыть по клику на пункт
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  // Закрыть по Escape + вернуть фокус на кнопку
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      burger.focus();
    }
  });

  // Сбросить состояние при переходе на десктоп
  var mq = window.matchMedia('(min-width: 861px)');
  var onMq = function (e) { if (e.matches) setMenu(false); };
  mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);

  /* ---------- Появление при скролле ---------- */
  var reveals = document.querySelectorAll('.reveal');

  // Задержки для лёгкого каскада (80ms на шаг)
  reveals.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.setProperty('--d', d);
  });

  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Счётчики в фактах ---------- */
  var counters = document.querySelectorAll('.count');

  var animate = function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (isNaN(to)) return;

    var dur = 1100;
    var start = null;

    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      // easeOutExpo — быстро стартует, мягко останавливается
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(to * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = to;
    };

    requestAnimationFrame(step);
  };

  if (!reduced && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { cio.observe(el); });
  }
  // При reduced-motion числа уже стоят в разметке — ничего не делаем.

})();
