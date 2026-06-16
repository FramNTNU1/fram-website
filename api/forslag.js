import Anthropic from "@anthropic-ai/sdk";

/* ============================================================
   Framkompasset – /api/forslag
   Tar imot { interesser: "<fritekst>" } og returnerer
   { forslag: [{ navn, grunn }] } – de 3 miljøene som passer best.

   Kjører på Claude Haiku 4.5 (billigste modell). En forespørsel
   koster i størrelsesorden ~$0,003, så dette er i praksis gratis
   for trafikken denne siden har.

   Krever miljøvariabelen ANTHROPIC_API_KEY i Vercel-prosjektet.
   ============================================================ */

// Miljøkatalogen – navnene MÅ matche <h3> på /miljoer eksakt,
// så front-end kan koble forslaget til riktig kort.
// `desc` = teksten som vises på /miljoer (uendret).
// `match` = ekstra nøkkelord/temaer kun for AI-matchingen (vises ikke).
const MILJOER = [
  { navn: "Ascend NTNU", kat: "Luft · Droner", desc: "Konkurrerer i internasjonale drone-konkurranser med autonome systemer.", match: "autonome droner, flygende roboter, datasyn, computer vision, kybernetikk, robotikk, AI, programmering, elektronikk, regulering, internasjonale konkurranser (IARC); passer deg som vil bygge selvstyrte flygende systemer." },
  { navn: "Boost Henne", kat: "Kvinnenettverk", desc: "Kvinnenettverk for studenter som vil inn i entreprenørskap. Rollemodeller, mentorer og events.", match: "kvinnenettverk, jenter, kvinner, entreprenørskap, gründer, oppstart, rollemodeller, mentorer, motivasjon, events; passer kvinner som vil prøve entreprenørskap." },
  { navn: "BRAIN NTNU", kat: "AI · Teknologi", desc: "Arrangerer hackathons, foredrag og møteplasser innen kunstig intelligens.", match: "kunstig intelligens, AI, maskinlæring, hackathon, foredrag, møteplass, datavitenskap, kybernetikk, forskning, arrangement; passer deg som vil inn i AI-miljøet gjennom events." },
  { navn: "Cogito", kat: "AI · Prosjekter", desc: "Utvikler AI-løsninger og bygger erfaring gjennom semesterprosjekter.", match: "kunstig intelligens, AI, maskinlæring, programmering, koding, datavitenskap, semesterprosjekter, workshops, bygge AI-løsninger, nybegynnervennlig; passer deg som vil lære AI ved å bygge." },
  { navn: "Designhjelpen", kat: "Konsulent · Design", desc: "Designstudenter hjelper andre orgs og oppstarter med visuell identitet, web og UX.", match: "design, grafisk design, visuell identitet, logo, web, webdesign, UX, interaksjonsdesign, produktdesign, tjenestedesign, kreativt, konsulent, ekte kunder; passer kreative design-studenter." },
  { navn: "DRIV NTNU", kat: "Helse · Innovasjon", desc: "Kobler studenter med reelle helseutfordringer og et tverrfaglig innovasjonsmiljø.", match: "helse, medisin, helseinnovasjon, helseteknologi, tverrfaglig, hackathon, innovasjon, entreprenørskap, campus Øya; passer deg som vil koble helse med teknologi og innovasjon." },
  { navn: "Entreprenørskolen", kat: "Master", desc: "NTNUs master i entreprenørskap (NSE). To år der du bygger et reelt selskap som eksamen.", match: "master, entreprenørskap, gründer, starte selskap, forretningsutvikling, kommersialisering, teknologi, tverrfaglig, inkubator, mentor; passer deg som vil ta en master der du bygger eget selskap." },
  { navn: "Fuel Fighter", kat: "Energi · Bil", desc: "Bygger ultra-energieffektive kjøretøy til Shell Eco-marathon.", match: "bil, bilbygging, kjøretøy, energieffektiv, elbil, Shell Eco-marathon, motorsport, mekanikk, elektronikk, aerodynamikk, autonom, bærekraft, konkurranse; passer deg som vil bygge supereffektive biler." },
  { navn: "Gridville", kat: "Energi · Nett", desc: "Studentprosjekter på fornybar energi, mikronett og smart strømforsyning.", match: "fornybar energi, elkraft, strøm, mikronett, solceller, bærekraft, humanitær, bistand, elektrifisering, landsby uten strøm, praktisk; passer deg som vil jobbe med energi og bistand." },
  { navn: "Gründerbrakka", kat: "Coworking", desc: "Coworking-plass for ambisiøse oppstarter. Faste kontorplasser og investornettverk.", match: "coworking, kontorplass, oppstart, startup, gründer, inkubator, investornettverk, skalere selskap, bygge bedrift; passer deg som allerede har en oppstart og trenger plass og nettverk." },
  { navn: "Hackerspace NTNU", kat: "Makerspace", desc: "Studentdrevet makerspace — lodding, 3D-print, software-prosjekter og workshops.", match: "makerspace, verksted, bygge med hendene, lodding, 3D-print, elektronikk, Arduino, mikrokontroller, Raspberry Pi, VR, programmering, software, spillutvikling, workshops; passer deg som liker å tinkre og bygge ting." },
  { navn: "Ingeniører uten grenser", kat: "Humanitær", desc: "Teknisk bistand og prosjekter i utviklingsland — rent vann, skoler, energi.", match: "humanitær, bistand, frivillig, bærekraft, teknologi for utviklingsland, rent vann, energi, infrastruktur, samfunnsnytte, ingeniørkunnskap; passer deg som vil hjelpe andre med teknologi." },
  { navn: "Innovatio", kat: "Linjeforening", desc: "Linjeforeningen for masterprogrammet i Innovasjon og bærekraftig samfunnsutvikling ved NTNU i Trondheim.", match: "linjeforening, innovasjon, bærekraft, samfunnsutvikling, sosialt, nettverk, næringsliv, master; for studenter på master i Innovasjon og bærekraftig samfunnsutvikling." },
  { navn: "Make NTNU", kat: "Makerspace", desc: "Gir studenter tilgang til verktøy, utstyr og kompetanse for å bygge egne prosjekter.", match: "makerspace, verksted, bygge med hendene, 3D-print, symaskin, lodding, verktøy, prototyper, kurs, kreativt, åpent verksted; passer deg som vil ha tilgang til utstyr for å bygge ting." },
  { navn: "Njord", kat: "Hav · Autonomi", desc: "Arrangerer en internasjonal konkurranse for selvstyrte skip, og bygger sine egne autonome fartøy.", match: "hav, maritim, autonomi, selvstyrte skip, autonome fartøy, ASV, båt, kybernetikk, programmering, konkurranse-arrangør; passer deg som vil jobbe med autonome båter og skip." },
  { navn: "Nordlys", kat: "Energi · Bil", desc: "Bygger og konkurrerer med soldrevne racerbiler i internasjonale solbilløp.", match: "bil, bilbygging, racerbil, motorsport, soldrevet, solbil, solceller, solenergi, fornybar energi, mekanikk, elektronikk, aerodynamikk, bærekraft, World Solar Challenge, konkurranse; passer deg som vil bygge biler og er glad i solenergi." },
  { navn: "NORSTEC", kat: "Rom · Nettverk", desc: "Forener studentorganisasjoner innen romteknologi og skaper nye muligheter gjennom samarbeid.", match: "rom, romfart, romteknologi, nettverk, samarbeid, satellitter, raketter, inkubator, paraply for romorganisasjoner; passer deg som vil jobbe på tvers i rommiljøet." },
  { navn: "NORSTEC Summit", kat: "Rom · Konferanse", desc: "Samler studenter, industri og myndigheter til Norges største studentdrevne romkonferanse.", match: "rom, romfart, romkonferanse, arrangement, event, arrangør, nettverk, industri, foredrag, romteknologi; passer deg som vil arrangere en stor romkonferanse." },
  { navn: "Orbit NTNU", kat: "Rom · Satellitter", desc: "Bygger CubeSat-satellitter. Første student-satellitt i bane fra NTNU.", match: "rom, romfart, satellitter, CubeSat, romteknologi, elektronikk, programmering, mekanikk, bane, orbit, ingeniør; passer deg som vil bygge satellitter." },
  { navn: "Propulse NTNU", kat: "Rom · Raketter", desc: "Designer, bygger og skyter opp væskedrevne forskningsraketter.", match: "rom, romfart, raketter, rakettmotor, væskedrevet, forbrenning, propulsjon, aerodynamikk, mekanikk, 3D-print, oppskyting, forskningsrakett, EuRoC; passer deg som vil bygge og skyte opp raketter." },
  { navn: "Relu", kat: "AI · Industri", desc: "Utvikler AI-løsninger i samarbeid med næringslivet.", match: "kunstig intelligens, AI, maskinlæring, ML, datavitenskap, data science, anvendt, næringsliv, industri, forskning, prosjekter, konsulent; passer deg som vil bruke maskinlæring på reelle problemer." },
  { navn: "Revolve NTNU", kat: "Motorsport · Bil", desc: "Formula Student — designer og bygger en ny elektrisk racerbil hvert år.", match: "bil, bilbygging, racerbil, motorsport, Formula Student, elbil, mekanikk, elektronikk, selvkjørende, driverless, datasyn, aerodynamikk, ingeniør, konkurranse; passer deg som vil bygge konkurransebiler." },
  { navn: "Solan", kat: "Linjeforening", desc: "Linjeforeningen for Entreprenørskolen ved NTNU i Trondheim.", match: "linjeforening, sosialt, nettverk, arrangementer, entreprenørskap; for studenter på Entreprenørskolen (NSE)." },
  { navn: "Spark* NTNU", kat: "Veiledning", desc: "Gratis veiledningstjeneste for studenter med en forretningsidé — mentorer, workshops og et program fra post-it til pilot.", match: "veiledning, mentor, gründer, forretningsidé, oppstart, startup, entreprenørskap, workshops, lavterskel, hjelp til å starte; passer deg som har en idé du vil teste ut." },
  { navn: "Start NTNU", kat: "Arrangør", desc: "Norges største studentorganisasjon for entreprenørskap. Startup Weekend, pitch-kvelder og karriereevents.", match: "entreprenørskap, arrangør, arrangement, Startup Weekend, pitch, innovasjon, konkurranser, events, nettverk, karriere; passer deg som vil arrangere og engasjere i gründermiljøet." },
  { navn: "Studio Beta", kat: "Arkitektur", desc: "Studentdrevet arkitektur- og designstudio. Byggeprosjekter i full skala og prototyper.", match: "arkitektur, design, byggeprosjekter, full skala, prototyper, bygge med hendene, kreativt, materialer, snekring; passer arkitektur- og design-studenter som vil bygge i full skala." },
  { navn: "Støttehjulet", kat: "Konsulent · Organisasjon", desc: "Hjelper organisasjoner med ledelse, samarbeid og organisasjonsutvikling.", match: "konsulent, rådgivning, organisasjon, ledelse, samarbeid, organisasjonsutvikling, prosjektledelse, frivillighet, mennesker; passer deg som vil hjelpe organisasjoner å fungere bedre." },
  { navn: "Vortex NTNU", kat: "Hav · Undervann", desc: "Bygger autonome undervannsfarkoster (ROV/AUV) til internasjonale konkurranser.", match: "hav, undervann, ROV, AUV, autonome farkoster, maritim robotikk, kybernetikk, programmering, elektronikk, mekanikk, datasyn, konkurranse (RoboSub); passer deg som vil bygge undervannsroboter." },
  { navn: "WIC", kat: "Kvinnenettverk", desc: "Women in Consulting. Nettverk, mentorprogram og karrierearrangementer for kvinner.", match: "kvinnenettverk, jenter, kvinner, konsulent, consulting, karriere, mentorprogram, nettverk, finans, investering, arrangementer; passer kvinner som vil inn i konsulent- og finansbransjen." },
];

