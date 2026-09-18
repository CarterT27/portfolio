import { useEffect, useState } from "preact/hooks";
import { inline } from "../components/Inline.tsx";
import type { Home } from "../data/types.ts";

type Mode = keyof Home["bio"];

export default function Bio({ bio }: { bio: Home["bio"] }) {
  const [mode, setMode] = useState<Mode>("default");
  const modes: Mode[] = ["default", "long"];

  useEffect(() => {
    if (import.meta.env.DEV && sessionStorage.getItem("bio-mode") === "long") {
      setMode("long");
    }
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    if (import.meta.env.DEV) sessionStorage.setItem("bio-mode", m);
  };

  return (
    <>
      <div class="bio-head">
        <span>Bio</span>
        <div class="modes">
          {modes.map((m) => (
            <button
              type="button"
              key={m}
              aria-pressed={mode === m}
              onClick={() => switchMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div class="prose" key={mode}>
        {bio[mode].map((paragraph, i) => <p key={i}>{inline(paragraph)}</p>)}
      </div>
    </>
  );
}
