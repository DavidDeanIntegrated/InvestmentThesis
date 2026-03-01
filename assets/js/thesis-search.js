// thesis-search.js — Client-side search and filtering for thesis listing page
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var cards = Array.from(document.querySelectorAll('.thesis-card'));
    var searchInput = document.getElementById('thesisSearch');
    var tagChips = document.querySelectorAll('.tag-chip-clickable');
    var sectorBtns = document.querySelectorAll('.sector-filter');
    var noResults = document.getElementById('noResults');

    var activeTag = null;
    var activeSector = 'all';

    function filterCards() {
      var query = (searchInput ? searchInput.value : '').toLowerCase().trim();
      var visibleCount = 0;

      cards.forEach(function(card) {
        var title   = (card.dataset.title || '').toLowerCase();
        var ticker  = (card.dataset.ticker || '').toLowerCase();
        var tags    = (card.dataset.tags || '').toLowerCase();
        var sector  = (card.dataset.sector || '').toLowerCase();
        var summary = card.querySelector('.thesis-card-summary');
        var summaryText = summary ? summary.textContent.toLowerCase() : '';

        var matchesSearch = !query ||
          title.indexOf(query) !== -1 ||
          ticker.indexOf(query) !== -1 ||
          tags.indexOf(query) !== -1 ||
          summaryText.indexOf(query) !== -1;

        var matchesTag = !activeTag || tags.indexOf(activeTag.toLowerCase()) !== -1;
        var matchesSector = activeSector === 'all' || sector === activeSector.toLowerCase();

        var visible = matchesSearch && matchesTag && matchesSector;
        card.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
      });

      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }

    tagChips.forEach(function(chip) {
      chip.addEventListener('click', function() {
        var tag = this.dataset.tag;
        if (activeTag === tag) {
          activeTag = null;
          this.classList.remove('active');
        } else {
          tagChips.forEach(function(c) { c.classList.remove('active'); });
          activeTag = tag;
          this.classList.add('active');
        }
        filterCards();
      });
    });

    sectorBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        sectorBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        activeSector = this.dataset.sector;
        filterCards();
      });
    });

    // Check URL hash for initial filter
    if (window.location.hash) {
      var hash = window.location.hash.substring(1);
      var parts = hash.split('=');
      if (parts[0] === 'tag' && parts[1]) {
        activeTag = decodeURIComponent(parts[1]);
        tagChips.forEach(function(chip) {
          if (chip.dataset.tag === activeTag) {
            chip.classList.add('active');
          }
        });
        filterCards();
      } else if (parts[0] === 'sector' && parts[1]) {
        activeSector = decodeURIComponent(parts[1]);
        sectorBtns.forEach(function(btn) {
          if (btn.dataset.sector === activeSector) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
        filterCards();
      }
    }
  });
})();
