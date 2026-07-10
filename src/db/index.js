/**
 * habits-dev Standalone-@db — Doppelwrapper über den modularen
 * Firestore-Layer von fitness-dev (gleiches Muster wie vitalos
 * src/shell/db/ und journal-dev src/db/).
 *
 * Ersetzt den früheren Hard-Alias auf fitness-dev/src/db.firestore.js
 * (toter Monolith). Habits braucht nur den fitness-Layer — Habits,
 * Journal-Anteile, Auth, todayISO/localToday kommen alle von dort.
 *
 * Firebase-Init ist einmalig: src/lib/firebase.js (habits-eigen, guarded).
 * Der resolveId-Redirect in vite.config.cjs leitet fitness-dev/src/firebase.js
 * darauf um.
 */

// Init zuerst evaluieren, damit die fitness-Module dieselbe Instanz sehen.
import "../lib/firebase.js";

export * from "@fitness-db/index.firestore.js";
