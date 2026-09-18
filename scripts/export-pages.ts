import app from "../_fresh/server.js";

const response = await app.fetch(new Request("https://localhost/"));
if (!response.ok) throw new Error(`Homepage render failed: ${response.status}`);

await Deno.remove("out", { recursive: true }).catch((error) => {
  if (!(error instanceof Deno.errors.NotFound)) throw error;
});

async function copyDir(from: string, to: string): Promise<void> {
  await Deno.mkdir(to, { recursive: true });
  for await (const entry of Deno.readDir(from)) {
    const source = `${from}/${entry.name}`;
    const destination = `${to}/${entry.name}`;
    if (entry.isDirectory) await copyDir(source, destination);
    else if (entry.isFile) await Deno.copyFile(source, destination);
  }
}

await copyDir("_fresh/client", "out");
await Deno.writeTextFile("out/index.html", await response.text());
