import { define } from "../utils.ts";
import { loadHome } from "../data/loadHome.ts";

// Applied before first paint so a saved light-mode choice never flashes dark.
const themeScript =
  `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.add("light")}catch(e){}`;

export default define.page(async function App({ Component }) {
  const home = await loadHome();
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{home.name}</title>
        <meta name="description" content={home.description} />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
