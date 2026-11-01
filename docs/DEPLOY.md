# Habits — Deploy und Installierbarkeit

Stand 2026-11-01. Gesamtweg: `~/vitalos/docs/DEPLOYMENT.md`, `~/dev/fitness-dev/docs/DEPLOY.md`.

## Zielbild (Daniel, 2026-11-01)

`habits-dev` soll **einzig in `journalv1` integriert** sein. Die heutige Kopplung an Fitness, Fuel und Relax
(`@fitness-db`, `@fuel`, `@relax` in `vite.config.cjs`, `src/db/index.js` reicht die Fitness-DB durch) ist
Altlast und soll mit dieser Integration entfallen. Bis dahin gilt der Ist-Stand unten.

## Kritische Änderung 2026-11-01: `@vos/cross-app-aliases` entfernt

- **Warum:** Das Paket stand als `workspace:*` in `package.json`, der Lockfile hatte aber `link:../vitalos/packages/…`
  (Pfad aus der Zeit vor dem Umzug nach `~/dev`) → `ERR_PNPM_OUTDATED_LOCKFILE`, `--frozen-lockfile` schlug fehl.
  Außerdem zeigten die Paket-Aliase immer auf `~/vitalos/fitness-app`, der Mini-App-Resolver
  (`miniAppSubmodulePlugin(FITNESS)`) aber auf `FITNESS` (`~/dev/fitness-dev`): der PWA-Teil des Builds scheiterte mit
  `Could not resolve "../../../views/SixPack/workoutDoc.js"`. Die Zeile `VOS_FITNESS = ../vitalos/fitness-app` stimmt seit
  dem Umzug nach `~/dev` nicht mehr (Folgefehler des Umzugs; weitere sind zu erwarten).
- **Was:** Paket aus `package.json` und Lockfile entfernt, `resolveCrossAppAliases()` in `vite.config.cjs` ist synchron und
  definiert **alle** genutzten Aliase selbst (inkl. `@habits-db`, `@habits`, die der alte Fallback nicht kannte). Alle
  Sibling-Pfade kommen aus `resolveSibling()`/`JOURNAL` und sind damit in jedem Kontext (`~/dev`, `~/vitalos/habit-app`, CI)
  dieselben wie die des Resolvers.
- **Verifiziert:** `vite build --config vite.config.cjs` (default) und mit `VITE_APP_MODE=client` bauen (5867 Module);
  vorher scheiterten beide. `pnpm install --frozen-lockfile --lockfile-only` grün.
- **Nicht wieder einführen:** ein relatives `link:`/`workspace:*` macht den Lockfile vom Installationsort abhängig.

## Offen

- `VOS_FITNESS` (`../vitalos/fitness-app`) in `vite.config.cjs` ist seit dem Umzug nach `~/dev` ein toter Pfad; der zweite
  Resolver-Lauf greift nur im alten Layout.
- Standalone-Deploy aus dem eigenen `master`-Checkout (statt Meta-Repo) ist hier nicht umgesetzt; es braucht dafür Nachbarn
  (fitness, fuel, relax, journal) und passt nicht zum Zielbild „nur in journalv1".
