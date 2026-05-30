// embeds.js — zero-dependency browser ES module.
// Convert a pasted URL into a privacy-friendly, responsive embed for the
// Wisy web-design tool's "Embed" component.
//
// Exports:
//   parseEmbed(url, opts)  -> { ok, provider, html, aspect }
//   providerOf(url)        -> provider id | 'generic' | 'invalid'
//   EMBED_PROVIDERS        -> [{ id, label, example }]
//   EMBED_RUNTIME          -> string (inlineable consent-loader)
//
// Security model:
//   - Only https URLs are ever turned into iframes.
//   - All values interpolated into markup are escaped.
//   - No eval, no tracking pixels, no third-party script injection beyond
//     the platform-blessed embed widgets (twitter/instagram/tiktok), which
//     the caller opts into and which only run when the page is rendered.

// ---------------------------------------------------------------------------
// Escaping helpers
// ---------------------------------------------------------------------------

/** Escape a string for use inside an HTML attribute value (double-quoted). */
function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escape a string for use in HTML text content. */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Base64-encode a UTF-8 string in both browser and Node. */
function b64encode(str) {
  const bytes = utf8Bytes(str);
  if (typeof btoa === 'function') {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  // Node fallback
  return Buffer.from(bytes).toString('base64');
}

function utf8Bytes(str) {
  if (typeof TextEncoder === 'function') return new TextEncoder().encode(str);
  // Node fallback
  return Uint8Array.from(Buffer.from(str, 'utf-8'));
}

// ---------------------------------------------------------------------------
// URL parsing
// ---------------------------------------------------------------------------

/** Parse a URL, return a URL object or null. Only http/https accepted. */
function safeUrl(raw) {
  if (typeof raw !== 'string') return null;
  let s = raw.trim();
  if (!s) return null;
  // Add a scheme if the user pasted a bare host (e.g. "vimeo.com/123").
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return null; // some non-web scheme
    s = 'https://' + s;
  }
  let u;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  return u;
}

/** Lowercased host without a leading "www." */
function host(u) {
  return u.hostname.replace(/^www\./i, '').toLowerCase();
}

/** True if host equals base or is a subdomain of it. */
function hostIs(h, base) {
  return h === base || h.endsWith('.' + base);
}

/** Split pathname into non-empty segments. */
function segs(u) {
  return u.pathname.split('/').filter(Boolean);
}

// ---------------------------------------------------------------------------
// iframe + wrapper builders
// ---------------------------------------------------------------------------

const DEFAULT_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

/**
 * Build a responsive iframe wrapped in .wisy-embed.
 * @param {object} o
 * @param {string} o.src           iframe src (must be https for non-relative)
 * @param {string} [o.aspect]      e.g. "16/9", "1/1", "4/3"
 * @param {string} [o.allow]
 * @param {boolean} [o.allowfullscreen]
 * @param {boolean} [o.privacy]
 * @param {string} [o.title]
 * @param {string} [o.extra]       extra attrs already escaped
 */
function iframeEmbed(o) {
  const aspect = o.aspect || '16/9';
  const allow = o.allow != null ? o.allow : DEFAULT_ALLOW;
  const attrs = [];
  attrs.push(`src="${escAttr(o.src)}"`);
  if (o.title) attrs.push(`title="${escAttr(o.title)}"`);
  attrs.push(`style="position:absolute;inset:0;width:100%;height:100%;border:0"`);
  if (allow) attrs.push(`allow="${escAttr(allow)}"`);
  if (o.allowfullscreen !== false) attrs.push('allowfullscreen');
  if (o.privacy !== false) {
    attrs.push('loading="lazy"');
    attrs.push('referrerpolicy="strict-origin-when-cross-origin"');
  }
  if (o.extra) attrs.push(o.extra);
  const iframe = `<iframe ${attrs.join(' ')}></iframe>`;
  return wrap(iframe, aspect);
}

/** Wrap arbitrary inner markup in the responsive .wisy-embed container. */
function wrap(inner, aspect) {
  return (
    `<div class="wisy-embed" style="position:relative;aspect-ratio:${escAttr(
      aspect
    )}">` +
    inner +
    `</div>`
  );
}

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------

