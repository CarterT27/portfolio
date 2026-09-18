import raw from "./home.json" with { type: "json" };
import type { Home } from "./types.ts";

export async function loadHome(): Promise<Home> {
  return import.meta.env.DEV
    ? JSON.parse(
      await Deno.readTextFile(new URL("./home.json", import.meta.url)),
    )
    : raw as Home;
}
