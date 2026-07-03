# habits-dev TODO

## Vision

Habit Tracker für **Workouts** und **Supplements** — yes/no mit optionalem Journaling.

**Coach nutzt es für sich selbst + trackt Klienten.**
**Klient nutzt es als eigene PWA.**

Beide sehen dieselbe Oberfläche — Unterschied liegt nur in den Daten (per UID in Firestore).

---

## Kern-Konzept: Habits mit Frequenz

Kein reines "täglich done/not done". Habits haben eine **Frequenz/Intervall**:

| Habit-Typ | Beispiel | Frequenz |
|-----------|----------|----------|
| Supplement | Kreatin, Kollagen | täglich |
| Workout | Push | 1x / 7 Tage |
| Workout | Pull | 1x / 7 Tage |
| Workout | Legs | 1x / 7 Tage |

→ Das System trackt **ob der Abstand passt**, nicht nur ob heute etwas gemacht wurde.
→ Ein Workout-Habit ist "fällig" wenn seit letztem Record mehr als N Tage vergangen sind.
→ Ein Supplement-Habit ist "fällig" wenn heute kein Record existiert.

---

## Architektur-Grundlage: @fitness/constants + @fitness/components

Aliases sind in vite.config.cjs definiert aber noch **nicht genutzt**.
Das ist der nächste Schritt — habits-dev baut auf fitness-dev constants auf:

```js
// @fitness/constants/ActivityConstants.js — bereits vorhanden
BLOCK_COLORS.push    = "#f472b6"  // pink
BLOCK_COLORS.pull    = "#34d399"  // grün
BLOCK_COLORS.legs    = "#fb923c"  // orange
BLOCK_COLORS.upper   = "#38bdf8"
BLOCK_COLORS.full    = "#fbbf24"

getBlockColor(block) // → CSS color string, direkt verwendbar

// @fitness/components/HabitWidget.jsx — kompakter Widget mit epochDay-Tracking
// Alternative zu string-date approach, interessant für Frequency-Logik
```

**Konsequenz für Datenmodell:**
Habit bekommt `block: "push" | "pull" | "legs" | "supplement" | "custom"`
→ Farbe kommt automatisch aus `BLOCK_COLORS[habit.block]`
→ Frequency-Default leitet sich aus block-Typ ab (strength → 7 Tage, supplement → 1 Tag)

---

## Was bereits läuft

- [x] Yes/No Tracking pro Habit pro Tag (Firestore)
- [x] Optionales Journaling pro Habit+Tag (Memoir-Feature)
- [x] 10-Tage Datepicker mit Rückwärts-Eintragung
- [x] Rolling 28-Tage Stats + Konsistenz-Score
- [x] Sidebar mit Habit-History + Journaling
- [x] Multi-User via Firestore (per UID)
- [x] PWA + autoUpdate SW (VitePWA)
- [x] Firebase Hosting (habit-vos.web.app)
- [x] GitHub Actions Deploy auf master push

---

## Offene Features

### P0 — Frequenz-Konfiguration

- [ ] **`frequency` Feld pro Habit** — `daily` | `weekly` | `every_N_days` (N konfigurierbar)
- [ ] **Fälligkeits-Logik** — letzter Record + Frequenz → ist Habit "heute fällig"?
- [ ] **Overdue-Indikator** — visuelles Signal wenn Habit überfällig (letzter Record > N Tage)
- [ ] **"Zu früh"-Guard** — optional: Warnung wenn Abstand zu letztem Record zu kurz (z.B. Push gestern, Push heute = Warnung)
- [ ] **Nächste-Fälligkeit-Anzeige** — "Push: nächstes Mal frühestens Do 10.7."

### P1 — Habit-Kategorien

- [ ] **`category` Feld** — `workout` | `supplement` | `custom`
- [ ] **Gruppierte Ansicht** — Workouts oben, Supplements darunter (oder nach Category)
- [ ] **Habit-Templates** — Preset "Push/Pull/Legs" legt 3 Habits auf einmal an (weekly, Workout)

### P2 — Coach/Klient Multi-View

- [ ] **Coach-Dashboard** — Übersicht aller Klienten-Habits auf einen Blick
  - Welcher Klient hat Push diese Woche gemacht? (read-only, per Firestore UID)
  - Farbcodes: grün=done, gelb=fällig, rot=überfällig
- [ ] **Klient-Einladung** — Coach kann Habit-Plan für Klient anlegen (Firestore write als Coach in Klienten-UID)
- [ ] **Shared Template** — Coach definiert Trainingsplan-Vorlage → Klient übernimmt Habits

### P3 — UX

- [ ] **Icons für Workout-Typen** — Dumbbell für Push/Pull, Footprints für Legs etc.
- [ ] **Wöchentliche Zusammenfassung** — "Diese Woche: 2/3 Workouts, 6/7 Kreatin"
- [ ] **Streak-Anzeige für Supplements** — Tagesstreak für daily Habits

---

## Datenmodell-Erweiterung (Firestore)

Aktuelles Schema:
```
fitness/{uid}/habits/{habitId}     — name, icon, created_at, deleted
fitness/{uid}/habitRecords/{id}    — habitId, date, completion, recorded_at
fitness/{uid}/habitJournals/{id}   — habitId, date, text, updated_at
```

Neu:
```
fitness/{uid}/habits/{habitId}
  + frequency: "daily" | "every_N_days"
  + frequency_days: number (default 1)
  + category: "workout" | "supplement" | "custom"
  + sort_order: number
```

Kein Breaking Change — bestehende Habits ohne `frequency` behandeln wie `daily`.

---

## Klienten-Integration (längerfristig)

habits-dev soll in die **klienten-dev** App integrierbar sein:
- Klient loggt sich mit eigenem Google-Account ein → eigene Firestore-UID
- Coach sieht im Klienten-Dashboard den Habit-Status (read via Admin SDK oder Firestore Rules)
- Trainingsplan-Erstellung im Coach-Interface legt Habits in Klienten-UID an

Verbindung: `klienten-dev` (Port 9001) kennt Klienten-UIDs → kann Habit-Status abfragen.
