/* ============================================================
   FRAM NTNU · Delt navigasjons-script (mobilmeny / hamburger)
   Bygger hamburger-knappen og gjør dropdowns til trekkspill
   på små skjermer. Progressiv forbedring: uten JS vises
   lenkene som normalt (ingen body.has-mnav).
   ============================================================ */
(function () {
  function init() {
    var inner = document.querySelector('nav.top .nav-inner');
    if (!inner) return;
    var links = inner.querySelector('.nav-links');
    if (!links) return;

    document.body.classList.add('has-mnav');

    // Hamburger-knapp
    var burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.type = 'button';
    burger.setAttribute('aria-label', 'Åpne meny');
    burger.setAttribute('aria-expanded', 'false');
    burger.innerHTML =
      '<svg class="menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>' +
      '<svg class="x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>';
    inner.appendChild(burger);

    function closeMenu() {
      links.classList.remove('open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Åpne meny');
    }

    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Lukk meny' : 'Åpne meny');
    });

    // Dropdowns → trekkspill på mobil
    var ddBtns = links.querySelectorAll('.nav-dd-btn');
    ddBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (window.matchMedia('(max-width: 900px)').matches) {
          e.preventDefault();
          e.stopPropagation();
          var dd = btn.closest('.nav-dd');
          if (dd) dd.classList.toggle('open');
        }
      });
    });

    // Lukk menyen når man navigerer til en faktisk lenke
    links.querySelectorAll('a[href]').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    // Lukk når man bytter til desktop-bredde
    window.addEventListener('resize', function () {
      if (!window.matchMedia('(max-width: 900px)').matches) closeMenu();
    });

    // Lukk med Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
