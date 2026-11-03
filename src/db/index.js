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
  collection,
  doc,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { addDoc, getDoc, getDocs, setDoc, writeBatch } from "../lib/offline.js";

export * from "@fitness-db/index.firestore.js";
import { db, getUid } from "@fitness-db/index.firestore.js";
import { todayISO } from "@fitness-db/shared/utils.js";
import {
  DAILY_DIMENSIONS,
  createDailyExecutionSnapshot,
  dailyExecutionScore,
  normalizeDailyAssignments,
  replaceDailyAssignments,
  setDailyDimensionCompleted as updateDailyDimension,
} from "../views/Habits/dailyExecutionModel.js";

const PUSH_DEFAULTS = {
  enabled: false,
  tokens: [],
  token: null,
  types: { workout: true, habit: true, restday: true },
  reminderTime: "18:00",
};

// Habit notifications belong to VitalOS. The shared Firestore document keeps
// app-specific settings and device tokens separate from Fitness.
export async function getPushSettings() {
  const snap = await getDoc(doc(db, "fitness", getUid(), "settings", "push"));
  if (!snap.exists()) return PUSH_DEFAULTS;
  const stored = snap.data() || {};
  const legacy = { ...stored, tokens: [], token: null };
  delete legacy.apps;
  const settings = stored.apps?.vitalos || legacy;
  const tokens = Array.from(new Set([...(settings.tokens || []), ...(settings.token ? [settings.token] : [])].filter(Boolean)));
  return { ...PUSH_DEFAULTS, ...settings, tokens, token: tokens[0] || null };
}

export async function savePushSettings(settings) {
  const tokens = Array.from(new Set([...(settings?.tokens || []), ...(settings?.token ? [settings.token] : [])].filter(Boolean)));
  await setDoc(doc(db, "fitness", getUid(), "settings", "push"), {
    apps: { vitalos: { ...settings, tokens, token: tokens[0] || null } },
    updated_at: serverTimestamp(),
  }, { merge: true });
  return { ok: true };
}

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

const dailyConfigRef = (uid) => doc(db, "fitness", uid, "settings", "dailyExecution");
const dailySnapshotRef = (uid, date) => doc(db, "fitness", uid, "dailyExecution", date);
const habitRef = (uid, id) => doc(db, "fitness", uid, "habits", id);
const habitRecordRef = (uid, id, date) => doc(db, "fitness", uid, "habitRecords", `${id}_${date}`);

function emptyDailyExecution(date) {
  return {
    schemaVersion: 1,
    date,
    configured: false,
    score: 0,
    dimensions: Object.fromEntries(DAILY_DIMENSIONS.map(({ key }) => [key, null])),
  };
}

function nextLocalDate(date) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + 1);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export async function getDailyExecutionConfig() {
  const snap = await getDoc(dailyConfigRef(getUid()));
  return snap.exists() ? (snap.data() || {}) : { assignments: {}, effectiveDate: todayISO() };
}

export async function getDailyExecution(date = todayISO()) {
  const uid = getUid();
  const dayRef = dailySnapshotRef(uid, date);
  const configRef = dailyConfigRef(uid);
  return runTransaction(db, async (transaction) => {
    const [daySnap, configSnap] = await Promise.all([transaction.get(dayRef), transaction.get(configRef)]);
    if (daySnap.exists()) return { ...daySnap.data(), configured: true };

    const config = configSnap.exists() ? configSnap.data() || {} : {};
    if (!config.assignments || !DAILY_DIMENSIONS.every(({ key }) => config.assignments[key])
        || date < (config.effectiveDate || todayISO())) return emptyDailyExecution(date);
    const assignments = normalizeDailyAssignments(config.assignments, DAILY_DIMENSIONS.map(({ key }) => ({
      uuid: config.assignments[key]?.habitId || config.assignments[key],
      name: "placeholder",
    })));
    const selectedIds = DAILY_DIMENSIONS.map(({ key }) => assignments[key].habitId);
    const habitSnaps = await Promise.all(selectedIds.map((id) => transaction.get(habitRef(uid, id))));
    const habits = habitSnaps.map((snap, index) => ({ uuid: selectedIds[index], ...(snap.data() || {}) }));
    if (habits.some((habit, index) => !habitSnaps[index].exists() || habit.deleted)) return emptyDailyExecution(date);

    const normalized = normalizeDailyAssignments(config.assignments, habits);
    const snapshot = createDailyExecutionSnapshot({ date, assignments: normalized, habits });
    const recordSnaps = await Promise.all(selectedIds.map((id) => transaction.get(habitRecordRef(uid, id, date))));
    recordSnaps.forEach((recordSnap, index) => {
      if (recordSnap.exists() && recordSnap.get("completion") === "DONE") {
        snapshot.dimensions[DAILY_DIMENSIONS[index].key].completed = true;
        snapshot.dimensions[DAILY_DIMENSIONS[index].key].completedAt = recordSnap.get("recorded_at")?.toDate?.().toISOString?.() || snapshot.createdAt;
      }
    });
    transaction.set(dayRef, { ...snapshot, score: dailyExecutionScore(snapshot), configured: true });
    return { ...snapshot, score: dailyExecutionScore(snapshot), configured: true };
  });
}

