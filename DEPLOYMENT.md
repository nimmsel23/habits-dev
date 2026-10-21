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
