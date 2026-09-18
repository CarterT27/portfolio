import { defineConfig } from "vite";
import { fresh } from "@fresh/plugin-vite";

export default defineConfig({
  plugins: [
    fresh(),
    {
      name: "reload-home-data",
      async hotUpdate({ file, modules, timestamp, read }) {
        if (
          this.environment.name === "client" && file.endsWith("/data/home.json")
        ) {
          await read();
          const invalidated = new Set<(typeof modules)[number]>();
          for (const module of modules) {
            this.environment.moduleGraph.invalidateModule(
              module,
              invalidated,
              timestamp,
              true,
            );
          }
          this.environment.hot.send({ type: "full-reload" });
          return [];
        }
      },
    },
  ],
  server: {
    // Browser-testing tools drop files here; don't reload the page for them.
    watch: { ignored: ["**/.playwright-mcp/**"] },
  },
});
