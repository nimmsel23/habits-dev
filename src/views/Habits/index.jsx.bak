import { useState, useEffect, useMemo } from "react";
import { Star, CalendarDays, Activity, PenLine } from "lucide-react";
import {
  getHabits, recordHabit, unrecordHabit, addHabit, deleteHabit,
  updateHabit, getHabitRecordsForDate, getHabitJournal, saveHabitJournal, getHabitJournalHistory
} from "@db";
import { localToday } from "@utils";
import { ICON_COMPONENTS_MAP } from "./utils";

import HabitForm from "./HabitForm";
import HabitItem from "./HabitItem";
import HabitSidebar from "./HabitSidebar";
import HabitJournalModal from "./HabitJournalModal";
import HabitStats from "./HabitStats";
import { getRollingDays } from "./utils";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newHabit, setNewHabit] = useState("");
  const [selectedIcon, setSelectedIcon] = useState('Activity');
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(localToday());
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingIcon, setEditingIcon] = useState(null);
  const [selectedHabitId, setSelectedHabitId] = useState(null);
  const [selectedSidebarDate, setSelectedSidebarDate] = useState(localToday());
  const [journalText, setJournalText] = useState("");
  const [journalHistory, setJournalHistory] = useState([]);
  const [isJournalSaving, setIsJournalSaving] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [memoirWrittenIds, setMemoirWrittenIds] = useState(new Set());

  const rollingDates = useMemo(() => getRollingDays(28), []);
  const recentDates = useMemo(() => getRollingDays(10), []);

  const outstandingMemoirs = useMemo(
    () => habits.filter(h => h.isDoneForSelectedDate && !memoirWrittenIds.has(h.uuid)),
    [habits, memoirWrittenIds]
  );

  function handleOpenMemoir(habit) {
    setSelectedHabitId(habit.uuid);
    setSelectedSidebarDate(selectedDate);
    setJournalModalOpen(true);
  }

  async function load() {
    setLoading(true);
    try {
      const allHabits = await getHabits();
      const completedHabitIdsForSelectedDate = await getHabitRecordsForDate(selectedDate);

      const habitsWithStatus = allHabits
        .filter(h => !h.deleted)
        .map(h => ({
          ...h,
          isDoneForSelectedDate: completedHabitIdsForSelectedDate.includes(h.uuid)
        }));
      setHabits(habitsWithStatus);

      const doneHabits = habitsWithStatus.filter(h => h.isDoneForSelectedDate);
      const journalChecks = await Promise.all(
        doneHabits.map(h => getHabitJournal(h.uuid, selectedDate).then(j => ({ uuid: h.uuid, has: !!(j?.text?.trim()) })))
      );
      setMemoirWrittenIds(new Set(journalChecks.filter(x => x.has).map(x => x.uuid)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [selectedDate]);

  useEffect(() => {
    setSelectedSidebarDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (selectedHabitId && selectedSidebarDate) {
      setJournalText("");
      getHabitJournal(selectedHabitId, selectedSidebarDate).then(j => {
        setJournalText(j?.text || "");
      });
    }
    if (selectedHabitId) {
      getHabitJournalHistory(selectedHabitId).then(setJournalHistory);
    }
  }, [selectedHabitId, selectedSidebarDate]);

  useEffect(() => {
    if (editingHabitId) {
      const habitToEdit = habits.find(h => h.uuid === editingHabitId);
      setEditingIcon(habitToEdit?.icon || 'Activity');
    } else {
      setEditingIcon(null);
    }
  }, [editingHabitId, habits]);

  async function toggleCheck(h) {
    if (h.isDoneForSelectedDate) {
      await unrecordHabit(h.uuid, selectedDate);
    } else {
      await recordHabit(h.uuid, selectedDate);
    }
    load();
  }

  async function toggleSidebarDone(habitId, date) {
    const h = habits.find(x => x.uuid === habitId);
    const isDone = h?.records?.some(r => r.date === date && r.completion === 'DONE');
    if (isDone) {
      await unrecordHabit(habitId, date);
    } else {
      await recordHabit(habitId, date);
    }
    load();
  }

  async function onSaveJournal(textOverride = null) {
    const textToSave = textOverride !== null ? textOverride : journalText;
    if (!selectedHabitId || !selectedSidebarDate) return;
    setIsJournalSaving(true);
    try {
      await saveHabitJournal(selectedHabitId, selectedSidebarDate, textToSave);
      getHabitJournalHistory(selectedHabitId).then(setJournalHistory);
      if (textToSave.trim()) {
        setMemoirWrittenIds(prev => new Set([...prev, selectedHabitId]));
      }
    } finally {
      setIsJournalSaving(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setSaving(true);
    try {
      await addHabit(newHabit.trim(), selectedIcon);
      setNewHabit("");
      setSelectedIcon('Activity');
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(uuid) {
    if (!confirm("Habit wirklich löschen?")) return;
    await deleteHabit(uuid);
    load();
  }

  const overallConsistency = habits.length === 0 ? 0 : habits.reduce((totalConsistency, h) => {
    const habitDoneCount = (h.records || []).filter(r => rollingDates.includes(r.date) && r.completion === 'DONE').length;
    return totalConsistency + (habitDoneCount / rollingDates.length);
  }, 0) / habits.length;

  const todayCompletionPercentage = habits.length === 0 ? 0 :
    (habits.filter(h => h.isDoneForSelectedDate).length / habits.length) * 100;

  function getMotivationalMessage(percentage) {
    if (percentage === 100) return "Hervorragend! Alle Habits erledigt! Weiter so!";
    if (percentage >= 50) return `Du hast ${Math.round(percentage)}% deiner Habits erledigt. Fast geschafft! Bleib dran!`;
    if (percentage > 0) return `Du hast ${Math.round(percentage)}% deiner Habits erledigt. Guter Start! Aber da geht noch mehr!`;
    return "Der Tag hat gerade erst begonnen! Fang jetzt an und hol dir die ersten Checks!";
  }

  const updateHabitName = (uuid, name) => {
    setHabits(prev => prev.map(h => h.uuid === uuid ? { ...h, name } : h));
  };

  const finishEditing = async () => {
    const h = habits.find(x => x.uuid === editingHabitId);
    if (h) {
      await updateHabit(h.uuid, h.name.trim(), editingIcon);
    }
    setEditingHabitId(null);
    setEditingIcon(null);
    load();
  };

  return (
    <div className="pb-32 px-2 sm:px-4 lg:px-6">
      <div className="mb-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-[var(--ink)] mb-1">Deine Habits</h1>
            <p className="text-xs font-bold opacity-30 uppercase tracking-[0.2em]">Konsistenz schlägt Intensität</p>
          </div>
          <div className="flex items-center gap-4 bg-[var(--card)] border border-[var(--line)] px-4 py-2.5 rounded-2xl shadow-xl">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Gesamt-Score</span>
                <span className="text-lg font-black text-[var(--accent)]">{Math.round(overallConsistency * 100)}%</span>
             </div>
             <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <Star size={20} fill="currentColor" fillOpacity={0.2} />
             </div>
          </div>
        </div>

        {/* Scrollable 10-Day Date Picker */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2">
          {recentDates.map(d => {
            const isSelected = d === selectedDate;
            const isToday = d === localToday();
            const dateObj = new Date(d);
            const weekday = dateObj.toLocaleDateString('de-DE', { weekday: 'short' });
            const dayNum = dateObj.getDate();

            return (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`flex-shrink-0 flex flex-col items-center min-w-[52px] py-3 rounded-2xl border transition-all
                  ${isSelected 
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 scale-105 z-10' 
                    : 'bg-[var(--card)] border-[var(--line)] text-[var(--dim)] hover:border-[var(--accent)]/50'}`}
              >
                <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'opacity-70' : 'opacity-40'}`}>
                  {weekday}
                </span>
                <span className="text-sm font-black tracking-tighter">
                  {dayNum}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-[var(--accent)] mt-1" />
                )}
              </button>
            );
          })}
          
          <div className="flex-shrink-0 pl-4 border-l border-[var(--line)]/30 flex items-center">
             <div className="p-3 rounded-2xl bg-[var(--card)] border border-[var(--line)] text-[var(--ink)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <CalendarDays size={14} className="text-[var(--dim)]" />
                {new Date(selectedDate).toLocaleDateString('de-DE', { month: 'short' })}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {outstandingMemoirs.length > 0 && (
            <div className="p-5 rounded-[24px] border border-[var(--accent)]/25 bg-[var(--accent)]/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                  Offene Memoirs ({outstandingMemoirs.length})
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {outstandingMemoirs.map(h => {
                  const Icon = ICON_COMPONENTS_MAP[h.icon] || ICON_COMPONENTS_MAP['Activity'];
                  return (
                    <button
                      key={h.uuid}
                      onClick={() => handleOpenMemoir(h)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[var(--card)] border border-[var(--line)] hover:border-[var(--accent)] hover:shadow-lg transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                          <Icon size={14} />
                        </div>
                        <span className="text-xs font-black text-[var(--ink)]">{h.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-lg group-hover:bg-[var(--accent)] group-hover:text-black transition-all">
                        <PenLine size={10} /> Schreiben
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="label-caps px-1 text-[var(--dim)]">Aktive Habits</div>
            {habits.length === 0 && !loading && (
              <div className="card p-12 text-center opacity-30 border-dashed bg-[var(--card)] border-[var(--line)]">
                <Activity size={32} className="mx-auto mb-3 text-[var(--dim)]" />
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--dim)]">Noch keine Habits</p>
              </div>
            )}
            {habits.map(h => (
              <HabitItem
                key={h.uuid}
                h={h}
                isSelected={selectedHabitId === h.uuid}
                isEditing={editingHabitId === h.uuid}
                editingIcon={editingIcon}
                setEditingIcon={setEditingIcon}
                setEditingHabitId={setEditingHabitId}
                onToggleSelection={() => setSelectedHabitId(selectedHabitId === h.uuid ? null : h.uuid)}
                onToggleCheck={toggleCheck}
                onDelete={handleDelete}
                onUpdateName={updateHabitName}
                onFinishEditing={finishEditing}
                selectedDate={selectedDate}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <HabitForm
            newHabit={newHabit}
            setNewHabit={setNewHabit}
            selectedIcon={selectedIcon}
            setSelectedIcon={setSelectedIcon}
            onAdd={handleAdd}
            saving={saving}
          />
          <HabitStats
            todayCompletionPercentage={todayCompletionPercentage}
            getMotivationalMessage={getMotivationalMessage}
          />
        </div>
      </div>

      <HabitSidebar
        selectedHabitId={selectedHabitId}
        setSelectedHabitId={setSelectedHabitId}
        habits={habits}
        rollingDates={rollingDates}
        selectedSidebarDate={selectedSidebarDate}
        setSelectedSidebarDate={setSelectedSidebarDate}
        journalText={journalText}
        isJournalSaving={isJournalSaving}
        onToggleSidebarDone={toggleSidebarDone}
        journalHistory={journalHistory}
        onOpenJournalModal={() => setJournalModalOpen(true)}
      />

      <HabitJournalModal
        open={journalModalOpen}
        onClose={() => setJournalModalOpen(false)}
        habit={habits.find(h => h.uuid === selectedHabitId)}
        date={selectedSidebarDate}
        journalText={journalText}
        setJournalText={setJournalText}
        isJournalSaving={isJournalSaving}
        onSaveJournal={onSaveJournal}
      />

      {selectedHabitId && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedHabitId(null)}></div>
      )}
    </div>
  );
}
