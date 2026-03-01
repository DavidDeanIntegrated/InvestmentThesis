// dark-mode.js — loaded in <head> (blocking) to prevent flash of wrong theme
(function() {
  'use strict';
  var STORAGE_KEY = 'theme';

  function getPreferred() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    var toggle = document.querySelector('.dark-mode-toggle');
    if (toggle) {
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  // Apply immediately (before paint)
  apply(getPreferred());

  // Bind toggle button after DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.querySelector('.dark-mode-toggle');
    if (btn) {
      btn.addEventListener('click', function() {
        var current = document.documentElement.getAttribute('data-theme');
        apply(current === 'dark' ? 'light' : 'dark');
      });
    }
  });
})();
