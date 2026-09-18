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
bun install
bun run build
```

The build renders the homepage and copies its interactive assets to `out/`.
In the existing Cloudflare Pages project, use `bun install && bun run build`
as the build command and `out` as the build output directory. Keep the root
directory blank and the production branch set to `main`.
