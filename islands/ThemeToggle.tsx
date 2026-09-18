import { useEffect, useState } from "preact/hooks";

export default function ThemeToggle() {
  const [light, setLight] = useState<boolean | null>(null);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !light;
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem("theme", next ? "light" : "dark");
    } catch {
      // Storage unavailable; the choice just won't persist.
    }
    setLight(next);
  };

  return (
    <button
      type="button"
      class="link"
      onClick={toggle}
      aria-label="Toggle theme"
    >
      {light === null ? " " : light ? "Dark" : "Light"}
    </button>
  );
}
