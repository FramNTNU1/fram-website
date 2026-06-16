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
// `desc` = teksten som vises på /miljoer (kun referanse her – sendes IKKE til modellen).
// `match` = nøkkelord/temaer som sendes til modellen for matchingen.
const MILJOER = [
  { navn: "Ascend NTNU", kat: "Luft · Droner", desc: "Konkurrerer i internasjonale drone-konkurranser med autonome systemer.", match: "drone, droner, fly, flyging, autonom, autonome systemer, UAV, datasyn, bildegjenkjenning, kybernetikk, robotikk, AI, programmering, elektronikk, konkurranse, luftfart" },
  { navn: "Boost Henne", kat: "Kvinnenettverk", desc: "Kvinnenettverk for studenter som vil inn i entreprenørskap. Rollemodeller, mentorer og events.", match: "kvinne, jente, jenter, nettverk for kvinner, kvinnenettverk, gründer, gründerskap, starte noe, oppstart, mentorer, rollemodeller, events, community" },
  { navn: "BRAIN NTNU", kat: "AI · Teknologi", desc: "Arrangerer hackathons, foredrag og møteplasser innen kunstig intelligens.", match: "kunstig intelligens, AI, maskinlæring, deep learning, hackathon, arrangement, foredrag, møteplass, tech-event, nettverk, datavitenskap, lære om AI" },
  { navn: "Cogito", kat: "AI · Prosjekter", desc: "Utvikler AI-løsninger og bygger erfaring gjennom semesterprosjekter.", match: "AI, kunstig intelligens, maskinlæring, bygge AI, lage AI, programmere AI, semesterprosjekt, prosjektgruppe, datavitenskap, nybegynner, lære programmering, workshop" },
  { navn: "Designhjelpen", kat: "Konsulent · Design", desc: "Designstudenter hjelper andre orgs og oppstarter med visuell identitet, web og UX.", match: "design, designe, grafisk design, visuell identitet, logo, logolaging, branding, web design, UX, UI, brukeropplevelse, interaksjonsdesign, produktdesign, kreativt, konsulent, utseende, se bra ut, estetikk, farger, typografi" },
  { navn: "DRIV NTNU", kat: "Helse · Innovasjon", desc: "Kobler studenter med reelle helseutfordringer og et tverrfaglig innovasjonsmiljø.", match: "helse, medisin, helsevesen, sykehus, helseinnovasjon, helseteknologi, medisinsk teknologi, tverrfaglig, hackathon, innovasjon, løse helseproblemer, pasient, velferd" },
  { navn: "Entreprenørskolen", kat: "Master", desc: "NTNUs master i entreprenørskap (NSE). To år der du bygger et reelt selskap som eksamen.", match: "master, mastergrad, studie, entreprenørskap, gründer, starte selskap, eget selskap, forretningsutvikling, business, startup, inkubator, NSE" },
  { navn: "Fuel Fighter", kat: "Energi · Bil", desc: "Bygger ultra-energieffektive kjøretøy til Shell Eco-marathon.", match: "bil, bygge bil, kjøretøy, energieffektiv, effektivitet, elbil, hybrid, Shell Eco-marathon, motorsport, mekanikk, elektronikk, aerodynamikk, bærekraft, konkurranse, lavt forbruk" },
  { navn: "Gridville", kat: "Energi · Nett", desc: "Studentprosjekter på fornybar energi, mikronett og smart strømforsyning.", match: "fornybar energi, grønn energi, elkraft, strøm, strømnett, mikronett, solceller, sol, vind, bærekraft, humanitær, bistand, elektrifisering, Afrika, u-land, kraftsystem" },
  { navn: "Hackerspace NTNU", kat: "Makerspace", desc: "Studentdrevet makerspace — lodding, 3D-print, software-prosjekter og workshops.", match: "makerspace, verksted, lage ting, bygge ting, fikse ting, lodding, elektronikk, Arduino, Raspberry Pi, mikrokontroller, 3D-print, programmering, software, app, spill, spillutvikling, hacking, workshop, hobbyprosjekt" },
  { navn: "Ingeniører uten grenser", kat: "Humanitær", desc: "Teknisk bistand og prosjekter i utviklingsland — rent vann, skoler, energi.", match: "humanitær, bistand, frivillig, hjelpe andre, u-land, utviklingsland, bærekraft, teknologi for godt, rent vann, vann, skoler, energi, infrastruktur, samfunnsnytte, verden, global" },
  { navn: "Make NTNU", kat: "Makerspace", desc: "Gir studenter tilgang til verktøy, utstyr og kompetanse for å bygge egne prosjekter.", match: "makerspace, verksted, lage ting, bygge ting, prototype, 3D-print, symaskin, sy, lodding, verktøy, utstyr, kurs, kreativt, hobbyprosjekt, DIY, håndverk" },
  { navn: "Njord", kat: "Hav · Autonomi", desc: "Arrangerer en internasjonal konkurranse for selvstyrte skip, og bygger sine egne autonome fartøy.", match: "hav, båt, skip, maritim, autonom, selvkjørende båt, autonome fartøy, kybernetikk, reguleringsteknikk, programmering, konkurranse, navigasjon, sjø" },
  { navn: "Nordlys", kat: "Energi · Bil", desc: "Bygger og konkurrerer med soldrevne racerbiler i internasjonale solbilløp.", match: "bil, bygge bil, racerbil, motorsport, soldrevet, solbil, solceller, solenergi, fornybar energi, mekanikk, elektronikk, aerodynamikk, bærekraft, konkurranse, sol" },
  { navn: "NORSTEC", kat: "Rom · Nettverk", desc: "Forener studentorganisasjoner innen romteknologi og skaper nye muligheter gjennom samarbeid.", match: "rom, romfart, space, romteknologi, nettverk, samarbeid, satellitter, raketter, romorganisasjon, koble miljøer" },
  { navn: "NORSTEC Summit", kat: "Rom · Konferanse", desc: "Samler studenter, industri og myndigheter til Norges største studentdrevne romkonferanse.", match: "rom, romfart, space, romkonferanse, konferanse, arrangement, event, arrangere, planlegge, nettverk, foredrag, møte industri" },
  { navn: "Orbit NTNU", kat: "Rom · Satellitter", desc: "Bygger CubeSat-satellitter. Første student-satellitt i bane fra NTNU.", match: "rom, romfart, space, satellitt, CubeSat, bygge satellitt, romteknologi, elektronikk, programmering, mekanikk, bane, orbit" },
  { navn: "Propulse NTNU", kat: "Rom · Raketter", desc: "Designer, bygger og skyter opp væskedrevne forskningsraketter.", match: "rom, romfart, space, rakett, bygge rakett, rakettmotor, framdrift, væskedrevet, forbrenning, aerodynamikk, mekanikk, 3D-print, oppskyting, eksperiment" },
  { navn: "Relu", kat: "AI · Industri", desc: "Utvikler AI-løsninger i samarbeid med næringslivet.", match: "AI, kunstig intelligens, maskinlæring, ML, deep learning, datavitenskap, anvende AI, næringsliv, industri, bedrift, forskning, konsulent, AI i praksis" },
  { navn: "Revolve NTNU", kat: "Motorsport · Bil", desc: "Formula Student — designer og bygger en ny elektrisk racerbil hvert år.", match: "bil, bygge bil, racerbil, Formula Student, Formel Student, motorsport, elbil, mekanikk, elektronikk, selvkjørende, datasyn, aerodynamikk, konkurranse, racing" },
  { navn: "Start NTNU", kat: "Arrangør", desc: "Norges største studentorganisasjon for entreprenørskap. Startup Weekend, pitch-kvelder og karriereevents.", match: "entreprenørskap, starte noe, gründer, startup, Startup Weekend, pitch, pitche, innovasjon, konkurranse, events, nettverk, karriere, forretning, bedrift" },
  { navn: "Studio Beta", kat: "Arkitektur", desc: "Studentdrevet arkitektur- og designstudio. Byggeprosjekter i full skala og prototyper.", match: "arkitektur, bygning, rom, romdesign, interiør, design, designstudio, byggeprosjekt, fysisk, full skala, prototyper, konstruere, kreativt, estetikk" },
  { navn: "Støttehjulet", kat: "Konsulent · Organisasjon", desc: "Hjelper organisasjoner med ledelse, samarbeid og organisasjonsutvikling.", match: "konsulent, rådgivning, hjelpe organisasjon, organisasjon, ledelse, lede, samarbeid, organisasjonsutvikling, strategi, prosjektledelse, frivillighet, management" },
  { navn: "Vortex NTNU", kat: "Hav · Undervann", desc: "Bygger autonome undervannsfarkoster (ROV/AUV) til internasjonale konkurranser.", match: "hav, undervann, ROV, AUV, ubåt, autonome farkoster, maritim robotikk, kybernetikk, programmering, elektronikk, mekanikk, konkurranse, dykke, sjø" },
  { navn: "WIC", kat: "Kvinnenettverk", desc: "Women in Consulting. Nettverk, mentorprogram og karrierearrangementer for kvinner.", match: "kvinne, jente, jenter, nettverk for kvinner, kvinnenettverk, konsulent, consulting, rådgivning, karriere, mentorprogram, nettverk, finans, investering, økonomi, business" },
];

