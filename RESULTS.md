## 2026-10-21 — Zentraler Changelog im Shell-Betrieb

Gemeinsame Quelle aktualisiert: Habits zeigt im Shell-Dokument und in Frames
keinen eigenen Dialog. Die Habits-Änderungen erscheinen im zentralen
VitalOS-Changelog mit einer Bestätigung für den gesamten Stand. Eigenständige
Habits-Nutzung behält ihren Dialog und Schlüssel. APP.md ergänzt.

Client-Build, Vendor-Parität, gemeinsame Metadaten-Tests und Browserprüfung
bei 320/390px erfolgreich. Kein Push/Deployment.

## 2026-10-21 — Gemeinsamer VitalOS-Changelog

Habits bindet den universellen Changelog aus VitalOS über einen Vite-Plugin
in allen Modi ein. Drei vendorte Module unter scripts/vos-changelog erlauben
Standalone-Builds; APP.md beschreibt Verhalten, Quelle und Aktualisierung.
Build-gebundene Release-Daten, Commit-Links, Browser-Bestätigung beim Schließen.

Produktionsbuild in Coach- und Client-Modus sowie Vendor-Parität erfolgreich.
Gemeinsame Metadaten-/Plugin-Tests und isolierter Browser bei 320/390px geprüft:
Erstanzeige, neue Version, Bestätigung, Escape, Fokus, sichere Texte/Links,
schmale Ansicht und blockierter localStorage. Kein Push oder Deployment.

## 2026-10-21 — npm run deploy:vos

Neuer npm-Befehl delegiert an `vos-release habits --yes`: dev pushen, nach
habit-app/vitalos mergen, Release-Branch pushen und den VitalOS-Pointer für CI
committen und pushen. Nutzt den vorhandenen Release-Helper aus PATH oder dem
benachbarten VitalOS-Checkout. Ablauf und Dry-Run in DEPLOYMENT.md dokumentiert.

Bash-Syntax und npm-Aufruf mit isoliertem Release-Stub geprüft: Modul/--yes,
Weitergabe von --dry-run und unveränderte Fehlercodes. Kein Release ausgeführt.

## 2026-10-21 — Täglicher Psychologie-Impuls

Die Psychologie-Karte rotiert 30 eigene Impulse zu Gewohnheiten und Motivation
nach lokalem Kalendertag. Der Text bleibt innerhalb eines Tages gleich und
aktualisiert sich um Mitternacht sowie beim Zurückkehren zur App.

Vite-Produktionsbuild und Datumsprüfungen (30 eindeutige Texte, Tageswechsel,
Zeitumstellung und Jahreswechsel) erfolgreich. pnpm war durch eine schreibgeschützte
Store-Sperre blockiert; der Build lief direkt über die installierte Vite-CLI.
Kein Deployment oder Browser-Test.

## 2026-10-19 — VitalOS-Push-Lane und eigener Service Worker

Habits/VitalOS speichert Einstellungen und Tokens in `apps.vitalos` des
gemeinsamen Push-Dokuments. Push nutzt `/vitalos-messaging-sw.js` mit dem
Scope `/vitalos-push/`; aktivierte Altgeräte registrieren den neuen Worker
beim nächsten Öffnen und migrieren das Token. Der Worker zeigt ausschließlich
Payloads mit `app: "vitalos"`.

Statische Syntax-, JSON- und Diff-Prüfungen erfolgreich. Kein Firebase-Release.
