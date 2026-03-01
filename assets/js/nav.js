// nav.js — Mobile hamburger toggle
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.querySelector('.nav-toggle');
    var links = document.querySelector('.nav-links');

    if (toggle && links) {
      toggle.addEventListener('click', function() {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        links.classList.toggle('open');
      });

      // Close menu when a link is clicked
      links.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
          toggle.setAttribute('aria-expanded', 'false');
          links.classList.remove('open');
        }
      });
    }
  });
})();
