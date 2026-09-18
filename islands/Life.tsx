import { useEffect, useRef, useState } from "preact/hooks";
import patterns from "../data/patterns.json" with { type: "json" };

// Conway's Game of Life on a toroidal grid, seeded with a famous pattern
// picked at random on each page load. When a pattern dies out, settles into
// a still life, or has run for long enough, the next one takes over.
// Click the grid to skip ahead.

type Pattern = {
  name: string;
  desc: string;
  w: number;
  h: number;
  rle: string;
};

const CELL = 4; // CSS pixels per cell
const TICK_MS = 140;
const MAX_GENS = 1500;

function decodeRLE(p: Pattern): Uint8Array {
  const cells = new Uint8Array(p.w * p.h);
  let x = 0;
  let y = 0;
  let run = "";
  for (const ch of p.rle) {
    if (ch >= "0" && ch <= "9") {
      run += ch;
      continue;
    }
    const n = run ? parseInt(run, 10) : 1;
    run = "";
    if (ch === "b") x += n;
    else if (ch === "o") {
      for (let k = 0; k < n; k++) cells[y * p.w + x++] = 1;
    } else if (ch === "$") {
      y += n;
      x = 0;
    } else if (ch === "!") break;
  }
  return cells;
}

export default function Life() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [current, setCurrent] = useState(-1);
  const [gen, setGen] = useState(0);
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = globalThis.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let grid = new Uint8Array(0);
    let next = new Uint8Array(0);
    let ink = "";
    let paper = "";
    let idx = Math.floor(Math.random() * patterns.length);
    let g = 0;
    let stillFor = 0;
    let raf = 0;
    let last = 0;
    let acc = 0;
    let visible = true;

    const readColors = () => {
      const cs = getComputedStyle(canvas);
      ink = cs.color;
      paper = cs.backgroundColor;
    };

    const draw = () => {
      const px = W * CELL * dpr;
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, px, px);
      ctx.fillStyle = ink;
      const s = CELL * dpr;
      const dot = s - Math.max(1, dpr); // one device pixel of gutter
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (grid[y * W + x]) ctx.fillRect(x * s, y * s, dot, dot);
        }
      }
    };

    const seed = (i: number) => {
      idx = (i + patterns.length) % patterns.length;
      const p = patterns[idx] as Pattern;
      grid.fill(0);
      const cells = decodeRLE(p);
      const ox = Math.floor((W - p.w) / 2);
      const oy = Math.floor((H - p.h) / 2);
      for (let y = 0; y < p.h; y++) {
        for (let x = 0; x < p.w; x++) {
          if (cells[y * p.w + x]) {
            grid[((oy + y + H) % H) * W + ((ox + x + W) % W)] = 1;
          }
        }
      }
      g = 0;
      stillFor = 0;
      acc = -600; // brief pause on the fresh seed
      setCurrent(idx);
      setGen(0);
      draw();
    };

    const step = () => {
      let changed = false;
      let pop = 0;
      for (let y = 0; y < H; y++) {
        const yu = ((y - 1 + H) % H) * W;
        const yc = y * W;
        const yd = ((y + 1) % H) * W;
        for (let x = 0; x < W; x++) {
          const xl = (x - 1 + W) % W;
          const xr = (x + 1) % W;
          const n = grid[yu + xl] + grid[yu + x] + grid[yu + xr] +
            grid[yc + xl] + grid[yc + xr] +
            grid[yd + xl] + grid[yd + x] + grid[yd + xr];
          const alive = grid[yc + x];
          const v = n === 3 || (alive && n === 2) ? 1 : 0;
          next[yc + x] = v;
          if (v !== alive) changed = true;
          pop += v;
        }
      }
      [grid, next] = [next, grid];
      g++;
      stillFor = changed ? 0 : stillFor + 1;
      if (pop === 0 || stillFor >= 2 || g >= MAX_GENS) {
        seed(idx + 1);
        return;
      }
      setGen(g);
      draw();
    };

    const loop = (t: number) => {
      if (!visible || document.hidden) {
        raf = 0;
        return;
      }
      if (last) acc += t - last;
      last = t;
      while (acc >= TICK_MS) {
        acc -= TICK_MS;
        step();
      }
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf || reduced) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };

    const resize = () => {
      dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
      const size = canvas.getBoundingClientRect().width;
      W = H = Math.max(20, Math.floor(size / CELL));
      canvas.width = canvas.height = W * CELL * dpr;
      grid = new Uint8Array(W * H);
      next = new Uint8Array(W * H);
      readColors();
      seed(idx);
    };

    resize();
    start();
    skip.current = () => seed(idx + 1);

    const ro = new ResizeObserver(() => {
      const size = canvas.getBoundingClientRect().width;
      if (Math.floor(size / CELL) !== W) resize();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const onVis = () => {
      if (!document.hidden) start();
    };
    document.addEventListener("visibilitychange", onVis);
    const mo = new MutationObserver(() => {
      readColors();
      draw();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const p = current >= 0 ? (patterns[current] as Pattern) : null;

  return (
    <div class="panel life">
      <canvas
        ref={ref}
        aria-label="Conway's Game of Life. Click for the next pattern."
        onClick={() => skip.current()}
      />
      <div class="panel-caption small muted">
        {p
          ? (
            <>
              <span class="fg">{p.name}</span>
              {" · "}
              {p.desc}
              <span class="gen">gen {gen}</span>
            </>
          )
          : " "}
      </div>
    </div>
  );
}
