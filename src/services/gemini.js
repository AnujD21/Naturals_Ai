const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Track live vs offline status for UI indicator
let _apiStatus = null; // null = untested, true = live, false = offline
export function getApiStatus() { return _apiStatus; }

/* ── Fallback responses for demo mode ─────────────────────── */
const FALLBACK_QA = [
  {
    keywords: ['toner', 'brassy', 'brass', 'yellow', 'orange'],
    answer: "For brassy highlights, use a **violet-based toner** (e.g. Wella T18 or Redken Shades EQ 09V). Apply on damp hair for 5–20 min depending on depth needed. For very orange tones, a blue-based toner works better — try Wella T14 or a 6B shade.",
  },
  {
    keywords: ['uneven', 'patchy', 'blotchy', 'correction', 'fix color'],
    answer: "Uneven color is usually caused by uneven porosity or missed sections. First do a strand test to identify the darkest and lightest zones. Fill the light areas with a warm filler shade (e.g. Level 6 Gold) before re-applying your target color for an even result.",
  },
  {
    keywords: ['olaplex', 'k18', 'bond', 'treatment', 'repair', 'damage'],
    answer: "**Olaplex** rebuilds disulfide bonds during the color process (add No.1 to color mix, No.2 post-rinse). **K18** works differently — it repairs keratin chains and is applied post-shampoo with no rinse. For severe damage use K18; for ongoing color protection, Olaplex in-service is the gold standard.",
  },
  {
    keywords: ['balayage', 'freehand', 'highlight', 'foil'],
    answer: "Balayage is a freehand painting technique — use a sweeping motion from mid-length to ends with minimal root saturation for a natural grow-out. For higher lift or more precise placement, foils give more control and heat. Combine both (babylights in foil + balayage) for a lived-in blonde look.",
  },
  {
    keywords: ['porosity', 'porous', 'absorb', 'moisture'],
    answer: "High porosity hair absorbs color quickly but fades fast — use a lower volume developer (10–20Vol) and add a filler. Low porosity hair resists penetration — use a slightly higher developer and heat. Always do a porosity test by dropping a strand in water: sinks fast = high porosity, floats = low porosity.",
  },
  {
    keywords: ['bleach', 'lift', 'lighten', 'blonde', 'platinum'],
    answer: "For safe bleaching: use a bond protector (Olaplex No.1 or FIBREPLEX), start with 20Vol on virgin hair and go to 30Vol only if needed. Process no longer than 50 min and check every 10 min. Never overlap bleach on previously lightened hair — apply to roots only on touch-ups to avoid breakage.",
  },
  {
    keywords: ['developer', 'volume', '10vol', '20vol', '30vol', '40vol'],
    answer: "**10Vol** — deposits only, gentle, for toning. **20Vol** — 1–2 levels of lift, standard for most color. **30Vol** — 2–3 levels of lift, use with care on fine or damaged hair. **40Vol** — maximum lift, use only on resistant grey or very dark hair with a strong formula. Never use 40Vol on bleach.",
  },
  {
    keywords: ['grey', 'gray', 'resistant', 'white hair', 'coverage'],
    answer: "Grey coverage needs a formula with at least 50% natural base shade. Mix a neutral + warm tone (e.g. 6N + 6G) for resistant greys. Use 20Vol developer and leave for the full 35–45 min. For blending rather than covering, try a demi-permanent gloss — less harsh and gives a translucent result.",
  },
  {
    keywords: ['scalp', 'sensitive', 'irritation', 'allergy', 'ppd'],
    answer: "For sensitive scalps, use PPD-free color (e.g. Wella Koleston Perfect ME+, L'Oréal iNOA). Always perform a patch test 48h before service. Apply a barrier cream along the hairline. Avoid 40Vol developer. If redness appears during processing, remove color immediately and rinse with cool water.",
  },
  {
    keywords: ['formula', 'recipe', 'mix', 'ratio'],
    answer: "Standard color formula ratio is **1:1** (colorant : developer) for cream colors. Lighteners typically use **1:2**. For a gloss or toner, 1:2 with 10Vol. Always weigh on a scale for accuracy — 60g colorant + 60g developer is a typical single-application amount for medium-length hair.",
  },
];

