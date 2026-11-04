import { DAILY_DIMENSIONS, dailyExecutionScore, setDailyDimensionCompleted } from "./dailyExecutionModel.js";

// Only an existing snapshot is changed: a manual Habit action must not invent
// a past assignment or derive completion from an unrelated Journal entry.
export function applyManualHabitTransaction({ db, dayRef, recordRef, habitId, date, completed, runTransaction, serverTimestamp }) {
  return runTransaction(db, async (transaction) => {
    const day = await transaction.get(dayRef);
    const snapshot = day.exists() ? day.data() : null;
    const dimension = DAILY_DIMENSIONS.find(({ key }) => snapshot?.dimensions?.[key]?.habitId === habitId)?.key;
    let next = null;
    if (dimension) {
      next = setDailyDimensionCompleted(snapshot, dimension, completed);
      transaction.set(dayRef, { ...next, score: dailyExecutionScore(next), configured: true });
    }
    transaction.set(recordRef, {
      habitId, date, completion: completed ? "DONE" : "MISSED", recorded_at: serverTimestamp(),
      ...(dimension ? { dailyDimension: dimension, dailyHabitName: next.dimensions[dimension].habitName, dailyExecutionDate: date } : {}),
    }, { merge: true });
    return next ? { ...next, score: dailyExecutionScore(next), configured: true } : null;
  });
}
