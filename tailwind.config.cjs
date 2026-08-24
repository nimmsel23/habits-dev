const fs = require("fs");
const path = require("path");

// "../journal-app" existiert nur im vitalos-Submodule-Checkout. Standalone
// (~/habits-dev) heißt der Nachbar "journal-dev" — ohne Fallback purged
// Tailwind die Klassen der eingebetteten Journal-Komponente komplett raus
// (gleicher Bug-Typ wie der ../package.json-Fallback in vite.config.cjs).
const JOURNAL_APP = path.resolve(__dirname, "../journal-app");
const JOURNAL_GLOB = (fs.existsSync(JOURNAL_APP) ? JOURNAL_APP : path.resolve(__dirname, "../journal-dev")) + "/src/**/*.{js,jsx}";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    JOURNAL_GLOB,
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
