## 2026-10-19 — VitalOS-Push-Lane und eigener Service Worker

Habits/VitalOS speichert Einstellungen und Tokens in `apps.vitalos` des
gemeinsamen Push-Dokuments. Push nutzt `/vitalos-messaging-sw.js` mit dem
Scope `/vitalos-push/`; aktivierte Altgeräte registrieren den neuen Worker
beim nächsten Öffnen und migrieren das Token. Der Worker zeigt ausschließlich
Payloads mit `app: "vitalos"`.

Statische Syntax-, JSON- und Diff-Prüfungen erfolgreich. Kein Firebase-Release.
