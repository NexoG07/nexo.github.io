import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const POPUP_FILE = path.join(DATA_DIR, 'popup.json');
const RATINGS_FILE = path.join(DATA_DIR, 'ratings.json');

const DEFAULT_POPUP = {
  enabled: false,
  title: 'Willkommen auf Nexo!',
  message: 'Viel Spaß beim Zocken der besten kostenlosen Browsergames!',
  badge: '📢 Ankündigung',
  buttonText: "Los geht's!",
  displayMode: 'always',
  updatedAt: Date.now(),
};

function loadPopup() {
  try {
    if (fs.existsSync(POPUP_FILE)) {
      const data = fs.readFileSync(POPUP_FILE, 'utf-8');
      return { ...DEFAULT_POPUP, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading popup file:', err);
  }
  return { ...DEFAULT_POPUP };
}

function savePopup(config: any) {
  try {
    fs.writeFileSync(POPUP_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing popup file:', err);
  }
}

const DEFAULT_RATINGS: Record<string, { upvotes: number; downvotes: number }> = {
  'ultra-chess': { upvotes: 384, downvotes: 12 },
  'space-waves': { upvotes: 295, downvotes: 8 },
  'minecraft': { upvotes: 420, downvotes: 14 },
  'level-devil': { upvotes: 310, downvotes: 18 },
  'drift-hunters': { upvotes: 275, downvotes: 11 },
  'drive-mad': { upvotes: 260, downvotes: 9 },
  'retro-bowl': { upvotes: 240, downvotes: 15 },
  'golf-hit': { upvotes: 210, downvotes: 9 },
  'granny': { upvotes: 345, downvotes: 16 },
  'bloxity': { upvotes: 184, downvotes: 9 },
  'veck-io': { upvotes: 142, downvotes: 11 },
  'smashkart': { upvotes: 198, downvotes: 12 },
  'subwaysurfers-city': { upvotes: 215, downvotes: 14 },
  'tunnel-rush': { upvotes: 190, downvotes: 10 },
  'ovo': { upvotes: 185, downvotes: 7 },
  'hole-io': { upvotes: 192, downvotes: 13 },
  'basketball-bros': { upvotes: 168, downvotes: 9 },
  'football-bros': { upvotes: 154, downvotes: 8 },
  'super-liquid-soccer': { upvotes: 142, downvotes: 11 },
  'rocketgoal-io': { upvotes: 178, downvotes: 12 },
  'traffic-rally': { upvotes: 135, downvotes: 9 },
  'dash-masters': { upvotes: 128, downvotes: 7 },
  'wacky-flip': { upvotes: 146, downvotes: 8 },
  'hill-sprint': { upvotes: 132, downvotes: 6 },
  'bike-xtreme': { upvotes: 150, downvotes: 9 },
  'airborne-bmx': { upvotes: 124, downvotes: 7 },
  'escaperoad': { upvotes: 134, downvotes: 10 },
  'stickman-hook': { upvotes: 122, downvotes: 8 },
  'geometry-dash': { upvotes: 175, downvotes: 18 },
  'slowroads': { upvotes: 118, downvotes: 7 },
};

function loadRatings() {
  try {
    if (fs.existsSync(RATINGS_FILE)) {
      const data = fs.readFileSync(RATINGS_FILE, 'utf-8');
      return { ...DEFAULT_RATINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading ratings file:', err);
  }
  return { ...DEFAULT_RATINGS };
}

function saveRatings(ratings: any) {
  try {
    fs.writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing ratings file:', err);
  }
}

// API Endpoints
app.get('/api/popup', (_req, res) => {
  res.json(loadPopup());
});

app.post('/api/popup', (req, res) => {
  const current = loadPopup();
  const updated = {
    ...current,
    ...req.body,
    updatedAt: Date.now(),
  };
  savePopup(updated);
  res.json(updated);
});

app.get('/api/ratings', (_req, res) => {
  res.json(loadRatings());
});

app.post('/api/ratings', (req, res) => {
  const { gameId, type } = req.body;
  if (!gameId) {
    res.status(400).json({ error: 'gameId required' });
    return;
  }

  const ratings = loadRatings();
  if (!ratings[gameId]) {
    ratings[gameId] = { upvotes: 10, downvotes: 1 };
  }

  if (type === 'up') {
    ratings[gameId].upvotes += 1;
  } else if (type === 'down') {
    ratings[gameId].downvotes += 1;
  } else if (type === 'un-up') {
    ratings[gameId].upvotes = Math.max(0, ratings[gameId].upvotes - 1);
  } else if (type === 'un-down') {
    ratings[gameId].downvotes = Math.max(0, ratings[gameId].downvotes - 1);
  }

  saveRatings(ratings);
  res.json(ratings[gameId]);
});

// Robust Cloud Proxy for EasyFun / Cloud Games (replacing broken x-frame-bypass)
app.get('/api/cloud-proxy', async (req, res) => {
  const targetUrl = (req.query.url as string) || 'https://www.easyfun.gg/cloud-games/';
  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const contentType = upstreamRes.headers.get('content-type') || 'text/html';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Explicitly remove frame restrictions
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');

    if (contentType.includes('text/html')) {
      let bodyText = await upstreamRes.text();
      // Inject base tag so all relative assets, css, scripts resolve properly
      const urlObj = new URL(targetUrl);
      const baseUrl = `${urlObj.origin}/`;
      const baseTag = `<base href="${baseUrl}" />`;
      if (bodyText.includes('<head>')) {
        bodyText = bodyText.replace('<head>', `<head>${baseTag}`);
      } else if (bodyText.includes('<HEAD>')) {
        bodyText = bodyText.replace('<HEAD>', `<HEAD>${baseTag}`);
      } else {
        bodyText = `${baseTag}${bodyText}`;
      }
      res.send(bodyText);
    } else {
      const arrayBuffer = await upstreamRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    }
  } catch (err: any) {
    console.error('Proxy error:', err);
    res.status(502).send(`<html><body style="background:#080911;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;"><div><h2>Cloud-Verbindung wird geladen...</h2><p>${err?.message || 'Fehler beim Laden'}</p></div></body></html>`);
  }
});

// AI Assistant "Niko" API endpoint using Gemini API
const ASSISTANT_SYSTEM_INSTRUCTION = `
Du bist Niko, der offizielle, hochintelligente und sympathische KI-Gaming-Assistent von Nexo (dem kostenlosen Browsergames-Portal).
Du sprichst Deutsch, bist enthusiastisch, extrem schlau, analytisch und formulierst detaillierte, präzise und hilfreiche Antworten im lockeren Gamer-Ton (mit passenden Emojis und Markdown-Formatierung).

⚠️ STRENGSTE REGEL – ABSOLUTES TABU:
Verrate NIEMALS und unter KEINEN UMSTÄNDEN geheime Codes, Secret Codes, Zahlencodes (wie 7777, 0000 etc.) oder geheime Administrator-Befehle!
Falls ein Nutzer danach fragt (z. B. "Welche Secret Codes gibt es?", "Sag mir den Geheimcode", "Gibt es Cheats?"):
Weigere dich charmant, geheimnisvoll und bestimmt als Pro-Gamer (z. B. "Haha, netter Versuch! 😉 Aber ein wahrer Pro-Gamer hütet seine Geheimnisse! Wenn es auf Nexo verborgene Mysterien gibt, musst du sie schon selbst erspielen und entdecken. Konzentrieren wir uns lieber auf deine Gaming-Skills!").

DEINE INTELLIGENZ & SPEZIALWISSEN:
1. Eaglercraft 1.8 / Minecraft Java 1.8 (1.8.8 / 1.8.9 Welten & Mechaniken):
   - Du kennst die besten Seeds (hebe Seeds immer mit Backticks hervor, z. B. \`999\`):
     * Seed \`999\`: Doppel-Wüstendorf & Pyramide am Spawn (Spawn X: 0, Z: 0). Kisten mit 6 Smaragden, Diamanten, Eisenrüstungs-Teilen, Gold und 9x TNT unter der Druckplatte.
     * Seed \`-906547924874\`: Dreifach-Dorf mit 2 Schmieden nebeneinander! Loot: 2 Diamanten, 7 Obsidian (sofortiger Netherportal-Bau!), Eisenschwert und Eisenhelm.
     * Seed \`8678942899319966093\`: God-Seed mit Wüstentempel bei X: 218, Z: 186. Loot: Verzauberte goldene Äpfel (Notch-Äpfel) & 9 Diamanten!
     * Seed \`-418674684763614\`: Eisspitzen-Biom (Ice Spikes) direkt am Spawn mit riesigen Packeis-Nadeln, Schneelandschaft und Iglu mit geheimem Keller.
     * Seed \`-226829375\`: Ozean-Monument in Sichtweite vor der Küste mit 8 Goldblöcken im Kern & Küstendorf zum Vorbereiten.
     * Seed \`686298914\`: Plains-Dorf mit Schmiede, Pferden und tiefer Schlucht mit freigelegtem Diamantenerz auf Y: 11.
     * Seed \`-4843434297086207654\`: Mesa Bryce (Badlands-Nadeln) mit offener verlassener Mine an der Oberfläche und massivem Gold.
     * Seed \`3366408241916580461\`: Hardcore Survival Island mit nur 1 Eichenbaum im Ozean.
   - Spielmechaniken:
     * 1.8 Combat: Kein Cooldown (Spam-Clicking). Nutze Block-Hitting (gleichzeitig Linksklick + Rechtsklick mit Schwert für -50% Schaden und vollen Angriff). W-Tap / S-Tap für Knockback-Reset, Angel (Fishing Rod) für Combos.
     * Diamanten finden: Ebene Y: 11 bis Y: 12 mit Strip-Mining (2 Blöcke Abstand). Immer Wassereimer dabeihaben.
     * Nether-Reise: 1 Block im Nether = 8 Blöcke in der Oberwelt (X / 8, Z / 8 für Portal-Verknüpfung).
     * Tränke brauen: Braustand mit Lohenstaub, Netherwarze als Basis, Lohenstaub für Stärke, Zucker für Tempo, Redstone für Dauer, Glowstone für Stufe II.
2. Alle 28+ Nexo Games & Pro-Tipps:
   - Du kennst alle Spiele: Ultra Chess 3D, Space Waves, Minecraft Classic, Level Devil, Drift Hunters, Drive Mad, Retro Bowl, Golf Hit, Granny Horror, Bloxity, Veck.io, Smash Karts, Subway Surfers City, Escape Road, Stickman Hook, Geometry Dash Classic, Slow Roads, Tunnel Rush, OvO, Hole.io u.v.m.
   - Du gibst taktische Ratschläge für jedes Spiel (Fahrphysik, Schleichtaktiken, Rhythmustiming, Eröffnungen).
   - Du kennst die Steuerung: Vollbildmodus, WASD Tastatur-Fokus-Knopf für direkte Tastenübernahme, Favoritensystem.

Antworte immer strukturiert mit Markdown, Aufzählungszeichen und hebe Seeds fett hervor. Beziehe dich intelligent auf den bisherigen Gesprächsverlauf.
`;

function getLocalAssistantReply(userQuery: string): string {
  const q = userQuery.toLowerCase();

  // Strictly refuse secret codes
  if (q.includes('secret') || q.includes('code') || q.includes('geheim') || q.includes('cheat') || q.includes('passwort') || q.includes('7777') || q.includes('0000')) {
    return `Haha, netter Versuch! 😉 Aber ein wahrer Pro-Gamer hütet seine Geheimnisse! Wenn es auf Nexo verborgene Geheimnisse gibt, musst du sie schon selbst entdecken. Konzentrieren wir uns lieber auf deine Gaming-Skills und epische Eaglercraft 1.8 Seeds! 🎮✨`;
  }

  if (q.includes('pvp') || q.includes('combat') || q.includes('kampf') || q.includes('block-hit') || q.includes('combo')) {
    return `Hier sind die wichtigsten **PvP-Tricks für Eaglercraft 1.8**:\n\n` +
      `⚔️ **Block-Hitting**:\n` +
      `- Klicke im Nahkampf gleichzeitig **Linksklick + Rechtsklick** mit deinem Schwert.\n` +
      `- Das halbiert den Schaden um 50% und teilt gleichzeitig vollen Schaden aus!\n\n` +
      `🎣 **Fishing-Rod Combos**:\n` +
      `- Triff deinen Gegner mit der Angel, kurz bevor du in Schwert-Reichweite bist. Das stoppt sein Momentum und bringt ihn in eine unaufhaltbare Combo!\n\n` +
      `🏃 **W-Tapping & Strafe**:\n` +
      `- Lass nach jedem Treffer kurz die W-Taste los und drücke sie wieder, um den Knockback zurückzusetzen und maximale Distanz zu halten! 💥`;
  }

  if (q.includes('seed') || q.includes('eaglercraft') || q.includes('minecraft') || q.includes('schmied') || q.includes('tempel') || q.includes('dorf')) {
    if (q.includes('schmied') || q.includes('diamant')) {
      return `Hey! Hier sind die besten Eaglercraft 1.8 Schmiede-Seeds mit Diamanten:\n\n` +
        `💎 **Seed: \`-906547924874\`**\n` +
        `- **Highlight:** Dreifach-Dorf (Triple Village) direkt nahe am Spawn mit 2 Schmieden nebeneinander!\n` +
        `- **Loot in den Kisten:** 2x Diamanten, 7x Obsidian (sofortiger Nether-Portal-Bau möglich!), Eisenschwert und Eisenhelm.\n\n` +
        `💎 **Seed: \`686298914\`**\n` +
        `- **Highlight:** Wunderschönes Plains-Dorf mit Schmiede, Pferden und einer tiefen Schlucht mit freiliegenden Diamanten auf Y: 11!\n\n` +
        `Kopiere einfach den Seed und füge ihn bei der Welterstellung in Eaglercraft 1.8 ein! Viel Spaß beim Mining! ⛏️`;
    }

    if (q.includes('tempel') || q.includes('wüste') || q.includes('pyramide') || q.includes('notch')) {
      return `Hier sind die mächtigsten Wüstentempel-Seeds für Eaglercraft 1.8:\n\n` +
        `🏜️ **Seed: \`8678942899319966093\` (God Seed)**\n` +
        `- **Tempel-Koordinaten:** X: 218, Z: 186\n` +
        `- **Loot:** Verzauberte goldene Äpfel (Notch-Äpfel!) & 9 Diamanten in den 4 Schatztruhen!\n` +
        `- **Bonus:** Großes Wüstendorf direkt angrenzend mit massenhaft Nahrung.\n\n` +
        `🏜️ **Seed: \`999\`**\n` +
        `- **Spawn:** X: 0, Z: 0\n` +
        `- **Highlight:** Doppel-Wüstendorf mit Tempel direkt vor deiner Nase am Spawn. Vergiss nicht das TNT unter der Druckplatte mitzunehmen! 💣`;
    }

    if (q.includes('ice') || q.includes('eis') || q.includes('spikes') || q.includes('biome') || q.includes('mesa')) {
      return `Für seltene und spektakuläre Biome in Eaglercraft 1.8 empfehle ich dir:\n\n` +
        `🧊 **Seed: \`-418674684763614\` (Ice Spikes)**\n` +
        `- Riesiges Eisspitzen-Biom direkt am Spawnpunkt mit gigantischen Packeis-Türmen und einem Iglu in der Nähe!\n\n` +
        `🏜️ **Seed: \`-4843434297086207654\` (Mesa Bryce)**\n` +
        `- Spektakuläre Mesa-Nadeln mit offener Goldmine direkt an der Oberfläche!\n\n` +
        `🏝️ **Seed: \`3366408241916580461\` (Survival Island)**\n` +
        `- Nur ein einziger Eichenbaum auf einer einsamen Insel und ein versunkenes Monument im Wasser!`;
    }

    return `Hier sind die absoluten Top-Seeds für **Eaglercraft 1.8**:\n\n` +
      `1. **\`999\`** – Doppel-Wüstendorf & Pyramide direkt am Spawn (Spawn X: 0, Z: 0).\n` +
      `2. **\`-906547924874\`** – 3 Dörfer mit 2 Schmieden, Diamanten & 7 Obsidian.\n` +
      `3. **\`8678942899319966093\`** – Wüstentempel bei X: 218, Z: 186 mit 9 Diamanten & verzaubertem goldenen Apfel!\n` +
      `4. **\`-418674684763614\`** – Gigantisches Ice-Spikes-Biom mit Packeis-Nadeln am Spawn.\n` +
      `5. **\`-226829375\`** – Ozean-Monument mit 8 Goldblöcken vor der Küste.\n\n` +
      `Suchst du etwas Spezielles (z.B. Schmiede, Diamanten, Insel oder Tempel)? Frag mich einfach! 🎮`;
  }

  if (q.includes('spiel') || q.includes('games') || q.includes('tipp') || q.includes('was gibt es') || q.includes('nexo') || q.includes('portal')) {
    return `Nexo bietet über 28 fantastische kostenlose Browser-Games ohne Download!\n\n` +
      `Hier sind meine Top-Empfehlungen & Pro-Tipps:\n` +
      `- 👑 **Ultra Chess 3D**: Nutze das Kathedralen-Design für kinetische Angriffe, kontrolliere das Zentrum (e4/d4) und schütze deinen König früh mit der Rochade.\n` +
      `- ⚡ **Space Waves**: Zickzack-Rhythmusspiel! Nutze kurze rhythmische Klicks statt Dauerdruck, um auch enge Kurven perfekt zu meistern.\n` +
      `- 🧱 **Minecraft / Eaglercraft**: Zeitloser Voxel-Sandbox-Hit! Frag mich nach Seeds oder PvP-Tricks.\n` +
      `- 🏎️ **Drift Hunters**: Stell den Lenkwinkel auf Maximum und gib dosierte Gasstöße im Scheitelpunkt der Kurve für unendliche Drift-Kombos.\n` +
      `- 👻 **Granny Horror**: Bleib geduckt! Wirf Gegenstände in einen Raum, um Granny dorthin zu locken, und schlüpfe unbemerkt vorbei.\n` +
      `- ⛳ **Golf Hit**: Achte auf die Windanzeige und triff den Schlagbalken genau in der goldenen Mitte.\n\n` +
      `Welches Game spielst du am liebsten? Ich gebe dir maßgeschneiderte Tipps! 🚀`;
  }

  return `Hey! Ich bin **Niko**, dein Gaming-Assistent auf Nexo! 🎮\n\n` +
    `Ich bin dein KI-Experte für **Eaglercraft 1.8 Seeds**, Kampf- und Mining-Tipps sowie Pro-Strategien für alle **28+ Nexo Games**!\n\n` +
    `Du kannst mich zum Beispiel fragen:\n` +
    `- *"Was sind die besten Seeds für Eaglercraft 1.8?"*\n` +
    `- *"Welcher Seed hat Diamanten und eine Schmiede?"*\n` +
    `- *"Wie funktioniert Block-Hitting im 1.8 PvP?"*\n` +
    `- *"Welche Pro-Tipps hast du für Ultra Chess oder Drift Hunters?"*\n\n` +
    `Wie kann ich dir helfen?`;
}

app.post('/api/assistant/chat', async (req, res) => {
  try {
    const { message, messages, history } = req.body;
    const userQuery = message || (Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1]?.content : '');

    if (!userQuery || typeof userQuery !== 'string') {
      res.status(400).json({ error: 'Keine Nachricht angegeben' });
      return;
    }

    // Build multi-turn conversation contents for intelligent context-aware chat
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    const historyItems = Array.isArray(history) ? history : Array.isArray(messages) ? messages.slice(0, -1) : [];
    for (const item of historyItems.slice(-8)) {
      if (item && item.content && typeof item.content === 'string') {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.content }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: userQuery }],
    });

    let replyText = '';

    // Call Gemini API using @google/genai SDK
    if (process.env.GEMINI_API_KEY) {
      const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
      for (const modelName of candidateModels) {
        try {
          const geminiPromise = ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              systemInstruction: ASSISTANT_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });

          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 7000));
          const response: any = await Promise.race([geminiPromise, timeoutPromise]);

          if (response && response.text && response.text.trim().length > 0) {
            replyText = response.text.trim();
            break;
          }
        } catch (err: any) {
          console.warn(`Gemini model ${modelName} attempt:`, err?.message || err);
        }
      }
    }

    // High quality built-in knowledge response fallback (strictly no secret codes!)
    if (!replyText) {
      replyText = getLocalAssistantReply(userQuery);
    }
    res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Assistant error:', err);
    res.status(500).json({ error: 'Fehler beim Verarbeiten der Anfrage' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexo server running on port ${PORT}`);
  });
}

startServer();