function getFallbackResponse(question) {
  const q = question.toLowerCase();
  for (const item of FALLBACK_QA) {
    if (item.keywords.some(kw => q.includes(kw))) {
      return item.answer;
    }
  }
  return "Great question! As a general rule: always do a strand test before applying a new formula, use a bond protector when lifting, and match your developer volume to the lift level needed — 20Vol for 1–2 levels, 30Vol for 2–3 levels. Want me to go deeper on any specific topic?";
}

/**
 * Send a question to Gemini with full conversation history for multi-turn chat.
 * @param {string} question - The latest user message
 * @param {Array}  history  - Prior chat messages [{ role: 'user'|'ai', text }]
 */
export async function askGemini(question, history = []) {
    try {
        // Build multi-turn contents array — Gemini requires alternating user/model roles
        const systemSeed = [
          { role: 'user',  parts: [{ text: 'You are Naturals AI, an expert salon assistant for an Indian hair salon chain. Give concise, professional advice on hair coloring, treatments, and styling. Keep responses under 4 sentences unless a detailed explanation is clearly needed. Use plain text — no markdown asterisks or symbols.' }] },
          { role: 'model', parts: [{ text: 'Understood. I am Naturals AI, ready to provide expert salon advice.' }] },
        ];

        const historyContents = history.map(m => ({
          role:  m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

        const contents = [
          ...systemSeed,
          ...historyContents,
          { role: 'user', parts: [{ text: question }] },
        ];

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents }),
            }
        );
        const data = await response.json();
        if (data.error) { _apiStatus = false; return getFallbackResponse(question); }
        _apiStatus = true;
        return data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(question);
    } catch {
        _apiStatus = false;
        return getFallbackResponse(question);
    }
}

/**
 * Analyze a hair image using Gemini Vision.
 * @param {string} base64Image - Base64-encoded image data (without the data:image prefix)
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png'
 * @param {object} clientContext - optional client preferences/history for personalized analysis
 * @returns {object} Parsed analysis results
 */
export async function analyzeHairImage(base64Image, mimeType, clientContext = null) {
    try {
        let contextPrompt = '';
        if (clientContext) {
            contextPrompt = `\n\nClient context:
- Name: ${clientContext.name || 'Unknown'}
- Previous color history: ${clientContext.colorHistory?.join(', ') || 'None'}
- Known allergies: ${clientContext.allergies || 'Not recorded'}
- Notes: ${clientContext.notes || 'None'}
Consider this history when making recommendations.`;
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: `You are SalonPilot AI, a professional hair analysis system. Analyze this hair image and provide a structured assessment.${contextPrompt}

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "confidence": <number 0-100>,
  "hairType": "<hair type classification e.g. Type 2B — Wavy>",
  "porosity": "<Low/Medium/High>",
  "damageLevel": "<None/Mild/Moderate/Severe>",
  "damageDetail": "<brief description of damage observed>",
  "recommendations": [
    { "name": "<product or service name>", "type": "<category>", "priority": "<High/Medium/Low>" }
  ],
  "colorSuggestion": "<suggested color or treatment based on current state>"
}`
                            },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Image
                                }
                            }
                        ]
                    }]
                })
            }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Parse JSON from response — handle potential markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            _apiStatus = true;
            return { success: true, data: JSON.parse(jsonMatch[0]) };
        }

        _apiStatus = false;
        return { success: false, error: 'Could not parse AI response', raw: text };
    } catch (err) {
        _apiStatus = false;
        return { success: false, error: err.message || 'API Connection Error' };
    }
}