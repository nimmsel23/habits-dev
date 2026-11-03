import test from "node:test";
import assert from "node:assert/strict";
import {
  DAILY_DIMENSIONS,
  createDailyExecutionSnapshot,
  dailyExecutionScore,
  normalizeDailyAssignments,
  replaceDailyAssignments,
  setDailyDimensionCompleted,
} from "../src/views/Habits/dailyExecutionModel.js";

const habits = [
  { uuid: "h1", name: "Training" },
  { uuid: "h2", name: "Lesen" },
  { uuid: "h3", name: "Gefühl notieren" },
  { uuid: "h4", name: "Atemübung" },
];
const assignments = { doing: "h1", thinking: "h2", feeling: "h3", being: "h4" };

test("daily execution has four independent dimensions and explicit manual completion", () => {
  assert.deepEqual(DAILY_DIMENSIONS.map(({ key }) => key), ["doing", "thinking", "feeling", "being"]);
  const snapshot = createDailyExecutionSnapshot({ date: "2026-11-03", assignments, habits, now: "2026-11-03T08:00:00Z" });
  assert.equal(dailyExecutionScore(snapshot), 0);
  assert.equal(snapshot.dimensions.doing.completionRule, "manual");

  const done = setDailyDimensionCompleted(snapshot, "doing", true, { at: "2026-11-03T09:00:00Z" });
  assert.equal(dailyExecutionScore(done), 1);
  assert.equal(done.dimensions.doing.completedAt, "2026-11-03T09:00:00Z");
  assert.equal(dailyExecutionScore(snapshot), 0);
});

test("one distinct existing habit is required per dimension", () => {
  assert.throws(() => normalizeDailyAssignments({ ...assignments, feeling: "h2" }, habits), /daily_assignment_habit_must_be_unique/);
  assert.throws(() => normalizeDailyAssignments({ ...assignments, feeling: "missing" }, habits), /daily_assignment_feeling_required/);
  assert.throws(() => normalizeDailyAssignments({ ...assignments, extra: "h1" }, habits), /daily_assignments_unknown_dimension/);
  assert.throws(() => normalizeDailyAssignments(assignments, habits.map((habit) => habit.uuid === "h4" ? { ...habit, deleted: true } : habit)), /daily_assignment_being_required/);
});

test("existing daily snapshots preserve habit names when definitions later change", () => {
  const first = createDailyExecutionSnapshot({ date: "2026-11-03", assignments, habits, now: "2026-11-03T08:00:00Z" });
  const changedHabits = habits.map((habit) => habit.uuid === "h1" ? { ...habit, name: "Neues Training" } : habit);
  const reopened = createDailyExecutionSnapshot({
    date: "2026-11-03",
    assignments,
    habits: changedHabits,
    existing: first,
    now: "2026-11-03T12:00:00Z",
  });
  assert.equal(reopened, first);
  assert.equal(reopened.dimensions.doing.habitName, "Training");
});

test("assignments may change before the first completion, but not rewrite a scored day", () => {
  const snapshot = createDailyExecutionSnapshot({ date: "2026-11-03", assignments, habits, now: "2026-11-03T08:00:00Z" });
  const replacement = replaceDailyAssignments(snapshot, {
    assignments: { ...assignments, doing: "h2", thinking: "h1" },
    habits,
    now: "2026-11-03T08:30:00Z",
  });
  assert.equal(replacement.dimensions.doing.habitId, "h2");
  assert.equal(replacement.createdAt, snapshot.createdAt);
  assert.equal(replacement.updatedAt, "2026-11-03T08:30:00Z");

  const completed = setDailyDimensionCompleted(snapshot, "doing", true);
  assert.throws(() => replaceDailyAssignments(completed, { assignments, habits }), /daily_assignments_locked_after_completion/);
  const linked = setDailyDimensionCompleted(snapshot, "doing", false, { linkedRecords: ["fitness-session-1"] });
  assert.throws(() => replaceDailyAssignments(linked, { assignments, habits }), /daily_assignments_locked_after_completion/);
});

test("daily score is capped at four regardless of external detail records", () => {
  const snapshot = createDailyExecutionSnapshot({ date: "2026-11-03", assignments, habits });
  const done = DAILY_DIMENSIONS.reduce((current, { key }) => setDailyDimensionCompleted(current, key, true), snapshot);
  done.dimensions.doing.linkedRecords.push("fitness-session-1", "fitness-session-2");
  assert.equal(dailyExecutionScore(done), 4);
  assert.equal(dailyExecutionScore({ dimensions: { doing: { completed: true } } }), 0);
});
