# HOT — Ideen zur Verbesserung von habits-dev

Stand: 2026-08-24

## Package-Management

- **pnpm statt npm**: spart Speicherplatz (globaler Content-addressed Store,
  Hard-Links statt Kopien), hat sauberen nativen Workspace-Support fürs
  Monorepo (`~/vitalos`) — lokale Pakete wie `@vos/cross-app-aliases` ließen
  sich damit ohne die aktuellen `npm install <lokaler-pfad>`-Workarounds
  einbinden.
- **Bun als Runtime + Package Manager**: ersetzt Node/npm/teilweise Vite.
  Installationen 20–30× schneller, Dev-Server startet praktisch sofort.
  Würde den aktuell recht fragilen `npm install`-Prozess (hängt gerne,
  siehe Session-Historie) deutlich robuster machen.

## Frontend-Größe

- **Preact statt React**: nahezu API-kompatibel, spart aber ca. 30–40 KB im
  finalen Bundle — für eine PWA wie habits-dev spürbar, da sie primär
  mobil genutzt wird.

## Bereits behobene Baustellen (zur Erinnerung)

- Firebase-Version im Monorepo vereinheitlicht (`12.15.0` → `^11.10.0`),
  da `vitalos` diese Version nutzt und der `./vertexai`-Export sonst fehlte.
- `vite.config.cjs`-Aliase dynamisch gemacht, damit sie auch greifen, wenn
  Monorepo-Verzeichnisse lokal mit `-dev`-Suffix vorliegen
  (z. B. `journal-dev` statt `journal`).

## Ergänzung (Sonnet)

- Die pnpm-/Bun-Idee lohnt sich am meisten, **wenn** das Monorepo-Setup
  (`~/vitalos` + Cross-App-Aliase) bleibt — bei einem Wechsel muss
  `.npmrc` (`legacy-peer-deps=true`) neu evaluiert werden, da pnpm mit
  Peer-Deps standardmäßig strenger ist als npm und das aktuell
  überdeckte Konflikte sichtbar machen könnte.
- Vor einem Preact-Wechsel: kurz prüfen, ob `@dnd-kit/*` und die
  Core4-Mobile-Komponenten (`Core4Layout.jsx`, `core4.css`) ohne
  React-spezifische APIs auskommen — dnd-kit ist React-nativ, ein
  `preact/compat`-Alias wäre nötig.
- **Weiterarbeiten würde ich zuerst an:**
  1. `gas/.clasp.json` klären — liegt seit dieser Session unversioniert
     im Repo, nicht Teil des aktuellen Commits.
  2. Den Theme-Switcher (V1 ↔ Core4-Layout) testen: Umschalten +
     Drag & Drop in beiden Ansichten, insbesondere ob die
     Firestore-Reihenfolge nach dem Wechsel konsistent bleibt.
  3. `npm install`-Robustheit — der Prozess hing in dieser Session
     mehrfach; bevor an pnpm/Bun gedacht wird, lohnt sich ein Blick,
     ob es an der lokalen Paket-Verlinkung (`npm install <Pfad>`)
     oder an Netzwerk/Registry liegt.

## Offene Punkte

- `.npmrc`-Strategie im Monorepo klären: aktuell `legacy-peer-deps=true`
  in `vitalos`, um Peer-Dependency-Konflikte zu ignorieren.
