const { defineConfig, loadEnv } = require("vite");
const react = require("@vitejs/plugin-react");
const { VitePWA } = require("vite-plugin-pwa");
const path = require("path");

// Nachbar-Repos: die vitalos-Submodule-Checkouts (master = firebase-first,
// modulare Firestore-Layer). Die Home-Worktrees sind dev-Playgrounds.
const FITNESS = path.resolve(__dirname, "../fitness-dev");
const FUEL = path.resolve(__dirname, "../fuel-dev");

module.exports = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appMode = process.env.VITE_APP_MODE || env.VITE_APP_MODE || "coach";

  // fitness-dev/src/firebase.js auf habits' eigene lib/firebase.js umleiten —
  // genau eine initializeApp im Bundle (Muster: vitalos
  // vitalos:subrepo-firebase-redirect). enforce:'pre' nötig, damit der Hook
  // vor vite:resolve läuft.
  const HABITS_FIREBASE = path.resolve(__dirname, "src/lib/firebase.js");
  const SUBREPO_FIREBASE = new Set([
    path.resolve(FITNESS, "src/firebase.js"),
    path.resolve(FUEL, "src/client/lib/firebase.js"),
  ]);
  const firebaseRedirect = {
    name: "habits:subrepo-firebase-redirect",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !source.startsWith(".")) return null;
      const resolved = path.resolve(path.dirname(importer.split("?")[0]), source);
      if (SUBREPO_FIREBASE.has(resolved) || SUBREPO_FIREBASE.has(`${resolved}.js`)) {
        return HABITS_FIREBASE;
      }
      return null;
    },
  };

  const outDir = appMode === "client" ? "./dist-firebase" : "./dist";

  console.log(`🚀 Building for mode: ${mode}, APP_MODE: ${appMode} -> outDir: ${outDir}`);

  return {
    base: "/",
    define: {
      "import.meta.env.VITE_APP_MODE": JSON.stringify(appMode),
    },
    plugins: [
      firebaseRedirect,
      react(),
      VitePWA({
        base: "/",
        scope: "/",
        registerType: "autoUpdate",
        injectRegister: "auto",
        manifest: {
          name: "VOS Habits",
          short_name: "Habits",
          description: "Habits auf VitalOS-Stack",
          theme_color: "#10b981",
          background_color: "#0f172a",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            { src: "/favicon.svg", sizes: "192x192 512x512", type: "image/svg+xml", purpose: "any maskable" }
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api/, /^\/nutrition/, /^\/supplements/, /^\/fuel/, /^\/health/],
          runtimeCaching: [
            {
              urlPattern: /^\/api\//,
              handler: "NetworkFirst",
              options: {
                cacheName: "habits-api",
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
                networkTimeoutSeconds: 5,
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      preserveSymlinks: true,
      alias: {
        "@db":      path.resolve(__dirname, "./src/db/index.js"),
        "@utils":   path.resolve(__dirname, "./src/db/index.js"),
        "@fitness-db": path.resolve(FITNESS, "src/lib/db"),
        "@fuel":    path.resolve(FUEL, "src/client"),
        "@journal": path.resolve(__dirname, "../journal-dev/src"),
        "@habits":  path.resolve(__dirname, "./src"),
        "@constants": path.resolve(FITNESS, "src/constants"),
        "@fitness/constants": path.resolve(FITNESS, "src/constants"),
        "@fitness/components": path.resolve(FITNESS, "src/components"),
        "@api": path.resolve(FUEL, appMode === "client" ? "src/client/lib/api.cloud.js" : "src/client/lib/api.local.js"),
      },
      // "firebase" hier zwingend: fitness-dev/fuel-dev importieren firebase/auth
      // und firebase/firestore auch direkt (nicht nur über firebase.js), und
      // haben dort eine andere Firebase-Version im eigenen node_modules.
      // Ohne dedupe entstehen zwei SDK-Instanzen -> "Component auth has not
      // been registered yet".
      dedupe: ["react", "react-dom", "@tanstack/react-query", "firebase"],
    },
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react":    ["react", "react-dom"],
            "vendor-query":    ["@tanstack/react-query"],
            "vendor-firebase": ["firebase/app", "firebase/firestore", "firebase/auth"],
          },
        },
      },
    },
    server: {
      host: "127.0.0.1",
      port: 9002,
      hmr: {
        host: "127.0.0.1",
        port: 9002,
      },
      proxy: {
        "/api":    "http://127.0.0.1:9080",
        "/health": "http://127.0.0.1:9080",
      },
    },
  };
});
