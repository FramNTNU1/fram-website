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
// `desc` = fyldig intern beskrivelse som sendes til modellen for matchingen.
// Disse vises IKKE på /miljoer – de er kun til semantisk matching i boten.
const MILJOER = [
  { navn: "Ascend NTNU", kat: "Luft · Droner", desc: "Bygger og programmerer autonome droner og dronesvermer som konkurrerer i verdens tøffeste dronekonkurranser. Jobber med autonomi, datasyn, maskinlæring, kybernetikk, software og elektronikk. For deg som er fascinert av flygende roboter, KI om bord og luftfart." },
  { navn: "Boost Henne", kat: "Kvinnenettverk", desc: "Nettverk under Spark som motiverer og hjelper kvinnelige studenter inn i entreprenørskap og gründerskap. Arrangerer jevnlig events og arrangementer, og tilbyr rollemodeller, mentorer og verktøy for jenter som vil starte noe eget. For kvinner som er nysgjerrige på oppstart og innovasjon, eller som vil være med å arrangere." },
  { navn: "BRAIN NTNU", kat: "AI · Teknologi", desc: "Arrangerer hackathons, foredrag og møteplasser innen kunstig intelligens, og kobler studenter med forskningsmiljø og næringsliv. En arrangør-org der mye av jobben er å planlegge og gjennomføre arrangementer og events. For deg som vil lære om KI, gå på AI-arrangementer, bli med på hackathon eller selv arrangere – ikke nødvendigvis bygge selv." },
  { navn: "Cogito", kat: "AI · Prosjekter", desc: "Norges største tekniske AI-studentorganisasjon. Du blir med i semesterprosjekter der du bygger og programmerer faktiske KI- og maskinlæringsløsninger sammen med andre. Åpent og nybegynnervennlig – fint sted å lære AI i praksis gjennom kurs, workshops og kodekvelder." },
  { navn: "Designhjelpen", kat: "Konsulent · Design", desc: "Designstudenter fra industriell design som driver et konsulentbyrå og hjelper oppstarter og bedrifter med visuell identitet, logo, grafisk profil, web, UX, interaksjonsdesign og produktdesign. For deg som vil designe ting, jobbe kreativt og lage noe som ser bra ut." },
  { navn: "DRIV NTNU", kat: "Helse · Innovasjon", desc: "Helseinnovasjonsarena på campus Øya som kobler studenter på tvers av medisin, helse og teknologi med reelle helseutfordringer fra sykehus og helsevesen. Arrangerer hackathons og hjelper studenter løse problemer for pasienter. For deg som vil jobbe med helse, medisinsk teknologi og innovasjon." },
  { navn: "Entreprenørskolen", kat: "Master", desc: "NTNUs toårige master i entreprenørskap (NSE) der du bygger et reelt selskap som en del av studiet. For deg som vil ta en mastergrad, starte eget selskap, drive forretningsutvikling og lære gründerskap fra innsiden gjennom en inkubator." },
  { navn: "Fuel Fighter", kat: "Energi · Bil", desc: "Bygger ultra-energieffektive kjøretøy som konkurrerer i Shell Eco-marathon på hvem som bruker minst energi. Jobber med mekanikk, elektronikk, aerodynamikk og bærekraft. For deg som vil bygge bil, drive med motorsport og bryr deg om effektivitet og lavt forbruk." },
  { navn: "Gridville", kat: "Energi · Nett", desc: "Studentprosjekt under Ingeniører uten grenser som designer og bygger mikronett for å gi strøm til en landsby uten tilgang på elektrisitet. Kombinerer fornybar energi, solceller og kraftsystemer med bistandsarbeid. For deg som vil jobbe med grønn energi, strømnett og humanitær teknologi i u-land." },
  { navn: "Hackerspace NTNU", kat: "Makerspace", desc: "Studentdrevet makerspace åpent for alle, med 3D-printere, lodding, elektronikk, Arduino/mikrokontrollere, VR og droner. Mye software- og spillutvikling, kurs og workshops. For deg som vil lage og fikse ting, programmere og kjøre egne hobbyprosjekter." },
  { navn: "Ingeniører uten grenser", kat: "Humanitær", desc: "Driver teknisk bistand og prosjekter i utviklingsland – rent vann, skoler, energi og infrastruktur. For deg som vil bruke teknologi til noe samfunnsnyttig, jobbe frivillig, hjelpe andre og bidra globalt med bærekraft." },
  { navn: "Make NTNU", kat: "Makerspace", desc: "Driver et makerverksted i Realfagbygget åpent 24/7 og gratis for alle, med 3D-printere, symaskiner, loddeutstyr og verktøy. Holder kurs og events. For deg som vil bygge egne prosjekter, lage ting med hendene, drive med DIY, håndverk og prototyper." },
  { navn: "Njord", kat: "Hav · Autonomi", desc: "Arrangerer verdens første studentkonkurranse for autonome skip, og bygger sine egne selvstyrte fartøy. Jobber med marin teknologi, kybernetikk, reguleringsteknikk, navigasjon og programmering. For deg som er interessert i hav, maritim teknologi, båt og autonomi." },
  { navn: "Nordlys", kat: "Energi · Bil", desc: "Bygger og konkurrerer med soldrevne racerbiler i internasjonale solbilløp. Jobber med solceller, solenergi, mekanikk, elektronikk, aerodynamikk og bærekraft. For deg som vil bygge bil, drive med motorsport og fornybar energi fra sola." },
  { navn: "NORSTEC", kat: "Rom · Nettverk", desc: "Paraplyorganisasjon (Norwegian Space Technology Collective) som forener norske romstudentorganisasjoner og skaper samarbeid på tvers innen romteknologi, satellitter og raketter. For deg som er rominteressert og vil bygge nettverk i romfartsmiljøet uavhengig av studieretning." },
  { navn: "NORSTEC Summit", kat: "Rom · Konferanse", desc: "Arrangerer Norges største studentdrevne romkonferanse og samler studenter, industri og myndigheter til foredrag og nettverk. For deg som vil arrangere og planlegge events, høre foredrag om rom og romfart, og møte romindustrien." },
  { navn: "Orbit NTNU", kat: "Rom · Satellitter", desc: "Bygger CubeSat-satellitter og sendte opp NTNUs første studentsatellitt i bane. Jobber med romteknologi, elektronikk, programmering og mekanikk. For deg som vil bygge satellitter og jobbe med rom, romfart og det som flyr i bane." },
  { navn: "Propulse NTNU", kat: "Rom · Raketter", desc: "Designer, bygger og skyter opp væskedrevne forskningsraketter. Jobber med rakettmotorer, framdrift, forbrenning, aerodynamikk, mekanikk og 3D-print. For deg som vil bygge raketter og drive med rom, romfart og oppskyting." },
  { navn: "Relu", kat: "AI · Industri", desc: "Anvendt maskinlæringsorganisasjon som bygger reelle KI- og ML-løsninger for bedrifter, sykehus og forskningsgrupper med ekte data. Samarbeider med selskaper som Rystad Energy og Grieg Seafood. For deg som vil anvende AI i praksis mot næringsliv og industri, mer enn å lære fra null." },
  { navn: "Revolve NTNU", kat: "Motorsport · Bil", desc: "Formula Student-team som designer og bygger en ny elektrisk racerbil hvert år, inkludert selvkjørende. Jobber med mekanikk, elektronikk, datasyn, aerodynamikk og racing. For deg som vil bygge racerbil og drive med motorsport og bilbygging på høyt nivå." },
  { navn: "Start NTNU", kat: "Arrangør", desc: "Norges største studentorganisasjon for entreprenørskap. Arrangerer Startup Weekend, pitch-kvelder, konkurranser og karriereevents. For deg som vil inn i gründer- og startup-miljøet, pitche idéer, bygge nettverk og gå på events – ikke nødvendigvis bygge teknisk selv." },
  { navn: "Studio Beta", kat: "Arkitektur", desc: "Studentdrevet arkitektur- og designstudio der studenter utvikler og realiserer egne byggeprosjekter i full skala og prototyper, ofte for ekte oppdragsgivere. For deg som vil jobbe med arkitektur, romdesign, konstruksjon og bygge fysiske ting kreativt." },
  { navn: "Støttehjulet", kat: "Konsulent · Organisasjon", desc: "Masterstudenter som tilbyr gratis konsulenttjenester innen ledelse, samarbeid og organisasjonsutvikling til andre organisasjoner og bedrifter. Bygger på organisasjonspsykologi. For deg som vil drive med rådgivning, strategi, ledelse, prosjektledelse og management." },
  { navn: "Vortex NTNU", kat: "Hav · Undervann", desc: "Bygger autonome undervannsfarkoster (ROV/AUV/ASV) som konkurrerer internasjonalt i blant annet RoboSub. Jobber med maritim robotikk, kybernetikk, programmering, elektronikk og mekanikk. For deg som vil jobbe under vann, med ubåter, hav og autonome farkoster." },
  { navn: "WIC", kat: "Kvinnenettverk", desc: "Women's Investment Club – nettverk for kvinnelige studenter med interesse for finans, investering og økonomi. Tilbyr mentorprogram, karrierearrangementer og nettverk. For jenter og kvinner som vil inn i finans, investering, konsulent/consulting eller karriere i næringslivet." },
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

const KATALOG = MILJOER.map((m) => `- ${m.navn} (${m.kat}): ${m.desc}`).join("\n");

const SYSTEM = `Du er «Framkompasset» – en veiviser som matcher studenters interesser mot studentorganisasjonene i FRAM ved NTNU.

Her er miljøene du kan foreslå:
${KATALOG}

Oppgave: Ut fra teksten brukeren skriver, velg de 1–4 miljøene som passer best. Regler:
- Bruk KUN navn fra listen over, skrevet helt likt.
- Ranger det beste miljøet først.
- Når flere miljøer tydelig driver med det samme brukeren nevner (f.eks. flere som bygger bil, flere innen romfart, eller flere AI-miljøer), ta med alle de relevante opptil 4 – ikke stopp på ett eller to. Vurder både beskrivelsen og kategorien (f.eks. «Energi · Bil» teller som bilbygging).
- Mange tekniske miljøer deler tema selv om de jobber i ulike domener. Spesielt innen autonome systemer / robotikk er Ascend NTNU (droner), Njord (autonome skip), Vortex NTNU (undervannsfarkoster) og Revolve NTNU (selvkjørende racerbil) nært beslektet. Når brukeren uttrykker interesse for ett av disse temaene (f.eks. droner, autonomi, selvkjørende, robotikk, datasyn, kybernetikk), ta gjerne med flere av de beslektede – men ranger alltid det mest åpenbare treffet først.
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

    // Normaliser navn til kanonisk form, fjern duplikater og ugyldige, maks 4.
    const forslagListe = Array.isArray(data.forslag) ? data.forslag : [];
    const sett = new Set();
    const forslag = [];
    for (const f of forslagListe) {
      const navn = finnKanonisk(f && f.navn);
      if (navn && !sett.has(navn)) {
        sett.add(navn);
        forslag.push({ navn });
        if (forslag.length === 4) break;
      }
    }

    return res.status(200).json({ forslag });
  } catch (err) {
    console.error("forslag-feil:", err);
    return res.status(502).json({ error: "Klarte ikke hente forslag akkurat nå." });
  }
}
