/* ============================================================
   FRAM · Felles arrangements-data (single source of truth)
   ------------------------------------------------------------
   Begge sider (forsiden + arrangementer-siden) leser herfra.
   Når et nytt bookingsystem/backend kobles på, er det dette
   arrayet som skal fylles fra API-et — markup-en under endres ikke.
   Rekkefølgen i arrayet = visningsrekkefølgen på arrangementer-siden.
   ============================================================ */
window.FRAM_EVENTS = [
  {
    day: "22", mo: "APR", time: "17:00 · 3t",
    type: "Sosialt", dataType: "sosialt", audience: "apent",
    title: "Bread n' Spread",
    desc: "Ukentlig sosial kveldsmat. Brødskiver, pålegg, prat og nye folk. Drop-in — ingen påmelding.",
    location: "Fram Lounge", host: "Fram",
    pill: { cls: "drop", text: "Drop-in" }, cta: "Se detaljer",
    img: "assets/bns-nov6.webp", hostFram: true, tone: null, partner: null, href: "#"
  },
  {
    day: "30", mo: "APR", time: "16:00 · 2t",
    type: "Workshop", dataType: "workshop", audience: "apent",
    title: "Hundekos + vafler",
    desc: "Pause fra skjermen og deadlines. Vi inviterer inn et par firbeinte gjester for klapping, kos og varme poter i fanget. Møt opp når du trenger det mest.",
    location: "Scenerommet", host: "Fram",
    pill: { cls: "open", text: "12 plasser igjen" }, cta: "Meld deg på",
    img: "assets/hundekos.webp", hostFram: true, tone: null, partner: null, href: "#"
  },
  {
    day: "5–6", mo: "MAR", time: "All day",
    type: "Pitch", dataType: "pitch", audience: "apent",
    title: "StartIT 2026",
    desc: "15 studenter. 3 minutter hver. En jury, en vinner, gratis pizza til alle. Ta med lagget ditt og se hva andre bygger.",
    location: "Gruva", host: "Fram + Spark*",
    pill: { cls: "open", text: "Åpen påmelding" }, cta: "Meld deg på",
    img: "assets/heroes/start.webp", hostFram: false, tone: "yellow",
    partner: { src: "assets/partners/start-ntnu.webp", alt: "Start NTNU", title: "Arrangør: Start NTNU" }, href: "#"
  },
  {
    day: "05", mo: "MAI", time: "16:30 · 2t",
    type: "Workshop", dataType: "workshop", audience: "apent",
    title: "3D-print for nybegynnere",
    desc: "Lær å bruke 3D-printerne i Idegarasjen. Fra CAD til ferdig print på to timer — ingen forkunnskap nødvendig.",
    location: "Idegarasjen", host: "Fram",
    pill: { cls: "open", text: "5 plasser igjen" }, cta: "Meld deg på",
    img: "assets/gruva-event.webp", hostFram: false, tone: "teal", partner: null, href: "#"
  },
  {
    day: "12", mo: "MAI", time: "19:00 · 90min",
    type: "Sosialt", dataType: "sosialt", audience: "apent",
    title: "Bread n' Spread",
    desc: "Ukentlig sosial kveldsmat. Brødskiver, pålegg, prat og nye folk. Drop-in — ingen påmelding.",
    location: "Fram Lounge", host: "Fram",
    pill: { cls: "drop", text: "Drop-in" }, cta: "Se detaljer",
    img: "assets/bns-nov6.webp", hostFram: false, tone: "red", partner: null, href: "#"
  },
  {
    day: "19", mo: "MAI", time: "17:00 · 60min",
    type: "Foredrag", dataType: "foredrag", audience: "apent",
    title: "Fra startup til exit — samtale med Cognite",
    desc: "Grunnleggeren snakker om veien fra første kodelinje til notering. Q&A etter foredraget.",
    location: "Scenerommet", host: "Fram",
    pill: { cls: "open", text: "Åpen påmelding" }, cta: "Meld deg på",
    img: "assets/scenerommet.avif", hostFram: false, tone: "blue", partner: null, href: "#"
  },
  {
    day: "26", mo: "MAI", time: "15:00 · 60min",
    type: "Workshop", dataType: "workshop", audience: "apent",
    title: "Lean Canvas — på én time",
    desc: "Spark* lærer deg å visualisere idéen din på et ark. Ta med pen og papir; vi tar resten.",
    location: "Gruva", host: "Spark*",
    pill: { cls: "open", text: "Åpen påmelding" }, cta: "Meld deg på",
    img: "assets/heroes/spark.webp", hostFram: false, tone: "yellow", partner: null, href: "#"
  },
  {
    day: "31", mo: "MAI", time: "18:00 · 24t",
    type: "Hackathon", dataType: "hackathon", audience: "apent",
    title: "24h Build — Klima & Energi", titlePartner: "brain",
    desc: "Et døgn. Et tema. Et team. Fram + Gridville inviterer til bygg-noe-konkret-natt med sponsorpremier fra Statkraft.",
    location: "Fram", host: "Fram + Gridville",
    pill: { cls: "open", text: "Lagpåmelding" }, cta: "Meld laget på",
    img: "assets/heroes/gridville.webp", hostFram: false, tone: "red",
    partner: { src: "assets/partners/brain-ntnu.webp", alt: "BRAIN NTNU", title: "Medarrangør: BRAIN NTNU" }, href: "#"
  },
  {
    day: "06", mo: "JUN", time: "18:00 · 3t",
    type: "Internt", dataType: "sosialt", audience: "internt",
    title: "Medlemsmiddag · Vårsemesteret",
    desc: "Takk-for-semesteret-middag for alle Fram-medlemmer. Mat, drikke, og oppsummering av hva vi har bygd sammen.",
    location: "Scenerommet", host: "Fram",
    pill: { cls: "intern", text: "🔒 Kun for medlemmer" }, cta: "Mer info",
    img: "assets/fram-fellesrom.webp", hostFram: false, tone: "charcoal", partner: null, href: "#"
  }
];