const GYLDIGE_NAVN = new Set(MILJOER.map((m) => m.navn));

const KATALOG = MILJOER.map((m) => `- ${m.navn} (${m.kat}): ${m.desc} [Passer for: ${m.match}]`).join("\n");

const SYSTEM = `Du er «Framkompasset» – en veiviser som matcher studenters interesser mot studentorganisasjonene i FRAM ved NTNU.

Her er miljøene du kan foreslå:
${KATALOG}

Oppgave: Ut fra teksten brukeren skriver, velg de 1–3 miljøene som passer best. Regler:
- Bruk KUN navn fra listen over, skrevet helt likt.
- Skriv en kort, konkret «grunn» (maks ~18 ord, på norsk) som forklarer hvorfor miljøet passer denne personen.
- Ranger det beste miljøet først.
- Når flere miljøer tydelig driver med det samme brukeren nevner (f.eks. flere som bygger bil, flere innen romfart, eller flere AI-miljøer), ta med alle de relevante opptil 3 – ikke stopp på ett eller to. Vurder både beskrivelsen og kategorien (f.eks. «Energi · Bil» teller som bilbygging).
- Hvis ingenting passer tydelig, returner en tom liste.
- Ikke dikt opp miljøer eller fakta.`;

const SCHEMA = {
  type: "object",
  properties: {
    forslag: {
      type: "array",
      items: {
        type: "object",
        properties: {
          navn: { type: "string" },
          grunn: { type: "string" },
        },
        required: ["navn", "grunn"],
        additionalProperties: false,
      },
    },
  },
  required: ["forslag"],
  additionalProperties: false,
};