// Finn det kanoniske miljønavnet fra modellens forslag – tåler at modellen
// skriver navnet litt annerledes (ulik casing, «NTNU»-suffiks o.l.).
function finnKanonisk(navn) {
  const n = String(navn || "").toLowerCase().trim();
  if (n.length < 2) return null;
  const eksakt = MILJOER.find((o) => o.navn.toLowerCase() === n);
  if (eksakt) return eksakt.navn;
  const delvis = MILJOER.find((o) => {
    const on = o.navn.toLowerCase();
    return n.length >= 4 && (n.includes(on) || on.includes(n));
  });
  return delvis ? delvis.navn : null;
}

const KATALOG = MILJOER.map((m) => `- ${m.navn} (${m.kat}): ${m.match}`).join("\n");

const SYSTEM = `Du er «Framkompasset» – en veiviser som matcher studenters interesser mot studentorganisasjonene i FRAM ved NTNU.

Her er miljøene du kan foreslå:
${KATALOG}

Oppgave: Ut fra teksten brukeren skriver, velg de 1–3 miljøene som passer best. Regler:
- Bruk KUN navn fra listen over, skrevet helt likt.
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
        },
        required: ["navn"],
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
const RATE_WINDOW_MS = 5 * 60_000;
const RATE_MAX = 5;

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
  // Avvis åpenbart store payloads tidlig – før vi behandler noe videre.
  if (interesser.length > 2000) {
    return res.status(413).json({ error: "Teksten er for lang." });
  }
  interesser = interesser.trim().slice(0, 300);
  if (interesser.length < 2) {
    return res.status(400).json({ error: "Skriv litt mer om interessene dine." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Mangler API-nøkkel på serveren." });
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 150,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: interesser }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });

    const text = response.content.find((b) => b.type === "text")?.text || "{}";
    const data = JSON.parse(text);

    // Normaliser navn til kanonisk form, fjern duplikater og ugyldige, maks 3.
    const forslagListe = Array.isArray(data.forslag) ? data.forslag : [];
    const sett = new Set();
    const forslag = [];
    for (const f of forslagListe) {
      const navn = finnKanonisk(f && f.navn);
      if (navn && !sett.has(navn)) {
        sett.add(navn);
        forslag.push({ navn });
        if (forslag.length === 3) break;
      }
    }

    return res.status(200).json({ forslag });
  } catch (err) {
    console.error("forslag-feil:", err);
    return res.status(502).json({ error: "Klarte ikke hente forslag akkurat nå." });
  }
}
