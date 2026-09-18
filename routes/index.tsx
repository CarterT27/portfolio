import { define } from "../utils.ts";
import { loadHome } from "../data/loadHome.ts";
import { inline } from "../components/Inline.tsx";
import Bio from "../islands/Bio.tsx";
import Life from "../islands/Life.tsx";
import ThemeToggle from "../islands/ThemeToggle.tsx";

export default define.page(async function Index() {
  const home = await loadHome();
  return (
    <main>
      <div class="page">
        <article>
          <h1>{home.name}</h1>

          <Bio bio={home.bio} />

          {home.workingOn.length > 0 && (
            <section>
              <h2>Working On</h2>
              <ul class="stack">
                {home.workingOn.map((item) => (
                  <li key={item.title}>
                    {item.url
                      ? (
                        <a
                          href={item.url}
                          class="link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.title}
                        </a>
                      )
                      : item.title}
                    {item.note && <div class="muted">{inline(item.note)}</div>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {home.thinking.length > 0 && (
            <section>
              <h2>Thinking about</h2>
              <ul class="bullets">
                {home.thinking.map((q, i) => <li key={i}>{inline(q)}</li>)}
              </ul>
            </section>
          )}

          {home.listening.length > 0 && (
            <section>
              <h2>Listening</h2>
              <ul class="stack">
                {home.listening.map((item) => (
                  <li key={item.title}>
                    {item.url
                      ? (
                        <a
                          href={item.url}
                          class="link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.title}
                        </a>
                      )
                      : item.title}
                    <span class="muted">{` by ${item.by}`}</span>
                    {item.note && <div class="muted">{inline(item.note)}</div>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {home.playing.length > 0 && (
            <section>
              <h2>Playing</h2>
              <ul class="stack">
                {home.playing.map((item) => (
                  <li key={item.title}>
                    {item.url
                      ? (
                        <a
                          href={item.url}
                          class="link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.title}
                        </a>
                      )
                      : item.title}
                    {item.note && <div class="muted">{inline(item.note)}</div>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2>Elsewhere</h2>
            <p class="muted">
              {home.elsewhere.map((s, i) => (
                <span key={s.name}>
                  <a
                    href={s.url}
                    class="link"
                    target={s.url.startsWith("http") ? "_blank" : undefined}
                    rel={s.url.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined}
                  >
                    {s.name}
                  </a>
                  {i < home.elsewhere.length - 1 && " · "}
                </span>
              ))}
            </p>
          </section>

          <footer>
            <span>© {new Date().getFullYear()} {home.name}</span>
            <ThemeToggle />
          </footer>
        </article>

        <aside>
          <div>
            <Life />
          </div>
        </aside>
      </div>
    </main>
  );
});
