/* Tømrerfirmaet Søndergaard Jensen ApS — shared interactions (no framework, no external calls) */
(function () {
  'use strict';

  /* Mobile nav: state machine open/closed, closes on link tap */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav.main');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Scroll reveal: trigger once, finish to completion (never scrubbed copy) */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Count-up numbers on scroll */
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute('data-count')),
            dec = parseInt(el.getAttribute('data-decimals') || '0', 10),
            start = null, dur = 900;
        nio.unobserve(el);
        if (reduce) { el.textContent = target.toFixed(dec).replace('.', ','); return; }
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1),
              v = target * (1 - Math.pow(1 - p, 3));
          el.textContent = v.toFixed(dec).replace('.', ',');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { nio.observe(el); });
  }

  /* Forms: validate, then show the demo confirmation (no backend yet — labelled honestly) */
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var field = f.closest('.field');
        var valid = f.type === 'checkbox' ? f.checked : f.value.trim() !== '';
        if (f.type === 'email' && f.value.trim() !== '') {
          valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
        }
        if (field) field.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        var firstBad = form.querySelector('.field.invalid input, .field.invalid select, .field.invalid textarea');
        if (firstBad) firstBad.focus();
        return;
      }
      var done = form.parentElement.querySelector('.form-ok');
      form.style.display = 'none';
      if (done) { done.classList.add('show'); done.setAttribute('tabindex', '-1'); done.focus(); }
    });
    form.querySelectorAll('[required]').forEach(function (f) {
      f.addEventListener('input', function () {
        var field = f.closest('.field');
        if (field) field.classList.remove('invalid');
      });
    });
  });

  /* Deep-link: tilbud.html?opgave=gulv (etc.) preselects the dropdown */
  var sel = document.querySelector('#opgave');
  if (sel) {
    var want = new URLSearchParams(window.location.search).get('opgave');
    if (want && sel.querySelector('option[value="' + want + '"]')) sel.value = want;
  }

  /* File input label mirrors the chosen file name */
  document.querySelectorAll('input[type="file"]').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var label = document.querySelector('label[for="' + inp.id + '"] .file-name');
      if (label && inp.files.length) label.textContent = inp.files[0].name;
    });
  });
})();
