# Habits

## Habits v2

Der direkte Einstieg „Habits v2“ öffnet Journal v2 im Habits-Modus.
Deep Link: `#journal/today/journal-v2/habits`. Enthält Bearbeiten von Namen,
Core4-Kategorie und Frequenz, Suchen/Filtern, Archiv/Wiederherstellen und
Korrekturen im 28-Tage-Raster. Die erweiterte Journal-Quelle wird über das
gepinnt gespeicherte Submodul übernommen; Daten und Anmeldung bleiben gemeinsam.
Eingebettete Door-/Journal-v1-Links und Browser-Zurück bleiben in Habits.

## Eingebautes Journal

Habits besitzt unter `journal/` einen vollständigen, auf einen Commit gepinnten
Checkout von `journal-dev` als Git-Submodul. Vite und Tailwind verwenden diesen
Stand ausschließlich, unabhängig von einem benachbarten Journal-Checkout.
`src/shell/JournalAppWrapper.jsx` importiert die originale Routenliste: Journal,
Journal v2, Door v2, Game v2, Tent v2, Smart Log und Door.
Alle Ansichten werden beim Build gebündelt und vom Habits-Service-Worker vorab
gecacht. React Query erhält einen eigenen Provider; Firebase, Anmeldung,
App-Updates und Datum gehören weiterhin zu Habits.

Deep Links bleiben unter Habits: `#journal/today/journal-v2/woche` bzw.
`#journal/2026-10-22/game-v2/fire`. Zurück/Vorwärts stellt Bereich und Modus wieder her.
Der gepinnte Quellstand dient als reproduzierbare Sicherheitskopie der Journal-App.
Benutzerdaten werden weiterhin im gemeinsamen Firestore gespeichert; das
Submodul erstellt keine Datenkopie. Zusätzliche Backend-Funktionen wie Door-
APIs benötigen weiterhin den zuständigen Server.

## Update-Changelog

Innerhalb der VitalOS-Shell erscheinen die Habits-Änderungen im gemeinsamen
VitalOS-Changelog. Es gibt dort nur eine Bestätigung für den gesamten Stand.
Der eigene Habits-Dialog erscheint ausschließlich bei eigenständigem Betrieb.

Beim ersten Start und bei einer neuen Version erscheint ein Dialog mit den
Änderungen, GitHub-Commit-Links und einem Link zur gesamten Commit-Historie.
„Weiter“ oder Escape bestätigt die Version für diesen Browser. Erst beim
Schließen wird `habits:seen-release` gespeichert. Ohne verfügbaren
Browserspeicher bleibt der Dialog nutzbar, erscheint beim nächsten Start aber erneut.

Die gemeinsame Quelle liegt in VitalOS unter `packages/mini-app-shell/`:
`vos-changelog-screen.mjs`, `vos-release-info.mjs`, `vos-changelog-vite.mjs`.
Habits nutzt eine generierte Kopie in `scripts/vos-changelog/`, damit auch
Standalone-CI ohne benachbarten VitalOS-Checkout bauen kann.

```sh
node ~/vitalos/packages/mini-app-shell/cli.mjs vendor-changelog scripts/vos-changelog
node ~/vitalos/packages/mini-app-shell/cli.mjs vendor-changelog scripts/vos-changelog --check
```

Der Vite-Plugin bindet Release-Daten direkt an den ausgelieferten Build und
erzeugt zusätzlich `release-info.json`. Er läuft in allen Build-Modi. GitHub-
Push-Commits werden nur für das passende Repository und denselben Commit
verwendet; sonst zeigt der Dialog die letzten zehn Commits ohne Merge-Commits
aus dem App-Repository. Dadurch erhalten Submodule im Parent-CI ihre eigenen
Release-Daten. Änderungen an der generierten Kopie immer zuerst in VitalOS machen.

## Änderungen

- 2026-10-22: Erweitertes Habits v2 aus Journal übernommen und als direkten Einstieg eingebunden.

- 2026-10-22: Vollständiges Journal als Submodul mit eigenem Wrapper, allen Bereichen und Offline-Build eingebunden.

- 2026-10-21: Gemeinsamen VitalOS-Changelog aus dem 6Pack-Pilot übernommen.
- 2026-10-21: `npm run deploy:vos` für den VitalOS-Release ergänzt.
- 2026-10-21: 30 täglich wechselnde Psychologie-Impulse ergänzt.
