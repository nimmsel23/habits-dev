import { X, Calendar, Check, Save, History, Brain, PenLine } from "lucide-react";
import { ICON_COMPONENTS_MAP, getRollingDays } from "./utils";

export default function HabitSidebar({
  selectedHabitId,
  setSelectedHabitId,
  habits,
  rollingDates,
  selectedSidebarDate,
  setSelectedSidebarDate,
  journalText,
  isJournalSaving,
  onToggleSidebarDone,
  journalHistory,
  onOpenJournalModal,
  inline = false,
}) {
  const selectedHabit = habits.find(h => h.uuid === selectedHabitId);
  if (!selectedHabit) return null;

  const selectedHabitRecords = selectedHabit.records || [];
  const selectedHabitConsistency = selectedHabitRecords.length > 0 ?
    (selectedHabitRecords.filter(r => rollingDates.includes(r.date) && r.completion === 'DONE').length / rollingDates.length) * 100 : 0;

  const IconComponent = ICON_COMPONENTS_MAP[selectedHabit.icon || 'Activity'];
  const isDoneOnSidebarDate = selectedHabit.records.some(r => r.date === selectedSidebarDate && r.completion === 'DONE');

  const content = (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent size={22} className="text-[var(--ink)]" />}
          <h2 className="text-lg font-black text-[var(--ink)]">{selectedHabit.name}</h2>
        </div>
        <button onClick={() => setSelectedHabitId(null)} className="p-2 text-[var(--dim)] hover:text-[var(--red)] transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-widest opacity-70 text-[var(--ink)] flex items-center gap-2">
            <Calendar size={12} className="text-[var(--dim)]" />
            Konsistenz (28 Tage)
          </h4>
          <span className="text-[10px] font-bold opacity-30 text-[var(--dim)]">{Math.round(selectedHabitConsistency)}%</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {getRollingDays(28).map(d => {
            const done = selectedHabit.records.some(r => r.date === d && r.completion === 'DONE');
            const isSelectedDate = d === selectedSidebarDate;
            return (
              <button
                key={d}
                onClick={() => setSelectedSidebarDate(d)}
                title={`${d}: ${done ? 'Erledigt' : 'Offen'}`}
                className={`aspect-square rounded-md shadow-sm transition-all border ${done ? 'bg-emerald-500 border-emerald-600' : 'bg-[var(--bg2)] border-[var(--line)]/50'} ${isSelectedDate ? 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--card)] scale-110 z-10' : ''}`}
              />
            );
          })}
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-0.5">{selectedSidebarDate}</div>
            <h4 className="text-sm font-black text-[var(--ink)]">Status & Notizen</h4>
          </div>
          <button
            onClick={() => onToggleSidebarDone(selectedHabitId, selectedSidebarDate)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDoneOnSidebarDate ? 'bg-green text-black shadow-lg shadow-green/20' : 'bg-[var(--bg2)] border border-[var(--line)] text-[var(--dim)]'}`}
          >
            <Check size={14} className={isDoneOnSidebarDate ? 'stroke-[3]' : ''} />
            {isDoneOnSidebarDate ? 'Erledigt' : 'Offen'}
          </button>
        </div>

        <button
          onClick={() => onOpenJournalModal?.()}
          className="w-full text-left bg-[var(--bg2)] border border-[var(--line)] rounded-2xl p-4 hover:border-[var(--accent)] transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">
              <PenLine size={12} />
              Reflexion schreiben
            </div>
            {isJournalSaving && <Save size={12} className="text-[var(--accent)] animate-pulse" />}
          </div>
          {journalText ? (
            <p className="text-xs font-bold leading-relaxed text-[var(--ink)]/80 line-clamp-3 whitespace-pre-wrap">{journalText}</p>
          ) : (
            <p className="text-xs font-bold leading-relaxed text-[var(--dim)] opacity-50 italic">Tippen, um die Memoirs zu öffnen</p>
          )}
        </button>

        {(() => {
          const currentEntry = journalHistory.find(h => h.date === selectedSidebarDate);
          if (!currentEntry?.coachFeedback) return null;
          return (
            <div className="p-4 rounded-2xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={14} className="text-[var(--accent)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Coach Feedback</span>
              </div>
              <p className="text-xs font-bold leading-relaxed text-[var(--ink)]/90 italic">"{currentEntry.coachFeedback}"</p>
            </div>
          );
        })()}
      </div>

      {journalHistory?.length > 0 && (
        <div className="space-y-3 pb-4">
          <div className="flex items-center gap-2 px-1">
            <History size={14} className="text-[var(--dim)]" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--dim)]">Historie</h4>
          </div>
          {journalHistory.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[var(--bg2)] border border-[var(--line)]/50">
              <div className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-2">{item.date}</div>
              <div className="text-xs font-bold leading-relaxed text-[var(--ink)]/80 whitespace-pre-wrap">{item.text}</div>
              {item.coachFeedback && (
                <div className="mt-3 pt-3 border-t border-[var(--line)]/30">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Brain size={10} className="text-[var(--accent)]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)]">Coach Feedback</span>
                  </div>
                  <p className="text-[11px] font-bold italic text-[var(--ink)]/70">"{item.coachFeedback}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (inline) {
    return (
      <div className="rounded-[24px] bg-[var(--card)] border border-[var(--line)] p-6 space-y-5">
        {content}
      </div>
    );
  }

  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-[var(--card)] shadow-2xl z-50 transform transition-transform duration-300 ${selectedHabitId ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full p-6 space-y-5 overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
