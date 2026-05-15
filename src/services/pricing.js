/**
 * Naturals Salon — Service Pricing (INR)
 * Used to calculate revenue when a stylist completes a service.
 */

export const PRICE_LIST = [
  // ── Color Services ────────────────────────────────────────
  { service: 'Balayage & Gloss',        price: 3500, category: 'Color'     },
  { service: 'Balayage & Color',        price: 3200, category: 'Color'     },
  { service: 'Full Balayage',           price: 4000, category: 'Color'     },
  { service: 'Full Color',              price: 1500, category: 'Color'     },
  { service: 'Root Retouch',            price: 850,  category: 'Color'     },
  { service: 'Root Touch-Up',           price: 850,  category: 'Color'     },
  { service: 'Highlights (Full)',        price: 2800, category: 'Color'     },
  { service: 'Highlights (Partial)',     price: 1600, category: 'Color'     },
  { service: 'Color Correction',        price: 4500, category: 'Color'     },
  { service: 'Gloss Treatment',         price: 650,  category: 'Color'     },
  { service: 'Toner Application',       price: 500,  category: 'Color'     },
  { service: 'Ombre / Sombre',          price: 3000, category: 'Color'     },
  { service: 'Fashion Color',           price: 2500, category: 'Color'     },

  // ── Bleach Services ───────────────────────────────────────
  { service: 'Full Bleach',             price: 2800, category: 'Bleach'    },
  { service: 'Bleach & Tone',           price: 3500, category: 'Bleach'    },
  { service: 'Bleach Touch-Up',         price: 1600, category: 'Bleach'    },
  { service: 'Platinum Bleach',         price: 4000, category: 'Bleach'    },
  { service: 'Strand Bleach',           price: 2000, category: 'Bleach'    },

  // ── Hair Treatments ───────────────────────────────────────
  { service: 'Hair Spa Treatment',      price: 1200, category: 'Treatment' },
  { service: 'Hair Spa',                price: 1200, category: 'Treatment' },
  { service: 'Keratin Treatment',       price: 3800, category: 'Treatment' },
  { service: 'Olaplex Treatment',       price: 2200, category: 'Treatment' },
  { service: 'Protein Treatment',       price: 1600, category: 'Treatment' },
  { service: 'Deep Conditioning',       price: 900,  category: 'Treatment' },
  { service: 'Scalp Treatment',         price: 1100, category: 'Treatment' },
  { service: 'Bond Repair Treatment',   price: 2500, category: 'Treatment' },
  { service: 'Hydration Mask',          price: 800,  category: 'Treatment' },

  // ── Cuts & Styling ────────────────────────────────────────
  { service: "Women's Cut",             price: 650,  category: 'Cut'       },
  { service: "Men's Cut",               price: 450,  category: 'Cut'       },
  { service: 'Blow Dry',                price: 550,  category: 'Style'     },
  { service: 'Blow Dry & Style',        price: 750,  category: 'Style'     },
  { service: 'Full Cut + Blow Dry',     price: 1100, category: 'Cut'       },
  { service: 'Hair Straightening',      price: 2200, category: 'Style'     },
  { service: 'Curling / Wave',          price: 1100, category: 'Style'     },
  { service: 'Bridal Hair',             price: 3500, category: 'Style'     },
  { service: 'Updo / Occasion Style',   price: 1800, category: 'Style'     },

  // ── Extensions ────────────────────────────────────────────
  { service: 'Extensions Install',      price: 5500, category: 'Extensions'},
  { service: 'Extensions Removal',      price: 1200, category: 'Extensions'},
  { service: 'Extensions Maintenance',  price: 2200, category: 'Extensions'},
  { service: 'Tape-In Extensions',      price: 5000, category: 'Extensions'},
  { service: 'Clip-In Extensions',      price: 3000, category: 'Extensions'},

  // ── AI & Consultations ────────────────────────────────────
  { service: 'AI Consultation',         price: 250,  category: 'AI'        },
  { service: 'Style Preview (AI)',       price: 250,  category: 'AI'        },
  { service: 'AI Analysis',             price: 200,  category: 'AI'        },
  { service: 'Hair Consultation',       price: 350,  category: 'Consult'   },
];

/** Category fallback prices when no exact match found */
const CATEGORY_FALLBACK = {
  Color:      1800,
  Bleach:     2800,
  Treatment:  1200,
  Cut:         650,
  Style:       700,
  Extensions: 3000,
  AI:          250,
  Consult:     350,
  Other:       900,
};

/**
 * Look up the price for a service name using keyword matching.
 * @param {string} serviceName  - e.g. "Balayage & Color", "Hair Spa Treatment"
 * @param {string} [category]   - optional category hint: "Color" | "Bleach" | "Treatment" | ...
 * @returns {number} price in INR
 */
export function getServicePrice(serviceName = '', category = '') {
  const name = serviceName.toLowerCase();

  // 1. Try exact match first
  const exact = PRICE_LIST.find(p => p.service.toLowerCase() === name);
  if (exact) return exact.price;

  // 2. Try keyword inclusion match (longest match wins)
  const matches = PRICE_LIST
    .filter(p => name.includes(p.service.toLowerCase()) || p.service.toLowerCase().split(' ').some(w => w.length > 3 && name.includes(w)))
    .sort((a, b) => b.service.length - a.service.length);

  if (matches.length) return matches[0].price;

  // 3. Keyword shortcuts for common patterns
  if (name.includes('balayage'))                  return 3500;
  if (name.includes('bleach'))                    return 2800;
  if (name.includes('keratin'))                   return 3800;
  if (name.includes('olaplex'))                   return 2200;
  if (name.includes('extension'))                 return 5000;
  if (name.includes('root') && name.includes('retouch')) return 850;
  if (name.includes('color') || name.includes('colour')) return 1500;
  if (name.includes('highlight'))                 return 2000;
  if (name.includes('correction'))                return 4500;
  if (name.includes('spa'))                       return 1200;
  if (name.includes('treatment'))                 return 1200;
  if (name.includes('cut'))                       return 650;
  if (name.includes('blow dry'))                  return 550;
  if (name.includes('consultation') || name.includes('ai')) return 250;
  if (name.includes('gloss') || name.includes('toner'))     return 600;

  // 4. Category fallback
  if (category && CATEGORY_FALLBACK[category]) return CATEGORY_FALLBACK[category];

  return CATEGORY_FALLBACK.Other;
}

/** Format INR price with comma separators */
export function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}
