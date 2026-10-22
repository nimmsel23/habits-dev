# Journal im Habits-Build

Nach dem Klonen und nach einem Wechsel des Habits-Commits:

```sh
git submodule update --init --recursive
pnpm --dir journal install --frozen-lockfile --ignore-scripts
```

Anschließend Habits wie bisher installieren und bauen. Die beiden Habits-CI-
Workflows initialisieren Journal nach dem Checkout des ausgelösten Habits-
Commits, installieren dessen eingefrorene Abhängigkeiten und prüfen nach dem
Build alle Journal-Einstiege und deren Service-Worker-Cache. Auch ein reiner
Journal-Gitlink-Commit startet die Workflows. Der öffentliche HTTPS-Remote
benötigt keinen lokalen Nachbarordner. Der unveränderte VitalOS-Workspace-
Lockfile kann weiterverwendet werden, da Habits keine neuen Paketabhängigkeiten hat.

Journal bewusst auf einen neueren veröffentlichten Stand aktualisieren:

```sh
git -C journal fetch origin dev
git -C journal checkout --detach origin/dev
pnpm --dir journal install --frozen-lockfile --ignore-scripts
npm run build:firebase
node scripts/check-journal-build.mjs dist-firebase
git add journal
git commit -m "chore(journal): update embedded snapshot"
```

CI verwendet immer den gespeicherten Gitlink, keinen beweglichen Branch-HEAD.
Journal-Quellcode und -Lockfile werden im Journal-Repository gepflegt.

# VitalOS-Release

Nach dem Committen der Änderungen:

```sh
npm run deploy:vos
```

Der Befehl nutzt den vorhandenen `vos-release habits --yes`-Ablauf:

1. `habits-dev/dev` nach `origin/dev` pushen.
2. In `vitalos/habit-app` den Branch `vitalos` aktualisieren und `origin/dev` hineinmergen.
3. Den Branch `vitalos` pushen.
4. Im VitalOS-Hauptrepository den `habit-app`-Verweis committen und `master` pushen.
   Dieser Push startet das CI-Deployment.

Voraussetzung ist der lokale VitalOS-Checkout mit `bin/vos-release`, entweder
neben `habits-dev` oder über `PATH` erreichbar. Der Release-Helper prüft die
Branches und Arbeitsverzeichnisse; Änderungen vorher committen. Es gibt keine
zusätzliche Rückfrage. Ein erfolgreicher Aufruf bestätigt die Git-Übergabe;
das Deployment-Ergebnis anschließend in der VitalOS-CI prüfen.

```sh
npm run deploy:vos -- --dry-run
```

Der bestehende Dry-Run zeigt die geplanten Push-, Merge- und Commit-Schritte.
Sein Merge-Preflight kann Remote-Refs abrufen und Git-Objekte schreiben.
