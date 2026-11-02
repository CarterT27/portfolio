# cartertran.com

A one-page personal site in plain HTML, CSS and JavaScript. There is no framework
and no build step: `public/` is exactly what gets deployed.

- `public/index.html` holds all the content, plus a short script for the bio and
  theme toggles.
- `public/style.css` holds the styles.
- `public/life.js` runs the Game of Life. Its patterns are at the top of the file.

## Running

Open `public/index.html` in a browser, or serve it:

```bash
python3 -m http.server -d public
```

## Deploying on Cloudflare Pages

In the Pages dashboard, leave the build command empty, set the build output
directory to `public`, leave the root directory blank, and use `main` as the
production branch.
