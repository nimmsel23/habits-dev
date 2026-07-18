# Habits Push Reminders — GAS Setup

Analog zu `fuel-dev/gas/` (Supplement-Reminder), aber gegen das
Habits-Datenmodell (`fitness/{uid}/habits` + `habitRecords`). Nutzt
dieselbe Push-Infrastruktur wie vitalos Shell: `fitness/{uid}/settings/push`
(Token, `enabled`, `reminderTime`, `types.habit`) — die Settings-UI dafür
existiert in vitalos bereits (`src/hooks/usePushNotifications.js`), hier
fehlte nur die Sende-Seite.

## Einmalig — eigenes, frisches GAS-Projekt (nicht das von fuel-dev)

```bash
cd ~/vitalos/habits-dev/gas
clasp create --title "habits-push-reminders" --type standalone
# → trägt scriptId automatisch in .clasp.json ein
clasp push
```

## Script Properties setzen

Project Settings → Script Properties:

| Key | Value |
|-----|-------|
| `FIREBASE_PROJECT` | `fitness-aos` (optional, ist Default) |

## Testen

Im GAS-Editor Funktion wählen und ausführen:
- `testCheckForUid("<uid>")` — Reminder-Check für einen User manuell anstoßen
- `triggerPushReminders()` — kompletter Run wie im Trigger, für alle User

## Trigger aktivieren

```
createReminderTrigger()  → alle 15 Minuten
```

## Voraussetzung im Frontend

User muss in den vitalos-Settings Push aktivieren (Notification-Permission
+ FCM-Token via `usePushNotifications.js`) und den Typ `habit` eingeschaltet
lassen (Default: an) sowie eine `reminderTime` (HH:MM) gesetzt haben — sonst
bleibt `push.token`/`push.reminderTime` leer und der Check überspringt den
User stillschweigend.

## Updates deployen

```bash
cd ~/vitalos/habits-dev/gas
clasp push
```
