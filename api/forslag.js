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
const MILJOER = [
  { navn: "Ascend NTNU", kat: "Luft · Droner", desc: "Konkurrerer i internasjonale drone-konkurranser med autonome systemer." },
  { navn: "Boost Henne", kat: "Kvinnenettverk", desc: "Kvinnenettverk for studenter som vil inn i entreprenørskap. Rollemodeller, mentorer og events." },
  { navn: "BRAIN NTNU", kat: "AI · Teknologi", desc: "Arrangerer hackathons, foredrag og møteplasser innen kunstig intelligens." },
  { navn: "Cogito", kat: "AI · Prosjekter", desc: "Utvikler AI-løsninger og bygger erfaring gjennom semesterprosjekter." },
  { navn: "Designhjelpen", kat: "Konsulent · Design", desc: "Designstudenter hjelper andre orgs og oppstarter med visuell identitet, web og UX." },
  { navn: "DRIV NTNU", kat: "Helse · Innovasjon", desc: "Kobler studenter med reelle helseutfordringer og et tverrfaglig innovasjonsmiljø." },
  { navn: "Entreprenørskolen", kat: "Master", desc: "NTNUs master i entreprenørskap (NSE). To år der du bygger et reelt selskap som eksamen." },
  { navn: "Fuel Fighter", kat: "Energi · Bil", desc: "Bygger ultra-energieffektive kjøretøy til Shell Eco-marathon." },
  { navn: "Gridville", kat: "Energi · Nett", desc: "Studentprosjekter på fornybar energi, mikronett og smart strømforsyning." },
  { navn: "Gründerbrakka", kat: "Coworking", desc: "Coworking-plass for ambisiøse oppstarter. Faste kontorplasser og investornettverk." },
  { navn: "Hackerspace NTNU", kat: "Makerspace", desc: "Studentdrevet makerspace — lodding, 3D-print, software-prosjekter og workshops." },
  { navn: "Ingeniører uten grenser", kat: "Humanitær", desc: "Teknisk bistand og prosjekter i utviklingsland — rent vann, skoler, energi." },
  { navn: "Innovatio", kat: "Linjeforening", desc: "Linjeforeningen for masterprogrammet i Innovasjon og bærekraftig samfunnsutvikling ved NTNU i Trondheim." },
  { navn: "Make NTNU", kat: "Makerspace", desc: "Gir studenter tilgang til verktøy, utstyr og kompetanse for å bygge egne prosjekter." },
  { navn: "Njord", kat: "Hav · Autonomi", desc: "Arrangerer en internasjonal konkurranse for selvstyrte skip, og bygger sine egne autonome fartøy." },
  { navn: "Nordlys", kat: "Energi · Bil", desc: "Bygger og konkurrerer med soldrevne racerbiler i internasjonale solbilløp." },
  { navn: "NORSTEC", kat: "Rom · Nettverk", desc: "Forener studentorganisasjoner innen romteknologi og skaper nye muligheter gjennom samarbeid." },
  { navn: "NORSTEC Summit", kat: "Rom · Konferanse", desc: "Samler studenter, industri og myndigheter til Norges største studentdrevne romkonferanse." },
  { navn: "Orbit NTNU", kat: "Rom · Satellitter", desc: "Bygger CubeSat-satellitter. Første student-satellitt i bane fra NTNU." },
  { navn: "Propulse NTNU", kat: "Rom · Raketter", desc: "Designer, bygger og skyter opp væskedrevne forskningsraketter." },
  { navn: "Relu", kat: "AI · Industri", desc: "Utvikler AI-løsninger i samarbeid med næringslivet." },
  { navn: "Revolve NTNU", kat: "Motorsport · Bil", desc: "Formula Student — designer og bygger en ny elektrisk racerbil hvert år." },
  { navn: "Solan", kat: "Linjeforening", desc: "Linjeforeningen for Entreprenørskolen ved NTNU i Trondheim." },
  { navn: "Spark* NTNU", kat: "Veiledning", desc: "Gratis veiledningstjeneste for studenter med en forretningsidé — mentorer, workshops og et program fra post-it til pilot." },
  { navn: "Start NTNU", kat: "Arrangør", desc: "Norges største studentorganisasjon for entreprenørskap. Startup Weekend, pitch-kvelder og karriereevents." },
  { navn: "Studio Beta", kat: "Arkitektur", desc: "Studentdrevet arkitektur- og designstudio. Byggeprosjekter i full skala og prototyper." },
  { navn: "Støttehjulet", kat: "Konsulent · Organisasjon", desc: "Hjelper organisasjoner med ledelse, samarbeid og organisasjonsutvikling." },
  { navn: "Vortex NTNU", kat: "Hav · Undervann", desc: "Bygger autonome undervannsfarkoster (ROV/AUV) til internasjonale konkurranser." },
  { navn: "WIC", kat: "Kvinnenettverk", desc: "Women in Consulting. Nettverk, mentorprogram og karrierearrangementer for kvinner." },
];

const GYLDIGE_NAVN = new Set(MILJOER.map((m) => m.navn));

const KATALOG = MILJOER.map((m) => `- ${m.navn} (${m.kat}): ${m.desc}`).join("\n");

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
