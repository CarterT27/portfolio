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

## Building

```bash
deno task build
deno task start
```

`deno task build` writes `_fresh/`; `deno task start` serves it. Deno Deploy
runs the build task automatically.
