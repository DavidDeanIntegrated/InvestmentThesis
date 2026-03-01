// toc.js — Floating table of contents with scrollspy for thesis pages
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var content = document.getElementById('thesisContent');
    var tocNav = document.getElementById('tocNav');
    var sidebar = document.getElementById('thesisSidebar');

    if (!content || !tocNav) return;

    // Find all h2 and h3 headings in thesis content
    var headings = content.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    // Build TOC
    var tocHTML = '';
    headings.forEach(function(heading, index) {
      // Ensure heading has an id
      if (!heading.id) {
        heading.id = 'section-' + index;
      }
      var level = heading.tagName.toLowerCase();
      var className = 'toc-link' + (level === 'h3' ? ' toc-h3' : '');
      tocHTML += '<a href="#' + heading.id + '" class="' + className + '">' + heading.textContent + '</a>';
    });
    tocNav.innerHTML = tocHTML;

    var tocLinks = tocNav.querySelectorAll('.toc-link');

    // Scrollspy using IntersectionObserver
    var currentActive = null;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          tocLinks.forEach(function(link) {
            if (link.getAttribute('href') === '#' + id) {
              if (currentActive) currentActive.classList.remove('active');
              link.classList.add('active');
              currentActive = link;
            }
          });
        }
      });
    }, {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0
    });

    headings.forEach(function(heading) {
      observer.observe(heading);
    });

    // Smooth scroll on TOC link click
    tocLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var targetId = this.getAttribute('href').substring(1);
        var target = document.getElementById(targetId);
        if (target) {
          var offset = 80; // account for sticky nav
          var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    // Mobile TOC toggle
    if (sidebar) {
      var mobileToggle = document.createElement('button');
      mobileToggle.className = 'toc-mobile-toggle';
      mobileToggle.textContent = 'Table of Contents';
      mobileToggle.addEventListener('click', function() {
        tocNav.classList.toggle('open');
      });
      sidebar.insertBefore(mobileToggle, sidebar.firstChild);
    }
  });
})();