/** Ordered detector list. Each returns provider id when it matches the host. */
function detectProvider(u) {
  const h = host(u);
  if (hostIs(h, 'youtube.com') || h === 'youtu.be' || hostIs(h, 'youtube-nocookie.com'))
    return 'youtube';
  if (hostIs(h, 'vimeo.com')) return 'vimeo';
  if (hostIs(h, 'spotify.com')) return 'spotify';
  if (hostIs(h, 'soundcloud.com')) return 'soundcloud';
  if (hostIs(h, 'music.apple.com') || hostIs(h, 'embed.music.apple.com')) return 'applemusic';
  if (hostIs(h, 'twitter.com') || h === 'x.com' || hostIs(h, 'x.com')) return 'twitter';
  if (hostIs(h, 'instagram.com')) return 'instagram';
  if (hostIs(h, 'tiktok.com')) return 'tiktok';
  if (
    hostIs(h, 'google.com') &&
    (u.pathname.startsWith('/maps') || u.pathname.startsWith('/maps/'))
  )
    return 'googlemaps';
  if (h === 'maps.app.goo.gl' || h === 'goo.gl') return 'googlemaps';
  if (hostIs(h, 'openstreetmap.org')) return 'openstreetmap';
  if (hostIs(h, 'figma.com')) return 'figma';
  if (hostIs(h, 'codepen.io')) return 'codepen';
  if (hostIs(h, 'codesandbox.io')) return 'codesandbox';
  if (hostIs(h, 'stackblitz.com')) return 'stackblitz';
  if (hostIs(h, 'replit.com') || hostIs(h, 'repl.it')) return 'replit';
  if (hostIs(h, 'loom.com')) return 'loom';
  if (hostIs(h, 'dailymotion.com') || h === 'dai.ly') return 'dailymotion';
  if (hostIs(h, 'twitch.tv')) return 'twitch';
  return 'generic';
}

/** @returns {string} provider id, or 'invalid' for unparseable input. */
export function providerOf(url) {
  const u = safeUrl(url);
  if (!u) return 'invalid';
  return detectProvider(u);
}

// ---------------------------------------------------------------------------
// Per-provider builders. Each returns { provider, html, aspect } or null.
// `u` is a URL object, `privacy` a boolean.
// ---------------------------------------------------------------------------

function buildYouTube(u, privacy) {
  const h = host(u);
  let id = '';
  let start = '';
  if (h === 'youtu.be') {
    id = segs(u)[0] || '';
  } else {
    const parts = segs(u);
    if (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'v') {
      id = parts[1] || '';
    } else if (parts[0] === 'live') {
      id = parts[1] || '';
    } else {
      id = u.searchParams.get('v') || '';
    }
  }
  const t = u.searchParams.get('t') || u.searchParams.get('start');
  if (t) start = parseTimeToSeconds(t);
  if (!id || !/^[A-Za-z0-9_-]{6,}$/.test(id)) return null;
  const domain = privacy ? 'www.youtube-nocookie.com' : 'www.youtube.com';
  const qs = new URLSearchParams();
  qs.set('rel', '0');
  if (start) qs.set('start', String(start));
  const src = `https://${domain}/embed/${encodeURIComponent(id)}?${qs.toString()}`;
  return {
    provider: 'youtube',
    aspect: '16/9',
    html: iframeEmbed({
      src,
      aspect: '16/9',
      title: 'YouTube video',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      privacy,
    }),
  };
}

function parseTimeToSeconds(t) {
  if (/^\d+$/.test(t)) return Number(t);
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
  if (!m) return '';
  const sec = (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0);
  return sec || '';
}

function buildVimeo(u, privacy) {
  const parts = segs(u);
  // vimeo.com/123456789  or  vimeo.com/channels/foo/123  or player.vimeo.com/video/123
  let id = '';
  let hash = '';
  const last = parts[parts.length - 1] || '';
  const idMatch = parts.find((p) => /^\d+$/.test(p));
  if (host(u).startsWith('player.')) {
    const vi = parts.indexOf('video');
    if (vi !== -1) id = parts[vi + 1] || '';
  }
  if (!id) id = idMatch || '';
  // private-link hash: vimeo.com/123/abcdef  or ?h=abcdef
  hash = u.searchParams.get('h') || '';
  if (!hash && idMatch) {
    const after = parts[parts.indexOf(idMatch) + 1];
    if (after && /^[A-Za-z0-9]+$/.test(after) && after !== last) hash = after;
    else if (last && last !== idMatch && /^[A-Za-z0-9]+$/.test(last)) hash = last;
  }
  if (!id || !/^\d+$/.test(id)) return null;
  const qs = new URLSearchParams();
  if (hash) qs.set('h', hash);
  if (privacy) qs.set('dnt', '1');
  const q = qs.toString();
  const src = `https://player.vimeo.com/video/${encodeURIComponent(id)}${q ? '?' + q : ''}`;
  return {
    provider: 'vimeo',
    aspect: '16/9',
    html: iframeEmbed({
      src,
      aspect: '16/9',
      title: 'Vimeo video',
      allow: 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media',
      privacy,
    }),
  };
}

