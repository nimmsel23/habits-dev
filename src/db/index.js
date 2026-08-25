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
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export * from "@fitness-db/index.firestore.js";
import { db, getUid } from "@fitness-db/index.firestore.js";
import { todayISO } from "@fitness-db/shared/utils.js";

// Der modulare fitness-app Firestore-Barrel exportiert aktuell keine
// Habit-CRUD-Helpers. Die alten Re-Exports aus vitalos/src/cloud führten in
// habits-dev aber zu gesplittetem Auth-State: watchAuth/signIn kamen aus dem
// modularen Core, getHabits/recordHabit aus dem Monolithen mit eigener
// currentUid-Variable. Deshalb hier ein lokaler Wrapper auf derselben
// Firestore/Auth-Linie wie der Rest von habits-dev.
export async function getHabits(days = 28) {
  const snap = await getDocs(collection(db, "fitness", getUid(), "habits"));
  const habits = snap.docs.map((entry) => ({ uuid: entry.id, ...entry.data() }));

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - (days - 1));

  const recordsQuery = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", ">=", startDate.toISOString().slice(0, 10)),
    where("date", "<=", todayISO()),
    orderBy("date", "desc"),
  );
  const recordsSnap = await getDocs(recordsQuery);
  const allRecords = recordsSnap.docs.map((entry) => entry.data());

  return habits
    .map((habit) => {
      const records = allRecords.filter((record) => record.habitId === habit.uuid);
      return {
        ...habit,
        records,
        hasRecord: (date) => records.some((record) => record.date === date && record.completion === "DONE"),
      };
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function updateHabit(uuid, newName, newIcon, newCategory = null, newFrequency = null) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), {
    name: newName,
    icon: newIcon,
    category: newCategory,
    frequency: newFrequency,
    updated_at: serverTimestamp(),
  }, { merge: true });
}

export async function addHabit(name, icon = "Activity", category = null, frequency = null) {
  return addDoc(collection(db, "fitness", getUid(), "habits"), {
    name,
    icon,
    category,
    frequency,
    created_at: serverTimestamp(),
  });
}

export async function deleteHabit(uuid) {
  await setDoc(doc(db, "fitness", getUid(), "habits", uuid), {
    deleted: true,
  }, { merge: true });
}

export async function getHabitRecordsForDate(date = todayISO()) {
  const recordsQuery = query(
    collection(db, "fitness", getUid(), "habitRecords"),
    where("date", "==", date),
    where("completion", "==", "DONE"),
  );
  const snap = await getDocs(recordsQuery);
  return snap.docs.map((entry) => entry.data().habitId);
}

export async function recordHabit(uuid, date = todayISO()) {
  await setDoc(doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`), {
    habitId: uuid,
    date,
    completion: "DONE",
    recorded_at: serverTimestamp(),
  });
  return { ok: true };
}

export async function unrecordHabit(uuid, date = todayISO()) {
  await setDoc(doc(db, "fitness", getUid(), "habitRecords", `${uuid}_${date}`), {
    habitId: uuid,
    date,
    completion: "MISSED",
    recorded_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

export async function saveHabitOrder(orderedUuids) {
  const batch = writeBatch(db);
  orderedUuids.forEach((uuid, idx) => {
    const ref = doc(db, "fitness", getUid(), "habits", uuid);
    batch.set(ref, { order: idx }, { merge: true });
  });
  await batch.commit();
}

// index.firestore.js hat bewusst keinen Fuel-Proxy mehr (learn-dev braucht
// @fuel nicht) — der eingebettete Journal-Tab (@journal → JournalTimeline)
// hier in habits-dev braucht Fuel-Daten aber schon, deshalb explizit:
export { getMealsHistory, getNutritionNotesHistory, getSupplementsHistory } from "@fuel/lib/db/firestore/index.js";
