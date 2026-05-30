// component-presets.js
// Zero-dependency browser ES module.
//
// A rich library of *style presets* per component. A preset is a named bundle
// of CSS style overrides (and optionally prop overrides) that the editor
// applies to a selected component. Values are expressed in terms of the design
// tokens already present on the page so presets re-theme automatically:
//
//   --color-primary  --color-primary-contrast  --color-accent
//   --color-bg  --color-surface  --color-surface-2
//   --color-text  --color-muted  --color-strong  --color-border
//   --radius  --radius-lg  --shadow  --shadow-lg
//   --font-display  --font-ui
//
// Shape:
//   COMPONENT_PRESETS = {
//     <componentType>: [ { name, style: {<cssProp>:<value>}, props?: {...} }, ... ]
//   }

export const COMPONENT_PRESETS = {
  // ───────────────────────────────────────────────────────────── buttons
  button: [
    {
      name: 'Solid',
      style: {
        background: 'var(--color-primary)',
        color: 'var(--color-primary-contrast)',
        border: '1px solid transparent',
        borderRadius: 'var(--radius)',
        padding: '0.65em 1.25em',
        fontWeight: '600',
        boxShadow: 'none',
        transition: 'background 160ms ease, transform 120ms ease'
      }
    },
    {
      name: 'Soft',
      style: {
        background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
        color: 'var(--color-primary)',
        border: '1px solid transparent',
        borderRadius: 'var(--radius)',
        padding: '0.65em 1.25em',
        fontWeight: '600',
        transition: 'background 160ms ease'
      }
    },
    {
      name: 'Outline',
      style: {
        background: 'transparent',
        color: 'var(--color-primary)',
        border: '1.5px solid var(--color-primary)',
        borderRadius: 'var(--radius)',
        padding: '0.6em 1.2em',
        fontWeight: '600',
        transition: 'background 160ms ease, color 160ms ease'
      }
    },
    {
      name: 'Ghost',
      style: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: '1px solid transparent',
        borderRadius: 'var(--radius)',
        padding: '0.6em 1em',
        fontWeight: '500',
        transition: 'background 140ms ease'
      }
    },
    {
      name: 'Gradient',
      style: {
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
        color: 'var(--color-primary-contrast)',
        border: '1px solid transparent',
        borderRadius: 'var(--radius)',
        padding: '0.68em 1.35em',
        fontWeight: '600',
        boxShadow: '0 6px 18px -8px color-mix(in srgb, var(--color-primary) 70%, transparent)',
        transition: 'transform 140ms ease, box-shadow 160ms ease'
      }
    },
    {
      name: 'Glow',
      style: {
        background: 'var(--color-primary)',
        color: 'var(--color-primary-contrast)',
        border: '1px solid transparent',
        borderRadius: 'var(--radius)',
        padding: '0.68em 1.35em',
        fontWeight: '600',
        boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-primary) 40%, transparent), 0 0 24px -2px color-mix(in srgb, var(--color-primary) 65%, transparent)',
        transition: 'box-shadow 200ms ease'
      }
    },
    {
      name: 'Pill',
      style: {
        background: 'var(--color-primary)',
        color: 'var(--color-primary-contrast)',
        border: '1px solid transparent',
        borderRadius: '999px',
        padding: '0.6em 1.5em',
        fontWeight: '600',
        transition: 'background 160ms ease'
      }
    },
    {
      name: 'Sharp',
      style: {
        background: 'var(--color-strong)',
        color: 'var(--color-bg)',
        border: '1px solid transparent',
        borderRadius: '0',
        padding: '0.7em 1.4em',
        fontWeight: '600',
        letterSpacing: '0.02em',
        transition: 'opacity 140ms ease'
      }
    },
    {
      name: 'Elevated',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.65em 1.25em',
        fontWeight: '600',
        boxShadow: 'var(--shadow)',
        transition: 'box-shadow 160ms ease, transform 120ms ease'
      }
    },
    {
      name: 'Neumorphic',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid transparent',
        borderRadius: 'var(--radius-lg)',
        padding: '0.7em 1.4em',
        fontWeight: '600',
        boxShadow: '6px 6px 14px color-mix(in srgb, var(--color-strong) 14%, transparent), -6px -6px 14px color-mix(in srgb, var(--color-bg) 80%, transparent)',
        transition: 'box-shadow 200ms ease'
      }
    },
    {
      name: 'Glass',
      style: {
        background: 'color-mix(in srgb, var(--color-surface) 55%, transparent)',
        color: 'var(--color-text)',
        border: '1px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
        borderRadius: 'var(--radius)',
        padding: '0.65em 1.3em',
        fontWeight: '600',
        backdropFilter: 'blur(10px) saturate(140%)',
        WebkitBackdropFilter: 'blur(10px) saturate(140%)',
        boxShadow: '0 8px 24px -16px color-mix(in srgb, var(--color-strong) 60%, transparent)'
      }
    },
    {
      name: 'Underline',
      style: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: 'none',
        borderRadius: '0',
        padding: '0.4em 0.1em',
        fontWeight: '600',
        boxShadow: 'inset 0 -2px 0 0 var(--color-primary)',
        transition: 'box-shadow 160ms ease, color 160ms ease'
      }
    },
    {
      name: 'Icon Led',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.6em 1.15em 0.6em 0.95em',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5em'
      }
    },
    {
      name: 'Mono Terminal',
      style: {
        background: 'var(--color-strong)',
        color: 'var(--color-accent)',
        border: '1px solid color-mix(in srgb, var(--color-accent) 35%, transparent)',
        borderRadius: 'var(--radius)',
        padding: '0.55em 1.1em',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        fontWeight: '500',
        letterSpacing: '0.04em',
        textTransform: 'lowercase'
      }
    },
    {
      name: '3D Press',
      style: {
        background: 'var(--color-primary)',
        color: 'var(--color-primary-contrast)',
        border: '1px solid transparent',
        borderRadius: 'var(--radius)',
        padding: '0.65em 1.3em',
        fontWeight: '700',
        boxShadow: '0 4px 0 0 color-mix(in srgb, var(--color-primary) 55%, var(--color-strong))',
        transform: 'translateY(0)',
        transition: 'transform 90ms ease, box-shadow 90ms ease'
      }
    },
    {
      name: 'Uppercase Tracked',
      style: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.6em 1.3em',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        fontSize: '0.82em'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── cards
  card: [
    {
      name: 'Flat',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: 'none',
        borderRadius: 'var(--radius)',
        boxShadow: 'none',
        padding: '1.25rem'
      }
    },
    {
      name: 'Bordered',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'none',
        padding: '1.25rem'
      }
    },
    {
      name: 'Elevated',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '1.5rem'
      }
    },
    {
      name: 'Glass',
      style: {
        background: 'color-mix(in srgb, var(--color-surface) 60%, transparent)',
        color: 'var(--color-text)',
        border: '1px solid color-mix(in srgb, var(--color-border) 55%, transparent)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        boxShadow: '0 16px 40px -24px color-mix(in srgb, var(--color-strong) 60%, transparent)',
        padding: '1.5rem'
      }
    },
    {
      name: 'Gradient Border',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1.5px solid transparent',
        borderRadius: 'var(--radius-lg)',
        backgroundImage: 'linear-gradient(var(--color-surface), var(--color-surface)), linear-gradient(135deg, var(--color-primary), var(--color-accent))',
        backgroundOrigin: 'border-box',
        backgroundClip: 'padding-box, border-box',
        padding: '1.5rem'
      }
    },
    {
      name: 'Inset',
      style: {
        background: 'var(--color-surface-2)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'inset 0 2px 6px color-mix(in srgb, var(--color-strong) 12%, transparent)',
        padding: '1.25rem'
      }
    },
    {
      name: 'Outline Accent',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderLeft: '3px solid var(--color-accent)',
        borderRadius: 'var(--radius)',
        boxShadow: 'none',
        padding: '1.25rem 1.25rem 1.25rem 1.4rem'
      }
    },
    {
      name: 'Soft Shadow',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: 'none',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 1px 2px color-mix(in srgb, var(--color-strong) 6%, transparent), 0 12px 28px -18px color-mix(in srgb, var(--color-strong) 40%, transparent)',
        padding: '1.5rem'
      }
    },
    {
      name: 'Sharp',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-strong)',
        borderRadius: '0',
        boxShadow: 'none',
        padding: '1.25rem'
      }
    },
    {
      name: 'Dark On Surface',
      style: {
        background: 'var(--color-strong)',
        color: 'var(--color-bg)',
        border: '1px solid color-mix(in srgb, var(--color-bg) 14%, transparent)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 48px -28px color-mix(in srgb, var(--color-strong) 80%, transparent)',
        padding: '1.5rem'
      }
    },
    {
      name: 'Spotlight',
      style: {
        background: 'radial-gradient(120% 120% at 0% 0%, color-mix(in srgb, var(--color-primary) 16%, var(--color-surface)), var(--color-surface) 60%)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── sections
  section: [
    {
      name: 'Spacious',
      style: {
        padding: '6rem 1.5rem',
        background: 'var(--color-bg)',
        color: 'var(--color-text)'
      }
    },
    {
      name: 'Tight',
      style: {
        padding: '2rem 1.5rem',
        background: 'var(--color-bg)',
        color: 'var(--color-text)'
      }
    },
    {
      name: 'Centered',
      style: {
        padding: '5rem 1.5rem',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        textAlign: 'center',
        maxWidth: '72ch',
        marginLeft: 'auto',
        marginRight: 'auto'
      }
    },
    {
      name: 'Split Pad',
      style: {
        padding: '5rem clamp(1.5rem, 8vw, 8rem)',
        background: 'var(--color-bg)',
        color: 'var(--color-text)'
      }
    },
    {
      name: 'Gradient Bg',
      style: {
        padding: '5rem 1.5rem',
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 8%, var(--color-bg)), var(--color-bg))',
        color: 'var(--color-text)'
      }
    },
    {
      name: 'Surface Bg',
      style: {
        padding: '5rem 1.5rem',
        background: 'var(--color-surface)',
        color: 'var(--color-text)'
      }
    },
    {
      name: 'Bordered Top',
      style: {
        padding: '4rem 1.5rem',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        borderTop: '1px solid var(--color-border)'
      }
    },
    {
      name: 'Full Bleed Dark',
      style: {
        padding: '6rem 1.5rem',
        background: 'var(--color-strong)',
        color: 'var(--color-bg)',
        width: '100%'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── hero
  hero: [
    {
      name: 'Gradient',
      style: {
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
        color: 'var(--color-primary-contrast)',
        padding: '7rem 1.5rem',
        textAlign: 'center'
      }
    },
    {
      name: 'Spotlight Dark',
      style: {
        background: 'radial-gradient(80% 120% at 50% 0%, color-mix(in srgb, var(--color-primary) 40%, var(--color-strong)), var(--color-strong) 70%)',
        color: 'var(--color-bg)',
        padding: '8rem 1.5rem',
        textAlign: 'center'
      }
    },
    {
      name: 'Minimal',
      style: {
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        padding: '7rem 1.5rem 5rem',
        textAlign: 'left',
        maxWidth: '60ch'
      }
    },
    {
      name: 'Split',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        padding: '5rem clamp(1.5rem, 8vw, 7rem)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '3rem',
        alignItems: 'center'
      }
    },
    {
      name: 'Glow',
      style: {
        background: 'var(--color-bg)',
        backgroundImage: 'radial-gradient(40% 60% at 50% 18%, color-mix(in srgb, var(--color-primary) 28%, transparent), transparent 70%)',
        color: 'var(--color-text)',
        padding: '8rem 1.5rem',
        textAlign: 'center'
      }
    },
    {
      name: 'Mesh Gradient',
      style: {
        background: 'radial-gradient(at 18% 20%, color-mix(in srgb, var(--color-primary) 35%, transparent), transparent 50%), radial-gradient(at 82% 30%, color-mix(in srgb, var(--color-accent) 35%, transparent), transparent 50%), radial-gradient(at 50% 90%, color-mix(in srgb, var(--color-surface-2) 60%, transparent), transparent 55%), var(--color-bg)',
        color: 'var(--color-text)',
        padding: '8rem 1.5rem',
        textAlign: 'center'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── headings
  heading: [
    {
      name: 'Tight',
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: '700',
        lineHeight: '1.02',
        letterSpacing: '-0.03em',
        color: 'var(--color-strong)'
      }
    },
    {
      name: 'Airy',
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: '500',
        lineHeight: '1.35',
        letterSpacing: '0',
        color: 'var(--color-text)'
      }
    },
    {
      name: 'Gradient Text',
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: '800',
        lineHeight: '1.05',
        letterSpacing: '-0.02em',
        background: 'linear-gradient(120deg, var(--color-primary), var(--color-accent))',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent'
      }
    },
    {
      name: 'Gradient Text Sheen',
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: '800',
        lineHeight: '1.05',
        letterSpacing: '-0.02em',
        background: 'linear-gradient(120deg, var(--color-strong), var(--color-primary) 55%, var(--color-accent))',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent'
      }
    },
    {
      name: 'Underline Accent',
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: '700',
        lineHeight: '1.1',
        color: 'var(--color-strong)',
        display: 'inline-block',
        boxShadow: 'inset 0 -0.18em 0 0 color-mix(in srgb, var(--color-accent) 55%, transparent)'
      }
    },
    {
      name: 'Uppercase Tracked',
      style: {
        fontFamily: 'var(--font-ui)',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.22em',
        fontSize: '0.95em',
        color: 'var(--color-muted)'
      }
    },
    {
      name: 'Serif Display',
      style: {
        fontFamily: 'Georgia, "Times New Roman", "Iowan Old Style", serif',
        fontWeight: '600',
        lineHeight: '1.12',
        letterSpacing: '-0.01em',
        color: 'var(--color-strong)'
      }
    },
    {
      name: 'Mono',
      style: {
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        fontWeight: '500',
        letterSpacing: '-0.01em',
        lineHeight: '1.15',
        color: 'var(--color-text)'
      }
    },
    {
      name: 'Outlined',
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: '800',
        lineHeight: '1.05',
        letterSpacing: '-0.01em',
        color: 'transparent',
        WebkitTextFillColor: 'transparent',
        WebkitTextStroke: '1.5px var(--color-strong)'
      }
    },
    {
      name: 'Highlight',
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: '700',
        lineHeight: '1.3',
        color: 'var(--color-strong)',
        background: 'linear-gradient(transparent 62%, color-mix(in srgb, var(--color-accent) 45%, transparent) 62%)',
        display: 'inline',
        padding: '0 0.1em'
      }
    },
    {
      name: 'Balanced',
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: '700',
        lineHeight: '1.15',
        letterSpacing: '-0.02em',
        textWrap: 'balance',
        color: 'var(--color-strong)'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── badges
  badge: [
    {
      name: 'Soft',
      style: {
        background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)',
        color: 'var(--color-primary)',
        border: '1px solid transparent',
        borderRadius: '999px',
        padding: '0.2em 0.7em',
        fontSize: '0.78em',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center'
      }
    },
    {
      name: 'Solid',
      style: {
        background: 'var(--color-primary)',
        color: 'var(--color-primary-contrast)',
        border: '1px solid transparent',
        borderRadius: '999px',
        padding: '0.2em 0.7em',
        fontSize: '0.78em',
        fontWeight: '600'
      }
    },
    {
      name: 'Outline',
      style: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: '999px',
        padding: '0.2em 0.7em',
        fontSize: '0.78em',
        fontWeight: '600'
      }
    },
    {
      name: 'Dot',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: '999px',
        padding: '0.2em 0.75em 0.2em 0.6em',
        fontSize: '0.78em',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4em'
      }
    },
    {
      name: 'Pill Gradient',
      style: {
        background: 'linear-gradient(120deg, var(--color-primary), var(--color-accent))',
        color: 'var(--color-primary-contrast)',
        border: '1px solid transparent',
        borderRadius: '999px',
        padding: '0.22em 0.8em',
        fontSize: '0.78em',
        fontWeight: '600'
      }
    },
    {
      name: 'Glow',
      style: {
        background: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
        color: 'var(--color-accent)',
        border: '1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)',
        borderRadius: '999px',
        padding: '0.2em 0.7em',
        fontSize: '0.78em',
        fontWeight: '600',
        boxShadow: '0 0 12px -2px color-mix(in srgb, var(--color-accent) 55%, transparent)'
      }
    },
    {
      name: 'Mono',
      style: {
        background: 'var(--color-surface-2)',
        color: 'var(--color-muted)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.18em 0.55em',
        fontSize: '0.74em',
        fontWeight: '500',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        letterSpacing: '0.02em'
      }
    },
    {
      name: 'Sharp',
      style: {
        background: 'var(--color-strong)',
        color: 'var(--color-bg)',
        border: '1px solid transparent',
        borderRadius: '0',
        padding: '0.2em 0.6em',
        fontSize: '0.76em',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.08em'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── inputs
  input: [
    {
      name: 'Outline',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.6em 0.85em',
        transition: 'border-color 140ms ease, box-shadow 140ms ease'
      }
    },
    {
      name: 'Filled',
      style: {
        background: 'var(--color-surface-2)',
        color: 'var(--color-text)',
        border: '1px solid transparent',
        borderRadius: 'var(--radius)',
        padding: '0.6em 0.85em',
        transition: 'background 140ms ease'
      }
    },
    {
      name: 'Underline',
      style: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: 'none',
        borderBottom: '1.5px solid var(--color-border)',
        borderRadius: '0',
        padding: '0.5em 0.15em',
        transition: 'border-color 140ms ease'
      }
    },
    {
      name: 'Pill',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: '999px',
        padding: '0.6em 1.1em'
      }
    },
    {
      name: 'Soft',
      style: {
        background: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))',
        color: 'var(--color-text)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)',
        borderRadius: 'var(--radius)',
        padding: '0.6em 0.85em'
      }
    },
    {
      name: 'Sharp',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-strong)',
        borderRadius: '0',
        padding: '0.6em 0.85em'
      }
    }
  ],

  // alias so `presetsFor('wc-input')` works too
  'wc-input': [
    {
      name: 'Outline',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.6em 0.85em',
        transition: 'border-color 140ms ease, box-shadow 140ms ease'
      }
    },
    {
      name: 'Filled',
      style: {
        background: 'var(--color-surface-2)',
        color: 'var(--color-text)',
        border: '1px solid transparent',
        borderRadius: 'var(--radius)',
        padding: '0.6em 0.85em'
      }
    },
    {
      name: 'Underline',
      style: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: 'none',
        borderBottom: '1.5px solid var(--color-border)',
        borderRadius: '0',
        padding: '0.5em 0.15em'
      }
    },
    {
      name: 'Pill',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: '999px',
        padding: '0.6em 1.1em'
      }
    },
    {
      name: 'Soft',
      style: {
        background: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))',
        color: 'var(--color-text)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 18%, transparent)',
        borderRadius: 'var(--radius)',
        padding: '0.6em 0.85em'
      }
    },
    {
      name: 'Sharp',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-strong)',
        borderRadius: '0',
        padding: '0.6em 0.85em'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── cta
  cta: [
    {
      name: 'Gradient',
      style: {
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
        color: 'var(--color-primary-contrast)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem clamp(1.5rem, 5vw, 4rem)',
        textAlign: 'center',
        boxShadow: '0 24px 60px -32px color-mix(in srgb, var(--color-primary) 70%, transparent)'
      }
    },
    {
      name: 'Solid Dark',
      style: {
        background: 'var(--color-strong)',
        color: 'var(--color-bg)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem clamp(1.5rem, 5vw, 4rem)',
        textAlign: 'center'
      }
    },
    {
      name: 'Bordered',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem clamp(1.5rem, 5vw, 4rem)',
        textAlign: 'center'
      }
    },
    {
      name: 'Glass',
      style: {
        background: 'color-mix(in srgb, var(--color-surface) 55%, transparent)',
        color: 'var(--color-text)',
        border: '1px solid color-mix(in srgb, var(--color-border) 55%, transparent)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        padding: '3rem clamp(1.5rem, 5vw, 4rem)',
        textAlign: 'center'
      }
    },
    {
      name: 'Image Ready',
      style: {
        background: 'linear-gradient(0deg, color-mix(in srgb, var(--color-strong) 70%, transparent), color-mix(in srgb, var(--color-strong) 30%, transparent)), var(--color-surface-2)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'var(--color-bg)',
        borderRadius: 'var(--radius-lg)',
        padding: '4rem clamp(1.5rem, 5vw, 4rem)',
        textAlign: 'center'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── navbar
  navbar: [
    {
      name: 'Solid',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }
    },
    {
      name: 'Glass',
      style: {
        background: 'color-mix(in srgb, var(--color-surface) 70%, transparent)',
        color: 'var(--color-text)',
        borderBottom: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        padding: '0.85rem 1.5rem',
        position: 'sticky',
        top: '0'
      }
    },
    {
      name: 'Minimal',
      style: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: 'none',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }
    },
    {
      name: 'Floating Pill',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: '999px',
        boxShadow: 'var(--shadow-lg)',
        padding: '0.6rem 1.2rem',
        margin: '1rem auto',
        maxWidth: 'min(56rem, calc(100% - 2rem))',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }
    },
    {
      name: 'Bordered',
      style: {
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── image
  image: [
    {
      name: 'Rounded',
      style: {
        borderRadius: 'var(--radius-lg)',
        objectFit: 'cover',
        display: 'block'
      }
    },
    {
      name: 'Sharp',
      style: {
        borderRadius: '0',
        objectFit: 'cover',
        display: 'block'
      }
    },
    {
      name: 'Circle',
      style: {
        borderRadius: '50%',
        objectFit: 'cover',
        aspectRatio: '1 / 1',
        display: 'block'
      }
    },
    {
      name: 'Shadow Lift',
      style: {
        borderRadius: 'var(--radius-lg)',
        objectFit: 'cover',
        display: 'block',
        boxShadow: '0 28px 60px -28px color-mix(in srgb, var(--color-strong) 60%, transparent)'
      }
    },
    {
      name: 'Bordered',
      style: {
        borderRadius: 'var(--radius)',
        objectFit: 'cover',
        display: 'block',
        border: '1px solid var(--color-border)',
        padding: '4px',
        background: 'var(--color-surface)'
      }
    },
    {
      name: 'Duotone',
      style: {
        borderRadius: 'var(--radius)',
        objectFit: 'cover',
        display: 'block',
        filter: 'grayscale(1) contrast(1.05) sepia(0.2)',
        mixBlendMode: 'luminosity'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── divider
  divider: [
    {
      name: 'Hairline',
      style: {
        border: 'none',
        height: '1px',
        background: 'var(--color-border)',
        margin: '1.5rem 0'
      }
    },
    {
      name: 'Fade',
      style: {
        border: 'none',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--color-border), transparent)',
        margin: '2rem 0'
      }
    },
    {
      name: 'Accent',
      style: {
        border: 'none',
        height: '3px',
        width: '3rem',
        borderRadius: '999px',
        background: 'var(--color-accent)',
        margin: '1.5rem 0'
      }
    },
    {
      name: 'Dotted',
      style: {
        border: 'none',
        borderTop: '2px dotted var(--color-border)',
        height: '0',
        margin: '1.5rem 0'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── list
  list: [
    {
      name: 'Clean',
      style: {
        listStyle: 'none',
        padding: '0',
        margin: '0',
        display: 'grid',
        gap: '0.5rem',
        color: 'var(--color-text)'
      }
    },
    {
      name: 'Dividered',
      style: {
        listStyle: 'none',
        padding: '0',
        margin: '0',
        color: 'var(--color-text)',
        borderTop: '1px solid var(--color-border)'
      }
    },
    {
      name: 'Check',
      style: {
        listStyle: 'none',
        padding: '0',
        margin: '0',
        display: 'grid',
        gap: '0.65rem',
        color: 'var(--color-text)'
      },
      props: { marker: '✓' }
    },
    {
      name: 'Inline Tags',
      style: {
        listStyle: 'none',
        padding: '0',
        margin: '0',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        color: 'var(--color-muted)'
      }
    }
  ],

  // ───────────────────────────────────────────────────────────── stat
  stat: [
    {
      name: 'Bold Number',
      style: {
        color: 'var(--color-strong)',
        textAlign: 'left'
      },
      props: { valueWeight: '800', valueSize: '2.5rem' }
    },
    {
      name: 'Card',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        textAlign: 'left'
      }
    },
    {
      name: 'Accent Value',
      style: {
        color: 'var(--color-accent)',
        textAlign: 'center'
      },
      props: { valueWeight: '700', valueSize: '2.25rem' }
    },
    {
      name: 'Gradient Value',
      style: {
        background: 'linear-gradient(120deg, var(--color-primary), var(--color-accent))',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        textAlign: 'center'
      },
      props: { valueWeight: '800', valueSize: '2.5rem' }
    }
  ],

  // ───────────────────────────────────────────────────────────── panel
  panel: [
    {
      name: 'Surface',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem'
      }
    },
    {
      name: 'Inset',
      style: {
        background: 'var(--color-surface-2)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        boxShadow: 'inset 0 1px 3px color-mix(in srgb, var(--color-strong) 10%, transparent)'
      }
    },
    {
      name: 'Accent Header',
      style: {
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderTop: '3px solid var(--color-primary)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem'
      }
    },
    {
      name: 'Dark',
      style: {
        background: 'var(--color-strong)',
        color: 'var(--color-bg)',
        border: '1px solid color-mix(in srgb, var(--color-bg) 12%, transparent)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem'
      }
    }
  ]
};

export function presetsFor(type) {
  return COMPONENT_PRESETS[type] || [];
}

export const PRESET_TYPES = Object.keys(COMPONENT_PRESETS);