function buildSpotify(u, privacy) {
  const parts = segs(u);
  // Drop a leading locale-ish "embed" if already present.
  const filtered = parts[0] === 'embed' ? parts.slice(1) : parts;
  const types = ['track', 'album', 'playlist', 'episode', 'show', 'artist'];
  const ti = filtered.findIndex((p) => types.includes(p));
  if (ti === -1) return null;
  const type = filtered[ti];
  const id = filtered[ti + 1] || '';
  if (!id || !/^[A-Za-z0-9]+$/.test(id)) return null;
  const square = type === 'track' || type === 'episode';
  const src = `https://open.spotify.com/embed/${type}/${encodeURIComponent(id)}`;
  // Spotify needs a real pixel height; use a tall aspect for lists, compact for single items.
  const aspect = square ? '1/1' : '4/3';
  return {
    provider: 'spotify',
    aspect,
    html: iframeEmbed({
      src,
      aspect,
      title: 'Spotify',
      allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
      privacy,
    }),
  };
}

function buildSoundcloud(u, privacy) {
  // Use the api widget. We pass the original track URL through to the player.
  const trackUrl = `https://soundcloud.com${u.pathname}`;
  if (segs(u).length < 1) return null;
  const params = new URLSearchParams();
  params.set('url', trackUrl);
  params.set('auto_play', 'false');
  params.set('show_comments', 'false');
  params.set('visual', 'true');
  const src = `https://w.soundcloud.com/player/?${params.toString()}`;
  return {
    provider: 'soundcloud',
    aspect: '16/9',
    html: iframeEmbed({
      src,
      aspect: '16/9',
      title: 'SoundCloud',
      allow: 'autoplay; clipboard-write; encrypted-media',
      privacy,
    }),
  };
}

function buildAppleMusic(u, privacy) {
  // music.apple.com/<storefront>/<album|playlist|...>/...  ->  embed.music.apple.com/<same path>
  const path = u.pathname.replace(/^\/+/, '');
  if (!path) return null;
  const q = u.search || '';
  const src = `https://embed.music.apple.com/${path}${q}`;
  return {
    provider: 'applemusic',
    aspect: '4/3',
    html: iframeEmbed({
      src,
      aspect: '4/3',
      title: 'Apple Music',
      allow: 'autoplay; encrypted-media; clipboard-write; *',
      privacy,
    }),
  };
}

function buildTwitter(u) {
  // No iframe; use the blessed blockquote widget. Caller must include
  // widgets.js once on the page (noted in the comment) for rendering.
  const canonical = `https://twitter.com${u.pathname}`;
  const html =
    `<blockquote class="twitter-tweet" data-dnt="true">` +
    `<a href="${escAttr(canonical)}">${escHtml(canonical)}</a>` +
    `</blockquote>` +
    `<!-- wisy: include https://platform.twitter.com/widgets.js once per page to render -->`;
  return { provider: 'twitter', aspect: 'auto', html };
}

function buildInstagram(u) {
  const canonical = `https://www.instagram.com${u.pathname}`;
  const html =
    `<blockquote class="instagram-media" data-instgrm-permalink="${escAttr(
      canonical
    )}" data-instgrm-version="14">` +
    `<a href="${escAttr(canonical)}">${escHtml(canonical)}</a>` +
    `</blockquote>` +
    `<!-- wisy: include https://www.instagram.com/embed.js once per page to render -->`;
  return { provider: 'instagram', aspect: '1/1', html };
}

