# cartertran.com

A one-page personal site built with [Fresh](https://fresh.deno.dev) on Deno. No
CSS framework, no component library: one route, three small islands, and about
200 lines of plain CSS.

## Editing

Everything on the page comes from `data/home.json`:

- `bio.default` and `bio.long` are arrays of paragraphs. Inline
  `[links](https://...)`, `**bold**` and `*italic*` are supported.
- `thinking` is a list of open questions.
- `listening` and `playing` are hidden while empty. Add entries like
  `{ "title": "...", "by": "...", "note": "why", "url": "..." }` (no `by` for
  games) and the sections appear.
- `elsewhere` is the link row at the bottom.

## Running

Install [Deno](https://docs.deno.com/runtime/getting_started/installation),
then:

```bash
deno install
deno task dev
```

## Building for Cloudflare Pages

```bash
deno install --frozen
deno task build:pages
```

The build renders the homepage and copies its interactive assets to `out/`.
Cloudflare Pages does not include Deno in its build image. Use this build command
in the Pages dashboard:

```bash
curl -fsSL https://deno.land/install.sh | sh -s v2.9.6 && $HOME/.deno/bin/deno install --frozen && $HOME/.deno/bin/deno task build:pages
```

Set the build output directory to `out`, leave the root directory blank, and
use `main` as the production branch.
