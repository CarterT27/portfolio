// Conway's Game of Life on a toroidal grid, seeded with a famous pattern
// picked at random on each page load. When a pattern dies out, settles into
// a still life, or has run for long enough, the next one takes over.
// Click the grid to skip ahead.

(() => {
  const PATTERNS = [
    {"name": "Gosper glider gun", "desc": "gun · Bill Gosper, 1970", "w": 36, "h": 9, "rle": "24bo11b$22bobo11b$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o14b$2o8bo3bob2o4bobo11b$10bo5bo7bo11b$11bo3bo20b$12b2o!"},
    {"name": "Simkin glider gun", "desc": "gun · Michael Simkin, 2015", "w": 33, "h": 21, "rle": "2o5b2o$2o5b2o2$4b2o$4b2o5$22b2ob2o$21bo5bo$21bo6bo2b2o$21b3o3bo3b2o$26bo4$20b2o$20bo$21b3o$23bo!"},
    {"name": "p46 gun", "desc": "gun · period 46", "w": 49, "h": 14, "rle": "30b2o17b$29bobo15b2o$29bo17b2o$17bo11b3o17b$2o15b2o30b$2o16b2o29b$13b2o2b2o30b$29b3o17b$29bo17b2o$29bobo15b2o$13b2o2b2o11b2o17b$2o16b2o29b$2o15b2o30b$17bo!"},
    {"name": "R-pentomino", "desc": "methuselah · settles after 1,103 generations", "w": 3, "h": 3, "rle": "b2o$2ob$bo!"},
    {"name": "Acorn", "desc": "methuselah · settles after 5,206 generations", "w": 7, "h": 3, "rle": "bo5b$3bo3b$2o2b3o!"},
    {"name": "Die hard", "desc": "vanishes after 130 generations", "w": 8, "h": 3, "rle": "6bob$2o6b$bo3b3o!"},
    {"name": "B-heptomino", "desc": "methuselah", "w": 4, "h": 3, "rle": "ob2o$3ob$bo!"},
    {"name": "Pi-heptomino", "desc": "methuselah", "w": 3, "h": 3, "rle": "3o$obo$obo!"},
    {"name": "Thunderbird", "desc": "methuselah", "w": 3, "h": 5, "rle": "3o2$bob$bob$bo!"},
    {"name": "Bunnies", "desc": "methuselah · settles after 17,332 generations", "w": 8, "h": 4, "rle": "o5bob$2bo3bob$2bo2bobo$bobo!"},
    {"name": "Rabbits", "desc": "methuselah · settles after 17,331 generations", "w": 7, "h": 3, "rle": "o3b3o$3o2bob$bo!"},
    {"name": "Lidka", "desc": "methuselah · settles after 29,055 generations", "w": 9, "h": 15, "rle": "bo7b$obo6b$bo7b8$8bo$6bobo$5b2obo2$4b3o!"},
    {"name": "Multum in parvo", "desc": "methuselah", "w": 6, "h": 4, "rle": "3b3o$2bo2bo$bo4b$o!"},
    {"name": "Jaydot", "desc": "methuselah", "w": 3, "h": 6, "rle": "b2o$3o2$bo$b2o$o!"},
    {"name": "Justyna", "desc": "methuselah", "w": 22, "h": 17, "rle": "17bo4b$16bo2bo2b$17b3o2b$17bo2bob2$2o16bo3b$bo16bo3b$18bo3b8$19b3o$11b3o!"},
    {"name": "Pulsar", "desc": "oscillator · period 3", "w": 13, "h": 13, "rle": "2b3o3b3o2b2$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o2b2$2b3o3b3o2b$o4bobo4bo$o4bobo4bo$o4bobo4bo2$2b3o3b3o!"},
    {"name": "Pentadecathlon", "desc": "oscillator · period 15", "w": 10, "h": 3, "rle": "2bo4bo2b$2ob4ob2o$2bo4bo!"},
    {"name": "Kok's galaxy", "desc": "oscillator · period 8", "w": 9, "h": 9, "rle": "2bo2bobob$2obob3ob$bo6bo$2o5bob2$bo5b2o$o6bob$b3obob2o$bobo2bo!"},
    {"name": "Queen bee shuttle", "desc": "oscillator · period 30", "w": 22, "h": 7, "rle": "9bo12b$7bobo12b$6bobo13b$2o3bo2bo11b2o$2o4bobo11b2o$7bobo12b$9bo!"},
    {"name": "Twin bees shuttle", "desc": "oscillator · period 46", "w": 29, "h": 11, "rle": "17b2o10b$2o15bobo7b2o$2o17bo7b2o$17b3o9b4$17b3o9b$2o17bo9b$2o15bobo9b$17b2o!"},
    {"name": "Lightweight spaceship", "desc": "spaceship · speed c/2", "w": 5, "h": 4, "rle": "bo2bo$o4b$o3bo$4o!"},
    {"name": "Middleweight spaceship", "desc": "spaceship · speed c/2", "w": 6, "h": 5, "rle": "3bo2b$bo3bo$o5b$o4bo$5o!"},
    {"name": "Heavyweight spaceship", "desc": "spaceship · speed c/2", "w": 7, "h": 5, "rle": "3b2o2b$bo4bo$o6b$o5bo$6o!"},
    {"name": "Copperhead", "desc": "spaceship · speed c/10", "w": 8, "h": 12, "rle": "b2o2b2o$3b2o$3b2o$obo2bobo$o6bo2$o6bo$b2o2b2o$2b4o2$3b2o$3b2o!"},
    {"name": "Loafer", "desc": "spaceship · speed c/7", "w": 9, "h": 9, "rle": "b2o2bob2o$o2bo2b2o$bobo$2bo$8bo$6b3o$5bo$6bo$7b2o!"},
    {"name": "Weekender", "desc": "spaceship · speed 2c/7", "w": 16, "h": 11, "rle": "bo12bob$bo12bob$obo10bobo$bo12bob$bo12bob$2bo3b4o3bo2b$6b4o6b$2b4o4b4o2b2$4bo6bo4b$5b2o2b2o!"},
    {"name": "Schick engine", "desc": "spaceship · speed c/2", "w": 20, "h": 11, "rle": "bo2bo15b$o19b$o3bo15b$4o9b2o5b$6b3o5b2o4b$6b2ob2o6b3o$6b3o5b2o4b$4o9b2o5b$o3bo15b$o19b$bo2bo!"},
    {"name": "Spider", "desc": "spaceship · speed c/5", "w": 27, "h": 8, "rle": "9bo7bo9b$3b2obobob2o3b2obobob2o3b$3obob3o9b3obob3o$o3bobo5bobo5bobo3bo$4b2o6bobo6b2o4b$b2o9bobo9b2ob$b2ob2o15b2ob2ob$5bo15bo!"},
    {"name": "Hivenudger", "desc": "spaceship · speed c/2", "w": 13, "h": 13, "rle": "4o5bo2bo$o3bo3bo4b$o7bo3bo$bo2bo3b4ob2$5b2o6b$5b2o6b$5b2o6b2$bo2bo3b4ob$o7bo3bo$o3bo3bo4b$4o5bo2bo!"},
    {"name": "Puffer 1", "desc": "puffer · leaves debris behind", "w": 27, "h": 7, "rle": "b3o6bo5bo6b3ob$o2bo5b3o3b3o5bo2bo$3bo4b2obo3bob2o4bo3b$3bo19bo3b$3bo2bo13bo2bo3b$3bo2b2o11b2o2bo3b$2bo3b2o11b2o3bo!"},
    {"name": "Puffer 2", "desc": "puffer · leaves debris behind", "w": 18, "h": 5, "rle": "b3o11b3o$o2bo10bo2bo$3bo4b3o6bo$3bo4bo2bo5bo$2bo4bo8bo!"},
    {"name": "Pufferfish", "desc": "puffer · leaves debris behind", "w": 15, "h": 12, "rle": "3bo7bo$2b3o5b3o$b2o2bo3bo2b2o$3b3o3b3o2$4bo5bo$2bo2bo3bo2bo$o5bobo5bo$2o4bobo4b2o$6bobo$3bobo3bobo$4bo5bo!"},
    {"name": "Blinker puffer 1", "desc": "puffer · leaves blinkers behind", "w": 9, "h": 18, "rle": "3bo5b$bo3bo3b$o8b$o4bo3b$5o4b4$b2o6b$2ob3o3b$b4o4b$2b2o5b2$5b2o2b$3bo4bo$2bo6b$2bo5bo$2b6o!"},
    {"name": "Switch engine", "desc": "infinite growth", "w": 6, "h": 4, "rle": "bobo2b$o5b$bo2bob$3b3o!"},
    {"name": "Block-laying switch engine", "desc": "infinite growth", "w": 29, "h": 28, "rle": "18bo10b$b3o8bo5bo10b$o3bo6bo7bo9b$b2o9b4o2b2o9b$3b2ob2o9b3o9b$5b2o11bobo8b$19bo7b2o$19bo7b2o11$7b2o20b$7b2o20b7$15b2o12b$15b2o!"},
    {"name": "10-cell infinite growth", "desc": "infinite growth · smallest known", "w": 8, "h": 6, "rle": "6bob$4bob2o$4bobob$4bo3b$2bo5b$obo!"},
    {"name": "Spacefiller 1", "desc": "spacefiller · grows quadratically", "w": 29, "h": 43, "rle": "5bobo21b$4bo2bo21b$3b2o24b$2bo26b$b4o24b$o4bo23b$o2bo25b$o2bo25b$bo9b3o3b3o9b$2b4obo2bo2bo3bo2bo8b$3bo3bo5bo3bo11b$4bo8bo3bo11b$4bobo6bo3bo11b2$3b3o5b3o3b3o9b$3b2o7bo5bo10b$3b3o6b7o10b$11bo7bo9b$4bobo3b11o8b$3bo2bo2bo12b2o5b$3bo5b12o3bo4b$3bo3bo13bo3bo3b$4bo3b12o5bo3b$5b2o12bo2bo2bo3b$8b11o3bobo4b$9bo7bo11b$10b7o6b3o3b$10bo5bo7b2o3b$9b3o3b3o5b3o3b2$11bo3bo6bobo4b$11bo3bo8bo4b$11bo3bo5bo3bo3b$8bo2bo3bo2bo2bob4o2b$9b3o3b3o9bob$25bo2bo$25bo2bo$23bo4bo$24b4ob$26bo2b$24b2o3b$21bo2bo4b$21bobo!"},
    {"name": "Max", "desc": "spacefiller · grows quadratically", "w": 27, "h": 27, "rle": "18bo8b$17b3o7b$12b3o4b2o6b$11bo2b3o2bob2o4b$10bo3bobo2bobo5b$10bo4bobobobob2o2b$12bo4bobo3b2o2b$4o5bobo4bo3bob3o2b$o3b2obob3ob2o9b2ob$o5b2o5bo13b$bo2b2obo2bo2bob2o10b$7bobobobobobo5b4o$bo2b2obo2bo2bo2b2obob2o3bo$o5b2o3bobobo3b2o5bo$o3b2obob2o2bo2bo2bob2o2bob$4o5bobobobobobo7b$10b2obo2bo2bob2o2bob$13bo5b2o5bo$b2o9b2ob3obob2o3bo$2b3obo3bo4bobo5b4o$2b2o3bobo4bo12b$2b2obobobobo4bo10b$5bobo2bobo3bo10b$4b2obo2b3o2bo11b$6b2o4b3o12b$7b3o17b$8bo!"},
  ];

  const CELL = 4; // CSS pixels per cell
  const TICK_MS = 140;
  const MAX_GENS = 1500;

  const canvas = document.getElementById("life");
  const nameEl = document.getElementById("life-name");
  const descEl = document.getElementById("life-desc");
  const genEl = document.getElementById("life-gen");
  const ctx = canvas.getContext("2d", { alpha: false });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let grid = new Uint8Array(0);
  let next = new Uint8Array(0);
  let ink = "";
  let paper = "";
  let idx = Math.floor(Math.random() * PATTERNS.length);
  let gen = 0;
  let stillFor = 0;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let visible = true;

  function decodeRLE(p) {
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

  function readColors() {
    const cs = getComputedStyle(canvas);
    ink = cs.color;
    paper = cs.backgroundColor;
  }

  function draw() {
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
  }

  function seed(i) {
    idx = (i + PATTERNS.length) % PATTERNS.length;
    const p = PATTERNS[idx];
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
    gen = 0;
    stillFor = 0;
    acc = -600; // brief pause on the fresh seed
    nameEl.textContent = p.name;
    descEl.textContent = ` · ${p.desc}`;
    genEl.textContent = "gen 0";
    draw();
  }

  function step() {
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
    gen++;
    stillFor = changed ? 0 : stillFor + 1;
    if (pop === 0 || stillFor >= 2 || gen >= MAX_GENS) {
      seed(idx + 1);
      return;
    }
    genEl.textContent = `gen ${gen}`;
    draw();
  }

  function loop(t) {
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
  }

  function start() {
    if (raf || reduced) return;
    last = 0;
    raf = requestAnimationFrame(loop);
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const size = canvas.getBoundingClientRect().width;
    W = H = Math.max(20, Math.floor(size / CELL));
    canvas.width = canvas.height = W * CELL * dpr;
    grid = new Uint8Array(W * H);
    next = new Uint8Array(W * H);
    readColors();
    seed(idx);
  }

  resize();
  start();
  canvas.addEventListener("click", () => seed(idx + 1));

  new ResizeObserver(() => {
    const size = canvas.getBoundingClientRect().width;
    if (Math.floor(size / CELL) !== W) resize();
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  }).observe(canvas);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) start();
  });

  // Repaint when the theme toggle changes the colors.
  new MutationObserver(() => {
    readColors();
    draw();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
})();