function buildTikTok(u) {
  const parts = segs(u);
  const vi = parts.indexOf('video');
  const id = vi !== -1 ? parts[vi + 1] : '';
  const canonical = `https://www.tiktok.com${u.pathname}`;
  const cite = escAttr(canonical);
  const vidAttr = id && /^\d+$/.test(id) ? ` data-video-id="${escAttr(id)}"` : '';
  const html =
    `<blockquote class="tiktok-embed" cite="${cite}"${vidAttr}>` +
    `<a href="${escAttr(canonical)}">${escHtml(canonical)}</a>` +
    `</blockquote>` +
    `<!-- wisy: include https://www.tiktok.com/embed.js once per page to render -->`;
  return { provider: 'tiktok', aspect: '9/16', html };
}

function buildGoogleMaps(u, privacy) {
  // Prefer an already-embeddable URL; otherwise force ?output=embed.
  let src;
  if (u.pathname.includes('/maps/embed')) {
    src = u.toString();
  } else {
    const out = new URL(u.toString());
    out.searchParams.set('output', 'embed');
    src = out.toString();
  }
  return {
    provider: 'googlemaps',
    aspect: '16/9',
    html: iframeEmbed({
      src,
      aspect: '16/9',
      title: 'Google Maps',
      allow: '',
      privacy,
    }),
  };
}

function buildOpenStreetMap(u, privacy) {
  // If it's already an export/embed URL keep it; otherwise build one from the map hash/bbox.
  let src;
  if (u.pathname.includes('/export/embed')) {
    src = u.toString();
  } else {
    const bbox = u.searchParams.get('bbox');
    const params = new URLSearchParams();
    if (bbox) params.set('bbox', bbox);
    params.set('layer', 'mapnik');
    // carry a marker from the #map=zoom/lat/lon hash if present
    const m = /map=\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/.exec(u.hash || '');
    if (m && !bbox) {
      const lat = Number(m[1]);
      const lon = Number(m[2]);
      const d = 0.01;
      params.set('bbox', `${lon - d},${lat - d},${lon + d},${lat + d}`);
      params.set('marker', `${lat},${lon}`);
    }
    src = `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
  }
  return {
    provider: 'openstreetmap',
    aspect: '16/9',
    html: iframeEmbed({
      src,
      aspect: '16/9',
      title: 'OpenStreetMap',
      allow: '',
      privacy,
    }),
  };
}

function buildFigma(u, privacy) {
  let src;
  if (u.pathname.startsWith('/embed')) {
    src = u.toString();
  } else {
    const params = new URLSearchParams();
    params.set('embed_host', 'wisy');
    params.set('url', u.toString());
    src = `https://www.figma.com/embed?${params.toString()}`;
  }
  return {
    provider: 'figma',
    aspect: '16/9',
    html: iframeEmbed({
      src,
      aspect: '16/9',
      title: 'Figma',
      allow: 'fullscreen; clipboard-write',
      privacy,
    }),
  };
}

function buildCodepen(u, privacy) {
  // codepen.io/<user>/pen/<slug>  ->  /<user>/embed/<slug>
  const parts = segs(u);
  if (parts.length < 3) return null;
  const user = parts[0];
  const slug = parts[2];
  if (parts[1] !== 'pen' && parts[1] !== 'embed' && parts[1] !== 'details') return null;
  const src = `https://codepen.io/${encodeURIComponent(user)}/embed/${encodeURIComponent(
    slug
  )}?default-tab=result`;
  return {
    provider: 'codepen',
    aspect: '4/3',
    html: iframeEmbed({
      src,
      aspect: '4/3',
      title: 'CodePen',
      allow: 'fullscreen; clipboard-write; encrypted-media',
      privacy,
    }),
  };
}

function buildCodesandbox(u, privacy) {
  // codesandbox.io/s/<id>  or  /p/sandbox/<id>  ->  /embed/<id>
  const parts = segs(u);
  let id = '';
  if (parts[0] === 'embed') id = parts[1] || '';
  else if (parts[0] === 's') id = parts[1] || '';
  else if (parts[0] === 'p' && (parts[1] === 'sandbox' || parts[1] === 'devbox')) id = parts[2] || '';
  if (!id) return null;
  const src = `https://codesandbox.io/embed/${encodeURIComponent(id)}`;
  return {
    provider: 'codesandbox',
    aspect: '4/3',
    html: iframeEmbed({
      src,
      aspect: '4/3',
      title: 'CodeSandbox',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      privacy,
    }),
  };
}