export async function saveDailyExecutionAssignments(assignments, habits, date = todayISO()) {
  const uid = getUid();
  const configRef = dailyConfigRef(uid);
  const dayRef = dailySnapshotRef(uid, date);
  normalizeDailyAssignments(assignments, habits);

  return runTransaction(db, async (transaction) => {
    const [daySnap, ...habitSnaps] = await Promise.all([
      transaction.get(dayRef),
      ...DAILY_DIMENSIONS.map(({ key }) => {
        const candidate = assignments[key];
        const id = typeof candidate === "string" ? candidate : candidate?.habitId;
        return transaction.get(habitRef(uid, id));
      }),
    ]);
    const selectedHabits = habitSnaps.map((snap, index) => {
      const candidate = assignments[DAILY_DIMENSIONS[index].key];
      const id = typeof candidate === "string" ? candidate : candidate?.habitId;
      return { uuid: id, ...(snap.data() || {}) };
    });
    if (habitSnaps.some((snap, index) => !snap.exists() || selectedHabits[index].deleted)) {
      throw new Error("daily_assignment_habit_unavailable");
    }
    const normalized = normalizeDailyAssignments(assignments, selectedHabits);
    const oldSnapshot = daySnap.exists() ? daySnap.data() : null;
    const hasActivity = DAILY_DIMENSIONS.some(({ key }) => oldSnapshot?.dimensions?.[key]?.completed
      || oldSnapshot?.dimensions?.[key]?.linkedRecords?.length);
    const effectiveDate = hasActivity ? nextLocalDate(date) : date;
    transaction.set(configRef, {
      schemaVersion: 1,
      assignments: normalized,
      effectiveDate,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    if (oldSnapshot && !hasActivity) {
      transaction.set(dayRef, {
        ...replaceDailyAssignments(oldSnapshot, { assignments: normalized, habits: selectedHabits }),
        score: 0,
        configured: true,
      });
    }
    return { ok: true, effectiveDate };
  });
}

export async function setDailyExecutionCompleted(date, dimensionKey, completed) {
  const uid = getUid();
  const loaded = await getDailyExecution(date);
  if (!loaded.configured) throw new Error("daily_execution_not_configured");
  const dayRef = dailySnapshotRef(uid, date);

  return runTransaction(db, async (transaction) => {
    const daySnap = await transaction.get(dayRef);
    if (!daySnap.exists()) throw new Error("daily_execution_missing");
    const snapshot = daySnap.data();
    const dimension = snapshot.dimensions?.[dimensionKey];
    if (!dimension?.habitId) throw new Error("daily_dimension_not_configured");
    const recordRef = habitRecordRef(uid, dimension.habitId, date);
    const next = updateDailyDimension(snapshot, dimensionKey, completed);
    transaction.set(dayRef, { ...next, score: dailyExecutionScore(next), configured: true });
    transaction.set(recordRef, {
      habitId: dimension.habitId,
      date,
      completion: completed ? "DONE" : "MISSED",
      dailyDimension: dimensionKey,
      dailyHabitName: dimension.habitName,
      dailyExecutionDate: date,
      recorded_at: serverTimestamp(),
    }, { merge: true });
    return { ...next, score: dailyExecutionScore(next), configured: true };
  });
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