/* HTML-escape helper */
window.FRAM_esc = function (s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};

/* ---- Full kort til arrangementer-siden (.ev-grid) ---- */
window.FRAM_renderEventCard = function (e) {
  var esc = window.FRAM_esc;
  var attrHost = e.hostFram ? ' data-host="fram"' : (e.tone ? ' data-tone="' + e.tone + '"' : '');
  var partnerImg = "";
  if (e.hostFram) {
    partnerImg = '<img src="assets/fram-symbol.webp" alt="Fram" class="ev-partner" title="Arrangør: Fram">';
  } else if (e.partner) {
    partnerImg = '<img src="' + e.partner.src + '" alt="' + esc(e.partner.alt) + '" class="ev-partner" title="' + esc(e.partner.title) + '">';
  }
  var titleAttr = e.titlePartner ? ' data-partner="' + e.titlePartner + '"' : '';
  return '' +
  '<div class="ev-card"' + attrHost + ' data-type="' + e.dataType + '" data-audience="' + e.audience + '" style="--ev-hover-img:url(\'' + e.img + '\');">' +
    '<div class="ev-header">' +
      '<div class="ev-hover-img"></div>' +
      partnerImg +
      '<div class="ev-top"><span class="ev-type-tag">' + esc(e.type) + '</span></div>' +
      '<div class="ev-date-big"><span class="day">' + esc(e.day) + '</span><span class="mo">' + esc(e.mo) + '</span><span class="ev-time">' + esc(e.time) + '</span></div>' +
    '</div>' +
    '<div class="ev-body">' +
      '<h4' + titleAttr + '>' + esc(e.title) + '</h4>' +
      '<p>' + esc(e.desc) + '</p>' +
      '<div class="ev-meta"><span>' + esc(e.location) + '</span><span>' + esc(e.host) + '</span></div>' +
    '</div>' +
    '<div class="ev-foot">' +
      '<span class="ev-pill ' + e.pill.cls + '">' + esc(e.pill.text) + '</span>' +
    '</div>' +
  '</div>';
};

/* ---- Kompakt kort til forsiden (.events-list) ---- */
window.FRAM_renderHomeEvent = function (e) {
  var esc = window.FRAM_esc;
  var startTime = String(e.time).split(" · ")[0];
  return '' +
  '<div class="event">' +
    '<div class="event-date"><span class="d">' + esc(e.day) + '</span><span class="m">' + esc(e.mo + " · " + startTime) + '</span></div>' +
    '<div class="event-title">' + esc(e.title) + '</div>' +
    '<div class="event-meta">' + esc(e.pill.text + " · " + e.location) + '</div>' +
  '</div>';
};