function buildStackblitz(u, privacy) {
  // stackblitz.com/edit/<id>  ->  ?embed=1; also supports /github/<repo>
  const out = new URL(u.toString());
  out.searchParams.set('embed', '1');
  return {
    provider: 'stackblitz',
    aspect: '4/3',
    html: iframeEmbed({
      src: out.toString(),
      aspect: '4/3',
      title: 'StackBlitz',
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      privacy,
    }),
  };
}

function buildReplit(u, privacy) {
  const out = new URL(u.toString());
  out.hostname = 'replit.com';
  out.searchParams.set('embed', 'true');
  return {
    provider: 'replit',
    aspect: '4/3',
    html: iframeEmbed({
      src: out.toString(),
      aspect: '4/3',
      title: 'Replit',
      allow: 'clipboard-write; encrypted-media',
      privacy,
    }),
  };
}

function buildLoom(u, privacy) {
  // loom.com/share/<id>  ->  /embed/<id>
  const parts = segs(u);
  let id = '';
  if (parts[0] === 'embed') id = parts[1] || '';
  else if (parts[0] === 'share') id = parts[1] || '';
  if (!id || !/^[A-Za-z0-9]+$/.test(id)) return null;
  const src = `https://www.loom.com/embed/${encodeURIComponent(id)}`;
  return {
    provider: 'loom',
    aspect: '16/9',
    html: iframeEmbed({
      src,
      aspect: '16/9',
      title: 'Loom',
      allow: 'autoplay; fullscreen; picture-in-picture',
      privacy,
    }),
  };
}

function buildDailymotion(u, privacy) {
  // dailymotion.com/video/<id>  or  dai.ly/<id>
  let id = '';
  if (host(u) === 'dai.ly') id = segs(u)[0] || '';
  else {
    const parts = segs(u);
    const vi = parts.indexOf('video');
    if (vi !== -1) id = parts[vi + 1] || '';
    else if (parts[0] === 'embed' && parts[1] === 'video') id = parts[2] || '';
  }
  if (!id || !/^[A-Za-z0-9]+$/.test(id)) return null;
  const src = `https://www.dailymotion.com/embed/video/${encodeURIComponent(id)}`;
  return {
    provider: 'dailymotion',
    aspect: '16/9',
    html: iframeEmbed({
      src,
      aspect: '16/9',
      title: 'Dailymotion',
      allow: 'autoplay; fullscreen; picture-in-picture; encrypted-media',
      privacy,
    }),
  };
}

function buildTwitch(u, privacy, opts) {
  // Twitch requires a parent= matching the embedding host.
  const parent = sanitizeParent(opts && opts.parent) || 'localhost';
  const parts = segs(u);
  const params = new URLSearchParams();
  let kind = 'channel';
  let src;
  if (host(u) === 'clips.twitch.tv' || (parts[0] === 'clip')) {
    const clip = parts[0] === 'clip' ? parts[1] : parts[0];
    if (!clip) return null;
    params.set('clip', clip);
    params.set('parent', parent);
    src = `https://clips.twitch.tv/embed?${params.toString()}`;
    return {
      provider: 'twitch',
      aspect: '16/9',
      html: iframeEmbed({
        src,
        aspect: '16/9',
        title: 'Twitch clip',
        allow: 'autoplay; fullscreen; encrypted-media',
        privacy,
      }),
    };
  }
  if (parts[0] === 'videos') {
    params.set('video', parts[1] || '');
    kind = 'video';
  } else if (parts.length >= 1) {
    params.set('channel', parts[0]);
    kind = 'channel';
  } else {
    return null;
  }
  params.set('parent', parent);
  params.set('autoplay', 'false');
  src = `https://player.twitch.tv/?${params.toString()}`;
  return {
    provider: 'twitch',
    aspect: '16/9',
    html: iframeEmbed({
      src,
      aspect: '16/9',
      title: 'Twitch ' + kind,
      allow: 'autoplay; fullscreen; encrypted-media',
      privacy,
    }),
  };
}

/** Only allow a plausible bare hostname for Twitch parent= (no scheme/path). */
function sanitizeParent(p) {
  if (typeof p !== 'string') return '';
  const v = p.trim().toLowerCase();
  if (/^[a-z0-9.-]+$/.test(v) && !v.startsWith('.') && !v.endsWith('.')) return v;
  return '';
}

