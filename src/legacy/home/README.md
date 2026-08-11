# Legacy home page (backup)

Snapshot of the original homepage before the stripped-down Figma redesign.

Saved: August 2026

## What’s included

- `index.astro` — page with logo, action buttons, project grid, separator
- `HomeHero.astro` / `HomeHero.css` — hero with Selected Work CTA
- `home.css` — page stylesheet imports

## Restore the old homepage

From the project root:

```bash
cp src/legacy/home/index.astro src/pages/index.astro
cp src/legacy/home/HomeHero.astro src/components/HomeHero.astro
cp src/legacy/home/HomeHero.css src/components/HomeHero.css
cp src/legacy/home/home.css src/styles/pages/home.css
```

Then run `npm run dev` and check `/`.
