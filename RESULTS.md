## 2026-10-22 — Erweitertes Habits v2 eingebunden

Journal-Submodul auf f7f9e5f aktualisiert: Bearbeiten von Name/Kategorie/Frequenz,
Archiv/Wiederherstellen, Suche/Filter, Tagesraster-Korrekturen, geplante Serien,
Monatsziele, historische Datenfenster und sichtbare Fehler mit Entwurfserhalt.
Direkter Habits-v2-Einstieg in der Habits-Navigation führt zu
#journal/today/journal-v2/habits. Journal-v2-Links zu Door/v1 laufen über den
Host-Wrapper, Datum und Browser-Historie bleiben unter Habits-Kontrolle.

Validierung: Journal-Tests (13) und Firebase-Build erfolgreich. Habits-Client-
und Coach-Build mit vollständigem Journal und Offline-Cache geprüft. Browser bei
320/390px: Habits-v2-Direkteinstieg/Deep Link, Door/v1-Links, Browser-Zurück und
Layout. Synthetischer Auth-Zustand, keine Nutzerdaten geschrieben. Echte
Firestore-Schreibvorgänge nicht getestet. Quellen und Gitlink nur lokal
committed; Journal muss vor Habits veröffentlicht werden. Kein Push/Deployment.

## 2026-10-22 — Vollständiges Journal im Habits-Build

Journal als Git-Submodul unter journal/ hinzugefügt, gepinnt auf den auf GitHub
veröffentlichten Commit 8e824cb. Eigener JournalAppWrapper verwendet die originale
Routenliste mit allen sieben Bereichen, eigenem React-Query-Provider und
Habits-Anmeldung/Datum. Bereich und Modus werden in Habits-Deep-Links gespeichert.
Vite, Firebase-Redirect und Tailwind zeigen auf den lokalen Submodul-Stand;
der benachbarte Journal-Checkout wird dafür nicht verwendet. Habits-Datenmodell
und Journal-Firestore bleiben gemeinsam; dies ist eine Quellcode-Sicherheitskopie.

Preview-/Live-CI initialisieren nach dem Habits-Checkout rekursiv die gepinnten
Submodule und installieren Journal mit seinem unveränderten Lockfile.
Gitlink-/Konfigurationsänderungen lösen CI ebenfalls aus. Build-Manifest und
scripts/check-journal-build.mjs prüfen die vollständige Routenübernahme und
Service-Worker-Precaching. APP.md und DEPLOYMENT.md beschreiben Nutzung/Updates.

Validierung: Client- und Coach-Produktionsbuild erfolgreich; alle sieben
Journal-Einstiege im Build und Offline-Cache vorhanden. Isolierter Browser mit
390px: alle sieben Bereiche geladen, Navigation aktiv, keine unbehandelten
JavaScript-Ausnahmen. Keine Anmeldung, keine Benutzerdaten geschrieben; echte
Firestore-Zugriffe und entfernte Backend-Funktionen wurden nicht geprüft.
Journal-Lockfile-Installation eingefroren erfolgreich; GitHub-Erreichbarkeit des
gepinnten Commits als Vorfahr von origin/dev geprüft. Kein Push/Deployment.

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


## 2026-10-31 — Dev-Projekte unter ~/dev

Lokale Entwicklungspfade und betroffene Verknüpfungen auf `~/dev/*-dev` umgestellt. Runtime-Daten, Branches und Release-Checkouts behalten ihre Zuständigkeit. Keine Pushes oder Releases. Gesamter Umzug und Prüfungen: `~/RESULTS.md`.
