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

/* YouTube-facade: bytt thumbnail-knapp med ekte iframe (autoplay) ved klikk.
   Sparer ~950 KiB + tung JS ved sidelast. Harmløs der knappen ikke finnes. */
(function () {
  var f = document.getElementById('ytFacade');
  if (!f) return;
  f.addEventListener('click', function () {
    var id = f.getAttribute('data-video');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
      '?rel=0&modestbranding=1&autoplay=1';
    iframe.title = 'Fram NTNU — Åpent for alle';
    iframe.allow = 'accelerated-2d-canvas; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    f.replaceWith(iframe);
  });
})();

/* Easter egg: skriv «origami» hvor som helst på siden, så folder et papirfly seg ut
   og flyr «fram» over skjermen og tegner et lett flyspor. Harmløst, rydder opp etter
   seg, blokkerer ingen klikk (pointer-events:none) og respekterer reduced-motion. */
(function () {
  var WORD = 'origami';
  var buf = '', flying = false;

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    var k = e.key || '';
    if (k.length !== 1) return; // ignorer Shift, piltaster o.l.
    buf = (buf + k.toLowerCase()).slice(-WORD.length);
    if (buf === WORD) { buf = ''; launch(); }
  });

  var NS = 'http://www.w3.org/2000/svg';
  var COLORS = ['#47B99F', '#1385B3', '#E36672', '#FFD130']; // origami-logoens flater

  function rand(a, b) { return a + Math.random() * (b - a); }

  function cubic(p0, p1, p2, p3, t) {
    var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
             y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
  }

  // FRAM-logoens origami-emblem, sentrert om (0,0) så rotasjon/skala pivoterer i midten.
  function origamiSVG() {
    var g = document.createElementNS(NS, 'g');
    g.innerHTML = '<g transform="translate(-500,-500)">' +
      '<polygon fill="#47B99F" points="712.1,924.1 500.3,712.2 500.3,288.6 712.1,500.5"/>' +
      '<polygon fill="#1385B3" points="76.5,288.6 288.4,500.5 712.1,500.5 500.2,288.6"/>' +
      '<polygon fill="#E36672" points="924,712.3 712.1,500.4 712.1,76.8 924,288.7"/>' +
      '<polygon fill="#FFD130" points="288.4,76.8 500.3,288.7 924,288.7 712.1,76.8"/>' +
      '<polygon fill="#3A7A67" points="712.1,500.5 500.3,537.1 500.3,500.6"/>' +
      '<polygon fill="#A8505F" points="924,288.6 712.1,325.2 712.1,288.7"/>' +
      '</g>';
    g.style.filter = 'drop-shadow(0 40px 40px rgba(0,0,0,0.22))';
    return g;
  }

  function launch() {
    if (flying) return;
    flying = true;

    var W = window.innerWidth, H = window.innerHeight;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;' +
      'pointer-events:none;z-index:99999;overflow:visible';
    document.body.appendChild(svg);

    if (!svg.animate) { window.setTimeout(function () { svg.remove(); flying = false; }, 100); return; }

    var pending = 0;
    function track(anim) {
      pending++;
      anim.onfinish = function () { if (--pending <= 0) { svg.remove(); flying = false; } };
    }

    var origin = { x: W * 0.5, y: H + 60 };          // start: midt nederst, så tar flokken av
    var FLEET = reduce ? 2 : 11;

    // ---- Flåte: origami-logoer som vifter ut oppover og tumler i lufta ----
    for (var i = 0; i < FLEET; i++) {
      (function (idx) {
        var scale = rand(0.045, 0.095);                       // logoen er ~850 enheter → ~38–80 px
        var ex = W * ((idx + 0.5) / FLEET) + rand(-70, 70);   // spres jevnt mot toppen
        var p0 = { x: origin.x + rand(-40, 40), y: origin.y };
        var p1 = { x: origin.x + (ex - origin.x) * 0.25 + rand(-140, 140), y: H * rand(0.50, 0.75) };
        var p2 = { x: origin.x + (ex - origin.x) * 0.75 + rand(-140, 140), y: H * rand(0.12, 0.40) };
        var p3 = { x: ex, y: rand(-200, -120) };

        var a0 = rand(0, 360), spin = rand(-720, 720);        // tumler ulikt mye
        var N = 48, frames = [];
        for (var s = 0; s <= N; s++) {
          var tt = s / N;
          var c = cubic(p0, p1, p2, p3, tt);
          frames.push({ transform: 'translate(' + c.x + 'px,' + c.y + 'px) rotate(' + (a0 + spin * tt) + 'deg) scale(' + scale + ')' });
        }

        var logo = origamiSVG();
        logo.style.opacity = '0';
        svg.appendChild(logo);

        var dur = reduce ? 1200 : rand(2200, 3400);
        var delay = reduce ? 0 : idx * rand(70, 130);    // staggered takeoff = flokk-følelse
        logo.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, delay: delay, fill: 'both' });
        track(logo.animate(frames, { duration: dur, delay: delay, easing: 'ease-in-out', fill: 'both' }));
      })(i);
    }

    // ---- Konfetti: papirbiter som spruter opp fra takeoff og daler ned ----
    var PIECES = reduce ? 0 : 30;
    for (var j = 0; j < PIECES; j++) {
      var piece = document.createElementNS(NS, 'g');
      var w = rand(5, 9), h = rand(7, 13);
      piece.innerHTML = '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w +
        '" height="' + h + '" rx="1" fill="' + COLORS[j % COLORS.length] + '"/>';
      svg.appendChild(piece);

      var a = rand(-145, -35) * Math.PI / 180, spd = rand(9, 17);
      var vx = Math.cos(a) * spd, vy = Math.sin(a) * spd, g = 0.85, spin = rand(-540, 540);
      var kf = [];
      for (var s2 = 0; s2 <= 8; s2++) {
        var f = s2 / 8, tau = f * 30;
        var x = origin.x + vx * tau, y = origin.y + vy * tau + 0.5 * g * tau * tau;
        kf.push({ transform: 'translate(' + x + 'px,' + y + 'px) rotate(' + (spin * f) + 'deg)',
                  opacity: f < 0.6 ? 1 : Math.max(0, 1 - (f - 0.6) / 0.4) });
      }
      track(piece.animate(kf, { duration: rand(1300, 2000), easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' }));
    }
  }
})();

/* ============================================================
   Vercel Speed Insights · måler reelle ytelsestall (Core Web
   Vitals) fra besøkende. Statisk side uten byggesteg, så vi
   injiserer det offisielle scriptet i stedet for npm-pakken.
   Krever at Speed Insights er skrudd på i Vercel-prosjektet.
   ============================================================ */
(function () {
  if (window.si) return;                       // unngå dobbel-lasting
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
  var s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/speed-insights/script.js';
  document.head.appendChild(s);
})();
