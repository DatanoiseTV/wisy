// fontlib.js — curated Google Fonts library for a graphical font browser.
// Zero-dependency browser ES module. All families are real Google Fonts.

/**
 * @typedef {Object} FontEntry
 * @property {string} family   Exact Google Fonts family name.
 * @property {'sans'|'serif'|'mono'|'display'|'handwriting'} category
 * @property {number[]} weights Available weights to request.
 * @property {boolean} popular  Whether this is one of the most-used fonts.
 */

/** @type {FontEntry[]} */
export const FONT_LIBRARY = [
  // ---------- SANS ----------
  { family: 'Inter', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Inter Tight', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Roboto', category: 'sans', weights: [300, 400, 500, 700, 900], popular: true },
  { family: 'Open Sans', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Lato', category: 'sans', weights: [300, 400, 700, 900], popular: true },
  { family: 'Montserrat', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Poppins', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Nunito', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Nunito Sans', category: 'sans', weights: [300, 400, 600, 700, 800], popular: false },
  { family: 'Work Sans', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'DM Sans', category: 'sans', weights: [400, 500, 600, 700], popular: true },
  { family: 'Manrope', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Plus Jakarta Sans', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Sora', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Outfit', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Figtree', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Space Grotesk', category: 'sans', weights: [300, 400, 500, 600, 700], popular: true },
  { family: 'Archivo', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'IBM Plex Sans', category: 'sans', weights: [300, 400, 500, 600, 700], popular: true },
  { family: 'Source Sans 3', category: 'sans', weights: [300, 400, 500, 600, 700], popular: true },
  { family: 'Rubik', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Karla', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Mulish', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Albert Sans', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Hanken Grotesk', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Onest', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Schibsted Grotesk', category: 'sans', weights: [400, 500, 600, 700, 800], popular: false },
  { family: 'Geist', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Be Vietnam Pro', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Red Hat Display', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Lexend', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Epilogue', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Urbanist', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Public Sans', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Jost', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Cabin', category: 'sans', weights: [400, 500, 600, 700], popular: false },
  { family: 'Raleway', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'PT Sans', category: 'sans', weights: [400, 700], popular: false },
  { family: 'Mukta', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Heebo', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Kanit', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Quicksand', category: 'sans', weights: [400, 500, 600, 700], popular: false },
  { family: 'Barlow', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Fira Sans', category: 'sans', weights: [300, 400, 500, 600, 700, 800], popular: false },

  // ---------- SERIF ----------
  { family: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900], popular: true },
  { family: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900], popular: true },
  { family: 'Lora', category: 'serif', weights: [400, 500, 600, 700], popular: true },
  { family: 'Fraunces', category: 'serif', weights: [300, 400, 500, 600, 700, 900], popular: true },
  { family: 'Source Serif 4', category: 'serif', weights: [300, 400, 500, 600, 700], popular: false },
  { family: 'PT Serif', category: 'serif', weights: [400, 700], popular: false },
  { family: 'Bitter', category: 'serif', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Cormorant', category: 'serif', weights: [300, 400, 500, 600, 700], popular: false },
  { family: 'Cormorant Garamond', category: 'serif', weights: [300, 400, 500, 600, 700], popular: false },
  { family: 'EB Garamond', category: 'serif', weights: [400, 500, 600, 700, 800], popular: true },
  { family: 'Libre Baskerville', category: 'serif', weights: [400, 700], popular: false },
  { family: 'Crimson Pro', category: 'serif', weights: [300, 400, 500, 600, 700], popular: false },
  { family: 'Crimson Text', category: 'serif', weights: [400, 600, 700], popular: false },
  { family: 'Spectral', category: 'serif', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Newsreader', category: 'serif', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Instrument Serif', category: 'serif', weights: [400], popular: false },
  { family: 'Bodoni Moda', category: 'serif', weights: [400, 500, 600, 700, 800, 900], popular: false },
  { family: 'DM Serif Display', category: 'serif', weights: [400], popular: false },
  { family: 'DM Serif Text', category: 'serif', weights: [400], popular: false },
  { family: 'Petrona', category: 'serif', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Gelasio', category: 'serif', weights: [400, 500, 600, 700], popular: false },
  { family: 'Zilla Slab', category: 'serif', weights: [300, 400, 500, 600, 700], popular: false },
  { family: 'Noto Serif', category: 'serif', weights: [400, 500, 600, 700], popular: false },
  { family: 'Cardo', category: 'serif', weights: [400, 700], popular: false },
  { family: 'Frank Ruhl Libre', category: 'serif', weights: [300, 400, 500, 700, 900], popular: false },
  { family: 'Roboto Slab', category: 'serif', weights: [300, 400, 500, 600, 700, 800], popular: true },

  // ---------- MONO ----------
  { family: 'JetBrains Mono', category: 'mono', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { family: 'Fira Code', category: 'mono', weights: [300, 400, 500, 600, 700], popular: true },
  { family: 'IBM Plex Mono', category: 'mono', weights: [300, 400, 500, 600, 700], popular: false },
  { family: 'Space Mono', category: 'mono', weights: [400, 700], popular: false },
  { family: 'Source Code Pro', category: 'mono', weights: [300, 400, 500, 600, 700], popular: true },
  { family: 'Roboto Mono', category: 'mono', weights: [300, 400, 500, 600, 700], popular: true },
  { family: 'Geist Mono', category: 'mono', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Inconsolata', category: 'mono', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Martian Mono', category: 'mono', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'DM Mono', category: 'mono', weights: [400, 500], popular: false },
  { family: 'Red Hat Mono', category: 'mono', weights: [400, 500, 600, 700], popular: false },
  { family: 'Ubuntu Mono', category: 'mono', weights: [400, 700], popular: false },

  // ---------- DISPLAY ----------
  { family: 'Bebas Neue', category: 'display', weights: [400], popular: true },
  { family: 'Anton', category: 'display', weights: [400], popular: true },
  { family: 'Oswald', category: 'display', weights: [300, 400, 500, 600, 700], popular: true },
  { family: 'Righteous', category: 'display', weights: [400], popular: false },
  { family: 'Abril Fatface', category: 'display', weights: [400], popular: false },
  { family: 'Bricolage Grotesque', category: 'display', weights: [400, 500, 600, 700, 800], popular: false },
  { family: 'Unbounded', category: 'display', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Syne', category: 'display', weights: [400, 500, 600, 700, 800], popular: false },
  { family: 'Big Shoulders Display', category: 'display', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Chakra Petch', category: 'display', weights: [300, 400, 500, 600, 700], popular: false },
  { family: 'Orbitron', category: 'display', weights: [400, 500, 600, 700, 800], popular: false },
  { family: 'Audiowide', category: 'display', weights: [400], popular: false },
  { family: 'Monoton', category: 'display', weights: [400], popular: false },
  { family: 'Bungee', category: 'display', weights: [400], popular: false },
  { family: 'Staatliches', category: 'display', weights: [400], popular: false },
  { family: 'Teko', category: 'display', weights: [300, 400, 500, 600, 700], popular: false },
  { family: 'Saira Condensed', category: 'display', weights: [300, 400, 500, 600, 700, 800], popular: false },
  { family: 'Archivo Black', category: 'display', weights: [400], popular: false },

  // ---------- HANDWRITING ----------
  { family: 'Caveat', category: 'handwriting', weights: [400, 500, 600, 700], popular: true },
  { family: 'Pacifico', category: 'handwriting', weights: [400], popular: true },
  { family: 'Dancing Script', category: 'handwriting', weights: [400, 500, 600, 700], popular: true },
  { family: 'Shadows Into Light', category: 'handwriting', weights: [400], popular: false },
  { family: 'Permanent Marker', category: 'handwriting', weights: [400], popular: false },
  { family: 'Satisfy', category: 'handwriting', weights: [400], popular: false },
  { family: 'Kalam', category: 'handwriting', weights: [300, 400, 700], popular: false },
  { family: 'Gloria Hallelujah', category: 'handwriting', weights: [400], popular: false },
  { family: 'Indie Flower', category: 'handwriting', weights: [400], popular: false },
  { family: 'Sacramento', category: 'handwriting', weights: [400], popular: false },
];

/**
 * @typedef {Object} FontPairing
 * @property {string} display Family used for headings (in FONT_LIBRARY).
 * @property {string} body    Family used for body text (in FONT_LIBRARY).
 * @property {string} tag     Short descriptor of the pairing's mood/use.
 */

/** @type {FontPairing[]} */
export const FONT_PAIRINGS = [
  { display: 'Fraunces', body: 'Inter', tag: 'Editorial' },
  { display: 'Space Grotesk', body: 'Inter', tag: 'Tech' },
  { display: 'Playfair Display', body: 'Lato', tag: 'Elegant' },
  { display: 'Playfair Display', body: 'Source Sans 3', tag: 'Classic' },
  { display: 'Montserrat', body: 'Merriweather', tag: 'Magazine' },
  { display: 'Oswald', body: 'Lora', tag: 'Bold News' },
  { display: 'DM Serif Display', body: 'DM Sans', tag: 'Refined' },
  { display: 'Bebas Neue', body: 'Work Sans', tag: 'Poster' },
  { display: 'Anton', body: 'Roboto', tag: 'Impact' },
  { display: 'Bricolage Grotesque', body: 'Manrope', tag: 'Modern' },
  { display: 'Syne', body: 'Inter', tag: 'Creative' },
  { display: 'Cormorant Garamond', body: 'Public Sans', tag: 'Luxury' },
  { display: 'Abril Fatface', body: 'Poppins', tag: 'Fashion' },
  { display: 'Sora', body: 'IBM Plex Sans', tag: 'Product' },
  { display: 'Archivo Black', body: 'Archivo', tag: 'Brutalist' },
  { display: 'Lora', body: 'Open Sans', tag: 'Readable' },
  { display: 'Unbounded', body: 'Hanken Grotesk', tag: 'Playful' },
  { display: 'Orbitron', body: 'Rubik', tag: 'Futuristic' },
  { display: 'Caveat', body: 'Nunito', tag: 'Friendly' },
  { display: 'EB Garamond', body: 'Mulish', tag: 'Scholarly' },
  { display: 'Instrument Serif', body: 'Geist', tag: 'Minimal' },
  { display: 'Bodoni Moda', body: 'Karla', tag: 'High Fashion' },
  { display: 'Chakra Petch', body: 'JetBrains Mono', tag: 'Cyber' },
  { display: 'Teko', body: 'Figtree', tag: 'Athletic' },
];

/** @type {Array<'sans'|'serif'|'mono'|'display'|'handwriting'>} */
export const FONT_CATEGORIES = ['sans', 'serif', 'mono', 'display', 'handwriting'];

const CATEGORY_FALLBACK = {
  sans: 'sans-serif',
  serif: 'serif',
  mono: 'monospace',
  display: 'sans-serif',
  handwriting: 'cursive',
};

const DEFAULT_WEIGHTS = [400, 500, 600, 700];

const FAMILY_INDEX = new Map(FONT_LIBRARY.map((f) => [f.family, f]));

/**
 * Filter the library by family substring (case-insensitive) and optional
 * category. Results are ordered popular-first, then alphabetically.
 *
 * @param {string} [query]
 * @param {string} [category]
 * @returns {FontEntry[]}
 */
export function searchFonts(query, category) {
  const q = (query || '').trim().toLowerCase();
  const cat = category && FONT_CATEGORIES.includes(category) ? category : null;

  const matches = FONT_LIBRARY.filter((font) => {
    if (cat && font.category !== cat) return false;
    if (q && !font.family.toLowerCase().includes(q)) return false;
    return true;
  });

  return matches.sort((a, b) => {
    if (a.popular !== b.popular) return a.popular ? -1 : 1;
    return a.family.localeCompare(b.family);
  });
}

/**
 * Build a CSS font-family stack: the requested family quoted, followed by a
 * sensible generic fallback derived from its category.
 *
 * @param {string} family
 * @returns {string}
 */
export function fontStack(family) {
  const entry = FAMILY_INDEX.get(family);
  const fallback = entry ? CATEGORY_FALLBACK[entry.category] : 'sans-serif';
  return `'${family}', ${fallback}`;
}

/**
 * Construct a single Google Fonts CSS2 URL for the given families, looking up
 * each family's weights from the library (defaulting to 400;500;600;700).
 * Duplicate families are removed; spaces in family names become '+'.
 *
 * @param {string[]} families
 * @returns {string}
 */
export function googleFontsHref(families) {
  const list = Array.isArray(families) ? families : [families];
  const seen = new Set();
  const params = [];

  for (const family of list) {
    if (typeof family !== 'string') continue;
    const name = family.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);

    const entry = FAMILY_INDEX.get(name);
    const weights = entry && entry.weights.length ? entry.weights : DEFAULT_WEIGHTS;
    const sortedWeights = [...weights].sort((a, b) => a - b);
    const encodedName = name.replace(/ /g, '+');
    params.push(`family=${encodedName}:wght@${sortedWeights.join(';')}`);
  }

  return `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`;
}