// Enkel rate-limiting per instans (best effort – ekte vern er
// utgiftstaket på API-nøkkelen + lengdegrensen under).
const RATE = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;

function rateLimited(ip) {
  const now = Date.now();
  const hits = (RATE.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  RATE.set(ip, hits);
  if (RATE.size > 5000) RATE.clear(); // unngå minnelekkasje
  return hits.length > RATE_MAX;
}

// Slipp bare gjennom forespørsler som kommer fra siden selv.
function sammeOpprinnelse(req) {
  const host = req.headers.host;
  const ref = req.headers.origin || req.headers.referer;
  if (!host || !ref) return false;
  try {
    return new URL(ref).host === host;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Bruk POST." });
  }
  if (!sammeOpprinnelse(req)) {
    return res.status(403).json({ error: "Ugyldig opprinnelse." });
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "ukjent";
  if (rateLimited(ip)) {
    return res.status(429).json({ error: "For mange forespørsler. Vent litt." });
  }

  let interesser = req.body && req.body.interesser;
  if (typeof interesser !== "string") {
    return res.status(400).json({ error: "Mangler «interesser»." });
  }
  interesser = interesser.trim().slice(0, 300);
  if (interesser.length < 3) {
    return res.status(400).json({ error: "Skriv litt mer om interessene dine." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Mangler API-nøkkel på serveren." });
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: "user", content: interesser }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });

    const text = response.content.find((b) => b.type === "text")?.text || "{}";
    const data = JSON.parse(text);

    // Filtrer bort alt som ikke matcher et ekte miljønavn.
    const forslag = (Array.isArray(data.forslag) ? data.forslag : [])
      .filter((f) => f && GYLDIGE_NAVN.has(f.navn))
      .slice(0, 3)
      .map((f) => ({ navn: f.navn, grunn: String(f.grunn || "").slice(0, 200) }));

    return res.status(200).json({ forslag });
  } catch (err) {
    console.error("forslag-feil:", err);
    return res.status(502).json({ error: "Klarte ikke hente forslag akkurat nå." });
  }
}