function buildGeneric(u, privacy) {
  if (u.protocol !== 'https:') return null; // never iframe plain http
  return {
    provider: 'generic',
    aspect: '16/9',
    html: iframeEmbed({
      src: u.toString(),
      aspect: '16/9',
      title: 'Embedded content',
      allow: '',
      privacy,
    }),
  };
}

const BUILDERS = {
  youtube: (u, p) => buildYouTube(u, p),
  vimeo: (u, p) => buildVimeo(u, p),
  spotify: (u, p) => buildSpotify(u, p),
  soundcloud: (u, p) => buildSoundcloud(u, p),
  applemusic: (u, p) => buildAppleMusic(u, p),
  twitter: (u) => buildTwitter(u),
  instagram: (u) => buildInstagram(u),
  tiktok: (u) => buildTikTok(u),
  googlemaps: (u, p) => buildGoogleMaps(u, p),
  openstreetmap: (u, p) => buildOpenStreetMap(u, p),
  figma: (u, p) => buildFigma(u, p),
  codepen: (u, p) => buildCodepen(u, p),
  codesandbox: (u, p) => buildCodesandbox(u, p),
  stackblitz: (u, p) => buildStackblitz(u, p),
  replit: (u, p) => buildReplit(u, p),
  loom: (u, p) => buildLoom(u, p),
  dailymotion: (u, p) => buildDailymotion(u, p),
  twitch: (u, p, opts) => buildTwitch(u, p, opts),
  generic: (u, p) => buildGeneric(u, p),
};

// ---------------------------------------------------------------------------
// Consent placeholder
// ---------------------------------------------------------------------------

const PROVIDER_LABELS = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  applemusic: 'Apple Music',
  twitter: 'X (Twitter)',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  googlemaps: 'Google Maps',
  openstreetmap: 'OpenStreetMap',
  figma: 'Figma',
  codepen: 'CodePen',
  codesandbox: 'CodeSandbox',
  stackblitz: 'StackBlitz',
  replit: 'Replit',
  loom: 'Loom',
  dailymotion: 'Dailymotion',
  twitch: 'Twitch',
  generic: 'external content',
};

/**
 * Build a click-to-load consent placeholder. The real embed HTML is stored,
 * base64-encoded, in data-embed-html; the runtime decodes and injects it on
 * click. data-embed-src/provider are included for display and debugging.
 */
