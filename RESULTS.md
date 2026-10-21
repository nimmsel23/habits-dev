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
