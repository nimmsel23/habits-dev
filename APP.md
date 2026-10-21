# Habits

## Update-Changelog

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

- 2026-10-21: Gemeinsamen VitalOS-Changelog aus dem 6Pack-Pilot übernommen.
- 2026-10-21: `npm run deploy:vos` für den VitalOS-Release ergänzt.
- 2026-10-21: 30 täglich wechselnde Psychologie-Impulse ergänzt.