function consentPlaceholder(provider, srcUrl, embedHtml) {
  const label = PROVIDER_LABELS[provider] || 'external content';
  const encoded = b64encode(embedHtml);
  return (
    `<div class="wisy-embed-consent" role="button" tabindex="0"` +
    ` data-embed-src="${escAttr(srcUrl)}"` +
    ` data-embed-provider="${escAttr(provider)}"` +
    ` data-embed-html="${escAttr(encoded)}"` +
    ` style="position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;` +
    `gap:.5rem;min-height:200px;aspect-ratio:16/9;padding:1rem;text-align:center;cursor:pointer;` +
    `background:#11181c;color:#e6edf3;border:1px solid #2a343c;border-radius:8px;font-family:system-ui,sans-serif">` +
    `<strong style="font-size:1rem">Load ${escHtml(label)} content?</strong>` +
    `<span style="font-size:.8rem;opacity:.75;max-width:36ch">This embed loads content from ${escHtml(
      label
    )} and may set cookies. Click to load.</span>` +
    `<span style="font-size:.8rem;font-weight:600;padding:.4rem .8rem;border-radius:4px;background:#2563eb;color:#fff">` +
    `Click to load</span>` +
    `</div>`
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert a URL into a responsive embed.
 * @param {string} url
 * @param {object} [opts]
 * @param {boolean} [opts.privacy=true]
 * @param {boolean} [opts.consent=false]
 * @param {string}  [opts.parent]   host for Twitch parent= (defaults localhost)
 * @returns {{ ok: boolean, provider: string, html: string, aspect: string }}
 */
export function parseEmbed(url, opts = {}) {
  const privacy = opts.privacy !== false;
  const consent = opts.consent === true;
  const u = safeUrl(url);
  if (!u) {
    return { ok: false, provider: 'invalid', html: '', aspect: '16/9' };
  }
  const provider = detectProvider(u);
  const builder = BUILDERS[provider] || BUILDERS.generic;
  let result = builder(u, privacy, opts);
  if (!result) {
    // Provider matched the host but the specific URL shape was unusable;
    // fall back to a generic iframe so the user still gets something.
    result = buildGeneric(u, privacy);
  }
  if (!result) {
    return { ok: false, provider, html: '', aspect: '16/9' };
  }
  if (consent) {
    const html = consentPlaceholder(result.provider, u.toString(), result.html);
    return { ok: true, provider: result.provider, html, aspect: result.aspect };
  }
  return { ok: true, provider: result.provider, html: result.html, aspect: result.aspect };
}

/** Picker list for the embed UI — one entry per supported provider. */
export const EMBED_PROVIDERS = [
  { id: 'youtube', label: 'YouTube', example: 'https://youtu.be/dQw4w9WgXcQ' },
  { id: 'vimeo', label: 'Vimeo', example: 'https://vimeo.com/76979871' },
  {
    id: 'spotify',
    label: 'Spotify',
    example: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
  },
  {
    id: 'soundcloud',
    label: 'SoundCloud',
    example: 'https://soundcloud.com/forss/flickermood',
  },
  {
    id: 'applemusic',
    label: 'Apple Music',
    example:
      'https://music.apple.com/us/album/the-dark-side-of-the-moon/1065973699',
  },
  { id: 'twitter', label: 'X (Twitter)', example: 'https://x.com/jack/status/20' },
  {
    id: 'instagram',
    label: 'Instagram',
    example: 'https://www.instagram.com/p/CqXyz12AbCd/',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    example: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
  },
  {
    id: 'googlemaps',
    label: 'Google Maps',
    example: 'https://www.google.com/maps?q=Eiffel+Tower,+Paris',
  },
  {
    id: 'openstreetmap',
    label: 'OpenStreetMap',
    example: 'https://www.openstreetmap.org/#map=16/48.8584/2.2945',
  },
  {
    id: 'figma',
    label: 'Figma',
    example: 'https://www.figma.com/file/abc123/Design?node-id=0-1',
  },
  { id: 'codepen', label: 'CodePen', example: 'https://codepen.io/team/codepen/pen/PNaGbb' },
  {
    id: 'codesandbox',
    label: 'CodeSandbox',
    example: 'https://codesandbox.io/s/new',
  },
  {
    id: 'stackblitz',
    label: 'StackBlitz',
    example: 'https://stackblitz.com/edit/react-starter',
  },
  { id: 'replit', label: 'Replit', example: 'https://replit.com/@templates/Nodejs' },
  { id: 'loom', label: 'Loom', example: 'https://www.loom.com/share/abcdef1234567890' },
  {
    id: 'dailymotion',
    label: 'Dailymotion',
    example: 'https://www.dailymotion.com/video/x7tgad0',
  },
  { id: 'twitch', label: 'Twitch', example: 'https://www.twitch.tv/twitchdev' },
  { id: 'generic', label: 'Other (any https URL)', example: 'https://example.com/' },
];

/**
 * Inlineable runtime for exported pages. Finds consent placeholders and, on
 * click or Enter/Space, decodes the stored embed HTML and replaces the
 * placeholder with the real embed. Self-contained, no dependencies, no eval.
 */
export const EMBED_RUNTIME = `(function(){
  function decode(b64){
    try{
      var bin = atob(b64);
      var bytes = new Uint8Array(bin.length);
      for(var i=0;i<bin.length;i++){ bytes[i]=bin.charCodeAt(i); }
      if(typeof TextDecoder!=='undefined'){ return new TextDecoder('utf-8').decode(bytes); }
      return decodeURIComponent(escape(bin));
    }catch(e){ return ''; }
  }
  function load(el){
    if(!el || el.getAttribute('data-embed-loaded')==='1') return;
    var html = decode(el.getAttribute('data-embed-html')||'');
    if(!html) return;
    var holder = document.createElement('div');
    holder.innerHTML = html;
    var node = holder.firstElementChild;
    if(!node) return;
    el.setAttribute('data-embed-loaded','1');
    el.parentNode.replaceChild(node, el);
  }
  function onActivate(e){
    var el = e.target.closest ? e.target.closest('.wisy-embed-consent[data-embed-src]') : null;
    if(!el) return;
    if(e.type==='keydown'){
      if(e.key!=='Enter' && e.key!==' ' && e.key!=='Spacebar') return;
      e.preventDefault();
    }
    load(el);
  }
  function init(){
    document.addEventListener('click', onActivate, false);
    document.addEventListener('keydown', onActivate, false);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();`;
